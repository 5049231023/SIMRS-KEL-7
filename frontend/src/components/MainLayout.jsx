import { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function MainLayout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const role = user?.role || 'admin';

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getInitials = (name) => {
    if (!name) return 'RS';
    const parts = name.replace(/^(dr\.|drg\.|Ns\.|apt\.)\s*/i, '').trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const roleDisplay = {
    admin: 'ADMINISTRATOR',
    dokter: 'DOKTER SPESIALIS',
    perawat: 'PERAWAT KLINIS',
    farmasi: 'FARMASI',
    laboratorium: 'LABORATORIUM',
    kasir: 'KASIR & BILLING'
  };

  return (
    <div className="app-layout">
      <header className="app-topbar">
        <div className="topbar-left">
          <button 
            type="button" 
            className="btn-toggle-sidebar"
            onClick={() => setSidebarOpen(prev => !prev)}
            title={sidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="topbar-brand">
            <div className="brand-badge">SIMRS</div>
            <div className="brand-text">
              <h1>SIM RS TERPADU</h1>
              <span>RS KELOMPOK 7</span>
            </div>
          </div>

          <div className="topbar-divider"></div>

          <div className="topbar-title-block">
            {title && <h2 className="topbar-title">{title}</h2>}
            {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="topbar-right">
          <div className="topbar-date">{today}</div>

          <div className="topbar-profile-card">
            <div className="profile-avatar">{getInitials(user?.nama)}</div>
            <div className="profile-info">
              <div className="profile-name" title={user?.nama}>{user?.nama || 'Petugas Medis'}</div>
              <div className="profile-nip">NIP: {user?.nip || '-'}</div>
              <span className={`role-badge role-${role}`}>
                {roleDisplay[role] || role.toUpperCase()}
              </span>
            </div>
            <button className="btn-topbar-logout" onClick={logout} title="Keluar dari Sistem">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="app-workspace">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`app-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          <div className="app-content-body">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
