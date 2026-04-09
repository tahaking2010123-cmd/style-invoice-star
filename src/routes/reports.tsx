import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { getStats, getInvoices, getExpenses } from "@/lib/store";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [stats, setStats] = useState(getStats());
  const [salesByDate, setSalesByDate] = useState<Record<string, number>>({});
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, number>>({});

  useEffect(() => {
    setStats(getStats());

    const sales = getInvoices('sale');
    const byDate: Record<string, number> = {};
    sales.forEach(s => { byDate[s.date] = (byDate[s.date] || 0) + s.netTotal; });
    setSalesByDate(byDate);

    const expenses = getExpenses();
    const byCat: Record<string, number> = {};
    expenses.forEach(e => { byCat[e.category || 'أخرى'] = (byCat[e.category || 'أخرى'] || 0) + e.amount; });
    setExpensesByCategory(byCat);
  }, []);

  const formatCurrency = (n: number) => n.toLocaleString('ar-EG') + ' ج.م';

  return (
    <PageLayout title="التقارير المالية" subtitle="ملخص شامل للأداء المالي">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-primary" /></div>
            <span className="text-sm text-muted-foreground">إجمالي المبيعات</span>
          </div>
          <p className="font-heading text-2xl font-bold text-primary">{formatCurrency(stats.totalSales)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-warning" /></div>
            <span className="text-sm text-muted-foreground">إجمالي المشتريات</span>
          </div>
          <p className="font-heading text-2xl font-bold text-warning">{formatCurrency(stats.totalPurchases)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-destructive" /></div>
            <span className="text-sm text-muted-foreground">المصروفات</span>
          </div>
          <p className="font-heading text-2xl font-bold text-destructive">{formatCurrency(stats.totalExpenses)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-success" /></div>
            <span className="text-sm text-muted-foreground">صافي الربح</span>
          </div>
          <p className={`font-heading text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(stats.totalProfit)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Date */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />المبيعات حسب التاريخ</h2>
          {Object.keys(salesByDate).length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">لا توجد بيانات</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(salesByDate).slice(-10).map(([date, amount]) => (
                <div key={date} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <span className="text-sm">{date}</span>
                  <span className="font-semibold text-sm text-primary">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-destructive" />المصروفات حسب التصنيف</h2>
          {Object.keys(expensesByCategory).length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">لا توجد بيانات</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(expensesByCategory).map(([cat, amount]) => (
                <div key={cat} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <span className="text-sm">{cat}</span>
                  <span className="font-semibold text-sm text-destructive">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
