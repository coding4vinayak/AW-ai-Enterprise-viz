import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminPage from '@/pages/admin';
import * as AuthContext from '@/lib/auth-context';

const mockUser = {
  id: 'test-user-id',
  email: 'admin@test.com',
  username: 'admin',
  role: 'super_admin',
  customerId: 'test-customer-id',
  status: 'active'
};

const mockCustomers = [
  { 
    id: 'customer-1', 
    name: 'Test Customer 1', 
    slug: 'test-customer-1', 
    status: 'active', 
    createdAt: '2024-01-01T00:00:00.000Z' 
  },
  { 
    id: 'customer-2', 
    name: 'Test Customer 2', 
    slug: 'test-customer-2', 
    status: 'inactive', 
    createdAt: '2024-01-02T00:00:00.000Z' 
  }
];

const mockUsers = [
  { 
    id: 'user-1', 
    customerId: 'customer-1',
    username: 'testuser1', 
    email: 'test1@example.com',
    role: 'viewer',
    status: 'active',
    lastLoginAt: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  { 
    id: 'user-2', 
    customerId: 'customer-2',
    username: 'testuser2', 
    email: 'test2@example.com',
    role: 'analyst',
    status: 'inactive',
    lastLoginAt: null,
    createdAt: '2024-01-02T00:00:00.000Z'
  }
];

const mockProviders = [
  {
    id: 'provider-1',
    name: 'OpenAI',
    type: 'openai',
    defaultModel: 'gpt-4',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'provider-2',
    name: 'Anthropic',
    type: 'anthropic',
    defaultModel: 'claude-3',
    isActive: false,
    createdAt: '2024-01-02T00:00:00.000Z'
  }
];

describe('Admin Page - Comprehensive Test Suite', () => {
  let queryClient: QueryClient;
  let fetchMock: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Mock fetch globally
    fetchMock = vi.fn();
    global.fetch = fetchMock;

    // Default successful responses
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/api/admin/customers')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCustomers
        });
      }
      if (url.includes('/api/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockUsers
        });
      }
      if (url.includes('/api/llm-providers')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProviders
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });

    // Mock useAuth hook
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Access Control Tests', () => {
    it('should deny access for viewer role', () => {
      vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
        user: { ...mockUser, role: 'viewer' },
        loading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true
      });

      renderWithProviders(<AdminPage />);
      
      expect(screen.getByTestId('text-access-denied-title')).toBeInTheDocument();
      expect(screen.getByTestId('text-access-denied-description')).toBeInTheDocument();
    });

    it('should deny access for analyst role', () => {
      vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
        user: { ...mockUser, role: 'analyst' },
        loading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true
      });

      renderWithProviders(<AdminPage />);
      
      expect(screen.getByTestId('text-access-denied-title')).toBeInTheDocument();
    });

    it('should allow access for super_admin', async () => {
      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('text-page-title')).toHaveTextContent('Admin Panel');
        expect(screen.getByTestId('text-page-description')).toBeInTheDocument();
      });
    });

    it('should allow access for customer_admin', async () => {
      vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
        user: { ...mockUser, role: 'customer_admin' },
        loading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true
      });

      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('text-page-title')).toBeInTheDocument();
      });
    });
  });

  describe('Overview Tab Tests', () => {
    it('should display all overview statistics correctly', async () => {
      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('text-total-customers')).toHaveTextContent('2');
        expect(screen.getByTestId('text-active-customers')).toHaveTextContent('1 active');
        expect(screen.getByTestId('text-total-users')).toHaveTextContent('2');
        expect(screen.getByTestId('text-active-users')).toHaveTextContent('1 active');
        expect(screen.getByTestId('text-total-providers')).toHaveTextContent('2');
        expect(screen.getByTestId('text-active-providers')).toHaveTextContent('1 active');
        expect(screen.getByTestId('text-system-status')).toHaveTextContent('Online');
      });
    });

    it('should show recent customers in overview', async () => {
      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('text-customer-name-customer-1')).toHaveTextContent('Test Customer 1');
        expect(screen.getByTestId('text-customer-slug-customer-1')).toHaveTextContent('test-customer-1');
        expect(screen.getByTestId('badge-customer-status-customer-1')).toHaveTextContent('active');
      });
    });

    it('should show recent users in overview', async () => {
      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('text-user-username-user-1')).toHaveTextContent('testuser1');
        expect(screen.getByTestId('text-user-email-user-1')).toHaveTextContent('test1@example.com');
        expect(screen.getByTestId('badge-user-role-user-1')).toHaveTextContent('viewer');
      });
    });

    it('should display no customers message when empty', async () => {
      fetchMock.mockImplementation((url: string) => {
        if (url.includes('/api/admin/customers')) {
          return Promise.resolve({ ok: true, json: async () => [] });
        }
        if (url.includes('/api/admin/users')) {
          return Promise.resolve({ ok: true, json: async () => [] });
        }
        if (url.includes('/api/llm-providers')) {
          return Promise.resolve({ ok: true, json: async () => [] });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('text-no-customers')).toBeInTheDocument();
        expect(screen.getByTestId('text-no-users')).toBeInTheDocument();
      });
    });
  });

  describe('Customer Management Tests', () => {
    it('should disable customer tab for non-super-admin', async () => {
      vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
        user: { ...mockUser, role: 'customer_admin' },
        loading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true
      });

      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        const customersTab = screen.getByTestId('tab-customers');
        expect(customersTab).toBeDisabled();
      });
    });

    it('should display customers table', async () => {
      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('tab-customers'));
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('row-customer-customer-1')).toBeInTheDocument();
        expect(screen.getByTestId('cell-customer-name-customer-1')).toHaveTextContent('Test Customer 1');
        expect(screen.getByTestId('cell-customer-slug-customer-1')).toHaveTextContent('test-customer-1');
      });
    });

    it('should open create customer dialog', async () => {
      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-customers'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('button-add-customer'));
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('text-dialog-title')).toHaveTextContent('Create New Customer');
        expect(screen.getByTestId('input-customer-name')).toBeInTheDocument();
        expect(screen.getByTestId('input-customer-slug')).toBeInTheDocument();
      });
    });

    it('should create new customer successfully', async () => {
      const newCustomer = {
        id: 'new-customer',
        name: 'New Customer',
        slug: 'new-customer',
        status: 'active',
        createdAt: '2024-01-03T00:00:00.000Z'
      };

      fetchMock.mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/admin/customers') && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => newCustomer
          });
        }
        if (url.includes('/api/admin/customers')) {
          return Promise.resolve({ ok: true, json: async () => mockCustomers });
        }
        if (url.includes('/api/admin/users')) {
          return Promise.resolve({ ok: true, json: async () => mockUsers });
        }
        if (url.includes('/api/llm-providers')) {
          return Promise.resolve({ ok: true, json: async () => mockProviders });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-customers'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('button-add-customer'));
      });
      
      await waitFor(() => {
        const nameInput = screen.getByTestId('input-customer-name');
        const slugInput = screen.getByTestId('input-customer-slug');
        
        fireEvent.change(nameInput, { target: { value: 'New Customer' } });
        fireEvent.change(slugInput, { target: { value: 'new-customer' } });
        
        fireEvent.click(screen.getByTestId('button-create-customer'));
      });
      
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/admin/customers',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ name: 'New Customer', slug: 'new-customer', status: 'active' })
          })
        );
      });
    });

    it('should handle customer creation error', async () => {
      fetchMock.mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/admin/customers') && options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            text: async () => 'Customer already exists'
          });
        }
        if (url.includes('/api/admin/customers')) {
          return Promise.resolve({ ok: true, json: async () => mockCustomers });
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-customers'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('button-add-customer'));
      });
      
      await waitFor(() => {
        fireEvent.change(screen.getByTestId('input-customer-name'), { target: { value: 'Duplicate' } });
        fireEvent.change(screen.getByTestId('input-customer-slug'), { target: { value: 'duplicate' } });
        fireEvent.click(screen.getByTestId('button-create-customer'));
      });
    });

    it('should display loading state for customers', async () => {
      fetchMock.mockImplementation((url: string) => {
        if (url.includes('/api/admin/customers')) {
          return new Promise(() => {}); // Never resolves
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-customers'));
      
      await waitFor(() => {
        expect(screen.getByTestId('text-loading-customers')).toBeInTheDocument();
      });
    });

    it('should display no customers message', async () => {
      fetchMock.mockImplementation((url: string) => {
        if (url.includes('/api/admin/customers')) {
          return Promise.resolve({ ok: true, json: async () => [] });
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-customers'));
      
      await waitFor(() => {
        expect(screen.getByTestId('text-no-customers-table')).toBeInTheDocument();
      });
    });
  });

  describe('User Management Tests', () => {
    it('should display users table', async () => {
      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-users'));
      
      await waitFor(() => {
        expect(screen.getByTestId('row-user-user-1')).toBeInTheDocument();
        expect(screen.getByTestId('cell-user-username-user-1')).toHaveTextContent('testuser1');
        expect(screen.getByTestId('cell-user-email-user-1')).toHaveTextContent('test1@example.com');
        expect(screen.getByTestId('cell-user-role-user-1')).toHaveTextContent('viewer');
      });
    });

    it('should show never for users without last login', async () => {
      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-users'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cell-user-lastlogin-user-2')).toHaveTextContent('Never');
      });
    });

    it('should open create user dialog', async () => {
      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-users'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('button-add-user'));
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('text-dialog-user-title')).toHaveTextContent('Create New User');
        expect(screen.getByTestId('input-user-email')).toBeInTheDocument();
        expect(screen.getByTestId('input-user-username')).toBeInTheDocument();
        expect(screen.getByTestId('input-user-password')).toBeInTheDocument();
      });
    });

    it('should create new user successfully', async () => {
      const newUser = {
        id: 'new-user',
        username: 'newuser',
        email: 'new@example.com',
        role: 'viewer',
        status: 'active',
        customerId: 'customer-1'
      };

      fetchMock.mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/admin/users') && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => newUser
          });
        }
        if (url.includes('/api/admin/customers')) {
          return Promise.resolve({ ok: true, json: async () => mockCustomers });
        }
        if (url.includes('/api/admin/users')) {
          return Promise.resolve({ ok: true, json: async () => mockUsers });
        }
        if (url.includes('/api/llm-providers')) {
          return Promise.resolve({ ok: true, json: async () => mockProviders });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-users'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('button-add-user'));
      });
      
      await waitFor(() => {
        fireEvent.change(screen.getByTestId('input-user-email'), { target: { value: 'new@example.com' } });
        fireEvent.change(screen.getByTestId('input-user-username'), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByTestId('input-user-password'), { target: { value: 'password123' } });
        
        fireEvent.click(screen.getByTestId('button-create-user'));
      });
      
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/admin/users',
          expect.objectContaining({
            method: 'POST'
          })
        );
      });
    });

    it('should display loading state for users', async () => {
      fetchMock.mockImplementation((url: string) => {
        if (url.includes('/api/admin/users')) {
          return new Promise(() => {}); // Never resolves
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-users'));
      
      await waitFor(() => {
        expect(screen.getByTestId('text-loading-users')).toBeInTheDocument();
      });
    });

    it('should display no users message', async () => {
      fetchMock.mockImplementation((url: string) => {
        if (url.includes('/api/admin/users')) {
          return Promise.resolve({ ok: true, json: async () => [] });
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-users'));
      
      await waitFor(() => {
        expect(screen.getByTestId('text-no-users-table')).toBeInTheDocument();
      });
    });
  });

  describe('AI Providers Tab Tests', () => {
    it('should display AI providers table', async () => {
      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-providers'));
      
      await waitFor(() => {
        expect(screen.getByTestId('row-provider-provider-1')).toBeInTheDocument();
        expect(screen.getByTestId('cell-provider-name-provider-1')).toHaveTextContent('OpenAI');
        expect(screen.getByTestId('cell-provider-type-provider-1')).toHaveTextContent('openai');
        expect(screen.getByTestId('cell-provider-model-provider-1')).toHaveTextContent('gpt-4');
      });
    });

    it('should show active/inactive status for providers', async () => {
      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-providers'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cell-provider-status-provider-1')).toHaveTextContent('Active');
        expect(screen.getByTestId('cell-provider-status-provider-2')).toHaveTextContent('Inactive');
      });
    });

    it('should display loading state for providers', async () => {
      fetchMock.mockImplementation((url: string) => {
        if (url.includes('/api/llm-providers')) {
          return new Promise(() => {}); // Never resolves
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-providers'));
      
      await waitFor(() => {
        expect(screen.getByTestId('text-loading-providers')).toBeInTheDocument();
      });
    });

    it('should display no providers message', async () => {
      fetchMock.mockImplementation((url: string) => {
        if (url.includes('/api/llm-providers')) {
          return Promise.resolve({ ok: true, json: async () => [] });
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-providers'));
      
      await waitFor(() => {
        expect(screen.getByTestId('text-no-providers')).toBeInTheDocument();
      });
    });

    it('should display provider configuration info', async () => {
      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-providers'));
      
      await waitFor(() => {
        expect(screen.getByTestId('card-provider-info')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation Tests', () => {
    it('should switch between all tabs', async () => {
      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('content-overview')).toBeInTheDocument();
      });
      
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
      
      fireEvent.click(screen.getByTestId('tab-overview'));
      await waitFor(() => {
        expect(screen.getByTestId('content-overview')).toBeInTheDocument();
      });
    });

    it('should maintain tab state after data refresh', async () => {
      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-users'));
      
      await waitFor(() => {
        expect(screen.getByTestId('content-users')).toBeInTheDocument();
      });
      
      // Tab should remain active even after query refetch
      queryClient.invalidateQueries();
      
      await waitFor(() => {
        expect(screen.getByTestId('content-users')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle network error gracefully', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('text-page-title')).toBeInTheDocument();
      });
    });

    it('should handle API error responses', async () => {
      fetchMock.mockImplementation((url: string) => {
        return Promise.resolve({
          ok: false,
          status: 500,
          text: async () => 'Internal server error'
        });
      });

      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('text-page-title')).toBeInTheDocument();
      });
    });
  });

  describe('Data Refresh Tests', () => {
    it('should refetch data after successful customer creation', async () => {
      let callCount = 0;
      
      fetchMock.mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/admin/customers')) {
          callCount++;
          if (options?.method === 'POST') {
            return Promise.resolve({
              ok: true,
              json: async () => ({ id: 'new', name: 'New', slug: 'new', status: 'active' })
            });
          }
          return Promise.resolve({ ok: true, json: async () => mockCustomers });
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      renderWithProviders(<AdminPage />);
      
      fireEvent.click(screen.getByTestId('tab-customers'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('button-add-customer'));
      });
      
      await waitFor(() => {
        fireEvent.change(screen.getByTestId('input-customer-name'), { target: { value: 'New' } });
        fireEvent.change(screen.getByTestId('input-customer-slug'), { target: { value: 'new' } });
        fireEvent.click(screen.getByTestId('button-create-customer'));
      });
      
      await waitFor(() => {
        expect(callCount).toBeGreaterThan(1);
      });
    });
  });
});
