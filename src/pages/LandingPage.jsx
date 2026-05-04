import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WiproCircle from '../components/WiproCircle';
import ChatAssistant from '../components/ChatAssistant';
import api from '../api/axiosInstance';

export default function LandingPage() {
  const navigate = useNavigate();
  const apiOrigin = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

  const toAbsoluteImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${apiOrigin}${url}`;
  };

  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setFeaturedLoading(true);
        const res = await api.get('/products/latest?count=6');
        if (!cancelled) setFeatured(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) setFeatured([]);
      } finally {
        if (!cancelled) setFeaturedLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const featuredSlots = useMemo(() => {
    const slots = Array.from({ length: 6 }, (_, i) => featured[i] ?? null);
    return slots;
  }, [featured]);

  return (
    <div className="lux-landing">
      <WiproCircle />
      <div className="lux-bg" aria-hidden="true">
        <div className="lux-vignette" />
        <div className="lux-spotlight lux-spotlight-a" />
        <div className="lux-spotlight lux-spotlight-b" />
        <div className="lux-grain" />
      </div>

      <header className="lux-nav">
        <div className="lux-brand">
          <span className="lux-mark" aria-hidden="true" />
          <span className="lux-brand-text">Aurum Gold & Diamonds</span>
        </div>

        <nav className="lux-nav-links" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#showcase">Showcase</a>
          <a href="#security">Security</a>
        </nav>

        <div className="lux-nav-cta">
          <button onClick={() => navigate('/login')} className="lux-btn lux-btn-primary">
            Enter Dashboard
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      <main className="lux-main">
        <section className="lux-hero">
          <div className="lux-hero-left">
            <div className="lux-pill">
              <span className="lux-pill-dot" aria-hidden="true" />
              Exquisite billing for luxury gold showrooms
            </div>

            <h1 className="lux-title">
              Your showroom‑grade
              <br />
              <span className="lux-title-accent">The gold standard</span>
            </h1>

            <p className="lux-subtitle">
              Generate elegant invoices, track stone weights, verify metal purity, and email PDF receipts—built for
              jewelry retail that cares about perfection.
            </p>

            <div className="lux-cta-row">
              <button onClick={() => navigate('/login')} className="lux-btn lux-btn-primary lux-btn-lg">
                Get Started
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button onClick={() => navigate('/login')} className="lux-btn lux-btn-ghost lux-btn-lg">
                View Demo
              </button>
            </div>

            <div className="lux-metrics">
              <div className="lux-metric">
                <div className="lux-metric-kpi">Purity</div>
                <div className="lux-metric-label">Metal verification</div>
              </div>
              <div className="lux-metric">
                <div className="lux-metric-kpi">Carat</div>
                <div className="lux-metric-label">Stone weight tracking</div>
              </div>
              <div className="lux-metric">
                <div className="lux-metric-kpi">Vault</div>
                <div className="lux-metric-label">Secure billing core</div>
              </div>
            </div>
          </div>

          <div className="lux-hero-right" id="showcase">
            <div className="lux-showcase-card">
              <div className="lux-showcase-top">
                <div className="lux-showcase-title">
                  Elite collections
                  <span className="lux-showcase-sub">Showroom inventory preview</span>
                </div>
                <div className="lux-badges">
                  <span className="lux-badge">{featuredLoading ? 'Loading…' : `Latest ${Math.min(6, featured.length)}`}</span>
                </div>
              </div>

              <div className={`lux-swatch-grid ${featuredLoading ? 'lux-swatch-grid-loading' : ''}`}>
                {featuredSlots.map((p, i) => {
                  const hasImage = Boolean(p?.imageUrl);
                  const fallbackClass = `lux-swatch-${i + 1}`;
                  const imgSrc = hasImage ? toAbsoluteImageUrl(p.imageUrl) : '';
                  const title = p?.name ? p.name : 'Product';

                  return (
                    <div
                      key={p?.id ?? `slot-${i}`}
                      className={`lux-swatch ${fallbackClass} ${hasImage ? 'lux-swatch-media' : ''}`}
                      title={title}
                      style={{ animationDelay: `${i * 70}ms` }}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate('/login')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') navigate('/login');
                      }}
                    >
                      {featuredLoading ? (
                        <div className="lux-swatch-shimmer" aria-hidden="true" />
                      ) : hasImage ? (
                        <>
                          <img
                            className="lux-swatch-img"
                            src={imgSrc}
                            alt={title}
                            loading="lazy"
                            onError={(e) => {
                              // Fallback to gradient if image fails.
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="lux-swatch-overlay">
                            <div className="lux-swatch-name">{title}</div>
                            <div className="lux-swatch-meta">Tap to explore</div>
                          </div>
                        </>
                      ) : (
                        <div className="lux-swatch-empty">
                          <span aria-hidden="true">💍</span>
                          <span className="lux-swatch-empty-text">Add jewelry photo</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="lux-ticker" aria-hidden="true">
                <div className="lux-ticker-track">
                  <span>Gold • Diamonds • Platinum • Silver • Gems • Watches • Solitaires •</span>
                  <span>Gold • Diamonds • Platinum • Silver • Gems • Watches • Solitaires •</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lux-section" id="features">
          <div className="lux-section-head">
            <h2 className="lux-h2">Designed like a showroom. Built like a fortress.</h2>
            <p className="lux-p">
              Elite UI, precise calculations, and shimmering outputs—so your jewelry business radiates quality.
            </p>
          </div>

          <div className="lux-bento">
            <div className="lux-tile lux-tile-wide">
              <div className="lux-tile-icon">💎</div>
              <div>
                <div className="lux-tile-title">Invoices that radiate luxury</div>
                <div className="lux-tile-text">Create bills in seconds, print with elegance, and email PDFs automatically.</div>
              </div>
            </div>

            <div className="lux-tile">
              <div className="lux-tile-icon">⚖️</div>
              <div>
                <div className="lux-tile-title">Stone & Metal purity</div>
                <div className="lux-tile-text">Track gold weights and diamond carats with absolute precision.</div>
              </div>
            </div>

            <div className="lux-tile">
              <div className="lux-tile-icon">📸</div>
              <div>
                <div className="lux-tile-title">Product showcase</div>
                <div className="lux-tile-text">Upload high-res jewelry photos and preview them during sales.</div>
              </div>
            </div>

            <div className="lux-tile lux-tile-tall" id="security">
              <div className="lux-tile-icon">🔒</div>
              <div>
                <div className="lux-tile-title">Safe by default</div>
                <div className="lux-tile-text">
                  Server‑calculated totals, signature verification for payments, and a clean API boundary.
                </div>
              </div>
              <div className="lux-mini-proof">
                <div className="lux-proof-row"><span className="lux-proof-dot" /> SMTP with app passwords</div>
                <div className="lux-proof-row"><span className="lux-proof-dot" /> Razorpay signature verify</div>
                <div className="lux-proof-row"><span className="lux-proof-dot" /> PDF invoices generated server-side</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lux-footer">
        <div className="lux-footer-inner">
          <div>
            <div className="lux-footer-brand">Aurum Gold & Diamonds</div>
            <div className="lux-footer-note">Elite Jewelry Billing Suite</div>
          </div>
          <div className="lux-footer-links">
            <a href="#features">Features</a>
            <a href="#showcase">Showcase</a>
            <a href="#security">Security</a>
          </div>
          <button onClick={() => navigate('/login')} className="lux-btn lux-btn-primary">
            Start Billing
          </button>
        </div>
      </footer>

      <ChatAssistant variant="floating" />
    </div>
  );
}
