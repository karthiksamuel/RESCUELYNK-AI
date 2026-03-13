import {
  LayoutDashboard, Radio, Map, Bot, BookOpen, Bell, Settings, AlertTriangle, Globe, LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader,
  SidebarFooter, SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar";
import { useAlerts } from "@/lib/alertStore";
import { useAuth } from "@/lib/authContext";

const NAV_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "SOS Emergency", url: "/sos", icon: Radio },
  { title: "Rescue Map", url: "/map", icon: Map },
  { title: "AI Assistant", url: "/assistant", icon: Bot },
  { title: "Knowledge Library", url: "/knowledge", icon: BookOpen },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const alerts = useAlerts();
  const { logout, userRole } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getDashboardUrl = () => {
    if (userRole === "rescue_team") return "/rescuer-dashboard";
    if (userRole === "command_operator") return "/operator-dashboard";
    return "/dashboard";
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-none bg-sidebar/60 backdrop-blur-3xl shadow-[0_0_40px_rgba(0,0,0,0.9)]"
    >
      <SidebarHeader className="p-4 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_theme(colors.primary.DEFAULT/0.3)]">
            <AlertTriangle className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-bold text-foreground leading-tight tracking-tight">Rescue<span className="text-primary text-shadow-sm">Link</span></h1>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5 flex items-center gap-1.5 uppercase tracking-widest opacity-80">
                <Globe className="w-3 h-3 text-secondary" /> Global Mesh
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const actualUrl = item.title === "Dashboard" ? getDashboardUrl() : item.url;
                const isActive = location.pathname === actualUrl;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <NavLink
                        to={actualUrl}
                        end
                        className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-all group"
                        activeClassName="!bg-primary/[0.08] !text-primary shadow-[inset_0_0_20px_theme(colors.primary.DEFAULT/0.05)]"
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                        {!collapsed && (
                          <span className="text-sm font-medium">{item.title}</span>
                        )}
                        {!collapsed && item.title === "Alerts" && alerts.length > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            className="ml-auto text-[10px] bg-primary/90 text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-[0_0_10px_theme(colors.primary.DEFAULT/0.5)]"
                          >
                            {alerts.length}
                          </motion.span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-4">
        {/* Logout button */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 4, backgroundColor: "hsl(var(--destructive)/0.1)" }}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground hover:text-destructive transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Log out</span>}
        </motion.button>

        {!collapsed && (
          <div className="bg-white/[0.02] p-3 rounded-2xl flex items-center justify-between border border-white/[0.02] shadow-[inset_0_0_15px_rgba(255,255,255,0.01)]">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-safe animate-pulse shadow-[0_0_10px_theme(colors.safe.DEFAULT/0.8)]" />
              <div>
                <p className="text-xs font-semibold text-foreground/90">System Online</p>
                <p className="text-[10px] text-muted-foreground">Mesh active</p>
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
