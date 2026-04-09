import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { getProducts, getInvoices, saveInvoice, type InvoiceItem, type Product, type Invoice } from "@/lib/store";
import { useState, useEffect, useCallback } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";

export const Route = createFileRoute("/returns")({
  component: ReturnsPage,
});

function ReturnsPage() {
  const [returns, setReturns] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [p, r] = await Promise.all([getProducts(), getInvoices('return')]);
      setProducts(p); setReturns(r);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const total = items.reduce((sum, i) => sum + i.total, 0);

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product || quantity <= 0) return;
    setItems([...items, { productId: product.id, productName: product.name, quantity, price: product.sellPrice, total: product.sellPrice * quantity }]);
    setSelectedProduct(""); setQuantity(1);
  };

  const handleSave = async () => {
    if (items.length === 0) return;
    await saveInvoice({ type: 'return', date: new Date().toISOString().split('T')[0], customerName, items, total, discount: 0, netTotal: total, paid: total, notes });
    await loadData();
    setItems([]); setCustomerName(""); setNotes(""); setShowForm(false);
  };

  const formatCurrency = (n: number) => n.toLocaleString('ar-EG') + ' ج.م';

  return (
    <PageLayout title="المرتجعات" subtitle={`${returns.length} مرتجع`}
      actions={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"><Plus className="w-4 h-4" /> مرتجع جديد</button>}
    >
      {showForm && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-8 w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-bold mb-6">مرتجع جديد</h2>
            <div className="mb-4"><label className="text-sm text-muted-foreground mb-1 block">اسم العميل</label><input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" /></div>
            <div className="flex gap-3 mb-4">
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none">
                <option value="">اختر منتج...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} - {p.sellPrice} ج.م</option>)}
              </select>
              <input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)} min={1} className="w-20 px-3 py-2.5 rounded-xl border border-input bg-background text-center focus:ring-2 focus:ring-ring focus:outline-none" />
              <button onClick={addItem} className="bg-accent text-accent-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors">إضافة</button>
            </div>
            {items.length > 0 && (
              <div className="bg-muted/30 rounded-xl p-4 mb-4 space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-card rounded-lg p-3">
                    <div><span className="font-medium text-sm">{item.productName}</span><span className="text-muted-foreground text-xs mr-2">× {item.quantity}</span></div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{formatCurrency(item.total)}</span>
                      <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-warning/10 rounded-xl p-4 mb-4 flex justify-between items-center">
              <span className="font-heading font-bold text-lg">إجمالي المرتجع</span>
              <span className="font-heading font-bold text-xl text-warning">{formatCurrency(total)}</span>
            </div>
            <div className="mb-6"><label className="text-sm text-muted-foreground mb-1 block">سبب المرتجع</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background resize-none focus:ring-2 focus:ring-ring focus:outline-none" rows={2} /></div>
            <div className="flex gap-3">
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
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">العميل</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">المبلغ</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">السبب</th>
          </tr></thead>
          <tbody>
            {returns.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-muted-foreground"><RotateCcw className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />{loading ? 'جاري التحميل...' : 'لا توجد مرتجعات'}</td></tr>
            ) : returns.map(r => (
              <tr key={r.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm">{r.date}</td>
                <td className="px-6 py-4 text-sm font-medium">{r.customerName || 'نقدي'}</td>
                <td className="px-6 py-4 text-sm font-semibold text-warning">{formatCurrency(r.netTotal)}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
