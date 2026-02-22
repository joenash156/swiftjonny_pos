interface ReceiptItem {
  product_name: string;
  quantity: number;
  product_price: number;
  price: number;
}

interface ReceiptData {
  public_id: string;
  receipt_header: string;
  receipt_footer: string;
  cashier_name: string;
  payment_method: string;
  items: ReceiptItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  created_at: string | Date;
}

function fmt(n: number): string {
  return `GH₵ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleString("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function printSaleReceipt(receipt: ReceiptData): void {
  const itemsHtml = receipt.items
    .map(
      (item) => `
      <tr>
        <td style="padding:3px 0">${item.product_name}</td>
        <td style="padding:3px 0;text-align:center">${item.quantity}</td>
        <td style="padding:3px 0;text-align:right">${fmt(item.product_price)}</td>
        <td style="padding:3px 0;text-align:right">${fmt(item.price)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8" />
  <title>Receipt #${receipt.public_id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #111; background: #fff; padding: 16px; max-width: 320px; margin: 0 auto; }
    h2 { font-size: 16px; text-align: center; margin-bottom: 4px; }
    .sub { text-align: center; font-size: 12px; color: #555; margin-bottom: 10px; }
    hr { border: none; border-top: 1px dashed #aaa; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 11px; text-transform: uppercase; color: #777; padding: 2px 0; }
    .totals td { padding: 2px 0; }
    .totals .label { color: #555; }
    .grand { font-weight: bold; font-size: 15px; }
    .footer { text-align: center; font-size: 12px; color: #555; margin-top: 10px; }
    @media print { body { padding: 0; } }
  </style>
</head><body>
  <h2>${receipt.receipt_header}</h2>
  <div class="sub">Receipt #${receipt.public_id.slice(0, 12).toUpperCase()}</div>
  <div class="sub">${fmtDate(receipt.created_at)}</div>
  <div class="sub">Cashier: ${receipt.cashier_name}</div>
  <hr/>
  <table>
    <thead>
      <tr>
        <th style="text-align:left">Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <hr/>
  <table class="totals">
    <tr><td class="label">Subtotal</td><td style="text-align:right">${fmt(receipt.subtotal)}</td></tr>
    <tr><td class="label">Discount</td><td style="text-align:right">-${fmt(receipt.discount_amount)}</td></tr>
    <tr><td class="label">Tax</td><td style="text-align:right">+${fmt(receipt.tax_amount)}</td></tr>
    <tr class="grand"><td>TOTAL</td><td style="text-align:right">${fmt(receipt.total)}</td></tr>
    <tr><td class="label" style="padding-top:4px">Payment</td><td style="text-align:right;text-transform:capitalize;padding-top:4px">${receipt.payment_method}</td></tr>
  </table>
  <hr/>
  <div class="footer">${receipt.receipt_footer}</div>
  <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }</script>
</body></html>`;

  const win = window.open("", "_blank", "width=400,height=600");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
