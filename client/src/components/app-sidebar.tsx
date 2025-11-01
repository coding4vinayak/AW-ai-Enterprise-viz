import {
  LayoutDashboard, Database, Sparkles, Settings, TrendingUp, Shield, Brain,
  ChevronRight, FileSpreadsheet, Webhook, Link as LinkIcon, Mail, Share2,
  Filter, BarChart3, PieChart, LineChart, Calculator, Zap, Globe, Code
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SubMenuItem {
  title: string;
  url: string;
  icon: any;
  testId?: string;
}

interface MenuItem {
  title: string;
  url?: string;
  icon: any;
  testId?: string;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    testId: "link-dashboard",
  },
  {
    title: "Data Sources",
    icon: Database,
    testId: "link-data",
    subItems: [
      { title: "All Sources", url: "/data-sources", icon: FileSpreadsheet, testId: "link-data-all" },
      { title: "Upload Data", url: "/data-sources?upload=true", icon: Database },
      { title: "Webhooks", url: "/data-sources?tab=webhooks", icon: Webhook },
      { title: "API Connectors", url: "/data-connectors", icon: LinkIcon },
      { title: "GraphQL", url: "/data-connectors/graphql", icon: Code },
    ],
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    testId: "link-analytics",
    subItems: [
      {
        title: "Chart Builder",
        icon: BarChart3,
        url: "/analytics",
      },
      {
        title: "Chart Builder",
        icon: BarChart3,
        url: "/chart-builder",
      },
      { title: "Advanced Charts", url: "/chart-builder-advanced", icon: PieChart },
      { title: "Trends & Forecasts", url: "/analytics/trends", icon: LineChart },
      { title: "Calculated Fields", url: "/analytics/calculated-fields", icon: Calculator },
    ],
  },
  {
    title: "Dashboards",
    icon: LayoutDashboard,
    subItems: [
      { title: "Quick Start Wizard", url: "/dashboard-wizard", icon: Zap },
      { title: "Layout Editor", url: "/dashboard-builder", icon: LayoutDashboard },
      { title: "Share Dashboard", url: "/dashboard/share", icon: Share2 },
      { title: "Email Reports", url: "/dashboard/reports", icon: Mail },
      { title: "Filters", url: "/dashboard/filters", icon: Filter },
    ],
  },
  {
    title: "AI Insights",
    url: "/insights",
    icon: Sparkles,
    testId: "link-insights",
  },
  {
    title: "Administration",
    icon: Shield,
    testId: "link-admin",
    subItems: [
      { title: "User Management", url: "/admin", icon: Shield, testId: "link-admin-users" },
      { title: "AI Settings", url: "/ai-settings", icon: Brain },
      { title: "Usage & Quotas", url: "/usage", icon: TrendingUp, testId: "link-usage" },
      { title: "Settings", url: "/settings", icon: Settings, testId: "link-settings" },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [openSections, setOpenSections] = useState<string[]>(["Data Sources", "Analytics", "Dashboards"]);

  const toggleSection = (title: string) => {
    setOpenSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const isActiveUrl = (url: string) => {
    if (url === "/" && location === "/") return true;
    if (url !== "/" && location.startsWith(url)) return true;
    return false;
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">DataViz AI</h1>
            <p className="text-xs text-muted-foreground">Analytics Platform</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (!item.subItems) {
                  const isActive = isActiveUrl(item.url!);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url!} data-testid={item.testId}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible
                    key={item.title}
                    open={openSections.includes(item.title)}
                    onOpenChange={() => toggleSection(item.title)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton data-testid={item.testId}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                          <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${openSections.includes(item.title) ? 'rotate-90' : ''}`} />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => {
                            const isActive = isActiveUrl(subItem.url);
                            return (
                              <SidebarMenuSubItem key={subItem.url}>
                                <SidebarMenuSubButton asChild isActive={isActive}>
                                  <Link href={subItem.url} data-testid={subItem.testId}>
                                    <subItem.icon className="h-4 w-4" />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground">
          <p>Enterprise Analytics</p>
          <p className="font-mono">v2.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}