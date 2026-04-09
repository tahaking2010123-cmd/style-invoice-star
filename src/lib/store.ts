// Simple localStorage-based store for the accounting system

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

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateBarcode(): string {
  return Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
}

function getStore<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Products
export function getProducts(): Product[] { return getStore<Product>('products'); }
export function saveProduct(p: Omit<Product, 'id' | 'barcode'>): Product {
  const products = getProducts();
  const product: Product = { ...p, id: generateId(), barcode: generateBarcode() };
  products.push(product);
  setStore('products', products);
  return product;
}
export function updateProduct(id: string, updates: Partial<Product>): void {
  const products = getProducts().map(p => p.id === id ? { ...p, ...updates } : p);
  setStore('products', products);
}
export function deleteProduct(id: string): void {
  setStore('products', getProducts().filter(p => p.id !== id));
}

// Customers
export function getCustomers(): Customer[] { return getStore<Customer>('customers'); }
export function saveCustomer(c: Omit<Customer, 'id'>): Customer {
  const customers = getCustomers();
  const customer: Customer = { ...c, id: generateId() };
  customers.push(customer);
  setStore('customers', customers);
  return customer;
}
export function updateCustomer(id: string, updates: Partial<Customer>): void {
  const customers = getCustomers().map(c => c.id === id ? { ...c, ...updates } : c);
  setStore('customers', customers);
}
export function deleteCustomer(id: string): void {
  setStore('customers', getCustomers().filter(c => c.id !== id));
}

// Invoices
export function getInvoices(type?: Invoice['type']): Invoice[] {
  const invoices = getStore<Invoice>('invoices');
  return type ? invoices.filter(i => i.type === type) : invoices;
}
export function saveInvoice(inv: Omit<Invoice, 'id'>): Invoice {
  const invoices = getInvoices();
  const invoice: Invoice = { ...inv, id: generateId() };
  invoices.push(invoice);
  setStore('invoices', invoices);
  
  // Update stock
  const products = getProducts();
  inv.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      if (inv.type === 'sale') product.stock -= item.quantity;
      else if (inv.type === 'purchase') product.stock += item.quantity;
      else if (inv.type === 'return') product.stock += item.quantity;
    }
  });
  setStore('products', products);
  
  return invoice;
}

// Expenses
export function getExpenses(): Expense[] { return getStore<Expense>('expenses'); }
export function saveExpense(e: Omit<Expense, 'id'>): Expense {
  const expenses = getExpenses();
  const expense: Expense = { ...e, id: generateId() };
  expenses.push(expense);
  setStore('expenses', expenses);
  return expense;
}
export function deleteExpense(id: string): void {
  setStore('expenses', getExpenses().filter(e => e.id !== id));
}

// Stats
export function getStats() {
  const sales = getInvoices('sale');
  const purchases = getInvoices('purchase');
  const expenses = getExpenses();
  const products = getProducts();
  const customers = getCustomers();

  const totalSales = sales.reduce((sum, i) => sum + i.netTotal, 0);
  const totalPurchases = purchases.reduce((sum, i) => sum + i.netTotal, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalProfit = totalSales - totalPurchases - totalExpenses;
  const lowStockProducts = products.filter(p => p.stock <= 5);

  return {
    totalSales,
    totalPurchases,
    totalExpenses,
    totalProfit,
    salesCount: sales.length,
    productsCount: products.length,
    customersCount: customers.length,
    lowStockProducts,
  };
}
