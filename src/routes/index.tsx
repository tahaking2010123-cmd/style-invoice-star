import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { getStats, getInvoices, exportBackupJSON, type Invoice } from "@/lib/store";
import {
  TrendingUp, ShoppingCart, Wallet, DollarSign, Package, Users, FileText, AlertTriangle, Download,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { StatCard } from "@/components/StatCard";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

type Stats = Awaited<ReturnType<typeof getStats>>;

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSales, setRecentSales] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [s, sales] = await Promise.all([getStats(), getInvoices('sale')]);
      setStats(s);
      setRecentSales(sales.slice(0, 5));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleBackup = async () => {
    try {
      const json = await exportBackupJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  };

  const formatCurrency = (n: number) => n.toLocaleString('ar-EG') + ' ج.م';

  if (loading || !stats) return (
    <PageLayout title="لوحة التحكم" subtitle="جاري التحميل...">
      <div className="flex items-center justify-center py-20 text-muted-foreground">جاري تحميل البيانات...</div>
    </PageLayout>
  );

  return (
    <PageLayout title="لوحة التحكم" subtitle="نظرة عامة على أداء المحل"
      actions={
        <button onClick={handleBackup} className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors">
          <Download className="w-4 h-4" /> نسخة احتياطية
        </button>
      }
    >
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
