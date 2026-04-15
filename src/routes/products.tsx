import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { getProducts, saveProduct, updateProduct, deleteProduct, type Product } from "@/lib/store";
import { printBarcodeLabel } from "@/lib/print-utils";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Search, Barcode, Pencil, Printer } from "lucide-react";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", buyPrice: 0, sellPrice: 0, stock: 0 });
  const [loading, setLoading] = useState(true);
  const [printQty, setPrintQty] = useState<{ [id: string]: number }>({});
  const [showPrintModal, setShowPrintModal] = useState<Product | null>(null);
  const [labelQty, setLabelQty] = useState(1);

  const loadData = useCallback(async () => {
    try { setProducts(await getProducts()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Search by name OR barcode - case insensitive
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)
  );

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: "", buyPrice: 0, sellPrice: 0, stock: 0 });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ name: p.name, buyPrice: p.buyPrice, sellPrice: p.sellPrice, stock: p.stock });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: form.name, buyPrice: form.buyPrice, sellPrice: form.sellPrice, stock: form.stock,
      });
    } else {
      await saveProduct({ name: form.name, category: "", buyPrice: form.buyPrice, sellPrice: form.sellPrice, stock: form.stock });
    }
    await loadData();
    setForm({ name: "", buyPrice: 0, sellPrice: 0, stock: 0 });
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    await loadData();
  };

  const handlePrint = (product: Product) => {
    setShowPrintModal(product);
    setLabelQty(1);
  };

  const confirmPrint = () => {
    if (showPrintModal && labelQty > 0) {
      printBarcodeLabel(showPrintModal, labelQty);
      setShowPrintModal(null);
    }
  };

  return (
    <PageLayout title="المنتجات والمخزون" subtitle={`${products.length} منتج`}
      actions={<button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"><Plus className="w-4 h-4" /> إضافة منتج</button>}
    >
      {/* Search - type barcode or name */}
      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input type="text" placeholder="بحث بالاسم أو الباركود..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-96 pr-12 pl-4 py-3 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        {search && filtered.length > 0 && filtered.length <= 5 && (
          <div className="absolute top-full right-0 mt-1 w-full md:w-96 bg-card border border-border rounded-xl shadow-lg z-30 overflow-hidden">
            {filtered.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-0" onClick={() => setSearch(p.barcode)}>
                <div>
                  <span className="font-medium text-sm">{p.name}</span>
                  <span className="text-muted-foreground text-xs mr-2">باركود: {p.barcode}</span>
                </div>
                <span className="text-xs text-muted-foreground">{p.sellPrice.toLocaleString('ar-EG')} ج.م</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print quantity modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowPrintModal(null)}>
          <div className="bg-card rounded-2xl border border-border p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-lg font-bold mb-2">طباعة باركود</h2>
            <p className="text-muted-foreground text-sm mb-4">{showPrintModal.name} - باركود: {showPrintModal.barcode}</p>
            <div className="mb-2">
              <label className="text-sm text-muted-foreground mb-1 block">عدد الملصقات</label>
              <input type="number" value={labelQty} onChange={e => setLabelQty(Math.max(1, +e.target.value))} min={1} max={100} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none text-center text-lg" />
            </div>
            <p className="text-xs text-muted-foreground mb-4">الطابعة: XP-233B (58mm) - حجم الملصق: 40×30mm</p>
            <div className="flex gap-3">
              <button onClick={confirmPrint} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"><Printer className="w-4 h-4" /> طباعة</button>
              <button onClick={() => setShowPrintModal(null)} className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl font-medium hover:bg-secondary/80 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center" onClick={() => { setShowForm(false); setEditingProduct(null); }}>
          <div className="bg-card rounded-2xl border border-border p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-bold mb-6">{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
            <div className="grid gap-4">
              {editingProduct && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">الباركود</label>
                  <input value={editingProduct.barcode} disabled className="w-full px-4 py-2.5 rounded-xl border border-input bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
              )}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">اسم المنتج</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
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
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">حفظ</button>
              <button onClick={() => { setShowForm(false); setEditingProduct(null); }} className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl font-medium hover:bg-secondary/80 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-muted/50 border-b border-border">
              <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الباركود</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">المنتج</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">سعر الشراء</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">سعر البيع</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">المخزون</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">إجراءات</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">{loading ? 'جاري التحميل...' : 'لا توجد منتجات'}</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono flex items-center gap-2"><Barcode className="w-4 h-4 text-muted-foreground" />{p.barcode}</td>
                  <td className="px-6 py-4 text-sm font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-sm">{p.buyPrice.toLocaleString('ar-EG')} ج.م</td>
                  <td className="px-6 py-4 text-sm">{p.sellPrice.toLocaleString('ar-EG')} ج.م</td>
                  <td className="px-6 py-4 text-sm"><span className={`px-3 py-1 rounded-lg text-xs font-semibold ${p.stock <= 5 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>{p.stock}</span></td>
                  <td className="px-6 py-4 flex items-center gap-1">
                    <button onClick={() => handlePrint(p)} className="text-accent-foreground hover:bg-accent/10 p-2 rounded-lg transition-colors" title="طباعة باركود"><Printer className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(p)} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
