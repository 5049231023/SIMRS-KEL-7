import { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import Modal from '../components/Modal';
import api from '../api/axios';

export default function RuangPeriksaDokterPage() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('antrean'); // 'antrean' | 'selesai'
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [modal, setModal] = useState({ show: false, isError: false, title: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [diagnosaUtama, setDiagnosaUtama] = useState('');
  const [diagnosaSekunder, setDiagnosaSekunder] = useState('');
  const [tindakan, setTindakan] = useState('');
  const [catatanDokter, setCatatanDokter] = useState('');
  const [labPemeriksaan, setLabPemeriksaan] = useState('');
  const [resepList, setResepList] = useState([
    { nama_obat: 'Paracetamol 500mg', jumlah: 10, aturan: '3x1 tablet sesudah makan' }
  ]);

  const loadData = () => {
    api.get('/kunjungan')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenForm = (enc) => {
    setSelectedEncounter(enc);
    setDiagnosaUtama('');
    setDiagnosaSekunder('');
    setTindakan('');
    setCatatanDokter('');
    setLabPemeriksaan('');
    setResepList([
      { nama_obat: 'Paracetamol 500mg', jumlah: 10, aturan: '3x1 tablet sesudah makan' }
    ]);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleAddResepRow = () => {
    setResepList(prev => [...prev, { nama_obat: '', jumlah: 1, aturan: '' }]);
  };

  const handleRemoveResepRow = (idx) => {
    setResepList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleResepChange = (idx, field, value) => {
    setResepList(prev => {
      const copy = [...prev];
      copy[idx][field] = value;
      return copy;
    });
  };

  const handleSubmitPemeriksaan = async (e) => {
    e.preventDefault();
    if (!selectedEncounter) return;

    try {
      const validResep = resepList.filter(r => r.nama_obat.trim() !== '');

      const payload = {
        diagnosa_utama: diagnosaUtama,
        diagnosa_sekunder: diagnosaSekunder,
        tindakan: tindakan,
        catatan_dokter: catatanDokter,
        resep_items: validResep,
        lab_pemeriksaan: labPemeriksaan,
        biaya_tindakan: tindakan ? 75000 : 0
      };

      await api.put(`/kunjungan/${selectedEncounter.id}/pemeriksaan`, payload);

      setModal({
        show: true,
        isError: false,
        title: 'Pemeriksaan Selesai',
        text: `Pemeriksaan pasien ${selectedEncounter.pasien?.nama} berhasil disimpan. E-Resep otomatis diteruskan ke Farmasi dan tagihan dibuat ke Kasir.`
      });

      setSelectedEncounter(null);
      loadData();
    } catch (err) {
      setModal({
        show: true,
        isError: true,
        title: 'Gagal Menyimpan',
        text: 'Terjadi kendala saat menyimpan pemeriksaan. Silakan cek data Anda.'
      });
    }
  };

  const filterBySearch = (list) => {
    if (!searchTerm) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(k => {
      const nama = (k.pasien?.nama || '').toLowerCase();
      const norm = (k.pasien?.no_rm || '').toLowerCase();
      const nik = (k.pasien?.nik || '').toLowerCase();
      const keluhan = (k.keluhan || '').toLowerCase();
      const poli = (k.poli || '').toLowerCase();
      const diagnosa = (k.pemeriksaan_dokter?.diagnosa_utama || '').toLowerCase();
      const dokter = (k.pemeriksaan_dokter?.dokter_nama || '').toLowerCase();

      return nama.includes(q) || norm.includes(q) || nik.includes(q) || keluhan.includes(q) || poli.includes(q) || diagnosa.includes(q) || dokter.includes(q);
    });
  };

  const rawAntrean = data.filter(k => k.status_alur === 'siap_dokter' || (k.status !== 'finished' && k.status_alur !== 'selesai'));
  const rawSelesai = data.filter(k => k.status_alur === 'selesai' || k.status === 'finished');

  const antreanPasien = filterBySearch(rawAntrean);
  const riwayatSelesai = filterBySearch(rawSelesai);

  return (
    <MainLayout
      title="Ruang Periksa Dokter"
      subtitle="Pemeriksaan klinis, penegakan diagnosa, e-resep farmasi, dan order laboratorium"
    >
      <div className="page-tabs">
        <button
          className={`tab-item ${activeTab === 'antrean' ? 'active' : ''}`}
          onClick={() => { setActiveTab('antrean'); setSelectedEncounter(null); }}
        >
          Antrean Pasien Siap Periksa ({rawAntrean.length})
        </button>
        <button
          className={`tab-item ${activeTab === 'selesai' ? 'active' : ''}`}
          onClick={() => { setActiveTab('selesai'); setSelectedEncounter(null); }}
        >
          Riwayat Pemeriksaan Selesai ({rawSelesai.length})
        </button>
      </div>

      {!selectedEncounter && (
        <div className="search-filter-box">
          <div className="filter-group" style={{ flex: 1 }}>
            <label>Pencarian Pasien Ruang Periksa</label>
            <input
              type="text"
              className="filter-input"
              placeholder="Cari nama pasien, no. RM, NIK, keluhan, atau diagnosa..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                className="btn-back"
                style={{ paddingBottom: '9px' }}
                onClick={() => setSearchTerm('')}
              >
                Hapus Pencarian
              </button>
            </div>
          )}
        </div>
      )}

      {/* JIKA ADA PASIEN YANG SEDANG DIPERIKSA */}
      {selectedEncounter && (
        <div className="dokter-exam-box">
          <div className="exam-box-header">
            <div>
              <h3>Formulir Pemeriksaan Medis Pasien</h3>
              <p>Pasien: <strong>{selectedEncounter.pasien?.nama}</strong> (No. RM: {selectedEncounter.pasien?.no_rm}) &bull; Poli: {selectedEncounter.poli}</p>
            </div>
            <button className="btn-back" onClick={() => setSelectedEncounter(null)}>Tutup Form</button>
          </div>

          {/* Tanda Vital dari Perawat */}
          <div className="vitals-summary-card">
            <h4>Hasil Asesmen Tanda Vital oleh Perawat ({selectedEncounter.tanda_vital?.perawat_nama || 'Perawat'}):</h4>
            <div className="vitals-grid">
              <div className="vital-item">
                <span className="vital-label">Tekanan Darah:</span>
                <strong className="vital-val">{selectedEncounter.tanda_vital?.tekanan_darah || '-'}</strong>
              </div>
              <div className="vital-item">
                <span className="vital-label">Suhu Tubuh:</span>
                <strong className="vital-val">{selectedEncounter.tanda_vital?.suhu || '-'}</strong>
              </div>
              <div className="vital-item">
                <span className="vital-label">Nadi:</span>
                <strong className="vital-val">{selectedEncounter.tanda_vital?.nadi || '-'}</strong>
              </div>
              <div className="vital-item">
                <span className="vital-label">Pernapasan:</span>
                <strong className="vital-val">{selectedEncounter.tanda_vital?.pernapasan || '-'}</strong>
              </div>
              <div className="vital-item">
                <span className="vital-label">Berat / Tinggi:</span>
                <strong className="vital-val">{selectedEncounter.tanda_vital?.berat_badan || '-'} / {selectedEncounter.tanda_vital?.tinggi_badan || '-'}</strong>
              </div>
            </div>
            {selectedEncounter.tanda_vital?.catatan_perawat && (
              <p className="vitals-note">Catatan Perawat: <em>"{selectedEncounter.tanda_vital.catatan_perawat}"</em></p>
            )}
          </div>

          <form onSubmit={handleSubmitPemeriksaan}>
            <div className="form-row">
              <div className="form-group">
                <label>Diagnosa Utama (ICD-10 / Klinis) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Febris Akut e.c Susp. ISPA"
                  value={diagnosaUtama}
                  onChange={e => setDiagnosaUtama(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Diagnosa Sekunder / Komplikasi</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Hipertensi Grade 1, Dehidrasi Ringan"
                  value={diagnosaSekunder}
                  onChange={e => setDiagnosaSekunder(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tindakan Medis / Rencana Terapi</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Terapi simptomatis dan kompres hangat"
                  value={tindakan}
                  onChange={e => setTindakan(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Permintaan Pemeriksaan Lab (Otomatis Masuk Modul Lab)</label>
                <select
                  className="form-control"
                  value={labPemeriksaan}
                  onChange={e => setLabPemeriksaan(e.target.value)}
                >
                  <option value="">-- Tidak Perlu Pemeriksaan Lab --</option>
                  <option value="Darah Lengkap & Trombosit">Darah Lengkap & Trombosit</option>
                  <option value="Gula Darah Puasa (GDP)">Gula Darah Puasa (GDP)</option>
                  <option value="Widal Test (Tifoid)">Widal Test (Tifoid)</option>
                  <option value="Urine Lengkap">Urine Lengkap</option>
                  <option value="Fungsi Ginjal (Ureum & Kreatinin)">Fungsi Ginjal (Ureum & Kreatinin)</option>
                  <option value="Profil Lipid / Kolesterol Total">Profil Lipid / Kolesterol Total</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Catatan Klinis Dokter / Edukasi Pasien</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Catatan perkembangan, anjuran istirahat, diet khusus, dll."
                value={catatanDokter}
                onChange={e => setCatatanDokter(e.target.value)}
              ></textarea>
            </div>

            {/* E-Resep Farmasi */}
            <div className="resep-builder-section">
              <div className="resep-builder-header">
                <h4>E-Resep Obat (Otomatis Diteruskan ke Instalasi Farmasi)</h4>
                <button type="button" className="btn-triage" onClick={handleAddResepRow}>+ Tambah Obat</button>
              </div>

              {resepList.map((item, idx) => (
                <div key={idx} className="resep-builder-row">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nama Obat & Dosis (misal: Paracetamol 500mg)"
                    value={item.nama_obat}
                    onChange={e => handleResepChange(idx, 'nama_obat', e.target.value)}
                    style={{ flex: 2 }}
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Jumlah"
                    value={item.jumlah}
                    min="1"
                    onChange={e => handleResepChange(idx, 'jumlah', parseInt(e.target.value) || 1)}
                    style={{ width: '90px' }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Aturan Pakai (misal: 3x1 tablet sesudah makan)"
                    value={item.aturan}
                    onChange={e => handleResepChange(idx, 'aturan', e.target.value)}
                    style={{ flex: 2 }}
                  />
                  {resepList.length > 1 && (
                    <button type="button" className="btn-remove-row" onClick={() => handleRemoveResepRow(idx)}>Hapus</button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-submit" style={{ flex: 1 }}>
                Selesaikan Pemeriksaan & Kirim Order
              </button>
              <button type="button" className="btn-back" onClick={() => setSelectedEncounter(null)}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB ANTREAN SIAP DIPERIKSA */}
      {activeTab === 'antrean' && !selectedEncounter && (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>No. RM</th>
                <th>Nama Pasien</th>
                <th>Poli / Layanan</th>
                <th>Keluhan Pasien</th>
                <th>Tanda Vital (TTV)</th>
                <th>Penjamin</th>
                <th>Aksi Dokter</th>
              </tr>
            </thead>
            <tbody>
              {antreanPasien.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">Tidak ada antrean pasien siap periksa saat ini.</td>
                </tr>
              ) : (
                antreanPasien.map(k => (
                  <tr key={k.id}>
                    <td><strong>{k.pasien?.no_rm || '-'}</strong></td>
                    <td>
                      <strong>{k.pasien?.nama || 'Pasien'}</strong><br/>
                      <small style={{ color: '#666' }}>{k.pasien?.jenis_kelamin} / {k.pasien?.nik}</small>
                    </td>
                    <td>
                      <span className="badge-poli">{k.poli}</span><br/>
                      <small>{k.pelayanan}</small>
                    </td>
                    <td>{k.keluhan}</td>
                    <td>
                      {k.tanda_vital ? (
                        <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                          <span>TD: <strong>{k.tanda_vital.tekanan_darah}</strong></span> &bull; <span>Suhu: <strong>{k.tanda_vital.suhu}</strong></span><br/>
                          <span>Nadi: {k.tanda_vital.nadi}</span> &bull; <span>RR: {k.tanda_vital.pernapasan}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#d97706', fontSize: '0.8rem' }}>Belum Asesmen TTV</span>
                      )}
                    </td>
                    <td>{k.penjamin}</td>
                    <td>
                      <button className="btn-hasil" onClick={() => handleOpenForm(k)}>
                        Periksa Pasien
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB RIWAYAT SELESAI */}
      {activeTab === 'selesai' && (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>No. RM</th>
                <th>Nama Pasien</th>
                <th>Poli</th>
                <th>Diagnosa Utama</th>
                <th>Tindakan / Terapi</th>
                <th>Dokter Pemeriksa</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {riwayatSelesai.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">Belum ada riwayat pemeriksaan selesai.</td>
                </tr>
              ) : (
                riwayatSelesai.map(k => (
                  <tr key={k.id}>
                    <td><strong>{k.pasien?.no_rm || '-'}</strong></td>
                    <td>{k.pasien?.nama || 'Pasien'}</td>
                    <td><span className="badge-poli">{k.poli}</span></td>
                    <td><strong>{k.pemeriksaan_dokter?.diagnosa_utama || 'Pemeriksaan Rutin'}</strong></td>
                    <td>{k.pemeriksaan_dokter?.tindakan || '-'}</td>
                    <td>{k.pemeriksaan_dokter?.dokter_nama || 'Dokter'}</td>
                    <td><span className="badge-status-completed">Selesai</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
