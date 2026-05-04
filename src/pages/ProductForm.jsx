import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const apiOrigin = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

  const toAbsoluteImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${apiOrigin}${url}`;
  };

  const [formData, setFormData] = useState({
    tagNo: '',
    itemName: '',
    category: '',
    hsn: '',
    quantity: 1,
    purityKarat: 22,
    grossWeightG: '',
    stoneWeightG: '',
    netWeightG: '',
    wastageType: 0,
    wastageValue: '',
    makingChargeType: 0,
    makingChargeRate: '',
    stoneAmount: '',
    status: 0,
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/products/${id}`)
        .then(res => {
          setFormData({
            tagNo: res.data.tagNo || '',
            itemName: res.data.itemName || '',
            category: res.data.category || '',
            hsn: res.data.hsn || '',
            quantity: res.data.quantity ?? 1,
            purityKarat: res.data.purityKarat ?? 22,
            grossWeightG: res.data.grossWeightG ?? '',
            stoneWeightG: res.data.stoneWeightG ?? '',
            netWeightG: res.data.netWeightG ?? '',
            wastageType: res.data.wastageType ?? 0,
            wastageValue: res.data.wastageValue ?? '',
            makingChargeType: res.data.makingChargeType ?? 0,
            makingChargeRate: res.data.makingChargeRate ?? '',
            stoneAmount: res.data.stoneAmount ?? '',
            status: res.data.status ?? 0,
            imageUrl: res.data.imageUrl || ''
          });
          setImagePreview(toAbsoluteImageUrl(res.data.imageUrl || ''));
          setImageFileName('');
        })
        .catch(() => setError('Failed to load product details'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      id: isEdit ? parseInt(id) : 0,
      tagNo: formData.tagNo,
      itemName: formData.itemName,
      category: formData.category || null,
      hsn: formData.hsn || null,
      quantity: parseInt(formData.quantity) || 1,
      purityKarat: parseInt(formData.purityKarat),
      grossWeightG: parseFloat(formData.grossWeightG || '0'),
      stoneWeightG: parseFloat(formData.stoneWeightG || '0'),
      netWeightG: parseFloat(formData.netWeightG || '0'),
      wastageType: parseInt(formData.wastageType),
      wastageValue: parseFloat(formData.wastageValue || '0'),
      makingChargeType: parseInt(formData.makingChargeType),
      makingChargeRate: parseFloat(formData.makingChargeRate || '0'),
      stoneAmount: parseFloat(formData.stoneAmount || '0'),
      status: parseInt(formData.status),
      imageUrl: formData.imageUrl || null
    };

    try {
      let productId = isEdit ? parseInt(id) : 0;
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        const created = await api.post('/products', payload);
        productId = created.data.id;
      }

      if (imageFile && productId) {
        const fd = new FormData();
        fd.append('file', imageFile);
        const uploadRes = await api.post(`/products/${productId}/image`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFormData(prev => ({ ...prev, imageUrl: uploadRes.data.imageUrl }));
        setImagePreview(toAbsoluteImageUrl(uploadRes.data.imageUrl));
        setImageFileName('');
      }

      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) return (
    <div className="dashboard-loading">
      <div className="spinner-nextgen"></div>
      <span>Fetching Product Data...</span>
    </div>
  );

  return (
    <div className="nextgen-form-view">
      <div className="page-header">
        <div className="header-info">
          <h1 className="page-title">
            {isEdit ? 'Modify' : 'Catalog'} <span>Product</span>
          </h1>
          <p>{isEdit ? 'Update tag ' + formData.tagNo : 'Add a new jewellery stock tag'}</p>
        </div>
        <button onClick={() => navigate('/products')} className="btn-glass">Cancel</button>
      </div>

      <div className="nextgen-card-centered">
        {error && <div className="nextgen-alert error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="nextgen-form">
          <div className="form-group-modern">
            <label>Product Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 16,
                  background: 'rgba(0,0,0,0.04)',
                  display: 'grid',
                  placeItems: 'center',
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.06)'
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <span style={{ fontSize: 28 }}>🖼️</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <input
                  id="product-image-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    padding: 0,
                    margin: -1,
                    overflow: 'hidden',
                    clip: 'rect(0, 0, 0, 0)',
                    whiteSpace: 'nowrap',
                    border: 0
                  }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                    setImageFileName(file?.name || '');
                    if (file) {
                      const localUrl = URL.createObjectURL(file);
                      setImagePreview(localUrl);
                    } else {
                      setImagePreview(toAbsoluteImageUrl(formData.imageUrl || ''));
                    }
                  }}
                />

                <label
                  htmlFor="product-image-input"
                  className="btn-premium"
                  style={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    color: '#fff',
                    padding: '10px 16px',
                    borderRadius: 14,
                    lineHeight: 1,
                    minWidth: 140,
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  Upload Image
                </label>

                {imageFileName && (
                  <span
                    style={{
                      padding: '8px 10px',
                      borderRadius: 999,
                      background: 'rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      fontSize: 13,
                      maxWidth: 260,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={imageFileName}
                  >
                    {imageFileName}
                  </span>
                )}

                {(imageFileName || imagePreview) && (
                  <button
                    type="button"
                    className="btn-glass"
                    style={{ padding: '8px 10px' }}
                    onClick={() => {
                      setImageFile(null);
                      setImageFileName('');
                      setImagePreview(toAbsoluteImageUrl(formData.imageUrl || ''));
                      const input = document.getElementById('product-image-input');
                      if (input) input.value = '';
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <small style={{ opacity: 0.75 }}>
              JPG/PNG/WebP, up to 10MB.
            </small>
          </div>

          <div className="form-row-modern">
            <div className="form-group-modern">
              <label>Tag Details</label>
              <div className="input-with-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                <input 
                  type="text" 
                  placeholder="Tag Number (e.g. T00123)"
                  value={formData.tagNo}
                  onChange={(e) => setFormData({...formData, tagNo: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label>Quantity</label>
              <div className="input-with-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                <input 
                  type="number" 
                  min="1"
                  placeholder="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row-modern">
            <div className="form-group-modern">
              <label>Item Name</label>
              <div className="input-with-icon">
                <input 
                  type="text"
                  placeholder="e.g. Chain / Ring / Bangle"
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label>Purity (Karat)</label>
              <div className="input-with-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <input 
                  type="number" 
                  placeholder="22"
                  value={formData.purityKarat}
                  onChange={(e) => setFormData({...formData, purityKarat: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row-modern">
            <div className="form-group-modern">
              <label>Gross Weight (g)</label>
              <div className="input-with-icon">
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={formData.grossWeightG}
                  onChange={(e) => setFormData({ ...formData, grossWeightG: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group-modern">
              <label>Stone Weight (g)</label>
              <div className="input-with-icon">
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={formData.stoneWeightG}
                  onChange={(e) => setFormData({ ...formData, stoneWeightG: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group-modern">
              <label>Net Weight (g)</label>
              <div className="input-with-icon">
                <input
                  type="number"
                  step="0.001"
                  placeholder="(auto)"
                  value={
                    formData.netWeightG !== ''
                      ? formData.netWeightG
                      : (Math.max(0, parseFloat(formData.grossWeightG || '0') - parseFloat(formData.stoneWeightG || '0'))).toFixed(3)
                  }
                  onChange={(e) => setFormData({ ...formData, netWeightG: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-row-modern">
            <div className="form-group-modern">
              <label>Wastage Type</label>
              <select
                className="input-nextgen"
                value={formData.wastageType}
                onChange={(e) => setFormData({ ...formData, wastageType: parseInt(e.target.value) })}
              >
                <option value={0}>Percent (%)</option>
                <option value={1}>Grams (g)</option>
              </select>
            </div>
            <div className="form-group-modern">
              <label>Wastage Value</label>
              <input
                className="input-nextgen"
                type="number"
                step="0.001"
                value={formData.wastageValue}
                onChange={(e) => setFormData({ ...formData, wastageValue: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-modern">
            <div className="form-group-modern">
              <label>Making Charge Type</label>
              <select
                className="input-nextgen"
                value={formData.makingChargeType}
                onChange={(e) => setFormData({ ...formData, makingChargeType: parseInt(e.target.value) })}
              >
                <option value={0}>Per Gram</option>
                <option value={1}>Fixed</option>
              </select>
            </div>
            <div className="form-group-modern">
              <label>Making Charge Rate</label>
              <input
                className="input-nextgen"
                type="number"
                step="0.01"
                value={formData.makingChargeRate}
                onChange={(e) => setFormData({ ...formData, makingChargeRate: e.target.value })}
              />
            </div>
            <div className="form-group-modern">
              <label>Stone Amount (₹)</label>
              <input
                className="input-nextgen"
                type="number"
                step="0.01"
                value={formData.stoneAmount}
                onChange={(e) => setFormData({ ...formData, stoneAmount: e.target.value })}
              />
            </div>
          </div>

          <div className="form-actions-nextgen">
            <button type="submit" className="btn-premium wide" disabled={loading}>
              <span className="btn-text">{loading ? 'Processing...' : (isEdit ? 'Apply Changes' : 'Register Product')}</span>
              {!loading && <div className="btn-glow"></div>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
