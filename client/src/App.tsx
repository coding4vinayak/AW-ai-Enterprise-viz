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
import DashboardWizard from "@/pages/dashboard-wizard";
import DashboardBuilder from "@/pages/dashboard-builder";
import { lazy } from "react";

// Navigate component for redirects
const Navigate = ({ to }: { to: string }) => {
  window.location.href = to;
  return null;
};

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
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-2 border-b" data-testid="header-main">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-user-menu">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium" data-testid="text-user-email">{user?.email}</p>
                      <p className="text-xs text-muted-foreground" data-testid="text-user-role">{user?.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/settings" data-testid="link-settings">Settings</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={authContext.logout} data-testid="button-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard-builder" component={DashboardBuilder} />
              <Route path="/chart-builder" component={lazy(() => import('./pages/chart-builder-advanced'))} />
              <Route path="/data-sources" component={DataSources} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/insights" component={Insights} />
              <Route path="/settings" component={Settings} />
              <Route path="/admin" component={AdminPage} />
              <Route path="/ai-settings" component={AISettingsPage} />
              <Route path="/usage" component={UsageDashboard} />
              <Route path="/dashboard-wizard" component={DashboardWizard} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
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