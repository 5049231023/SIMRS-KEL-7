import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import api from '../api/axios';

export default function PendaftaranPage() {
  const [searchNik, setSearchNik] = useState('');
  const [satusehatStatus, setSatusehatStatus] = useState(null); // 'loading', 'success', 'warning'
  const [showForm, setShowForm] = useState(false);
  const [statusPasien, setStatusPasien] = useState(''); // 'baru' atau 'kunjungan'
  const [modal, setModal] = useState({ show: false, isError: false, title: '', text: '' });
  
  const [formData, setFormData] = useState({
    no_rm: 'Otomatis',
    ihs_number: '-',
    nik: '',
    nama: '',
    tgl_lahir: '',
    jenis_kelamin: 'L',
    no_telp: '',
    alamat: '',
    tgl_kunjungan: '',
    penjamin: 'Umum',
    pelayanan: 'Rawat Jalan',
    poli: 'Umum',
    keluhan: ''
  });

  const navigate = useNavigate();

  const calculateAge = (dob) => {
    if (!dob) return '';
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const handleCekNik = async () => {
    if (!searchNik) return;
    setSatusehatStatus('loading');
    
    setTimeout(async () => {
      try {
        const res = await api.get(`/pasien/cek-nik/${searchNik}`);
        if (res.data.status === 'found') {
          const p = res.data.data;
          setFormData(prev => ({
            ...prev,
            no_rm: p.no_rm,
            ihs_number: p.ihs_number || '-',
            nik: p.nik,
            nama: p.nama,
            tgl_lahir: p.tgl_lahir,
            jenis_kelamin: p.jenis_kelamin,
            no_telp: p.no_telp,
            alamat: p.alamat,
            tgl_kunjungan: new Date().toISOString().split('T')[0],
            poli: 'Umum',
            keluhan: '',
            penjamin: 'Umum',
            pelayanan: 'Rawat Jalan'
          }));
          setStatusPasien('kunjungan');
          setSatusehatStatus('success');
          setShowForm(true);
        }
      } catch (err) {
        setSatusehatStatus('warning');
        setShowForm(false);
      }
    }, 700);
  };

  const handleBaru = () => {
    setSatusehatStatus(null);
    setStatusPasien('baru');
    setSearchNik('');
    setFormData({
      no_rm: 'Otomatis',
      ihs_number: '-',
      nik: '',
      nama: '',
      tgl_lahir: '',
      jenis_kelamin: 'L',
      no_telp: '',
      alamat: '',
      tgl_kunjungan: new Date().toISOString().split('T')[0],
      penjamin: 'Umum',
      pelayanan: 'Rawat Jalan',
      poli: 'Umum',
      keluhan: ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (statusPasien === 'baru') {
        const pRes = await api.post('/pasien', {
          nik: formData.nik,
          nama: formData.nama,
          tgl_lahir: formData.tgl_lahir,
          jenis_kelamin: formData.jenis_kelamin,
          no_telp: formData.no_telp,
          alamat: formData.alamat
        });
        
        await api.post('/kunjungan', {
          patient_id: pRes.data.pasien.id,
          tgl_kunjungan: formData.tgl_kunjungan,
          poli: formData.poli,
          pelayanan: formData.pelayanan,
          penjamin: formData.penjamin,
          keluhan: formData.keluhan
        });
        
        setModal({
          show: true, isError: false, title: 'Pendaftaran Berhasil',
          text: `Pasien ${formData.nama} berhasil didaftarkan. No RM: ${pRes.data.pasien.no_rm}`
        });
      } else {
        const pRes = await api.get(`/pasien/cek-nik/${formData.nik}`);
        await api.post('/kunjungan', {
          pasien_id: pRes.data.data.id,
          tgl_kunjungan: formData.tgl_kunjungan,
          poli: formData.poli,
          keluhan: formData.keluhan
        });
        
        setModal({
          show: true, isError: false, title: 'Kunjungan Berhasil',
          text: `Kunjungan pasien ${formData.nama} berhasil dicatat.`
        });
      }
    } catch (error) {
      setModal({
        show: true, isError: true, title: 'Terjadi Kesalahan',
        text: 'Gagal memproses data pendaftaran. Periksa kembali koneksi atau data input.'
      });
    }
  };

  const closeModal = () => {
    setModal({ show: false });
    navigate('/pasien');
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const isReadOnly = statusPasien === 'kunjungan';

  return (
    <>
      <Navbar />
      <div className="reg-container">
        <div className="reg-header-flex">
          <div>
            <h2>Formulir Pendaftaran Pasien</h2>
            <p>Registrasi kunjungan atau tambah pasien baru</p>
          </div>
          <button className="btn-status-action" onClick={handleBaru}>+ Pendaftaran Anggota Baru</button>
        </div>

        <div className="search-box-section">
          <div className="search-input-group">
            <input type="text" className="search-input" placeholder="Masukkan NIK Pasien (16 digit)" value={searchNik} onChange={e => setSearchNik(e.target.value)} maxLength="16" />
            <button className="search-btn" onClick={handleCekNik}>Cek NIK & SATUSEHAT</button>
          </div>
        </div>

        {satusehatStatus === 'loading' && (
          <div className="satusehat-banner satusehat-loading">
            <strong>⏳ Menghubungkan ke SATUSEHAT...</strong><br/>Sedang memvalidasi NIK dan mengambil data IHS.
          </div>
        )}
        {satusehatStatus === 'success' && (
          <div className="satusehat-banner satusehat-success">
            <strong>✅ Data SATUSEHAT Ditemukan</strong><br/>Pasien terdaftar dengan IHS Number: {formData.ihs_number}
          </div>
        )}
        {satusehatStatus === 'warning' && (
          <div className="satusehat-banner satusehat-warning">
            <strong>⚠️ NIK Tidak Ditemukan</strong><br/>Data pasien tidak ditemukan di lokal maupun SATUSEHAT. Silakan daftarkan sebagai pasien baru.
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
            <h3 style={{ color: '#1e3c72', fontSize: '1rem', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Data Identitas Pasien {statusPasien === 'kunjungan' ? '(Read-only)' : ''}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Nomor Rekam Medis</label>
                <input type="text" className="form-control" value={formData.no_rm} readOnly style={{ background: '#e2e8f0' }} />
              </div>
              <div className="form-group">
                <label>IHS Number (SATUSEHAT)</label>
                <input type="text" className="form-control" value={formData.ihs_number} readOnly style={{ background: '#e2e8f0' }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nomor Induk Kependudukan (NIK)</label>
                <input type="text" className="form-control" name="nik" value={formData.nik} onChange={handleChange} required readOnly={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input type="text" className="form-control" name="nama" value={formData.nama} onChange={handleChange} required readOnly={isReadOnly} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tanggal Lahir</label>
                <input type="date" className="form-control" name="tgl_lahir" value={formData.tgl_lahir} onChange={handleChange} required readOnly={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Usia</label>
                <input type="text" className="form-control" value={`${calculateAge(formData.tgl_lahir)} Tahun`} readOnly style={{ background: '#e2e8f0' }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Jenis Kelamin</label>
                <select className="form-control" name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} disabled={isReadOnly}>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nomor Telepon / WhatsApp</label>
                <input type="text" className="form-control" name="no_telp" value={formData.no_telp} onChange={handleChange} readOnly={isReadOnly} />
              </div>
            </div>

            <div className="form-group">
              <label>Alamat Lengkap</label>
              <textarea className="form-control" name="alamat" rows="2" value={formData.alamat} onChange={handleChange} required readOnly={isReadOnly}></textarea>
            </div>

            <h3 style={{ color: '#1e3c72', fontSize: '1rem', margin: '25px 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Data Layanan & Kunjungan</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Tanggal Kunjungan</label>
                <input type="date" className="form-control" name="tgl_kunjungan" value={formData.tgl_kunjungan} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Metode Penjamin</label>
                <select className="form-control" name="penjamin" value={formData.penjamin} onChange={handleChange}>
                  <option value="Umum">Umum / Mandiri</option>
                  <option value="BPJS Kesehatan">BPJS Kesehatan</option>
                  <option value="Asuransi Lain">Asuransi Lainnya</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Jenis Pelayanan</label>
                <select className="form-control" name="pelayanan" value={formData.pelayanan} onChange={handleChange}>
                  <option value="Rawat Jalan">Rawat Jalan</option>
                  <option value="Rawat Inap">Rawat Inap</option>
                  <option value="IGD">IGD / Gawat Darurat</option>
                </select>
              </div>
              <div className="form-group">
                <label>Poliklinik Tujuan</label>
                <select className="form-control" name="poli" value={formData.poli} onChange={handleChange}>
                  <option value="Umum">Poli Umum</option>
                  <option value="Penyakit Dalam">Poli Penyakit Dalam</option>
                  <option value="Bedah">Poli Bedah</option>
                  <option value="Anak">Poli Anak</option>
                  <option value="Gigi">Poli Gigi</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Keluhan Utama</label>
              <textarea className="form-control" name="keluhan" rows="3" value={formData.keluhan} onChange={handleChange} required></textarea>
            </div>

            <button type="submit" className="btn-submit">Simpan & Daftarkan Kunjungan</button>
            <div style={{ textAlign: 'center' }}>
              <button type="button" className="btn-back" onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </form>
        )}
      </div>
      <Modal show={modal.show} icon={modal.isError ? '!' : '✓'} isError={modal.isError} title={modal.title} text={modal.text} onClose={closeModal} />
    </>
  );
}
