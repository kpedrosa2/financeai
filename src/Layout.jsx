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
  LogOut,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative overflow-hidden">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent -z-10" />
        
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex border-r border-white/10 bg-black/40 backdrop-blur-xl">
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

        {/* Mobile Menu */}
        <div className="md:hidden">
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          
          <div className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-r border-white/20 z-50 transform transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">FinanceAI</h2>
                    <p className="text-xs text-purple-300">Controle Inteligente</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs font-medium text-purple-300 uppercase tracking-wider px-3 mb-2">Menu</p>
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-white border-l-2 border-purple-400'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
              <div className="flex items-center gap-3 mb-3 px-2">
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
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                onClick={() => base44.auth.logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="text-white hover:bg-white/10"
              >
                <Menu className="w-6 h-6" />
              </Button>
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