// Supabase-based store for the accounting system
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  size?: string;
  color?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  balance: number;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  type: 'sale' | 'purchase' | 'return';
  date: string;
  customerName: string;
  items: InvoiceItem[];
  total: number;
  discount: number;
  netTotal: number;
  paid: number;
  notes: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

function generateBarcode(): string {
  return Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
}

// ---- Products ----
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(p => ({
    id: p.id, name: p.name, barcode: p.barcode, category: p.category,
    buyPrice: Number(p.buy_price), sellPrice: Number(p.sell_price), stock: p.stock,
    size: p.size || undefined, color: p.color || undefined,
  }));
}

export async function saveProduct(p: Omit<Product, 'id' | 'barcode'>): Promise<Product> {
  const { data, error } = await supabase.from('products').insert({
    name: p.name, category: p.category || '',
    buy_price: p.buyPrice, sell_price: p.sellPrice, stock: p.stock,
    size: p.size || null, color: p.color || null,
  }).select().single();
  if (error) throw error;
  return { id: data.id, name: data.name, barcode: data.barcode, category: data.category,
    buyPrice: Number(data.buy_price), sellPrice: Number(data.sell_price), stock: data.stock,
    size: data.size || undefined, color: data.color || undefined };
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const { error } = await supabase.from('products').update({
    ...(updates.name !== undefined && { name: updates.name }),
    ...(updates.category !== undefined && { category: updates.category }),
    ...(updates.buyPrice !== undefined && { buy_price: updates.buyPrice }),
    ...(updates.sellPrice !== undefined && { sell_price: updates.sellPrice }),
    ...(updates.stock !== undefined && { stock: updates.stock }),
    ...(updates.size !== undefined && { size: updates.size }),
    ...(updates.color !== undefined && { color: updates.color }),
  }).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ---- Customers ----
export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(c => ({
    id: c.id, name: c.name, phone: c.phone, address: c.address, balance: Number(c.balance),
  }));
}

export async function saveCustomer(c: Omit<Customer, 'id'>): Promise<Customer> {
  const { data, error } = await supabase.from('customers').insert({
    name: c.name, phone: c.phone, address: c.address, balance: c.balance,
  }).select().single();
  if (error) throw error;
  return { id: data.id, name: data.name, phone: data.phone, address: data.address, balance: Number(data.balance) };
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
  const { error } = await supabase.from('customers').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
}

// ---- Invoices ----
export async function getInvoices(type?: Invoice['type']): Promise<Invoice[]> {
  let query = supabase.from('invoices').select('*').order('created_at', { ascending: false });
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) throw error;

  const invoices: Invoice[] = [];
  for (const inv of data || []) {
    const { data: itemsData } = await supabase.from('invoice_items').select('*').eq('invoice_id', inv.id);
    invoices.push({
      id: inv.id, type: inv.type as Invoice['type'], date: inv.date,
      customerName: inv.customer_name, total: Number(inv.total), discount: Number(inv.discount),
      netTotal: Number(inv.net_total), paid: Number(inv.paid), notes: inv.notes,
      items: (itemsData || []).map(i => ({
        productId: i.product_id || '', productName: i.product_name,
        quantity: i.quantity, price: Number(i.price), total: Number(i.total),
      })),
    });
  }
  return invoices;
}

export async function saveInvoice(inv: Omit<Invoice, 'id'>): Promise<Invoice> {
  const { data, error } = await supabase.from('invoices').insert({
    type: inv.type, date: inv.date, customer_name: inv.customerName,
    total: inv.total, discount: inv.discount, net_total: inv.netTotal,
    paid: inv.paid, notes: inv.notes,
  }).select().single();
  if (error) throw error;

  // Insert items
  if (inv.items.length > 0) {
    const { error: itemsError } = await supabase.from('invoice_items').insert(
      inv.items.map(item => ({
        invoice_id: data.id, product_id: item.productId || null,
        product_name: item.productName, quantity: item.quantity,
        price: item.price, total: item.total,
      }))
    );
    if (itemsError) throw itemsError;
  }

  // Update stock
  for (const item of inv.items) {
    if (!item.productId) continue;
    const { data: product } = await supabase.from('products').select('stock').eq('id', item.productId).single();
    if (product) {
      let newStock = product.stock;
      if (inv.type === 'sale') newStock -= item.quantity;
      else if (inv.type === 'purchase') newStock += item.quantity;
      else if (inv.type === 'return') newStock += item.quantity;
      await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
    }
  }

  return { ...inv, id: data.id };
}

// ---- Expenses ----
export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(e => ({
    id: e.id, date: e.date, category: e.category, description: e.description, amount: Number(e.amount),
  }));
}

export async function saveExpense(e: Omit<Expense, 'id'>): Promise<Expense> {
  const { data, error } = await supabase.from('expenses').insert({
    date: e.date, category: e.category, description: e.description, amount: e.amount,
  }).select().single();
  if (error) throw error;
  return { id: data.id, date: data.date, category: data.category, description: data.description, amount: Number(data.amount) };
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// ---- Stats ----
export async function getStats() {
  const [sales, purchases, expenses, products, customers] = await Promise.all([
    getInvoices('sale'), getInvoices('purchase'), getExpenses(), getProducts(), getCustomers(),
  ]);

  const totalSales = sales.reduce((sum, i) => sum + i.netTotal, 0);
  const totalPurchases = purchases.reduce((sum, i) => sum + i.netTotal, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalProfit = totalSales - totalPurchases - totalExpenses;
  const lowStockProducts = products.filter(p => p.stock <= 5);

  return {
    totalSales, totalPurchases, totalExpenses, totalProfit,
    salesCount: sales.length, productsCount: products.length,
    customersCount: customers.length, lowStockProducts,
  };
}

// ---- Backup Export ----
export async function exportBackupJSON(): Promise<string> {
  const [products, customers, invoices, expenses] = await Promise.all([
    getProducts(), getCustomers(), getInvoices(), getExpenses(),
  ]);
  return JSON.stringify({ products, customers, invoices, expenses, exportDate: new Date().toISOString() }, null, 2);
}

export async function exportBackupCSV(): Promise<{ products: string; customers: string; invoices: string; expenses: string }> {
  const [products, customers, invoices, expenses] = await Promise.all([
    getProducts(), getCustomers(), getInvoices(), getExpenses(),
  ]);

  const productsCsv = "الاسم,الباركود,التصنيف,سعر الشراء,سعر البيع,المخزون,المقاس,اللون\n" +
    products.map(p => `${p.name},${p.barcode},${p.category},${p.buyPrice},${p.sellPrice},${p.stock},${p.size||''},${p.color||''}`).join('\n');

  const customersCsv = "الاسم,الهاتف,العنوان,الرصيد\n" +
    customers.map(c => `${c.name},${c.phone},${c.address},${c.balance}`).join('\n');

  const invoicesCsv = "النوع,التاريخ,العميل,الإجمالي,الخصم,الصافي,المدفوع,ملاحظات\n" +
    invoices.map(i => `${i.type},${i.date},${i.customerName},${i.total},${i.discount},${i.netTotal},${i.paid},${i.notes}`).join('\n');

  const expensesCsv = "التاريخ,التصنيف,الوصف,المبلغ\n" +
    expenses.map(e => `${e.date},${e.category},${e.description},${e.amount}`).join('\n');

  return { products: productsCsv, customers: customersCsv, invoices: invoicesCsv, expenses: expensesCsv };
}
