import JsBarcode from 'jsbarcode';
import type { Product, Invoice } from './store';

// Barcode printer settings for XP-233B (58mm thermal printer)
const PRINTER_SETTINGS = {
  name: 'xp-233b',
  labelWidth: 40, // mm
  labelHeight: 30, // mm
  dpi: 203,
};

export function printBarcodeLabel(product: Product, quantity: number = 1) {
  const labels = Array.from({ length: quantity }, () => `
    <div style="
      width: ${PRINTER_SETTINGS.labelWidth}mm;
      height: ${PRINTER_SETTINGS.labelHeight}mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      padding: 1mm 2mm;
      box-sizing: border-box;
    ">
      <div style="font-size: 13px; font-weight: bold; text-align: center; margin-bottom: 1px;">سنتر المدير</div>
      <div style="font-size: 15px; font-weight: bold; text-align: center; margin-bottom: 1px;">${product.sellPrice.toLocaleString('ar-EG')} ج.م</div>
      <div style="font-size: 11px; font-weight: bold; text-align: center; margin-bottom: 1px; max-width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${product.name}</div>
      <div style="font-size: 10px; text-align: center; letter-spacing: 1px;">${product.barcode}</div>
    </div>
  `).join('');

  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html><html dir="rtl"><head>
    <title>طباعة باركود - ${product.name}</title>
    <style>
      @page { size: ${PRINTER_SETTINGS.labelWidth}mm ${PRINTER_SETTINGS.labelHeight}mm; margin: 0; }
      body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
      @media print { body { margin: 0; } }
    </style>
  </head><body>${labels}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
}

export function printInvoice(invoice: Invoice, type: 'sale' | 'purchase' | 'sale_return' | 'purchase_return') {
  const typeLabel = {
    sale: 'فاتورة بيع',
    purchase: 'فاتورة شراء',
    sale_return: 'مرتجع مبيعات',
    purchase_return: 'مرتجع مشتريات',
  }[type];

  const formatCurrency = (n: number) => n.toLocaleString('ar-EG') + ' ج.م';
  const remaining = invoice.netTotal - invoice.paid;

  const itemsRows = invoice.items.map((item, i) => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${i + 1}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;">${item.productName}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${formatCurrency(item.price)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html><html dir="rtl"><head>
    <title>${typeLabel} - ${invoice.id.slice(0, 8)}</title>
    <style>
      @page { size: A4; margin: 15mm; }
      body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; }
      .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
      .header h1 { margin: 0; font-size: 28px; color: #1e40af; }
      .header h2 { margin: 5px 0 0; font-size: 18px; color: #555; }
      .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
      .info-block { background: #f8fafc; padding: 12px 16px; border-radius: 8px; min-width: 200px; }
      .info-block label { font-size: 12px; color: #888; display: block; }
      .info-block span { font-size: 15px; font-weight: bold; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { background: #1e40af; color: white; padding: 10px 8px; font-size: 13px; }
      .totals { margin-right: auto; width: 300px; }
      .totals div { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
      .totals .net { font-size: 18px; font-weight: bold; color: #1e40af; border-top: 2px solid #1e40af; padding-top: 10px; }
      .footer { text-align: center; margin-top: 40px; color: #aaa; font-size: 12px; }
      @media print { body { padding: 0; } }
    </style>
  </head><body>
    <div class="header">
      <h1>المدير</h1>
      <h2>${typeLabel}</h2>
    </div>
    <div class="info">
      <div class="info-block"><label>رقم الفاتورة</label><span>${invoice.id.slice(0, 8)}</span></div>
      <div class="info-block"><label>التاريخ</label><span>${invoice.date}</span></div>
      <div class="info-block"><label>${type.includes('purchase') ? 'المورد' : 'العميل'}</label><span>${invoice.customerName || 'نقدي'}</span></div>
    </div>
    <table>
      <thead><tr>
        <th style="width:40px">#</th>
        <th>المنتج</th>
        <th style="width:70px">الكمية</th>
        <th style="width:100px">السعر</th>
        <th style="width:100px">الإجمالي</th>
      </tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <div class="totals">
      <div><span>الإجمالي</span><span>${formatCurrency(invoice.total)}</span></div>
      <div><span>الخصم</span><span>${formatCurrency(invoice.discount)}</span></div>
      <div class="net"><span>الصافي</span><span>${formatCurrency(invoice.netTotal)}</span></div>
      <div><span>المدفوع</span><span>${formatCurrency(invoice.paid)}</span></div>
      <div><span>المتبقي</span><span style="color:${remaining > 0 ? '#dc2626' : '#16a34a'}">${formatCurrency(remaining)}</span></div>
    </div>
    ${invoice.notes ? `<div style="background:#f8fafc;padding:12px;border-radius:8px;margin-top:15px;"><strong>ملاحظات:</strong> ${invoice.notes}</div>` : ''}
    <div class="footer">تم الإنشاء بواسطة نظام المدير</div>
  </body></html>`;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
}
