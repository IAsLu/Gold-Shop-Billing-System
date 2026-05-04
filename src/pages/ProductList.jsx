import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const apiOrigin = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {
      setAlert({ type: 'error', msg: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setAlert({ type: 'success', msg: 'Product removed from inventory' });
      fetchProducts();
    } catch {
      setAlert({ type: 'error', msg: 'Failed to delete product' });
    }
  };

  const filteredProducts = products.filter(p => 
    (p.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.tagNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="nextgen-products-view">
      <div className="page-header">
        <div className="header-info">
          <h1 className="page-title">Inventory <span>Management</span></h1>
          <p>Manage tag-wise jewellery stock</p>
        </div>
        <Link to="/products/create" className="btn-premium">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add New Tag
        </Link>
      </div>

      <div className="inventory-controls">
        <div className="search-bar-modern">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            placeholder="Search by tag number or item name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-stats">
          <span>Showing {filteredProducts.length} Products</span>
        </div>
      </div>

      {alert && (
        <div className={`nextgen-alert ${alert.type}`}>
          {alert.msg}
          <button onClick={() => setAlert(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner-nextgen"></div>
          <span>Syncing Inventory...</span>
        </div>
      ) : (
        <div className="product-grid-nextgen">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No Products Found</h3>
              <p>Try adjusting your search or add a new product to get started.</p>
            </div>
          ) : (
            filteredProducts.map((p, i) => (
              <div className="product-card-nextgen" key={p.id} style={{animationDelay: `${i * 0.08}s`}}>
                <div className="product-card-header">
                  <span className={`stock-badge ${p.status === 0 ? 'success' : 'danger'}`}>
                    {p.status === 0 ? 'Available' : (p.status === 1 ? 'Reserved' : 'Sold')}
                  </span>
                  <div className="product-id">{p.tagNo}</div>
                </div>
                
                <div className="product-card-body">
                  {p.imageUrl ? (
                    <div className="product-image-container">
                      <img
                        src={p.imageUrl.startsWith('http') ? p.imageUrl : `${apiOrigin}${p.imageUrl}`}
                        alt={p.itemName}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div className="product-icon-large">🏷️</div>
                  )}
                  <h3 className="product-name">{p.itemName}</h3>
                  <div className="product-price">{p.purityKarat}K • {(p.netWeightG || 0).toFixed(3)} g</div>
                  
                  <div className="product-stock-level">
                    <div className="stock-info">
                      <span>Making / Stone</span>
                      <strong>₹{Number(p.makingChargeRate || 0).toLocaleString('en-IN')} • ₹{Number(p.stoneAmount || 0).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="stock-progress">
                      <div 
                        className={`fill ${p.status === 0 ? '' : 'danger'}`} 
                        style={{ width: `${p.status === 0 ? 100 : 40}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="product-card-footer">
                  <Link to={`/products/edit/${p.id}`} className="btn-icon-edit" title="Edit Product">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </Link>
                  <button onClick={() => handleDelete(p.id)} className="btn-icon-delete" title="Delete Product">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
