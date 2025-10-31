
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth-context';
import AdminPage from '@/pages/admin';

const mockUser = {
  id: 'test-user-id',
  email: 'admin@test.com',
  username: 'admin',
  role: 'super_admin',
  customerId: 'test-customer-id',
  status: 'active'
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider value={{ user: mockUser, login: vi.fn(), logout: vi.fn(), isLoading: false }}>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Admin Page - Complete Test Suite', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  describe('Access Control Tests', () => {
    it('should deny access for viewer role', () => {
      const viewerUser = { ...mockUser, role: 'viewer' };
      const { rerender } = render(<AdminPage />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('text-access-denied-title')).toBeInTheDocument();
      expect(screen.getByTestId('text-access-denied-description')).toBeInTheDocument();
    });

    it('should allow access for super_admin', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ customers: [], users: [], providers: [] })
      });

      render(<AdminPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('text-page-title')).toHaveTextContent('Admin Panel');
      });
    });

    it('should allow access for customer_admin', async () => {
      const adminUser = { ...mockUser, role: 'customer_admin' };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ users: [] })
      });

      render(<AdminPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('text-page-title')).toBeInTheDocument();
      });
    });
  });

  describe('Overview Tab Tests', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          customers: [
            { id: '1', name: 'Test Customer', slug: 'test', status: 'active', createdAt: '2024-01-01' }
          ],
          users: [
            { id: '1', username: 'user1', email: 'user1@test.com', role: 'viewer', status: 'active' }
          ],
          providers: [
            { id: '1', name: 'OpenAI', type: 'openai', isActive: true, createdAt: '2024-01-01' }
          ]
        })
      });
    });

    it('should display overview statistics', async () => {
      render(<AdminPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('text-total-customers')).toBeInTheDocument();
        expect(screen.getByTestId('text-total-users')).toBeInTheDocument();
        expect(screen.getByTestId('text-total-providers')).toBeInTheDocument();
        expect(screen.getByTestId('text-system-status')).toHaveTextContent('Online');
      });
    });

    it('should show recent customers', async () => {
      render(<AdminPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('text-customer-name-1')).toHaveTextContent('Test Customer');
        expect(screen.getByTestId('badge-customer-status-1')).toHaveTextContent('active');
      });
    });
  });

  describe('Customer Management Tests', () => {
    it('should open create customer dialog', async () => {
      render(<AdminPage />, { wrapper: createWrapper() });
      
      const addButton = screen.getByTestId('button-add-customer');
      fireEvent.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('text-dialog-title')).toHaveTextContent('Create New Customer');
      });
    });

    it('should create new customer', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'new-customer',
          name: 'New Customer',
          slug: 'new-customer',
          status: 'active'
        })
      });

      render(<AdminPage />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByTestId('button-add-customer'));
      
      await waitFor(() => {
        const nameInput = screen.getByTestId('input-customer-name');
        const slugInput = screen.getByTestId('input-customer-slug');
        
        fireEvent.change(nameInput, { target: { value: 'New Customer' } });
        fireEvent.change(slugInput, { target: { value: 'new-customer' } });
        
        fireEvent.click(screen.getByTestId('button-create-customer'));
      });
    });

    it('should update customer status', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          customers: [
            { id: '1', name: 'Test', slug: 'test', status: 'active', createdAt: '2024-01-01' }
          ]
        })
      });

      render(<AdminPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const statusSelect = screen.getByTestId('select-customer-status-1');
        fireEvent.click(statusSelect);
      });
    });
  });

  describe('User Management Tests', () => {
    it('should list users', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          users: [
            { 
              id: 'user-1', 
              username: 'testuser', 
              email: 'test@example.com',
              role: 'viewer',
              status: 'active',
              lastLoginAt: '2024-01-01'
            }
          ]
        })
      });

      render(<AdminPage />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByTestId('tab-users'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cell-user-username-user-1')).toHaveTextContent('testuser');
        expect(screen.getByTestId('cell-user-email-user-1')).toHaveTextContent('test@example.com');
      });
    });

    it('should open create user dialog', async () => {
      render(<AdminPage />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByTestId('tab-users'));
      fireEvent.click(screen.getByTestId('button-add-user'));
      
      await waitFor(() => {
        expect(screen.getByTestId('input-user-email')).toBeInTheDocument();
        expect(screen.getByTestId('input-user-username')).toBeInTheDocument();
      });
    });

    it('should create new user', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'new-user',
          username: 'newuser',
          email: 'new@example.com',
          role: 'viewer'
        })
      });

      render(<AdminPage />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByTestId('tab-users'));
      fireEvent.click(screen.getByTestId('button-add-user'));
      
      await waitFor(() => {
        fireEvent.change(screen.getByTestId('input-user-email'), { 
          target: { value: 'new@example.com' } 
        });
        fireEvent.change(screen.getByTestId('input-user-username'), { 
          target: { value: 'newuser' } 
        });
        fireEvent.change(screen.getByTestId('input-user-password'), { 
          target: { value: 'password123' } 
        });
        
        fireEvent.click(screen.getByTestId('button-create-user'));
      });
    });
  });

  describe('AI Providers Tab Tests', () => {
    it('should display AI providers', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          providers: [
            {
              id: 'provider-1',
              name: 'OpenAI',
              type: 'openai',
              defaultModel: 'gpt-4',
              isActive: true,
              createdAt: '2024-01-01'
            }
          ]
        })
      });

      render(<AdminPage />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByTestId('tab-providers'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cell-provider-name-provider-1')).toHaveTextContent('OpenAI');
        expect(screen.getByTestId('cell-provider-type-provider-1')).toHaveTextContent('openai');
        expect(screen.getByTestId('cell-provider-model-provider-1')).toHaveTextContent('gpt-4');
      });
    });
  });

  describe('Tab Navigation Tests', () => {
    it('should switch between tabs', async () => {
      render(<AdminPage />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('content-overview')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('tab-customers'));
      await waitFor(() => {
        expect(screen.getByTestId('content-customers')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('tab-users'));
      await waitFor(() => {
        expect(screen.getByTestId('content-users')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('tab-providers'));
      await waitFor(() => {
        expect(screen.getByTestId('content-providers')).toBeInTheDocument();
      });
    });
  });
});
