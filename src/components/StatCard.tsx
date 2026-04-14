import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

const variantStyles = {
  default: "bg-card border-border shadow-sm",
  primary: "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/15 shadow-sm shadow-primary/5",
  success: "bg-gradient-to-br from-success/5 to-success/10 border-success/15 shadow-sm shadow-success/5",
  warning: "bg-gradient-to-br from-warning/5 to-warning/10 border-warning/15 shadow-sm shadow-warning/5",
  destructive: "bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/15 shadow-sm shadow-destructive/5",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground font-medium mb-2">{title}</p>
          <p className="font-heading text-2xl font-bold text-foreground tracking-tight">{value}</p>
          {trend && <p className="text-xs text-muted-foreground mt-2">{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconStyles[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
