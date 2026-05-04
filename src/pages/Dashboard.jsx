import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, billRes, ratesRes] = await Promise.all([
          api.get('/products'),
          api.get('/billing'),
          api.get('/rates/live').catch(() => ({ data: null }))
        ]);
        setProducts(prodRes.data);
        setBills(billRes.data);
        setRates(ratesRes.data);
      } catch (error) {
        console.error('Dashboard data fetch failed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  const lowStock = products.filter((p) => p.stock < 10).length;
  const recentBills = [...bills].reverse().slice(0, 5);

  const handleExportLedgerPdf = () => {
    const printWindow = window.open('', '_blank');
    const tableRows = bills.map(b => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">#${b.id}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(b.date).toLocaleDateString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${b.customerName || 'Aurum Valued Client'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${(b.grandTotal || 0).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Transactions Ledger</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 8px; border-bottom: 2px solid #000; }
            h2 { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h2>Transactions Ledger</h2>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) return (
    <div className="dashboard-loading">
      <div className="spinner-nextgen"></div>
      <span>Initializing NextGen Systems...</span>
    </div>
  );

  return (
    <div className="dashboard-container-nextgen">
      {/* Header Section */}
      <header className="dashboard-header-nextgen">
        <div className="header-info">
          <h1>Showroom <span>Analytics</span></h1>
          <p>Real-time jewelry & gold tracking</p>
        </div>
        <div className="header-date-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </header>

      {/* Hero Stats Grid */}
      <div className="nextgen-stats-grid">
        <div className="nextgen-stat-card revenue" style={{animationDelay: '0.1s'}}>
          <div className="stat-icon">₹</div>
          <div className="stat-content">
            <span className="label">Total Revenue</span>
            <h2 className="value">₹{totalRevenue.toLocaleString('en-IN')}</h2>
            <div className="progress-bar"><div className="fill" style={{width: '75%'}}></div></div>
            <span className="trend positive">↑ 12.5% Growth</span>
          </div>
        </div>

        <div className="nextgen-stat-card sales" style={{animationDelay: '0.2s'}}>
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
          </div>
          <div className="stat-content">
            <span className="label">Total Sales</span>
            <h2 className="value">{bills.length}</h2>
            <span className="sub-value">Completed Orders</span>
            <div className="mini-chart">
                <div className="bar" style={{height: '40%'}}></div>
                <div className="bar" style={{height: '70%'}}></div>
                <div className="bar" style={{height: '50%'}}></div>
                <div className="bar" style={{height: '90%'}}></div>
                <div className="bar" style={{height: '60%'}}></div>
            </div>
          </div>
        </div>

        <div className="nextgen-stat-card inventory" style={{animationDelay: '0.3s'}}>
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <div className="stat-content">
            <span className="label">Stock Items</span>
            <h2 className="value">{products.length}</h2>
            <span className={`stock-status ${lowStock > 0 ? 'warning' : 'ok'}`}>
              {lowStock > 0 ? `⚠️ ${lowStock} Low Stock` : '✓ Inventory Optimal'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="nextgen-content-layout">
        {/* Recent Bills Section */}
        <section className="nextgen-main-card">
          <div className="card-header">
            <h3>Recent Transactions</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-premium" onClick={handleExportLedgerPdf} style={{ padding: '6px 12px', fontSize: '13px' }}>Export PDF</button>
              <button className="btn-link">View Full Ledger</button>
            </div>
          </div>
          <div className="nextgen-table-wrap">
            <table className="nextgen-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer/Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBills.map((bill, i) => (
                  <tr key={bill.id} style={{animationDelay: `${0.4 + i * 0.1}s`}}>
                    <td className="id-cell">#{bill.id}</td>
                    <td>
                      <div className="date-info">
                        <span className="primary">{new Date(bill.date).toLocaleDateString()}</span>
                        <span className="secondary">{bill.customerName || 'Aurum Valued Client'}</span>
                      </div>
                    </td>
                    <td className="amount-cell">₹{bill.grandTotal?.toLocaleString('en-IN')}</td>
                    <td><span className="status-pill success">Settled</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-glass" 
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                          onClick={() => navigate(`/invoice/${bill.id}`)}
                          title="View Invoice"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Actions / Activity */}
        <aside className="nextgen-side-panel">
            {/* Live Gold Rates Widget */}
            <div className="gold-rate-widget">
              <div className="gold-rate-header">
                <div className="gold-rate-header-left">
                  <span className="gold-rate-icon">✨</span>
                  <span className="gold-rate-title">Tamil Nadu Live Rate</span>
                </div>
                <span className="gold-rate-live">LIVE</span>
              </div>
              
              {rates ? (
                <div className="gold-rate-list">
                  <div className="gold-rate-item">
                    <span className="gold-rate-karat">24K Pure Gold</span>
                    <span className="gold-rate-price">₹{rates.rate24KPerGram?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="gold-rate-item">
                    <span className="gold-rate-karat">22K Standard</span>
                    <span className="gold-rate-price">₹{rates.rate22KPerGram?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="gold-rate-item">
                    <span className="gold-rate-karat">18K Jewelry</span>
                    <span className="gold-rate-price">₹{rates.rate18KPerGram?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ) : (
                <div className="gold-rate-empty">
                  Fetching current rates...
                </div>
              )}
            </div>

            <div className="nextgen-side-card">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                    <button className="action-btn">
                        <div className="icon">💳</div>
                        <span>Create New Bill</span>
                    </button>
                    <button className="action-btn">
                        <div className="icon">📦</div>
                        <span>Manage Inventory</span>
                    </button>
                </div>
            </div>

            <div className="nextgen-side-card">
                <h3>Live Activity</h3>
                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-indicator"></div>
                        <div className="activity-text">
                            <p>System Initialized</p>
                            <span>Just now</span>
                        </div>
                    </div>
                    <div className="activity-item" style={{opacity: 0.7}}>
                        <div className="activity-indicator" style={{animation: 'none', background: '#94a3b8', boxShadow: 'none'}}></div>
                        <div className="activity-text">
                            <p>Database Synced</p>
                            <span>2 mins ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
}
