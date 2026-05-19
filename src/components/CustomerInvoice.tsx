import { Tab, TabItem } from '../types';

interface Props {
  tab: Tab;
  businessName: string;
  businessType?: string;
  staffName?: string;
  invoiceNumber?: string;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function generateInvoiceNumber(tabId: string, createdAt: number) {
  const year = new Date(createdAt).getFullYear();
  const seq = tabId.slice(-6).toUpperCase();
  return `INV-${year}-${seq}`;
}

export function CustomerInvoice({ tab, businessName, staffName, invoiceNumber }: Props) {
  const invNum = invoiceNumber || generateInvoiceNumber(tab.id, tab.createdAt);
  const subtotal = tab.items.reduce((s, i) => s + i.priceAtSale * i.quantity, 0);
  const total = Math.round(subtotal);

  return (
    <div
      id="customer-invoice-print"
      className="hidden print:block"
      style={{
        fontFamily: "'Arial', sans-serif",
        fontSize: '11pt',
        color: '#000',
        background: '#fff',
        padding: '24mm 20mm',
        maxWidth: '210mm',
        margin: '0 auto',
        minHeight: '297mm',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12mm', borderBottom: '2pt solid #000', paddingBottom: '8mm' }}>
        <div>
          <div style={{ fontSize: '22pt', fontWeight: '900', letterSpacing: '-0.5pt', color: '#000', marginBottom: '2mm' }}>
            {businessName}
          </div>
          <div style={{ fontSize: '8pt', color: '#555', letterSpacing: '1pt', textTransform: 'uppercase', fontWeight: '700' }}>
            MADIS Point of Sale
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18pt', fontWeight: '900', color: '#000', letterSpacing: '-0.5pt' }}>INVOICE</div>
          <div style={{ fontSize: '9pt', color: '#555', marginTop: '2mm', fontWeight: '600' }}>
            {invNum}
          </div>
        </div>
      </div>

      {/* Invoice meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12mm', gap: '8mm' }}>
        <div>
          <div style={{ fontSize: '7.5pt', color: '#888', textTransform: 'uppercase', letterSpacing: '1pt', fontWeight: '700', marginBottom: '2mm' }}>
            Bill To
          </div>
          <div style={{ fontSize: '12pt', fontWeight: '800', color: '#000' }}>{tab.customerName}</div>
          {tab.mpesaPhone && (
            <div style={{ fontSize: '9pt', color: '#555', marginTop: '1mm' }}>M-Pesa: {tab.mpesaPhone}</div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '3mm' }}>
            <div style={{ fontSize: '7.5pt', color: '#888', textTransform: 'uppercase', letterSpacing: '1pt', fontWeight: '700' }}>Date</div>
            <div style={{ fontSize: '10pt', fontWeight: '600' }}>{formatDate(tab.createdAt)}</div>
          </div>
          <div style={{ marginBottom: '3mm' }}>
            <div style={{ fontSize: '7.5pt', color: '#888', textTransform: 'uppercase', letterSpacing: '1pt', fontWeight: '700' }}>Time</div>
            <div style={{ fontSize: '10pt', fontWeight: '600' }}>{formatTime(tab.createdAt)}</div>
          </div>
          {staffName && (
            <div>
              <div style={{ fontSize: '7.5pt', color: '#888', textTransform: 'uppercase', letterSpacing: '1pt', fontWeight: '700' }}>Served By</div>
              <div style={{ fontSize: '10pt', fontWeight: '600' }}>{staffName}</div>
            </div>
          )}
        </div>
      </div>

      {/* Line items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8mm' }}>
        <thead>
          <tr style={{ borderTop: '1.5pt solid #000', borderBottom: '1.5pt solid #000' }}>
            <th style={{ padding: '3mm 2mm', textAlign: 'left', fontSize: '8pt', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8pt', width: '45%' }}>
              Description
            </th>
            <th style={{ padding: '3mm 2mm', textAlign: 'center', fontSize: '8pt', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8pt', width: '12%' }}>
              Qty
            </th>
            <th style={{ padding: '3mm 2mm', textAlign: 'right', fontSize: '8pt', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8pt', width: '20%' }}>
              Unit Price
            </th>
            <th style={{ padding: '3mm 2mm', textAlign: 'right', fontSize: '8pt', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8pt', width: '23%' }}>
              Amount (KES)
            </th>
          </tr>
        </thead>
        <tbody>
          {tab.items.map((item: TabItem, idx: number) => (
            <tr
              key={item.productId}
              style={{ borderBottom: '0.5pt solid #ddd', background: idx % 2 === 0 ? '#fafafa' : '#fff' }}
            >
              <td style={{ padding: '3mm 2mm', fontSize: '10pt', fontWeight: '600' }}>{item.name}</td>
              <td style={{ padding: '3mm 2mm', textAlign: 'center', fontSize: '10pt', color: '#444' }}>{item.quantity}</td>
              <td style={{ padding: '3mm 2mm', textAlign: 'right', fontSize: '10pt', color: '#444', fontFamily: 'monospace' }}>
                {item.priceAtSale.toLocaleString()}
              </td>
              <td style={{ padding: '3mm 2mm', textAlign: 'right', fontSize: '10pt', fontWeight: '700', fontFamily: 'monospace' }}>
                {(item.priceAtSale * item.quantity).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12mm' }}>
        <div style={{ width: '55mm', minWidth: '160px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2mm 0', fontSize: '10pt', color: '#555' }}>
            <span>Subtotal</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>KES {subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2mm 0', fontSize: '10pt', color: '#555' }}>
            <span>VAT (0%)</span>
            <span style={{ fontFamily: 'monospace' }}>—</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '3mm 2mm',
            fontSize: '13pt',
            fontWeight: '900',
            borderTop: '2pt solid #000',
            marginTop: '2mm',
          }}>
            <span>TOTAL</span>
            <span style={{ fontFamily: 'monospace' }}>KES {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment info */}
      {tab.paymentType && (
        <div style={{
          background: '#f5f5f5',
          border: '1pt solid #ddd',
          borderRadius: '4pt',
          padding: '4mm 6mm',
          marginBottom: '12mm',
          display: 'flex',
          alignItems: 'center',
          gap: '4mm',
        }}>
          <div>
            <div style={{ fontSize: '7.5pt', color: '#888', textTransform: 'uppercase', letterSpacing: '1pt', fontWeight: '700' }}>
              Payment Method
            </div>
            <div style={{ fontSize: '11pt', fontWeight: '800', color: '#000', marginTop: '1mm' }}>
              {tab.paymentType}
              {tab.mpesaPhone && tab.paymentType === 'M-Pesa' ? ` · ${tab.mpesaPhone}` : ''}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{
              background: '#000',
              color: '#fff',
              padding: '1.5mm 4mm',
              borderRadius: '3pt',
              fontSize: '8pt',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.5pt',
            }}>
              PAID
            </div>
          </div>
        </div>
      )}

      {/* Notes section (optional) */}
      <div style={{ marginBottom: '12mm' }}>
        <div style={{ fontSize: '7.5pt', color: '#888', textTransform: 'uppercase', letterSpacing: '1pt', fontWeight: '700', marginBottom: '2mm' }}>
          Notes
        </div>
        <div style={{ borderTop: '0.5pt solid #ddd', paddingTop: '3mm', minHeight: '15mm', fontSize: '9pt', color: '#555' }}>
          Thank you for your business!
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1pt solid #ddd',
        paddingTop: '6mm',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 'auto',
      }}>
        <div>
          <div style={{ fontSize: '8pt', color: '#888', marginBottom: '1mm' }}>Invoice generated by</div>
          <div style={{ fontSize: '10pt', fontWeight: '900', color: '#000' }}>MADIS POS</div>
          <div style={{ fontSize: '7.5pt', color: '#aaa' }}>Market Analysis & Data Insight System · Powered by August</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '7.5pt', color: '#888' }}>Ref: {tab.id.slice(0, 12).toUpperCase()}</div>
          <div style={{ fontSize: '7.5pt', color: '#aaa', marginTop: '1mm' }}>{invNum}</div>
        </div>
      </div>
    </div>
  );
}
