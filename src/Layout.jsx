import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  CreditCard, 
  Target, 
  Sparkles,
  Settings,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Transações",
    url: createPageUrl("Transactions"),
    icon: ArrowLeftRight,
  },
  {
    title: "Dívidas",
    url: createPageUrl("Debts"),
    icon: CreditCard,
  },
  {
    title: "Metas",
    url: createPageUrl("Goals"),
    icon: Target,
  },
  {
    title: "Análise IA",
    url: createPageUrl("AIAnalysis"),
    icon: Sparkles,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative overflow-hidden">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent -z-10" />
        
        <Sidebar className="border-r border-white/10 bg-black/20 backdrop-blur-xl">
          <SidebarHeader className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">FinanceAI</h2>
                <p className="text-xs text-purple-300">Controle Inteligente</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-purple-300 uppercase tracking-wider px-3 py-2">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`relative mb-1 transition-all duration-300 ${
                            isActive 
                              ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-white border-l-2 border-purple-400' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                            <item.icon className="w-4 h-4" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">
                  {user?.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-purple-300 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
              onClick={() => base44.auth.logout()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-white/10 p-2 rounded-lg transition-colors" />
              <h1 className="text-xl font-bold text-white">FinanceAI</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
      
      <style>{`
        :root {
          --sidebar-background: transparent;
          --sidebar-foreground: white;
        }
      `}</style>
    </SidebarProvider>
  );
}