import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, FileText, ShoppingCart, Package, Users, Wallet, RotateCcw, BarChart3, LogOut, Crown,
} from "lucide-react";

const navItems = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/sales", label: "فواتير البيع", icon: FileText },
  { to: "/purchases", label: "فواتير المشتريات", icon: ShoppingCart },
  { to: "/products", label: "المنتجات والمخزون", icon: Package },
  { to: "/customers", label: "العملاء والموردين", icon: Users },
  { to: "/expenses", label: "المصروفات", icon: Wallet },
  { to: "/returns", label: "المرتجعات", icon: RotateCcw },
  { to: "/reports", label: "التقارير", icon: BarChart3 },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/login' });
  };
  return (
    <aside className="fixed top-0 right-0 h-screen w-[270px] bg-sidebar text-sidebar-foreground flex flex-col z-50 shadow-2xl">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center shadow-lg">
            <Crown className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold tracking-tight">المدير</h1>
            <p className="text-[11px] text-sidebar-accent-foreground/50 font-medium">نظام الإدارة والمحاسبة</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-200
                ${isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium w-full text-sidebar-foreground/50 hover:bg-destructive/15 hover:text-destructive transition-all duration-200">
          <LogOut className="w-[18px] h-[18px]" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
