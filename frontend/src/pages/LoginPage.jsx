import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [unit, setUnit] = useState('Rekam Medis');
  const [tglLahir, setTglLahir] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-body');
    return () => document.body.classList.remove('login-body');
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await login(nip, password);
      navigate('/');
    } catch (error) {
      alert('Login gagal. Periksa NIP dan Password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoNip) => {
    setNip(demoNip);
    setPassword('123');
    setLoading(true);
    try {
      await login(demoNip, '123');
      navigate('/');
    } catch (error) {
      alert('Login gagal untuk akun demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register({ nama, unit, tgl_lahir: tglLahir, password });
      alert(`Registrasi berhasil! NIP Anda: ${data.nip}\nSilakan login menggunakan NIP tersebut.`);
      setMode('login');
      setNip(data.nip.toString());
      setPassword(password);
      setNama('');
      setTglLahir('');
      setUnit('Rekam Medis');
    } catch (error) {
      alert('Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-icon">+</div>
      <h2>SIM RS Terpadu</h2>
      <p>{mode === 'login' ? 'Masuk ke Sistem Manajemen Rumah Sakit' : 'Daftar Akun Petugas Rumah Sakit'}</p>
      
      {mode === 'login' ? (
        <>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Nomor Induk Pegawai (NIP)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Masukkan NIP"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Kata Sandi</label>
              <input
                type="password"
                className="form-control"
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-main" disabled={loading}>
              {loading ? 'Memproses Masuk...' : 'Masuk ke Sistem'}
            </button>
            <div className="toggle-link">
              Belum punya akun? <a onClick={() => setMode('register')}>Daftar Baru</a>
            </div>
          </form>

          {/* QUICK DEMO LOGIN BUTTONS */}
          <div className="demo-accounts-box">
            <div className="demo-accounts-title">Pilih Akun Demo (1-Klik Masuk):</div>
            <div className="demo-buttons-grid">
              <button
                type="button"
                className="btn-demo btn-demo-admin"
                onClick={() => handleQuickLogin('101')}
              >
                <strong>Admin SIMRS</strong>
                <span>NIP: 101</span>
              </button>
              <button
                type="button"
                className="btn-demo btn-demo-dokter"
                onClick={() => handleQuickLogin('103')}
              >
                <strong>Dokter Spesialis</strong>
                <span>NIP: 103</span>
              </button>
              <button
                type="button"
                className="btn-demo btn-demo-perawat"
                onClick={() => handleQuickLogin('104')}
              >
                <strong>Perawat Klinis</strong>
                <span>NIP: 104</span>
              </button>
              <button
                type="button"
                className="btn-demo btn-demo-farmasi"
                onClick={() => handleQuickLogin('102')}
              >
                <strong>Petugas Farmasi</strong>
                <span>NIP: 102</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>NIP</label>
            <input type="text" className="form-control" value="Otomatis Digenerate" readOnly disabled />
          </div>
          <div className="form-group">
            <label>Nama Lengkap & Gelar</label>
            <input
              type="text"
              className="form-control"
              placeholder="Contoh: dr. Budi Santoso, Sp.A"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Unit / Peran Pelayanan</label>
            <select className="form-control" value={unit} onChange={(e) => setUnit(e.target.value)} required>
              <option value="Admin">Administrator SIMRS</option>
              <option value="Dokter">Dokter Spesialis / Umum</option>
              <option value="Perawat">Perawat Klinis / IGD</option>
              <option value="Farmasi">Petugas Farmasi & Apotek</option>
              <option value="Laboratorium">Petugas Laboratorium</option>
              <option value="Kasir">Kasir & Billing</option>
              <option value="Rekam Medis">Rekam Medis</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tanggal Lahir</label>
            <input
              type="date"
              className="form-control"
              value={tglLahir}
              onChange={(e) => setTglLahir(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Kata Sandi</label>
            <input
              type="password"
              className="form-control"
              placeholder="Minimal 3 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-main" disabled={loading}>
            {loading ? 'Mendaftarkan...' : 'Daftar Akun Petugas'}
          </button>
          <div className="toggle-link">
            Sudah punya akun? <a onClick={() => setMode('login')}>Login di sini</a>
          </div>
        </form>
      )}
    </div>
  );
}
