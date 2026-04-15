import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { getProducts, getCustomers, getInvoices, saveInvoice, updateInvoice, type InvoiceItem, type Product, type Invoice, type Customer } from "@/lib/store";
import { printInvoice } from "@/lib/print-utils";
import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Trash2, Pencil, Printer } from "lucide-react";

export const Route = createFileRoute("/sales")({
  component: SalesPage,
});

function SalesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [notes, setNotes] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [p, inv, c] = await Promise.all([getProducts(), getInvoices('sale'), getCustomers('buyer')]);
      setProducts(p); setInvoices(inv); setCustomers(c);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const total = items.reduce((sum, i) => sum + i.total, 0);
  const netTotal = total - discount;

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product || quantity <= 0) return;
    setItems([...items, { productId: product.id, productName: product.name, quantity, price: product.sellPrice, total: product.sellPrice * quantity }]);
    setSelectedProduct(""); setQuantity(1);
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const openNew = () => {
    setEditingId(null);
    setItems([]); setCustomerId(""); setDiscount(0); setPaid(0); setNotes(""); setError("");
    setShowForm(true);
  };

  const openEdit = (inv: Invoice) => {
    setEditingId(inv.id);
    setItems(inv.items);
    const customer = customers.find(c => c.name === inv.customerName);
    setCustomerId(customer?.id || "");
    setDiscount(inv.discount);
    setPaid(inv.paid);
    setNotes(inv.notes);
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!customerId) { setError("يجب اختيار العميل"); return; }
    if (items.length === 0) { setError("يجب إضافة منتج واحد على الأقل"); return; }
    setError("");
    const customer = customers.find(c => c.id === customerId);
    const invoiceData = {
      type: 'sale' as const, date: new Date().toISOString().split('T')[0],
      customerId, customerName: customer?.name || '', items, total, discount, netTotal, paid, notes,
    };
    if (editingId) {
      await updateInvoice(editingId, invoiceData);
    } else {
      await saveInvoice(invoiceData);
    }
    await loadData();
    setItems([]); setCustomerId(""); setDiscount(0); setPaid(0); setNotes(""); setEditingId(null); setShowForm(false);
  };

  const formatCurrency = (n: number) => n.toLocaleString('ar-EG') + ' ج.م';

  return (
    <PageLayout title="فواتير البيع" subtitle={`${invoices.length} فاتورة`}
      actions={<button onClick={openNew} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"><Plus className="w-4 h-4" /> فاتورة جديدة</button>}
    >
      {showForm && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center overflow-y-auto py-8" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-8 w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-bold mb-6">{editingId ? 'تعديل فاتورة بيع' : 'فاتورة بيع جديدة'}</h2>
            {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-4">{error}</div>}
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-1 block">اسم العميل <span className="text-destructive">*</span></label>
              <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none">
                <option value="">اختر العميل...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mb-4">
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none">
                <option value="">اختر منتج...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} - {p.sellPrice} ج.م (متاح: {p.stock})</option>)}
              </select>
              <input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)} min={1} className="w-20 px-3 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none text-center" />
              <button onClick={addItem} className="bg-accent text-accent-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors">إضافة</button>
            </div>
            {items.length > 0 && (
              <div className="bg-muted/30 rounded-xl p-4 mb-4 space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-card rounded-lg p-3">
                    <div><span className="font-medium text-sm">{item.productName}</span><span className="text-muted-foreground text-xs mr-2">× {item.quantity}</span></div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{formatCurrency(item.total)}</span>
                      <button onClick={() => removeItem(idx)} className="text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div><label className="text-sm text-muted-foreground mb-1 block">الإجمالي</label><div className="px-4 py-2.5 rounded-xl bg-muted font-semibold">{formatCurrency(total)}</div></div>
              <div><label className="text-sm text-muted-foreground mb-1 block">الخصم</label><input type="number" value={discount} onChange={e => setDiscount(+e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" /></div>
              <div><label className="text-sm text-muted-foreground mb-1 block">المدفوع</label><input type="number" value={paid} onChange={e => setPaid(+e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none" /></div>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 mb-4 flex justify-between items-center">
              <span className="font-heading font-bold text-lg">الصافي</span>
              <span className="font-heading font-bold text-xl text-primary">{formatCurrency(netTotal)}</span>
            </div>
            <div className="mb-6"><label className="text-sm text-muted-foreground mb-1 block">ملاحظات</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none resize-none" rows={2} /></div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">{editingId ? 'تحديث الفاتورة' : 'حفظ الفاتورة'}</button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl font-medium hover:bg-secondary/80 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-muted/50 border-b border-border">
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">رقم الفاتورة</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">التاريخ</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">العميل</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الصافي</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">المدفوع</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">إجراءات</th>
          </tr></thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />{loading ? 'جاري التحميل...' : 'لا توجد فواتير بعد'}</td></tr>
            ) : invoices.map(inv => (
              <tr key={inv.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm font-mono">{inv.id.slice(0, 8)}</td>
                <td className="px-6 py-4 text-sm">{inv.date}</td>
                <td className="px-6 py-4 text-sm font-medium">{inv.customerName || 'نقدي'}</td>
                <td className="px-6 py-4 text-sm font-semibold text-primary">{formatCurrency(inv.netTotal)}</td>
                <td className="px-6 py-4 text-sm">{formatCurrency(inv.paid)}</td>
                <td className="px-6 py-4 flex items-center gap-1">
                  <button onClick={() => printInvoice(inv, 'sale')} className="text-accent-foreground hover:bg-accent/10 p-2 rounded-lg transition-colors" title="طباعة"><Printer className="w-4 h-4" /></button>
                  <button onClick={() => openEdit(inv)} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
