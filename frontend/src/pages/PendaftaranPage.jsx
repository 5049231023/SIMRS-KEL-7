import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Modal from '../components/Modal';
import api from '../api/axios';

export default function PendaftaranPage() {
  const [searchNik, setSearchNik] = useState('');
  const [satusehatStatus, setSatusehatStatus] = useState(null); // 'loading', 'success_satusehat', 'success_lokal', 'warning'
  const [satusehatMsg, setSatusehatMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [statusPasien, setStatusPasien] = useState(''); // 'baru', 'satusehat_baru', 'kunjungan'
  const [modal, setModal] = useState({ show: false, isError: false, title: '', text: '' });
  const [satusehatInfo, setSatusehatInfo] = useState({
    organization_id: '33771066-46d2-408b-a167-308ef64fca93',
    environment: 'sandbox',
    status_label: 'Sandbox Kemenkes',
    dummy_patients: []
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    no_rm: 'Otomatis',
    ihs_number: '-',
    nik: '',
    nama: '',
    tgl_lahir: '',
    jenis_kelamin: 'L',
    no_telp: '',
    alamat: '',
    tgl_kunjungan: todayStr,
    penjamin: 'Umum',
    pelayanan: 'Rawat Jalan',
    poli: 'Umum',
    keluhan: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Ambil metadata status SATUSEHAT dan daftar pasien dummy resmi
    api.get('/satusehat/status')
      .then(res => {
        if (res.data) {
          setSatusehatInfo(res.data);
        }
      })
      .catch(err => console.error('Error fetching SATUSEHAT info:', err));
  }, []);

  const calculateAge = (dob) => {
    if (!dob) return '';
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const handleCekNikWith = async (targetNik) => {
    const nik = targetNik ? String(targetNik).trim() : String(searchNik).trim();
    if (!nik) return;

    setSearchNik(nik);
    setSatusehatStatus('loading');
    setSatusehatMsg('Menghubungkan ke SATUSEHAT Kemenkes & memvalidasi NIK ' + nik + '...');
    
    try {
      const res = await api.get(`/pasien/cek-nik/${nik}`);
      if (res.data.status === 'found') {
        const p = res.data.data;
        const source = res.data.source; // 'lokal' atau 'satusehat'
        const isLokal = source === 'lokal';

        setFormData(prev => ({
          ...prev,
          no_rm: p.no_rm || 'Otomatis (Saat Simpan)',
          ihs_number: p.ihs_number || '-',
          nik: p.nik,
          nama: p.nama,
          tgl_lahir: p.tgl_lahir,
          jenis_kelamin: (p.jenis_kelamin === 'Perempuan' || p.jenis_kelamin === 'P' || p.jenis_kelamin === 'female') ? 'P' : 'L',
          no_telp: p.no_telp || '',
          alamat: p.alamat || '',
          tgl_kunjungan: todayStr,
          poli: 'Umum',
          keluhan: '',
          penjamin: 'Umum',
          pelayanan: 'Rawat Jalan'
        }));

        if (isLokal) {
          setStatusPasien('kunjungan');
          setSatusehatStatus('success_lokal');
          setSatusehatMsg(`Pasien terdaftar di Rekam Medis SIMRS (No RM: ${p.no_rm} | IHS: ${p.ihs_number}). Form kunjungan siap diisi.`);
        } else {
          setStatusPasien('satusehat_baru');
          setSatusehatStatus('success_satusehat');
          setSatusehatMsg(`Data terverifikasi di SATUSEHAT Sandbox (${res.data.sub_source === 'satusehat_live' ? 'Live API Kemenkes' : 'Data Dummy Resmi Kemenkes'}). IHS Number: ${p.ihs_number}. Nomor Rekam Medis SIMRS akan diterbitkan otomatis.`);
        }
        setShowForm(true);
      } else {
        setSatusehatStatus('warning');
        setSatusehatMsg(`NIK ${nik} tidak ditemukan di database SIMRS maupun di platform SATUSEHAT Sandbox. Silakan daftarkan sebagai pasien baru manual.`);
        setShowForm(false);
      }
    } catch (err) {
      setSatusehatStatus('warning');
      setSatusehatMsg('Gagal memvalidasi ke SATUSEHAT. Silakan periksa koneksi atau input data manual.');
      setShowForm(false);
    }
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
      tgl_kunjungan: todayStr,
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
      if (statusPasien === 'baru' || statusPasien === 'satusehat_baru') {
        // Daftarkan pasien baru lokal (dengan mempertahankan nomor IHS SATUSEHAT jika ada)
        const pRes = await api.post('/pasien', {
          nik: formData.nik,
          nama: formData.nama,
          tgl_lahir: formData.tgl_lahir,
          jenis_kelamin: formData.jenis_kelamin,
          no_telp: formData.no_telp,
          alamat: formData.alamat,
          ihs_number: formData.ihs_number !== '-' ? formData.ihs_number : null
        });
        
        // Daftarkan kunjungan & otomatis sinkron ke SATUSEHAT
        const kRes = await api.post('/kunjungan', {
          patient_id: pRes.data.pasien.id,
          tgl_kunjungan: formData.tgl_kunjungan,
          poli: formData.poli,
          pelayanan: formData.pelayanan,
          penjamin: formData.penjamin,
          keluhan: formData.keluhan
        });
        
        const syncStatus = kRes.data?._workflow?.satusehat_sync?.status || 'Tersinkron';
        const syncId = kRes.data?._workflow?.satusehat_sync?.satusehat_encounter_id || '-';

        setModal({
          show: true,
          isError: false,
          title: 'Pendaftaran Pasien & Kunjungan Berhasil',
          text: `Pasien ${formData.nama} berhasil didaftarkan ke SIMRS.\n• No Rekam Medis: ${pRes.data.pasien.no_rm}\n• IHS Number: ${pRes.data.pasien.ihs_number}\n• SATUSEHAT Sync: ${syncStatus} (Encounter ID: ${syncId})`
        });
      } else {
        // Pasien lama/sudah ada di lokal: hanya catat kunjungan baru
        const pRes = await api.get(`/pasien/cek-nik/${formData.nik}`);
        const patientId = pRes.data?.data?.id || formData.no_rm;
        
        const kRes = await api.post('/kunjungan', {
          patient_id: patientId,
          tgl_kunjungan: formData.tgl_kunjungan,
          poli: formData.poli,
          pelayanan: formData.pelayanan || 'Rawat Jalan',
          penjamin: formData.penjamin || 'Umum',
          keluhan: formData.keluhan
        });

        const syncStatus = kRes.data?._workflow?.satusehat_sync?.status || 'Tersinkron';
        const syncId = kRes.data?._workflow?.satusehat_sync?.satusehat_encounter_id || '-';
        
        setModal({
          show: true,
          isError: false,
          title: 'Kunjungan Berhasil Didaftarkan',
          text: `Kunjungan pasien ${formData.nama} berhasil dicatat ke antrean pelayanan.\n• No RM: ${formData.no_rm}\n• SATUSEHAT Sync: ${syncStatus} (Encounter: ${syncId})`
        });
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Gagal memproses pendaftaran. Pastikan data terisi lengkap.';
      setModal({
        show: true,
        isError: true,
        title: 'Pendaftaran Gagal',
        text: errMsg
      });
    }
  };

  const closeModal = () => {
    setModal({ show: false });
    navigate('/pasien');
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  // Field identitas read-only jika data ditarik dari SATUSEHAT atau Rekam Medis
  const isIdentityReadOnly = statusPasien === 'kunjungan' || statusPasien === 'satusehat_baru';

  return (
    <MainLayout
      title="Pendaftaran Pasien & Kunjungan"
      subtitle="Registrasi kunjungan pasien dengan validasi data IHS SATUSEHAT Kemenkes RI"
    >
      <div className="reg-container">
        
        {/* PANEL STATUS SATUSEHAT KEMENKES */}
        <div className="satusehat-info-card">
          <div className="satusehat-info-header">
            <div className="satusehat-title">
              Integrasi SATUSEHAT Kemenkes (Environment: Sandbox)
            </div>
            <span className="satusehat-badge-active">
              FASYANKES TERDAFTAR
            </span>
          </div>
          <div className="satusehat-meta">
            <span>Org ID: <strong>{satusehatInfo.organization_id}</strong></span>
            <span>Status: <strong>{satusehatInfo.status_label}</strong></span>
            <span>FHIR Version: <strong>R4 (Kemenkes Profile)</strong></span>
          </div>

          {/* DUMMY PATIENTS QUICK SELECT CHIPS */}
          <div className="satusehat-chips-section">
            <span className="satusehat-chips-label">
              Klik 1-Kali untuk Uji Coba Data Dummy Resmi SATUSEHAT:
            </span>
            <div className="satusehat-chips-container">
              {(satusehatInfo.dummy_patients && satusehatInfo.dummy_patients.length > 0
                ? satusehatInfo.dummy_patients
                : [
                    { nama: 'Ardianto Putra', nik: '9271060312000001', ihs_number: 'P02478375538' },
                    { nama: 'Claudia Sintia', nik: '9204014804000002', ihs_number: 'P03647103112' },
                    { nama: 'Elizabeth Dior', nik: '9104224509000003', ihs_number: 'P00805884304' },
                    { nama: 'Dr. Alan Bagus Prasetya', nik: '9104223107000004', ihs_number: 'P00912894463' },
                    { nama: 'Budi Santoso', nik: '3515012345670001', ihs_number: 'P00098234112' }
                  ]
              ).map((dummy, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn-dummy-chip"
                  onClick={() => handleCekNikWith(dummy.nik)}
                  title={`Uji Coba Pasien Dummy ${dummy.nama}`}
                >
                  {dummy.nama}
                  <small>NIK: {dummy.nik} • IHS: {dummy.ihs_number}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="reg-header-flex">
          <div>
            <h2>Pencarian Identitas Pasien</h2>
            <p>Masukkan NIK untuk verifikasi SATUSEHAT atau tambah data baru</p>
          </div>
          <button className="btn-status-action" onClick={handleBaru}>+ Pendaftaran Pasien Baru</button>
        </div>

        <div className="search-box-section">
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              placeholder="Masukkan NIK Pasien (16 digit) atau pilih salah satu data dummy di atas..."
              value={searchNik}
              onChange={e => setSearchNik(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCekNikWith(searchNik); }}
              maxLength="16"
            />
            <button className="search-btn" onClick={() => handleCekNikWith(searchNik)}>
              Cek NIK & SATUSEHAT
            </button>
          </div>
        </div>

        {satusehatStatus === 'loading' && (
          <div className="satusehat-banner satusehat-loading">
            <strong>Memproses Validasi SATUSEHAT...</strong><br/>
            {satusehatMsg}
          </div>
        )}
        {(satusehatStatus === 'success_satusehat' || satusehatStatus === 'success_lokal') && (
          <div className="satusehat-banner satusehat-success">
            <strong>Identitas Terverifikasi</strong><br/>
            {satusehatMsg}
          </div>
        )}
        {satusehatStatus === 'warning' && (
          <div className="satusehat-banner satusehat-warning">
            <strong>Data Tidak Ditemukan</strong><br/>
            {satusehatMsg}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
            <h3 style={{ color: '#1e3c72', fontSize: '1rem', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              Data Identitas Pasien {isIdentityReadOnly ? '(Terverifikasi SATUSEHAT)' : ''}
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Nomor Rekam Medis SIMRS</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.no_rm}
                  readOnly
                  style={{ background: '#f1f5f9', fontWeight: '600' }}
                />
              </div>
              <div className="form-group">
                <label>IHS Number (Kemenkes SATUSEHAT)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.ihs_number}
                  readOnly
                  style={{ background: '#f1f5f9', fontWeight: '700', color: '#166534' }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nomor Induk Kependudukan (NIK)</label>
                <input
                  type="text"
                  className="form-control"
                  name="nik"
                  value={formData.nik}
                  onChange={handleChange}
                  required
                  readOnly={isIdentityReadOnly}
                />
              </div>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  className="form-control"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  readOnly={isIdentityReadOnly}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tanggal Lahir</label>
                <input
                  type="date"
                  className="form-control"
                  name="tgl_lahir"
                  value={formData.tgl_lahir}
                  onChange={handleChange}
                  required
                  readOnly={isIdentityReadOnly}
                />
              </div>
              <div className="form-group">
                <label>Usia</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.tgl_lahir ? `${calculateAge(formData.tgl_lahir)} Tahun` : '-'}
                  readOnly
                  style={{ background: '#f1f5f9' }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Jenis Kelamin</label>
                <select
                  className="form-control"
                  name="jenis_kelamin"
                  value={formData.jenis_kelamin}
                  onChange={handleChange}
                  disabled={isIdentityReadOnly}
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  className="form-control"
                  name="no_telp"
                  value={formData.no_telp}
                  onChange={handleChange}
                  readOnly={isIdentityReadOnly}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Alamat Lengkap</label>
              <textarea
                className="form-control"
                name="alamat"
                rows="2"
                value={formData.alamat}
                onChange={handleChange}
                required
                readOnly={isIdentityReadOnly}
              ></textarea>
            </div>

            <h3 style={{ color: '#1e3c72', fontSize: '1rem', margin: '25px 0 15px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              Data Pelayanan Kunjungan & Poli
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label>Tanggal Kunjungan</label>
                <input
                  type="date"
                  className="form-control"
                  name="tgl_kunjungan"
                  value={formData.tgl_kunjungan}
                  onChange={handleChange}
                  required
                />
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
              <textarea
                className="form-control"
                name="keluhan"
                rows="3"
                placeholder="Contoh: Demam sejak 3 hari yang lalu, batuk kering, dan sakit tenggorokan..."
                value={formData.keluhan}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-submit">
              Simpan & Daftarkan Kunjungan (Sinkronkan SATUSEHAT)
            </button>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button type="button" className="btn-back" onClick={() => setShowForm(false)}>
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
      <Modal
        show={modal.show}
        icon={modal.isError ? '!' : '✓'}
        isError={modal.isError}
        title={modal.title}
        text={modal.text}
        onClose={closeModal}
      />
    </MainLayout>
  );
}
