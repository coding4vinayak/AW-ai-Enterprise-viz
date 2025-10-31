
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

vi.mock('wouter', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  useLocation: () => ['/']
}));

describe('Sidebar Navigation - Complete Test Suite', () => {
  const renderSidebar = () => {
    return render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );
  };

  describe('Main Navigation Items', () => {
    it('should render dashboard link', () => {
      renderSidebar();
      expect(screen.getByTestId('link-dashboard')).toBeInTheDocument();
    });

    it('should render AI insights link', () => {
      renderSidebar();
      expect(screen.getByTestId('link-insights')).toBeInTheDocument();
    });
  });

  describe('Data Sources Section', () => {
    it('should render data sources section', () => {
      renderSidebar();
      expect(screen.getByTestId('link-data')).toBeInTheDocument();
    });

    it('should expand data sources submenu', () => {
      renderSidebar();
      const dataLink = screen.getByTestId('link-data');
      fireEvent.click(dataLink);
      
      expect(screen.getByTestId('link-data-all')).toBeInTheDocument();
    });

    it('should have all data source submenu items', () => {
      renderSidebar();
      fireEvent.click(screen.getByTestId('link-data'));
      
      expect(screen.getByText('All Sources')).toBeInTheDocument();
      expect(screen.getByText('Upload Data')).toBeInTheDocument();
      expect(screen.getByText('Webhooks')).toBeInTheDocument();
      expect(screen.getByText('API Connectors')).toBeInTheDocument();
      expect(screen.getByText('GraphQL')).toBeInTheDocument();
    });
  });

  describe('Analytics Section', () => {
    it('should render analytics section', () => {
      renderSidebar();
      expect(screen.getByTestId('link-analytics')).toBeInTheDocument();
    });

    it('should expand analytics submenu', () => {
      renderSidebar();
      fireEvent.click(screen.getByTestId('link-analytics'));
      
      expect(screen.getByTestId('link-analytics-builder')).toBeInTheDocument();
    });

    it('should have all analytics submenu items', () => {
      renderSidebar();
      fireEvent.click(screen.getByTestId('link-analytics'));
      
      expect(screen.getByText('Chart Builder')).toBeInTheDocument();
      expect(screen.getByText('Advanced Charts')).toBeInTheDocument();
      expect(screen.getByText('Trends & Forecasts')).toBeInTheDocument();
      expect(screen.getByText('Calculated Fields')).toBeInTheDocument();
    });
  });

  describe('Dashboards Section', () => {
    it('should render dashboards section', () => {
      renderSidebar();
      const dashboardsSection = screen.getAllByText('Dashboards')[1]; // Second occurrence
      expect(dashboardsSection).toBeInTheDocument();
    });

    it('should have all dashboard submenu items', () => {
      renderSidebar();
      
      expect(screen.getByText('Quick Start Wizard')).toBeInTheDocument();
      expect(screen.getByText('Layout Editor')).toBeInTheDocument();
      expect(screen.getByText('Share Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Email Reports')).toBeInTheDocument();
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });

  describe('Administration Section', () => {
    it('should render admin section', () => {
      renderSidebar();
      expect(screen.getByTestId('link-admin')).toBeInTheDocument();
    });

    it('should expand admin submenu', () => {
      renderSidebar();
      fireEvent.click(screen.getByTestId('link-admin'));
      
      expect(screen.getByTestId('link-admin-users')).toBeInTheDocument();
    });

    it('should have all admin submenu items', () => {
      renderSidebar();
      fireEvent.click(screen.getByTestId('link-admin'));
      
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('AI Settings')).toBeInTheDocument();
      expect(screen.getByTestId('link-usage')).toBeInTheDocument();
      expect(screen.getByTestId('link-settings')).toBeInTheDocument();
    });
  });

  describe('Collapsible Functionality', () => {
    it('should toggle section open/close', () => {
      renderSidebar();
      const analyticsSection = screen.getByTestId('link-analytics');
      
      // Initially closed
      fireEvent.click(analyticsSection);
      expect(screen.getByText('Chart Builder')).toBeInTheDocument();
      
      // Close it
      fireEvent.click(analyticsSection);
    });
  });
});
