import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  RotateCcw,
  BarChart3,
  Store,
} from "lucide-react";

const navItems = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/sales", label: "فواتير البيع", icon: FileText },
  { to: "/purchases", label: "فواتير المشتريات", icon: ShoppingCart },
  { to: "/products", label: "المنتجات والمخزون", icon: Package },
  { to: "/customers", label: "العملاء", icon: Users },
  { to: "/expenses", label: "المصروفات", icon: Wallet },
  { to: "/returns", label: "المرتجعات", icon: RotateCcw },
  { to: "/reports", label: "التقارير", icon: BarChart3 },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed top-0 right-0 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Store className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold">محل الأناقة</h1>
            <p className="text-xs text-sidebar-accent-foreground opacity-60">نظام المحاسبة</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-center text-sidebar-foreground/40">نظام محاسبة v1.0</p>
      </div>
    </aside>
  );
}
