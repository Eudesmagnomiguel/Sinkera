const fmt = (n: number) => n.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) + ' Kz';
const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

const CSS = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif; color:#111; background:#fff; padding:48px; font-size:13px; line-height:1.5; }
  .page { max-width:760px; margin:0 auto; }
  /* header */
  .inv-header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:24px; border-bottom:2px solid #111; margin-bottom:28px; }
  .logo { font-size:26px; font-weight:900; letter-spacing:-1px; }
  .logo span { color:#7c3aed; }
  .company-info { font-size:11px; color:#555; margin-top:4px; line-height:1.6; }
  .inv-title-block { text-align:right; }
  .inv-title { font-size:22px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
  .inv-title.proforma { color:#7c3aed; }
  .inv-title.final { color:#059669; }
  .inv-meta { font-size:11px; color:#666; line-height:1.8; }
  .inv-meta strong { color:#111; font-weight:700; }
  /* party blocks */
  .parties { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:28px; }
  .party-block { background:#f7f7f7; border-radius:8px; padding:14px 16px; }
  .party-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:#888; margin-bottom:8px; }
  .party-name { font-size:14px; font-weight:700; color:#111; margin-bottom:4px; }
  .party-info { font-size:12px; color:#555; line-height:1.6; }
  /* table */
  .items-section { margin-bottom:24px; }
  table { width:100%; border-collapse:collapse; }
  thead tr { background:#111; color:#fff; }
  thead th { padding:10px 12px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.4px; text-align:left; }
  thead th.r { text-align:right; }
  thead th.c { text-align:center; }
  tbody tr:nth-child(even) { background:#f9f9f9; }
  tbody td { padding:10px 12px; font-size:13px; border-bottom:1px solid #eee; }
  tbody td.r { text-align:right; }
  tbody td.c { text-align:center; }
  tfoot td { padding:10px 12px; font-size:13px; border-top:2px solid #eee; }
  tfoot td.r { text-align:right; }
  /* totals */
  .totals-wrap { display:flex; justify-content:flex-end; margin-bottom:28px; }
  .totals { width:260px; background:#f3f0ff; border-radius:10px; padding:16px 20px; }
  .totals-row { display:flex; justify-content:space-between; font-size:13px; color:#555; margin-bottom:6px; }
  .totals-row.discount { color:#7c3aed; font-weight:600; }
  .totals-grand { display:flex; justify-content:space-between; font-size:18px; font-weight:900; color:#111; border-top:1px solid #c4b5fd; padding-top:10px; margin-top:4px; }
  /* footer row */
  .inv-footer-row { display:flex; justify-content:space-between; align-items:center; padding-top:20px; border-top:1px solid #eee; }
  .payment-badge { display:inline-block; background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; text-transform:uppercase; letter-spacing:0.4px; }
  .proforma-badge { display:inline-block; background:#f5f3ff; border:1px solid #c4b5fd; color:#5b21b6; font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; }
  .page-footer { margin-top:32px; text-align:center; font-size:11px; color:#aaa; padding-top:16px; border-top:1px solid #f0f0f0; }
  @media print { body { padding:20px; } }
`;

const COMPANY = `
  <div class="company-info">
    Luanda, Angola<br/>
    www.sinkera.ao · suporte@sinkera.ao<br/>
    Tel: +244 900 000 000
  </div>
`;

function openAndPrint(html: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 600);
}

// ─── Proforma Invoice (from cart) ──────────────────────────────────────────

export interface CartInvoiceItem {
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export function printProformaInvoice(params: {
  items: CartInvoiceItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  customerName?: string;
  customerEmail?: string;
  nif?: string;
  companyName?: string;
}) {
  const { items, subtotal, discount, couponCode, customerName, customerEmail, nif, companyName } = params;
  const clientName = companyName || customerName || 'Cliente';
  const total = subtotal - discount;
  const now = new Date();
  const validUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const proformaNo = 'PF-' + now.getFullYear() + ('0' + (now.getMonth() + 1)).slice(-2) + now.getDate() + '-' + Math.floor(Math.random() * 9000 + 1000);

  const rows = items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td class="c">${i.quantity}</td>
      <td class="r">${fmt(i.price)}</td>
      <td class="r" style="font-weight:600;">${fmt(i.price * i.quantity)}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"/><title>${proformaNo}</title><style>${CSS}</style></head>
<body><div class="page">
  <div class="inv-header">
    <div>
      <div class="logo">SINKE<span>RA</span></div>${COMPANY}
    </div>
    <div class="inv-title-block">
      <div class="inv-title proforma">Factura Proforma</div>
      <div class="inv-meta">
        <strong>Nº:</strong> ${proformaNo}<br/>
        <strong>Data:</strong> ${fmtDate(now)}<br/>
        <strong>Válida até:</strong> ${fmtDate(validUntil)}
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party-block">
      <div class="party-label">Fornecedor</div>
      <div class="party-name">Sinkera Tecnologia, Lda.</div>
      <div class="party-info">NIF: 5000000000<br/>Luanda, Angola</div>
    </div>
    <div class="party-block">
      <div class="party-label">Cliente</div>
      <div class="party-name">${clientName}</div>
      <div class="party-info">
        ${nif ? `NIF: ${nif}<br/>` : ''}
        ${customerEmail ? `Email: ${customerEmail}` : 'N/D'}
      </div>
    </div>
  </div>

  <div class="items-section">
    <table>
      <thead>
        <tr>
          <th>Descrição do Produto</th>
          <th class="c">Qtd</th>
          <th class="r">Preço Unit.</th>
          <th class="r">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <div class="totals-wrap">
    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      <div class="totals-row"><span>Envio</span><span style="color:#059669;font-weight:600;">Grátis</span></div>
      ${discount > 0 ? `<div class="totals-row discount"><span>Desconto${couponCode ? ` (${couponCode})` : ''}</span><span>-${fmt(discount)}</span></div>` : ''}
      <div class="totals-grand"><span>TOTAL</span><span>${fmt(total)}</span></div>
    </div>
  </div>

  <div class="inv-footer-row">
    <span style="font-size:11px;color:#888;">Válida por 7 dias · Preços em Kwanza (Kz)</span>
  </div>

  <div class="page-footer">Sinkera Tecnologia, Lda. · www.sinkera.ao · Todos os direitos reservados</div>
</div></body></html>`;

  openAndPrint(html);
}

// ─── Final Invoice (from confirmed order) ─────────────────────────────────

export interface OrderInvoiceItem {
  name: string;
  price: number;
  quantity: number;
}

export function printFinalInvoice(params: {
  orderId: string;
  createdAt: string;
  status: string;
  items: OrderInvoiceItem[];
  totalAmount: number;
  paymentMethod: string;
  shippingAddress?: {
    fullName?: string;
    address?: string;
    city?: string;
    province?: string;
    phone?: string;
  };
  customerEmail?: string;
}) {
  const { orderId, createdAt, items, totalAmount, paymentMethod, shippingAddress, customerEmail } = params;
  const shortId = orderId.split('-')[0].toUpperCase();
  const invoiceNo = 'FA-' + new Date(createdAt).getFullYear() + ('0' + (new Date(createdAt).getMonth() + 1)).slice(-2) + '-' + shortId;

  const PAYMENT_LABELS: Record<string, string> = {
    multicaixa: 'Multicaixa Express',
    bank_transfer: 'Transferência Bancária',
    cash_on_delivery: 'Pagamento na Entrega',
  };

  const rows = items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td class="c">${i.quantity}</td>
      <td class="r">${fmt(i.price)}</td>
      <td class="r" style="font-weight:600;">${fmt(i.price * i.quantity)}</td>
    </tr>`).join('');

  const addr = shippingAddress;

  const html = `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"/><title>${invoiceNo}</title><style>${CSS}</style></head>
<body><div class="page">
  <div class="inv-header">
    <div>
      <div class="logo">SINKE<span>RA</span></div>${COMPANY}
    </div>
    <div class="inv-title-block">
      <div class="inv-title final">Factura</div>
      <div class="inv-meta">
        <strong>Nº:</strong> ${invoiceNo}<br/>
        <strong>Data:</strong> ${fmtDate(createdAt)}<br/>
        <strong>Ref. Encomenda:</strong> #${shortId}
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party-block">
      <div class="party-label">Vendedor</div>
      <div class="party-name">Sinkera Tecnologia, Lda.</div>
      <div class="party-info">NIF: 5000000000<br/>Luanda, Angola<br/>suporte@sinkera.ao</div>
    </div>
    <div class="party-block">
      <div class="party-label">Cliente / Destinatário</div>
      <div class="party-name">${addr?.fullName || 'Cliente'}</div>
      <div class="party-info">
        ${addr?.address ? addr.address + '<br/>' : ''}
        ${addr?.city || ''}${addr?.city && addr?.province ? ', ' : ''}${addr?.province || ''}<br/>
        ${addr?.phone ? 'Tel: ' + addr.phone + '<br/>' : ''}
        ${customerEmail ? 'Email: ' + customerEmail : ''}
      </div>
    </div>
  </div>

  <div class="items-section">
    <table>
      <thead>
        <tr>
          <th>Descrição do Produto</th>
          <th class="c">Qtd</th>
          <th class="r">Preço Unit.</th>
          <th class="r">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <div class="totals-wrap">
    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>${fmt(totalAmount)}</span></div>
      <div class="totals-row"><span>Envio</span><span style="color:#059669;font-weight:600;">Grátis</span></div>
      <div class="totals-grand"><span>TOTAL</span><span>${fmt(totalAmount)}</span></div>
    </div>
  </div>

  <div class="inv-footer-row">
    <span class="payment-badge">✓ ${PAYMENT_LABELS[paymentMethod] ?? paymentMethod}</span>
    <span style="font-size:11px;color:#888;">Documento com valor fiscal · Preços em Kwanza (Kz)</span>
  </div>

  <div class="page-footer">Sinkera Tecnologia, Lda. · www.sinkera.ao · Obrigado pela sua preferência!</div>
</div></body></html>`;

  openAndPrint(html);
}
