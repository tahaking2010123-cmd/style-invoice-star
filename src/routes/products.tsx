import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { getProducts, saveProduct, deleteProduct, type Product } from "@/lib/store";
import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Barcode } from "lucide-react";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", buyPrice: 0, sellPrice: 0, stock: 0, size: "", color: "" });

  useEffect(() => { setProducts(getProducts()); }, []);

  const filtered = products.filter(p =>
    p.name.includes(search) || p.barcode.includes(search) || p.category.includes(search)
  );

  const handleSave = () => {
    if (!form.name) return;
    saveProduct(form);
    setProducts(getProducts());
    setForm({ name: "", category: "", buyPrice: 0, sellPrice: 0, stock: 0, size: "", color: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setProducts(getProducts());
  };

  return (
    <PageLayout
      title="المنتجات والمخزون"
      subtitle={`${products.length} منتج`}
      actions={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> إضافة منتج
        </button>
      }
    >
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="بحث بالاسم أو الباركود..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 pr-12 pl-4 py-3 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-bold mb-6">إضافة منتج جديد</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-muted-foreground mb-1 block">اسم المنتج</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">التصنيف</label>
                <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="رجالي، حريمي، أطفال" className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">المقاس</label>
                <input value={form.size} onChange={e => setForm({...form, size: e.target.value})} placeholder="S, M, L, XL" className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">اللون</label>
                <input value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">سعر الشراء</label>
                <input type="number" value={form.buyPrice} onChange={e => setForm({...form, buyPrice: +e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">سعر البيع</label>
                <input type="number" value={form.sellPrice} onChange={e => setForm({...form, sellPrice: +e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">الكمية</label>
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: +e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">حفظ</button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl font-medium hover:bg-secondary/80 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الباركود</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">المنتج</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">التصنيف</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">سعر الشراء</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">سعر البيع</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">المخزون</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">لا توجد منتجات</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono flex items-center gap-2"><Barcode className="w-4 h-4 text-muted-foreground" />{p.barcode}</td>
                  <td className="px-6 py-4 text-sm font-medium">{p.name}{p.size && <span className="text-muted-foreground mr-1">({p.size})</span>}{p.color && <span className="text-muted-foreground mr-1">- {p.color}</span>}</td>
                  <td className="px-6 py-4 text-sm">{p.category}</td>
                  <td className="px-6 py-4 text-sm">{p.buyPrice.toLocaleString('ar-EG')} ج.م</td>
                  <td className="px-6 py-4 text-sm">{p.sellPrice.toLocaleString('ar-EG')} ج.م</td>
                  <td className="px-6 py-4 text-sm"><span className={`px-3 py-1 rounded-lg text-xs font-semibold ${p.stock <= 5 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>{p.stock}</span></td>
                  <td className="px-6 py-4"><button onClick={() => handleDelete(p.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
