import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'nav-item active' : 'nav-item';

  return (
    <div className="top-navbar">
      <Link to="/" className="nav-brand">SIM RS Terpadu</Link>
      <div className="nav-menu">
        <Link to="/" className={isActive('/')}>Beranda</Link>
        <Link to="/pendaftaran" className={isActive('/pendaftaran')}>Pendaftaran</Link>
        <Link to="/pasien" className={isActive('/pasien')}>Data Pasien</Link>
        <Link to="/igd" className={isActive('/igd')}>IGD</Link>
        <Link to="/farmasi" className={isActive('/farmasi')}>Farmasi</Link>
        <Link to="/laboratorium" className={isActive('/laboratorium')}>Laboratorium</Link>
        <Link to="/kasir" className={isActive('/kasir')}>Kasir</Link>
      </div>
      <div className="nav-profile-group">
        <div className="nav-profile">{user?.nama || 'Petugas'}</div>
        <button className="btn-logout" onClick={logout}>Keluar</button>
      </div>
    </div>
  );
}
