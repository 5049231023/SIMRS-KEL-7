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
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-body');
    return () => document.body.classList.remove('login-body');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(nip, password);
      if (data.practitioner.unit !== 'Rekam Medis') {
        navigate('/404');
      } else {
        navigate('/');
      }
    } catch (error) {
      alert('Login gagal. Periksa NIP dan Password.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const data = await register({ nama, unit, tgl_lahir: tglLahir, password });
      alert(`Registrasi berhasil! NIP Anda: ${data.nip}\nSilakan login menggunakan NIP tersebut.`);
      setMode('login');
      setNip('');
      setPassword('');
      setNama('');
      setTglLahir('');
      setUnit('Rekam Medis');
    } catch (error) {
      alert('Registrasi gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="login-card">
      <div className="login-icon">🏥</div>
      <h2>SIM RS Terpadu</h2>
      <p>{mode === 'login' ? 'Silakan login menggunakan NIP Anda' : 'Daftar akun petugas baru'}</p>
      
      {mode === 'login' ? (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>NIP</label>
            <input type="text" className="form-control" value={nip} onChange={(e) => setNip(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-main">Masuk Dashboard</button>
          <div className="toggle-link">
            Belum punya akun? <a onClick={() => setMode('register')}>Daftar Baru</a>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>NIP</label>
            <input type="text" className="form-control" value="Otomatis" readOnly disabled />
          </div>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input type="text" className="form-control" value={nama} onChange={(e) => setNama(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Unit/Poli</label>
            <select className="form-control" value={unit} onChange={(e) => setUnit(e.target.value)} required>
              <option value="Rekam Medis">Rekam Medis</option>
              <option value="Dokter">Dokter</option>
              <option value="Perawat">Perawat</option>
              <option value="Farmasi">Farmasi</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tanggal Lahir</label>
            <input type="date" className="form-control" value={tglLahir} onChange={(e) => setTglLahir(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-main">Daftar Akun</button>
          <div className="toggle-link">
            Sudah punya akun? <a onClick={() => setMode('login')}>Login di sini</a>
          </div>
        </form>
      )}
    </div>
  );
}
