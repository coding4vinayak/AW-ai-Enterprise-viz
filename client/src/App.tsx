import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AIChatPanel } from "@/components/ai/ai-chat-panel";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import DataSources from "@/pages/data-sources";
import Insights from "@/pages/insights";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/data" component={DataSources} />
      <Route path="/insights" component={Insights} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showAIPanel, setShowAIPanel] = useState(false);

  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
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
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
