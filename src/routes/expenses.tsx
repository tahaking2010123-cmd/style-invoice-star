import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { getExpenses, saveExpense, deleteExpense, type Expense } from "@/lib/store";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";

export const Route = createFileRoute("/expenses")({
  component: ExpensesPage,
});

function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], category: "", description: "", amount: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try { setExpenses(await getExpenses()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSave = async () => {
    if (!form.description || form.amount <= 0) return;
    await saveExpense(form);
    await loadData();
    setForm({ date: new Date().toISOString().split('T')[0], category: "", description: "", amount: 0 });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    await loadData();
  };

  return (
    <PageLayout title="المصروفات" subtitle={`إجمالي: ${total.toLocaleString('ar-EG')} ج.م`}
      actions={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"><Plus className="w-4 h-4" /> إضافة مصروف</button>}
    >
      {showForm && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-bold mb-6">إضافة مصروف</h2>
            <div className="space-y-4">
              <div><label className="text-sm text-muted-foreground mb-1 block">التاريخ</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" /></div>
              <div><label className="text-sm text-muted-foreground mb-1 block">التصنيف</label><input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="إيجار، كهرباء، مرتبات..." className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" /></div>
              <div><label className="text-sm text-muted-foreground mb-1 block">الوصف</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" /></div>
              <div><label className="text-sm text-muted-foreground mb-1 block">المبلغ</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: +e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">حفظ</button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl font-medium hover:bg-secondary/80 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-muted/50 border-b border-border">
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">التاريخ</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">التصنيف</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الوصف</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">المبلغ</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">إجراءات</th>
          </tr></thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground"><Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />{loading ? 'جاري التحميل...' : 'لا توجد مصروفات'}</td></tr>
            ) : expenses.map(e => (
              <tr key={e.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm">{e.date}</td>
                <td className="px-6 py-4 text-sm"><span className="bg-accent/10 text-accent px-3 py-1 rounded-lg text-xs font-medium">{e.category}</span></td>
                <td className="px-6 py-4 text-sm">{e.description}</td>
                <td className="px-6 py-4 text-sm font-semibold text-destructive">{e.amount.toLocaleString('ar-EG')} ج.م</td>
                <td className="px-6 py-4"><button onClick={() => handleDelete(e.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
