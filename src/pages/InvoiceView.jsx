import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api.get(`/billing/invoice/${id}`)
      .then(res => setInvoice(res.data))
      .catch(() => alert('Invoice not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    if (!invoice) return;
    setPaying(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) {
        alert('Failed to load Razorpay checkout');
        return;
      }

      const orderRes = await api.post('/payments/create-order', { invoiceId: invoice.invoiceId });
      const { keyId, orderId, amount, currency, businessName, invoiceId } = orderRes.data;

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: businessName,
        description: `Invoice #${invoiceId}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              invoiceId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            alert('Payment successful');
          } catch (e) {
            alert('Payment verification failed');
          }
        },
        theme: { color: '#5B5FFF' },
      });

      rzp.open();
    } catch (e) {
      alert('Payment initialization failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="dashboard-loading">
      <div className="spinner-nextgen"></div>
      <span>Generating Digital Invoice...</span>
    </div>
  );

  if (!invoice) return <div className="nextgen-alert error">Invoice not found</div>;

  return (
    <div className="nextgen-invoice-view">
      {/* Action Bar (Hidden on Print) */}
      <div className="invoice-actions no-print">
          <button 
          onClick={() => navigate('/')} 
          className="btn-glass"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}  // Add this
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handlePay} className="btn-premium" disabled={paying}>
            {paying ? 'Opening Payment...' : 'Pay with Razorpay'}
          </button>
          <button onClick={() => window.print()} className="btn-premium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z"/></svg>
            Print Invoice
          </button>
          <button onClick={() => navigate('/')} className="btn-glass">Done</button>
        </div>
      </div>

      {/* The Actual Invoice Document */}
      <div className="invoice-document shadow-premium">
        <div className="invoice-watermark">PAID</div>
        
        <div className="doc-header">
          <div className="brand-side">
            <div className="brand-logo-nextgen">
              <span className="logo-dot"></span>
              Aurum Gold
            </div>
            <p className="brand-subtitle">Elite Jewellery Billing Suite</p>
            <div className="business-details">
              <p>789 Diamond Plaza, Jewellery Hub</p>
              <p>Zaveri Bazaar, Mumbai, India</p>
              <p>GSTIN: 27ABCDE1234F1Z5</p>
            </div>
          </div>
          <div className="invoice-info-side">
            <h1>INVOICE</h1>
            <div className="info-grid">
              <div className="info-item">
                <label>Invoice Number</label>
                <strong>#INV-{invoice.invoiceId.toString().padStart(5, '0')}</strong>
              </div>
              <div className="info-item">
                <label>Date Issued</label>
                <strong>{new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="doc-billing-details">
          <div className="bill-to">
            <label>Bill To</label>
            <h3>{invoice.customerName || 'Customer'}</h3>
            <p>Invoice ID: #{invoice.invoiceId}</p>
          </div>
        </div>

        <div className="doc-table-section">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'center' }}>Karat</th>
                <th style={{ textAlign: 'right' }}>Net Wt</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <strong>{item.description}</strong>
                    <span className="item-sku">Rate: ₹{item.ratePerGramUsed?.toLocaleString?.('en-IN')}/g • Making: ₹{item.makingCharge?.toLocaleString?.('en-IN')}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.purityKarat}K</td>
                  <td style={{ textAlign: 'right' }}>{Number(item.netWeightG || 0).toFixed(3)} g</td>
                  <td style={{ textAlign: 'right' }} className="row-total">₹{item.total.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="doc-footer-section">
          <div className="notes-area">
            <label>Notes</label>
            <p>Thank you. Please keep this invoice for your records. Exchange/buyback is subject to purity and shop policy.</p>
          </div>
          <div className="totals-area">
            <div className="total-line">
              <span>Subtotal</span>
              <strong>₹{invoice.subtotal.toLocaleString('en-IN')}</strong>
            </div>
            <div className="total-line">
              <span>GST ({((invoice.gstRate || 0) * 100).toFixed(1)}%)</span>
              <strong>₹{invoice.gstAmount.toLocaleString('en-IN')}</strong>
            </div>
            {invoice.oldGoldDeduction > 0 && (
              <div className="total-line">
                <span>Old Gold Deduction</span>
                <strong>- ₹{invoice.oldGoldDeduction.toLocaleString('en-IN')}</strong>
              </div>
            )}
            <div className="total-line grand">
              <span>Total Amount</span>
              <span className="final-price">₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="doc-signature">
          <div className="signature-box">
            <div className="sign-line"></div>
            <p>Authorized Signatory</p>
          </div>
        </div>

        <div className="doc-bottom-bar">
          <p>NextGen Billing System v2.0 • Digital Authenticated Document</p>
        </div>
      </div>
    </div>
  );
}
