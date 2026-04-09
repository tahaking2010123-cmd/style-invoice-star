import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { getCustomers, saveCustomer, deleteCustomer, type Customer } from "@/lib/store";
import { useState, useEffect } from "react";
import { Plus, Trash2, Users, Search } from "lucide-react";

export const Route = createFileRoute("/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", balance: 0 });

  useEffect(() => { setCustomers(getCustomers()); }, []);

  const filtered = customers.filter(c => c.name.includes(search) || c.phone.includes(search));

  const handleSave = () => {
    if (!form.name) return;
    saveCustomer(form);
    setCustomers(getCustomers());
    setForm({ name: "", phone: "", address: "", balance: 0 });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteCustomer(id);
    setCustomers(getCustomers());
  };

  return (
    <PageLayout
      title="العملاء"
      subtitle={`${customers.length} عميل`}
      actions={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> إضافة عميل
        </button>
      }
    >
      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input type="text" placeholder="بحث بالاسم أو رقم الهاتف..." value={search} onChange={e => setSearch(e.target.value)} className="w-full md:w-96 pr-12 pl-4 py-3 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-bold mb-6">إضافة عميل جديد</h2>
            <div className="space-y-4">
              <div><label className="text-sm text-muted-foreground mb-1 block">الاسم</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" /></div>
              <div><label className="text-sm text-muted-foreground mb-1 block">رقم الهاتف</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" /></div>
              <div><label className="text-sm text-muted-foreground mb-1 block">العنوان</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" /></div>
              <div><label className="text-sm text-muted-foreground mb-1 block">الرصيد (مديونية)</label><input type="number" value={form.balance} onChange={e => setForm({...form, balance: +e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" /></div>
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
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الاسم</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الهاتف</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">العنوان</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الرصيد</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">إجراءات</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />لا يوجد عملاء</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium">{c.name}</td>
                <td className="px-6 py-4 text-sm">{c.phone}</td>
                <td className="px-6 py-4 text-sm">{c.address}</td>
                <td className="px-6 py-4 text-sm"><span className={c.balance > 0 ? 'text-destructive font-semibold' : 'text-success font-semibold'}>{c.balance.toLocaleString('ar-EG')} ج.م</span></td>
                <td className="px-6 py-4"><button onClick={() => handleDelete(c.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
