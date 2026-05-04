import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function BillingCreate() {
  const navigate = useNavigate();
  const [stockTags, setStockTags] = useState([]);
  const [rate, setRate] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [gstRate, setGstRate] = useState(0.03);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const apiOrigin = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

  const toAbsoluteImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${apiOrigin}${url}`;
  };

  useEffect(() => {
    Promise.all([
      api.get('/products'),
      api.get('/rates/latest').catch(() => ({ data: null })),
    ])
      .then(([tagsRes, rateRes]) => {
        setStockTags(tagsRes.data || []);
        setRate(rateRes.data || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addItem = () => {
    setSelectedItems([...selectedItems, { tagNo: '', key: Date.now() }]);
  };

  const removeItem = (key) => {
    setSelectedItems(selectedItems.filter((item) => item.key !== key));
  };

  const updateItem = (key, field, value) => {
    const newItems = selectedItems.map(item => {
      if (item.key === key) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setSelectedItems(newItems);
  };

  const getRatePerGram = (karat) => {
    if (!rate) return 0;
    if (karat === 24) return rate.rate24KPerGram;
    if (karat === 18) return rate.rate18KPerGram;
    return rate.rate22KPerGram;
  };

  const calculateLine = (tag) => {
    if (!tag) return { subtotal: 0, gst: 0, total: 0 };
    const net = (tag.netWeightG || 0) > 0
      ? tag.netWeightG
      : Math.max(0, (tag.grossWeightG || 0) - (tag.stoneWeightG || 0));
    const ratePerGram = getRatePerGram(tag.purityKarat || 22);
    const wastageG = tag.wastageType === 1
      ? (tag.wastageValue || 0)
      : net * (tag.wastageValue || 0) / 100;
    const chargeableWeight = net + Math.max(0, wastageG);
    const metalValue = chargeableWeight * ratePerGram;
    const making = tag.makingChargeType === 1
      ? (tag.makingChargeRate || 0)
      : (tag.makingChargeRate || 0) * net;
    const stone = tag.stoneAmount || 0;
    const subtotal = metalValue + making + stone;
    const gst = subtotal * (gstRate || 0);
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const calculateSubtotal = () =>
    selectedItems.reduce((sum, item) => {
      const tag = stockTags.find(t => (t.tagNo || '').toLowerCase() === (item.tagNo || '').toLowerCase());
      return sum + calculateLine(tag).subtotal;
    }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) return alert('Please add at least one item');
    
    setSubmitting(true);
    try {
      const res = await api.post('/billing', {
        customerName: customerName.trim() || null,
        customerPhone: customerPhone.trim() || null,
        customerEmail: customerEmail.trim() || null,
        gstRate,
        items: selectedItems
          .map(item => ({ tagNo: (item.tagNo || '').trim() }))
          .filter(x => x.tagNo)
      });
      navigate(`/invoice/${res.data.invoiceId}`);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="dashboard-loading">
      <div className="spinner-nextgen"></div>
      <span>Initializing Billing Engine...</span>
    </div>
  );

  const subtotal = calculateSubtotal();
  const tax = subtotal * (gstRate || 0);
  const grandTotal = subtotal + tax;

  return (
    <div className="nextgen-billing-view">
      <div className="page-header">
        <div className="header-info">
          <h1 className="page-title">Generate <span>Gold Invoice</span></h1>
          <p>Tag-wise billing with daily gold rate, wastage, making charges and GST.</p>
        </div>
       <button
        onClick={() => navigate('/')}
        className="btn-glass"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, lineHeight: 1 }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ display: 'block', flexShrink: 0 }}
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span style={{ display: 'block' }}>Back</span>
      </button>
      </div>

      <div className="billing-split-layout">
        {/* Left: Item Selection */}
        <div className="billing-form-section">
          <div className="nextgen-main-card">
            <div className="card-header">
              <h3>Line Items</h3>
              <button type="button" onClick={addItem} className="btn-premium-sm">
                <span className="icon">+</span> Add Tag
              </button>
            </div>

            <div className="billing-items-scroll" style={{ marginTop: 10 }}>
              {selectedItems.length === 0 ? (
                <div className="empty-items-state">
                  <div className="icon">🏷️</div>
                  <p>Your invoice is empty. Start adding stock tags!</p>
                </div>
              ) : (
                selectedItems.map((item) => {
                  const tag = stockTags.find(t => (t.tagNo || '').toLowerCase() === (item.tagNo || '').toLowerCase());
                  const preview = calculateLine(tag);
                  return (
                    <div key={item.key} className="billing-item-row-dynamic">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            overflow: 'hidden',
                            border: '1px solid rgba(0,0,0,0.06)',
                            background: 'rgba(0,0,0,0.04)',
                            display: 'grid',
                            placeItems: 'center',
                            flex: '0 0 auto'
                          }}
                        >
                          {tag?.imageUrl ? (
                            <img
                              src={toAbsoluteImageUrl(tag.imageUrl)}
                              alt={tag.itemName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <span style={{ fontSize: 20, opacity: 0.8 }}>🪙</span>
                          )}
                        </div>

                        <div className="product-selector" style={{ flex: 1, minWidth: 0 }}>
                        <select 
                          value={item.tagNo}
                          onChange={(e) => updateItem(item.key, 'tagNo', e.target.value)}
                          required
                        >
                          <option value="">Choose a tag...</option>
                          {stockTags
                            .filter(t => t.status === 0)
                            .map(t => (
                            <option key={t.id} value={t.tagNo}>
                              {t.tagNo} • {t.itemName} • {t.purityKarat}K • {(t.netWeightG || 0).toFixed(3)}g
                            </option>
                          ))}
                        </select>
                      </div>
                      </div>

                      <div className="quantity-control" style={{ minWidth: 160 }}>
                        <label>Net Wt</label>
                        <span style={{ fontWeight: 650 }}>
                          {tag ? `${(tag.netWeightG || 0).toFixed(3)} g` : '-'}
                        </span>
                      </div>

                      <div className="item-subtotal-preview">
                        <label>Total</label>
                        <span>₹{tag ? preview.total.toLocaleString('en-IN') : '0'}</span>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => removeItem(item.key)}
                        className="btn-item-remove"
                        title="Remove Item"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Summary & Preview */}
        <div className="billing-summary-section">
          <div className="nextgen-side-card summary-card">
            <h3>Invoice Summary</h3>

            <div className="summary-details" style={{ marginTop: 16 }}>
              <div className="summary-row" style={{ alignItems: 'center', gap: 12 }}>
                <span style={{ minWidth: 110 }}>Customer</span>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Name (optional)"
                  className="input-nextgen"
                  style={{ flex: 1 }}
                />
              </div>
              <div className="summary-row" style={{ alignItems: 'center', gap: 12 }}>
                <span style={{ minWidth: 110 }}>Phone</span>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="E.164 or mobile (optional)"
                  className="input-nextgen"
                  style={{ flex: 1 }}
                />
              </div>
              <div className="summary-row" style={{ alignItems: 'center', gap: 12 }}>
                <span style={{ minWidth: 110 }}>Email</span>
                <input
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-nextgen"
                  style={{ flex: 1 }}
                />
              </div>
              <div className="summary-row" style={{ alignItems: 'center', gap: 12 }}>
                <span style={{ minWidth: 110 }}>GST Rate</span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="1"
                  value={gstRate}
                  onChange={(e) => setGstRate(parseFloat(e.target.value || '0'))}
                  className="input-nextgen"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Rate (22K)</span>
                <strong>{rate ? `₹${rate.rate22KPerGram.toLocaleString('en-IN')}/g` : 'Not set'}</strong>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
              </div>
              <div className="summary-row">
                <span>GST ({((gstRate || 0) * 100).toFixed(1)}%)</span>
                <strong>₹{tax.toLocaleString('en-IN')}</strong>
              </div>
              <div className="divider"></div>
              <div className="summary-row grand-total">
                <span>Grand Total</span>
                <span className="total-amount">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button 
              type="submit" 
              onClick={handleSubmit}
              className="btn-premium wide pulse-effect" 
              disabled={submitting || selectedItems.length === 0}
            >
              <span className="btn-text">{submitting ? 'Processing...' : 'Generate & Print Invoice'}</span>
              {!submitting && <div className="btn-glow"></div>}
            </button>

            <div className="summary-footer">
              <p>Secure transaction powered by NextGen Billing Engine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
