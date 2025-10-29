import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AIChatPanel } from "@/components/ai/ai-chat-panel";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import DataSources from "@/pages/data-sources";
import Insights from "@/pages/insights";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import AdminPage from "./pages/admin";
import AISettingsPage from "@/pages/ai-settings";
import UsageDashboard from "@/pages/usage-dashboard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen, LogOut, User } from "lucide-react";
import { Redirect } from "wouter";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock implementations for missing components and hooks
const Navigate = ({ to }) => {
  window.location.href = to;
  return null;
};
const LoginPage = () => <div>Login Page</div>; // Placeholder
const DashboardPage = () => <div>Dashboard Page</div>; // Placeholder
const DataSourcesPage = () => <div>Data Sources Page</div>; // Placeholder
const AnalyticsPage = () => <div>Analytics Page</div>; // Placeholder
const InsightsPage = () => <div>Insights Page</div>; // Placeholder
const SettingsPage = () => <div>Settings Page</div>; // Placeholder
const NotFoundPage = () => <div>Not Found Page</div>; // Placeholder
const SidebarInset = ({ children }) => <div>{children}</div>; // Placeholder

function ProtectedRoutes() {
  const [location] = useLocation();
  const authContext = useAuth();

  if (!authContext) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Authentication context error. Please refresh the page.</div>
      </div>
    );
  }

  const { user, loading } = authContext;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Public routes that don't require authentication
  if (location === '/login') {
    return user ? <Navigate to="/" /> : <Login />;
  }

  // Protected routes - redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Main app layout with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/data-sources" component={DataSources} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/insights" component={Insights} />
            <Route path="/settings" component={Settings} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/ai-settings" component={AISettingsPage} />
            <Route path="/usage" component={UsageDashboard} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <ProtectedRoutes />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;