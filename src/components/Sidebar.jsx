import { NavLink } from 'react-router-dom';

const navItems = [
  {
    label: 'Main Menu',
    links: [
      {
        to: '/',
        label: 'Dashboard',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        to: '/products',
        label: 'Products',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Transactions',
    links: [
      {
        to: '/billing',
        label: 'Generate Bill',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '12px', color: 'white', display: 'flex' }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 10l.5 3t.5 3l.5-3t.5-3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10l3 2-3 2-3-2 3-2z" />
          </svg>
        </div>
        Aurum Gold
      </div>

      <div style={{ flex: 1 }}>
        {navItems.map((group) => (
          <div key={group.label} style={{ marginBottom: '20px' }}>
            <div className="sidebar-label">{group.label}</div>
            {group.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>System Active</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>All modules running</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="nav-link" 
          style={{ width: '100%', border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
