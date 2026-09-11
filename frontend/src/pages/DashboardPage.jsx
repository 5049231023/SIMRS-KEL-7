import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || 'admin';

  const [stats, setStats] = useState({
    total_kunjungan: 0, bor: 0, rawat_inap: 0, igd: 0,
    antrean_perawat: 0, antrean_dokter: 0, selesai_hari_ini: 0,
    resep_pending: 0, lab_pending: 0, tagihan_pending: 0
  });

  const [kunjunganList, setKunjunganList] = useState([]);
  const [selectedTtvPatient, setSelectedTtvPatient] = useState(null);
  const [modal, setModal] = useState({ show: false, isError: false, title: '', text: '' });

  // TTV Form states for Perawat
  const [ttvForm, setTtvForm] = useState({
    tekanan_darah: '120/80 mmHg',
    suhu: '36.5 °C',
    nadi: '80 x/mnt',
    pernapasan: '20 x/mnt',
    berat_badan: '65 kg',
    tinggi_badan: '165 cm',
    triage_level: 'P3',
    catatan_perawat: ''
  });

  const loadData = () => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));

    api.get('/kunjungan')
      .then(res => setKunjunganList(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenTtv = (k) => {
    setSelectedTtvPatient(k);
    setTtvForm({
      tekanan_darah: k.tanda_vital?.tekanan_darah || '120/80 mmHg',
      suhu: k.tanda_vital?.suhu || '36.5 °C',
      nadi: k.tanda_vital?.nadi || '80 x/mnt',
      pernapasan: k.tanda_vital?.pernapasan || '20 x/mnt',
      berat_badan: k.tanda_vital?.berat_badan || '65 kg',
      tinggi_badan: k.tanda_vital?.tinggi_badan || '165 cm',
      triage_level: k.triage_level || 'P3',
      catatan_perawat: k.tanda_vital?.catatan_perawat || ''
    });
  };

  const handleSubmitTtv = async (e) => {
    e.preventDefault();
    if (!selectedTtvPatient) return;

    try {
      await api.put(`/kunjungan/${selectedTtvPatient.id}/ttv`, ttvForm);
      setModal({
        show: true,
        isError: false,
        title: 'Asesmen Berhasil Disimpan',
        text: `Tanda vital pasien ${selectedTtvPatient.pasien?.nama} berhasil dicatat. Status pasien dialihkan ke ruang periksa Dokter.`
      });
      setSelectedTtvPatient(null);
      loadData();
    } catch (err) {
      setModal({
        show: true,
        isError: true,
        title: 'Gagal Menyimpan',
        text: 'Terjadi kesalahan saat menyimpan data tanda vital.'
      });
    }
  };

  const pasienPerawat = kunjunganList.filter(k => k.status_alur === 'menunggu_perawat' || !k.tanda_vital);
  const pasienDokter = kunjunganList.filter(k => k.status_alur === 'siap_dokter');

  return (
    <MainLayout
      title={role === 'dokter' ? 'Panel Kerja Dokter' : role === 'perawat' ? 'Panel Asuhan Keperawatan' : 'Panel Administrasi SIMRS'}
      subtitle={`Selamat bertugas, ${user?.nama || 'Petugas'} &bull; Unit: ${user?.unit || '-'}`}
    >
      {/* HERO BANNER */}
      <div className="dashboard-hero">
        <div className="hero-text">
          <h1>
            {role === 'dokter' && 'Ruang Layanan Dokter Spesialis'}
            {role === 'perawat' && 'Layanan Asuhan & Asesmen Tanda Vital'}
            {role === 'admin' && 'Sistem Informasi Manajemen RS Terpadu'}
            {role === 'farmasi' && 'Instalasi Farmasi & Pelayanan Obat'}
          </h1>
          <p>
            {role === 'dokter' && 'Kelola pemeriksaan pasien rujukan, tegakkan diagnosa medis, terbitkan resep farmasi, dan buat order laboratorium secara terintegrasi.'}
            {role === 'perawat' && 'Lakukan skrining awal pasien, input tanda-tanda vital (TTV), tentukan triase IGD, dan teruskan pasien siap periksa ke dokter.'}
            {role === 'admin' && 'Mengelola registrasi pasien, data rekam medis, billing kasir, dan memonitor seluruh operasional rumah sakit realtime.'}
            {role === 'farmasi' && 'Terima resep digital langsung dari dokter periksa, lakukan telaah obat, dan serahkan obat kepada pasien.'}
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            {role === 'dokter' && (
              <Link to="/pemeriksaan-dokter" className="btn-action">Masuk ke Ruang Periksa</Link>
            )}
            {role === 'perawat' && (
              <Link to="/igd" className="btn-action">Buka Antrean & Triase IGD</Link>
            )}
            {role === 'admin' && (
              <Link to="/pendaftaran" className="btn-action">Daftarkan Pasien Baru</Link>
            )}
            {role === 'farmasi' && (
              <Link to="/farmasi" className="btn-action">Buka Resep Masuk</Link>
            )}
          </div>
        </div>

        <div className="card-akses">
          <div className="row-info">
            <span>Identitas Petugas</span>
            <strong>{user?.nama}</strong>
          </div>
          <div className="row-info">
            <span>Unit Kerja</span>
            <strong>{user?.unit}</strong>
          </div>
          <div className="row-info">
            <span>Peran Otoritas</span>
            <strong style={{ textTransform: 'uppercase' }}>{role}</strong>
          </div>
          <span className="badge-status">STATUS AKTIF</span>
        </div>
      </div>

      {/* MODAL / POPUP INPUT TTV OLEH PERAWAT */}
      {selectedTtvPatient && (
        <div className="dokter-exam-box" style={{ marginBottom: '25px' }}>
          <div className="exam-box-header">
            <div>
              <h3>Input Tanda-Tanda Vital Pasien</h3>
              <p>Pasien: <strong>{selectedTtvPatient.pasien?.nama}</strong> (No RM: {selectedTtvPatient.pasien?.no_rm}) &bull; Keluhan: <em>"{selectedTtvPatient.keluhan}"</em></p>
            </div>
            <button className="btn-back" onClick={() => setSelectedTtvPatient(null)}>Tutup</button>
          </div>

          <form onSubmit={handleSubmitTtv}>
            <div className="form-row">
              <div className="form-group">
                <label>Tekanan Darah (mmHg)</label>
                <input
                  type="text"
                  className="form-control"
                  value={ttvForm.tekanan_darah}
                  onChange={e => setTtvForm(prev => ({ ...prev, tekanan_darah: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Suhu Tubuh (°C)</label>
                <input
                  type="text"
                  className="form-control"
                  value={ttvForm.suhu}
                  onChange={e => setTtvForm(prev => ({ ...prev, suhu: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Denyut Nadi (x/menit)</label>
                <input
                  type="text"
                  className="form-control"
                  value={ttvForm.nadi}
                  onChange={e => setTtvForm(prev => ({ ...prev, nadi: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Laju Pernapasan / RR (x/menit)</label>
                <input
                  type="text"
                  className="form-control"
                  value={ttvForm.pernapasan}
                  onChange={e => setTtvForm(prev => ({ ...prev, pernapasan: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Berat Badan (kg)</label>
                <input
                  type="text"
                  className="form-control"
                  value={ttvForm.berat_badan}
                  onChange={e => setTtvForm(prev => ({ ...prev, berat_badan: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Tinggi Badan (cm)</label>
                <input
                  type="text"
                  className="form-control"
                  value={ttvForm.tinggi_badan}
                  onChange={e => setTtvForm(prev => ({ ...prev, tinggi_badan: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Triage Level (Khusus IGD / Prioritas)</label>
                <select
                  className="form-control"
                  value={ttvForm.triage_level}
                  onChange={e => setTtvForm(prev => ({ ...prev, triage_level: e.target.value }))}
                >
                  <option value="P1">P1 - Merah (Resusitasi / Kritis)</option>
                  <option value="P2">P2 - Oranye (Emergensi Berat)</option>
                  <option value="P3">P3 - Kuning (Mendesak / Urgent)</option>
                  <option value="P4">P4 - Hijau (Tidak Mendesak)</option>
                  <option value="P5">P5 - Biru (Bukan Gawat Darurat)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Catatan Asesmen Awal Perawat</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Kondisi umum, riwayat alergi, kesadaran, dll."
                  value={ttvForm.catatan_perawat}
                  onChange={e => setTtvForm(prev => ({ ...prev, catatan_perawat: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-submit" style={{ flex: 1 }}>
                Simpan TTV & Teruskan ke Dokter
              </button>
              <button type="button" className="btn-back" onClick={() => setSelectedTtvPatient(null)}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STATISTIK SESUAI ROLE */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {role === 'dokter' ? (
          <>
            <div className="stat-card">
              <h3>Pasien Siap Diperiksa</h3>
              <p>{stats.antrean_dokter}</p>
            </div>
            <div className="stat-card">
              <h3>Pemeriksaan Selesai Hari Ini</h3>
              <p>{stats.selesai_hari_ini}</p>
            </div>
            <div className="stat-card">
              <h3>Resep Menunggu Dispense</h3>
              <p>{stats.resep_pending}</p>
            </div>
            <div className="stat-card">
              <h3>Order Lab Belum Keluar</h3>
              <p>{stats.lab_pending}</p>
            </div>
          </>
        ) : role === 'perawat' ? (
          <>
            <div className="stat-card">
              <h3>Pasien Butuh Asesmen TTV</h3>
              <p>{stats.antrean_perawat}</p>
            </div>
            <div className="stat-card">
              <h3>Antrean Unit IGD</h3>
              <p>{stats.igd}</p>
            </div>
            <div className="stat-card">
              <h3>Pasien Siap Diperiksa Dokter</h3>
              <p>{stats.antrean_dokter}</p>
            </div>
            <div className="stat-card">
              <h3>Total Kunjungan Poli</h3>
              <p>{stats.total_kunjungan}</p>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <h3>Total Kunjungan Hari Ini</h3>
              <p>{stats.total_kunjungan}</p>
            </div>
            <div className="stat-card">
              <h3>Bed Occupancy Rate (BOR)</h3>
              <p>{stats.bor}%</p>
            </div>
            <div className="stat-card">
              <h3>Antrean IGD</h3>
              <p>{stats.igd}</p>
            </div>
            <div className="stat-card">
              <h3>Tagihan Pending Kasir</h3>
              <p>{stats.tagihan_pending}</p>
            </div>
            <div className="stat-card">
              <h3>Resep Farmasi Pending</h3>
              <p>{stats.resep_pending}</p>
            </div>
            <div className="stat-card">
              <h3>Permintaan Lab Pending</h3>
              <p>{stats.lab_pending}</p>
            </div>
          </>
        )}
      </div>

      {/* WIDGET INTERAKTIF SESUAI ROLE */}
      {role === 'perawat' && (
        <div style={{ marginBottom: '25px' }}>
          <div className="header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Antrean Pasien Menunggu Asesmen TTV</h3>
              <p>Silakan ukur tanda vital sebelum pasien masuk ke ruang periksa dokter</p>
            </div>
            <span className="badge-status-pending">{pasienPerawat.length} Menunggu</span>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>No. RM</th>
                  <th>Nama Pasien</th>
                  <th>Poli Tujuan</th>
                  <th>Keluhan Utama</th>
                  <th>Penjamin</th>
                  <th>Status Alur</th>
                  <th>Aksi Asesmen</th>
                </tr>
              </thead>
              <tbody>
                {pasienPerawat.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-row">Semua pasien telah selesai dilakukan asesmen tanda vital.</td>
                  </tr>
                ) : (
                  pasienPerawat.map(k => (
                    <tr key={k.id}>
                      <td><strong>{k.pasien?.no_rm || '-'}</strong></td>
                      <td>
                        <strong>{k.pasien?.nama || 'Pasien'}</strong><br/>
                        <small>{k.pasien?.jenis_kelamin} / {k.pasien?.nik}</small>
                      </td>
                      <td><span className="badge-poli">{k.poli}</span></td>
                      <td>{k.keluhan}</td>
                      <td>{k.penjamin}</td>
                      <td><span className="badge-status-pending">Menunggu TTV</span></td>
                      <td>
                        <button className="btn-hasil" onClick={() => handleOpenTtv(k)}>
                          Input TTV Sekarang
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {role === 'dokter' && (
        <div style={{ marginBottom: '25px' }}>
          <div className="header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Pasien Siap Diperiksa di Ruang Dokter</h3>
              <p>Pasien telah selesai melalui asesmen tanda vital oleh perawat</p>
            </div>
            <Link to="/pemeriksaan-dokter" className="btn-action" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              Buka Semua di Ruang Periksa
            </Link>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>No. RM</th>
                  <th>Nama Pasien</th>
                  <th>Poli</th>
                  <th>Tanda Vital (TTV)</th>
                  <th>Keluhan</th>
                  <th>Aksi Klinis</th>
                </tr>
              </thead>
              <tbody>
                {pasienDokter.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-row">Tidak ada antrean pasien siap periksa saat ini.</td>
                  </tr>
                ) : (
                  pasienDokter.map(k => (
                    <tr key={k.id}>
                      <td><strong>{k.pasien?.no_rm}</strong></td>
                      <td><strong>{k.pasien?.nama}</strong></td>
                      <td><span className="badge-poli">{k.poli}</span></td>
                      <td>
                        <small>
                          TD: <strong>{k.tanda_vital?.tekanan_darah || '-'}</strong> | Suhu: <strong>{k.tanda_vital?.suhu || '-'}</strong><br/>
                          Nadi: {k.tanda_vital?.nadi || '-'} | Catatan: <em>"{k.tanda_vital?.catatan_perawat || '-'}"</em>
                        </small>
                      </td>
                      <td>{k.keluhan}</td>
                      <td>
                        <Link to="/pemeriksaan-dokter" className="btn-hasil">
                          Periksa Medis
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PINTASAN MODUL UTAMA (UNTUK ADMIN) */}
      {role === 'admin' && (
        <>
          <h3 className="section-title">Pintasan Modul Pelayanan SIMRS</h3>
          <div className="modules-grid">
            <Link to="/pendaftaran" className="module-card clickable">
              <div className="module-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  <path d="M9 14h6"/>
                  <path d="M9 18h6"/>
                  <path d="M9 10h2"/>
                </svg>
              </div>
              <div className="module-name">Pendaftaran Pasien</div>
            </Link>

            <Link to="/pasien" className="module-card clickable">
              <div className="module-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <div className="module-name">Data Rekam Medis</div>
            </Link>

            <Link to="/igd" className="module-card clickable">
              <div className="module-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div className="module-name">Gawat Darurat</div>
            </Link>

            <Link to="/pemeriksaan-dokter" className="module-card clickable">
              <div className="module-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 3v5a5.5 5.5 0 0 0 11 0V3"/>
                  <path d="M3 3h3"/>
                  <path d="M14 3h3"/>
                  <path d="M10 13.5v3.5a4 4 0 0 0 4 4h1a4 4 0 0 0 4-4v-2"/>
                  <circle cx="19" cy="13" r="2"/>
                </svg>
              </div>
              <div className="module-name">Ruang Dokter</div>
            </Link>

            <Link to="/farmasi" className="module-card clickable">
              <div className="module-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                  <path d="m8.5 8.5 7 7"/>
                </svg>
              </div>
              <div className="module-name">Farmasi & Apotek</div>
            </Link>

            <Link to="/laboratorium" className="module-card clickable">
              <div className="module-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2v7.5a2 2 0 0 1-.2.9L4.7 20.5a1 1 0 0 0 .9 1.5h12.8a1 1 0 0 0 .9-1.5L14.2 10.4a2 2 0 0 1-.2-.9V2"/>
                  <path d="M8.5 2h7"/>
                  <path d="M7 16h10"/>
                </svg>
              </div>
              <div className="module-name">Laboratorium</div>
            </Link>

            <Link to="/kasir" className="module-card clickable">
              <div className="module-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                  <line x1="6" y1="15" x2="10" y2="15"/>
                </svg>
              </div>
              <div className="module-name">Kasir & Billing</div>
            </Link>
          </div>
        </>
      )}

      <Modal
        show={modal.show}
        icon={modal.isError ? '!' : '✓'}
        isError={modal.isError}
        title={modal.title}
        text={modal.text}
        onClose={() => setModal({ show: false })}
      />
    </MainLayout>
  );
}
