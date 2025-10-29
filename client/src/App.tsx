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
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/data">
        {() => <ProtectedRoute component={DataSources} />}
      </Route>
      <Route path="/insights">
        {() => <ProtectedRoute component={Insights} />}
      </Route>
      <Route path="/analytics">
        {() => <ProtectedRoute component={Analytics} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={Settings} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const { user } = useAuth();
  const [location] = useLocation();

  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  // Don't show sidebar on login page
  if (location === "/login" || !user) {
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
