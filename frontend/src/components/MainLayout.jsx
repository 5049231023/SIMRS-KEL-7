import Sidebar from './Sidebar';

export default function MainLayout({ children, title, subtitle }) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="app-topbar">
          <div>
            {title && <h2 className="topbar-title">{title}</h2>}
            {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
          </div>
          <div className="topbar-right">
            <div className="topbar-date">{today}</div>
            <div className="topbar-status-chip">
              <span className="status-dot"></span>
              <span>Sistem Terkoneksi</span>
            </div>
          </div>
        </header>

        <div className="app-content-body">
          {children}
        </div>
      </div>
    </div>
  );
}
