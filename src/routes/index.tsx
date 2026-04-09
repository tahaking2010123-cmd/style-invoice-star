import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { StatCard } from "@/components/StatCard";
import { getStats, getInvoices } from "@/lib/store";
import {
  TrendingUp,
  ShoppingCart,
  Wallet,
  DollarSign,
  Package,
  Users,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState(getStats());
  const [recentSales, setRecentSales] = useState(getInvoices('sale').slice(-5).reverse());

  useEffect(() => {
    setStats(getStats());
    setRecentSales(getInvoices('sale').slice(-5).reverse());
  }, []);

  const formatCurrency = (n: number) => n.toLocaleString('ar-EG') + ' ج.م';

  return (
    <PageLayout title="لوحة التحكم" subtitle="نظرة عامة على أداء المحل">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="إجمالي المبيعات" value={formatCurrency(stats.totalSales)} icon={TrendingUp} variant="primary" />
        <StatCard title="إجمالي المشتريات" value={formatCurrency(stats.totalPurchases)} icon={ShoppingCart} variant="warning" />
        <StatCard title="المصروفات" value={formatCurrency(stats.totalExpenses)} icon={Wallet} variant="destructive" />
        <StatCard title="صافي الربح" value={formatCurrency(stats.totalProfit)} icon={DollarSign} variant="success" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="عدد المنتجات" value={stats.productsCount.toString()} icon={Package} />
        <StatCard title="عدد العملاء" value={stats.customersCount.toString()} icon={Users} />
        <StatCard title="عدد الفواتير" value={stats.salesCount.toString()} icon={FileText} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">آخر المبيعات</h2>
          {recentSales.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">لا توجد مبيعات بعد</p>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{sale.customerName || 'عميل نقدي'}</p>
                    <p className="text-xs text-muted-foreground">{sale.date}</p>
                  </div>
                  <p className="font-heading font-semibold text-primary">{formatCurrency(sale.netTotal)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            منتجات منخفضة المخزون
          </h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">جميع المنتجات متوفرة</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-destructive/5">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.barcode}</p>
                  </div>
                  <span className="text-sm font-semibold text-destructive">{product.stock} قطعة</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
