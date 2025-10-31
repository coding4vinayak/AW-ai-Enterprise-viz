
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth-context';

// Import all pages
import AdminPage from '@/pages/admin';
import AnalyticsPage from '@/pages/analytics';
import AISettingsPage from '@/pages/ai-settings';
import DashboardBuilderPage from '@/pages/dashboard-builder';
import UsageDashboard from '@/pages/usage-dashboard';
import DataSourcesPage from '@/pages/data-sources';
import InsightsPage from '@/pages/insights';

const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
  username: 'testuser',
  role: 'super_admin',
  customerId: 'test-customer',
  status: 'active'
};

const createTestWrapper = () => {
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

describe('All Pages - Comprehensive Test Suite', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ data: [] })
      })
    ) as any;
  });

  describe('Admin Page', () => {
    it('should render without errors', async () => {
      render(<AdminPage />, { wrapper: createTestWrapper() });
      await waitFor(() => {
        expect(screen.getByTestId('text-page-title')).toBeInTheDocument();
      });
    });

    it('should load all tabs', async () => {
      render(<AdminPage />, { wrapper: createTestWrapper() });
      await waitFor(() => {
        expect(screen.getByTestId('tab-overview')).toBeInTheDocument();
        expect(screen.getByTestId('tab-customers')).toBeInTheDocument();
        expect(screen.getByTestId('tab-users')).toBeInTheDocument();
        expect(screen.getByTestId('tab-providers')).toBeInTheDocument();
      });
    });
  });

  describe('Analytics Page', () => {
    it('should render without errors', () => {
      render(<AnalyticsPage />, { wrapper: createTestWrapper() });
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should not crash on load', async () => {
      const { container } = render(<AnalyticsPage />, { wrapper: createTestWrapper() });
      await waitFor(() => {
        expect(container).toBeTruthy();
      });
    });
  });

  describe('AI Settings Page', () => {
    it('should render without errors', async () => {
      render(<AISettingsPage />, { wrapper: createTestWrapper() });
      await waitFor(() => {
        expect(screen.getByText('AI Configuration')).toBeInTheDocument();
      });
    });

    it('should load provider selection', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: '1', name: 'OpenAI', type: 'openai' }
        ])
      });

      render(<AISettingsPage />, { wrapper: createTestWrapper() });
      await waitFor(() => {
        expect(screen.getByTestId('select-provider')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Builder Page', () => {
    it('should render without errors', () => {
      render(<DashboardBuilderPage />, { wrapper: createTestWrapper() });
      expect(screen.getByText('Dashboard Builder')).toBeInTheDocument();
    });

    it('should not throw maximum call stack error', async () => {
      const { container } = render(<DashboardBuilderPage />, { wrapper: createTestWrapper() });
      await waitFor(() => {
        expect(container).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Usage Dashboard Page', () => {
    it('should render without errors', async () => {
      render(<UsageDashboard />, { wrapper: createTestWrapper() });
      await waitFor(() => {
        expect(screen.getByText('Usage Analytics')).toBeInTheDocument();
      });
    });

    it('should load usage stats', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          api_calls: 100,
          ai_tokens: 5000,
          storage: 1024
        })
      });

      render(<UsageDashboard />, { wrapper: createTestWrapper() });
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/usage/stats'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Data Sources Page', () => {
    it('should render without errors', () => {
      render(<DataSourcesPage />, { wrapper: createTestWrapper() });
      expect(screen.getByText('Data Sources')).toBeInTheDocument();
    });
  });

  describe('Insights Page', () => {
    it('should render without errors', () => {
      render(<InsightsPage />, { wrapper: createTestWrapper() });
      expect(screen.getByText('AI Insights')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

      render(<UsageDashboard />, { wrapper: createTestWrapper() });
      await waitFor(() => {
        expect(screen.getByText('Usage Analytics')).toBeInTheDocument();
      });
    });

    it('should handle 404 responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not found'
      });

      render(<AdminPage />, { wrapper: createTestWrapper() });
      await waitFor(() => {
        expect(screen.getByTestId('text-page-title')).toBeInTheDocument();
      });
    });
  });
});
