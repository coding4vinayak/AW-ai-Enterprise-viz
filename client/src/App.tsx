import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-theme-toggle";
import { AIChatPanel } from "@/components/ai/ai-chat-panel";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import DataSources from "@/pages/data-sources";
import Insights from "@/pages/insights";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen, LogOut } from "lucide-react";
import { Redirect } from "wouter";
import AdminPage from "./pages/admin";
import AISettingsPage from "@/pages/ai-settings";


function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType; path?: string }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component {...rest} />;
}

function Router() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route><Redirect to="/login" /></Route>
      </Switch>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">
                  {user?.username}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  title={isChatOpen ? "Close AI Chat" : "Open AI Chat"}
                >
                  {isChatOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                </Button>
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/data" component={DataSources} />
              <Route path="/insights" component={Insights} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/settings" component={Settings} />
              <Route path="/admin" component={AdminPage} />
              <Route path="/ai-settings" component={AISettingsPage} />
              <Route path="/login" component={Login} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
        <AIChatPanel open={isChatOpen} onOpenChange={setIsChatOpen} />
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();

  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  // Don't show sidebar on login page
  if (location === "/login" || !isAuthenticated) {
    return <Router />;
  }

  return (
    <TooltipProvider>
          <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 min-w-0">
                {/* Top Bar */}
                <header className="flex items-center justify-between h-16 px-4 border-b border-border shrink-0">
                  <div className="flex items-center gap-3">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <div className="hidden md:block">
                      <h2 className="text-sm font-medium text-muted-foreground">
                        Enterprise Analytics Platform
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAIPanel(!showAIPanel)}
                      data-testid="button-ai-panel-toggle"
                      aria-label="Toggle AI panel"
                    >
                      {showAIPanel ? (
                        <PanelRightClose className="h-5 w-5" />
                      ) : (
                        <PanelRightOpen className="h-5 w-5" />
                      )}
                    </Button>
                    <ThemeToggle />
                  </div>
                </header>

                {/* Main Content Area */}
                <div className="flex flex-1 min-h-0">
                  <main className="flex-1 overflow-hidden">
                    <Router />
                  </main>

                  {/* AI Chat Panel */}
                  {showAIPanel && (
                    <div className="w-[400px] border-l border-border shrink-0">
                      <AIChatPanel />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;