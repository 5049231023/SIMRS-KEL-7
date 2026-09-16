import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen = true }) {
  const { user } = useAuth();
  const role = user?.role || 'admin';

  // Helper render clean SVG icons
  const renderIcon = (type) => {
    const props = {
      width: '18',
      height: '18',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className: 'sidebar-icon'
    };

    switch (type) {
      case 'dashboard':
        return (
          <svg {...props}>
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        );
      case 'pendaftaran':
        return (
          <svg {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        );
      case 'pasien':
        return (
          <svg {...props}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        );
      case 'igd':
        return (
          <svg {...props}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        );
      case 'dokter':
        return (
          <svg {...props}>
            <path d="M4.5 3v5a5.5 5.5 0 0 0 11 0V3"/>
            <path d="M3 3h3"/>
            <path d="M14 3h3"/>
            <path d="M10 13.5v3.5a4 4 0 0 0 4 4h1a4 4 0 0 0 4-4v-2"/>
            <circle cx="19" cy="13" r="2"/>
          </svg>
        );
      case 'farmasi':
        return (
          <svg {...props}>
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
            <path d="m8.5 8.5 7 7"/>
          </svg>
        );
      case 'lab':
        return (
          <svg {...props}>
            <path d="M10 2v7.5a2 2 0 0 1-.2.9L4.7 20.5a1 1 0 0 0 .9 1.5h12.8a1 1 0 0 0 .9-1.5L14.2 10.4a2 2 0 0 1-.2-.9V2"/>
            <path d="M8.5 2h7"/>
            <path d="M7 16h10"/>
          </svg>
        );
      case 'kasir':
        return (
          <svg {...props}>
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
            <line x1="6" y1="15" x2="10" y2="15"/>
          </svg>
        );
      case 'users':
        return (
          <svg {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        );
      default:
        return (
          <svg {...props}>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        );
    }
  };

  // Nav menus grouped by role with clean icon key
  const getNavLinks = () => {
    if (role === 'dokter') {
      return [
        { to: '/', label: 'Beranda Dokter', icon: 'dashboard' },
        { to: '/pemeriksaan-dokter', label: 'Ruang Periksa Medis', icon: 'dokter' },
        { to: '/farmasi', label: 'Resep Farmasi', icon: 'farmasi' },
        { to: '/laboratorium', label: 'Hasil Laboratorium', icon: 'lab' },
        { to: '/pasien', label: 'Data Rekam Medis', icon: 'pasien' },
      ];
    }
    if (role === 'perawat') {
      return [
        { to: '/', label: 'Beranda Asuhan', icon: 'dashboard' },
        { to: '/igd', label: 'Antrean & Triase IGD', icon: 'igd' },
        { to: '/pasien', label: 'Data Pasien & TTV', icon: 'pasien' },
        { to: '/pendaftaran', label: 'Pendaftaran Kunjungan', icon: 'pendaftaran' },
      ];
    }
    if (role === 'farmasi') {
      return [
        { to: '/', label: 'Beranda Farmasi', icon: 'dashboard' },
        { to: '/farmasi', label: 'Resep & Dispensing', icon: 'farmasi' },
        { to: '/pasien', label: 'Data Rekam Medis', icon: 'pasien' },
        { to: '/kasir', label: 'Billing Kasir', icon: 'kasir' },
      ];
    }
    // Admin gets all modules
    return [
      { to: '/', label: 'Dashboard Utama', icon: 'dashboard' },
      { to: '/pendaftaran', label: 'Pendaftaran Pasien', icon: 'pendaftaran' },
      { to: '/pasien', label: 'Data Rekam Medis', icon: 'pasien' },
      { to: '/igd', label: 'Unit Gawat Darurat', icon: 'igd' },
      { to: '/pemeriksaan-dokter', label: 'Pemeriksaan Dokter', icon: 'dokter' },
      { to: '/farmasi', label: 'Farmasi & Apotek', icon: 'farmasi' },
      { to: '/laboratorium', label: 'Laboratorium', icon: 'lab' },
      { to: '/kasir', label: 'Kasir & Billing', icon: 'kasir' },
      { to: '/admin/users', label: 'Manajemen Akun Staf', icon: 'users' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-section-title">MENU PELAYANAN</div>
      <nav className="sidebar-nav">
        {navLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {renderIcon(item.icon)}
            <span className="sidebar-link-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
