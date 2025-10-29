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

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <TooltipProvider>
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <header className="flex items-center justify-between h-14 px-3 sm:px-4 border-b border-border shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="hidden sm:block truncate">
                  <h2 className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    Enterprise Analytics Platform
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  data-testid="button-ai-panel-toggle"
                  aria-label="Toggle AI panel"
                  className="shrink-0"
                >
                  {isChatOpen ? (
                    <PanelRightClose className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <PanelRightOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="button-user-menu" className="shrink-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.username}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <div className="flex flex-1 min-h-0 overflow-hidden">
              <main className="flex-1 overflow-y-auto">
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/data" component={DataSources} />
                  <Route path="/insights" component={Insights} />
                  <Route path="/analytics" component={Analytics} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/admin" component={AdminPage} />
                  <Route path="/ai-settings" component={AISettingsPage} />
                  <Route path="/usage" component={UsageDashboard} />
                  <Route component={NotFound} />
                </Switch>
              </main>

              {/* Desktop AI Chat Panel */}
              <div className={`hidden lg:block border-l border-border shrink-0 transition-all duration-300 ${isChatOpen ? 'w-96' : 'w-0 overflow-hidden'}`}>
                {isChatOpen && <AIChatPanel />}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile AI Chat Panel */}
        <Sheet open={isChatOpen && window.innerWidth < 1024} onOpenChange={setIsChatOpen}>
          <SheetContent side="right" className="w-full sm:w-96 p-0">
            <AIChatPanel />
          </SheetContent>
        </Sheet>
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
          <Router />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;