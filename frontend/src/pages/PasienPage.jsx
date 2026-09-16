import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import api from '../api/axios';

export default function PasienPage() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPoli, setFilterPoli] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    api.get('/kunjungan')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const calculateAge = (dob) => {
    if (!dob) return '';
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setFilterPoli('ALL');
    setFilterStatus('ALL');
  };

  // Distinct list of Polis for dropdown
  const poliList = Array.from(new Set(data.map(k => k.poli).filter(Boolean)));

  const filteredData = data.filter(k => {
    const q = searchTerm.toLowerCase();
    const nik = (k.pasien?.nik || '').toLowerCase();
    const nama = (k.pasien?.nama || '').toLowerCase();
    const norm = (k.pasien?.no_rm || '').toLowerCase();
    const keluhan = (k.keluhan || '').toLowerCase();
    const diagnosa = (k.pemeriksaan_dokter?.diagnosa_utama || '').toLowerCase();
    const tindakan = (k.pemeriksaan_dokter?.tindakan || '').toLowerCase();

    const matchSearch = !searchTerm || nik.includes(q) || nama.includes(q) || norm.includes(q) || keluhan.includes(q) || diagnosa.includes(q) || tindakan.includes(q);

    let matchPoli = true;
    if (filterPoli !== 'ALL') {
      matchPoli = k.poli === filterPoli;
    }

    let matchStatus = true;
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'selesai') {
        matchStatus = k.status_alur === 'selesai' || k.status === 'finished';
      } else if (filterStatus === 'siap_dokter') {
        matchStatus = k.status_alur === 'siap_dokter';
      } else if (filterStatus === 'menunggu_perawat') {
        matchStatus = k.status_alur === 'menunggu_perawat' || (!k.tanda_vital && k.status !== 'finished');
      }
    }

    return matchSearch && matchPoli && matchStatus;
  });

  return (
    <MainLayout
      title="Data Pasien & Rekam Medis"
      subtitle="Monitor riwayat kunjungan klinis, asesmen tanda vital, dan rekam medis terpadu"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3>Daftar Kunjungan Pasien</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Total {data.length} kunjungan terdaftar dalam sistem</p>
        </div>
        <Link to="/pendaftaran" className="btn-action" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
          + Pendaftaran Baru
        </Link>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="search-filter-box">
        <div className="filter-group" style={{ flex: 2 }}>
          <label>Pencarian Pasien</label>
          <input 
            type="text" 
            className="filter-input" 
            placeholder="Cari NIK, nama pasien, no. RM, keluhan, atau diagnosa..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="filter-group">
          <label>Filter Poli / Layanan</label>
          <select
            className="filter-input"
            value={filterPoli}
            onChange={e => setFilterPoli(e.target.value)}
          >
            <option value="ALL">Semua Poli</option>
            {poliList.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Filter Status Alur</label>
          <select
            className="filter-input"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Semua Status</option>
            <option value="menunggu_perawat">Menunggu Perawat (TTV)</option>
            <option value="siap_dokter">Siap Diperiksa Dokter</option>
            <option value="selesai">Pemeriksaan Selesai</option>
          </select>
        </div>

        {(searchTerm || filterPoli !== 'ALL' || filterStatus !== 'ALL') && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              className="btn-back"
              style={{ paddingBottom: '9px' }}
              onClick={handleResetFilter}
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          Menampilkan <strong>{filteredData.length}</strong> dari {data.length} total data kunjungan
        </span>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>No. RM</th>
              <th>Nama Pasien</th>
              <th>JK / Usia</th>
              <th>Alamat & Telp</th>
              <th>Tgl Kunjungan</th>
              <th>Poli / Layanan</th>
              <th>Tanda Vital (TTV)</th>
              <th>Status Alur</th>
              <th>Diagnosa / Keluhan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-row">
                  {data.length === 0
                    ? 'Belum ada data kunjungan terdaftar.'
                    : 'Tidak ada data kunjungan yang cocok dengan kriteria filter Anda.'}
                </td>
              </tr>
            ) : (
              filteredData.map(k => (
                <tr key={k.id}>
                  <td><strong>{k.pasien?.no_rm || '-'}</strong></td>
                  <td>
                    <div><strong>{k.pasien?.nama || '-'}</strong></div>
                    <small>NIK: {k.pasien?.nik || '-'}</small>
                  </td>
                  <td>{k.pasien?.jenis_kelamin || '-'} / {calculateAge(k.pasien?.tgl_lahir)} thn</td>
                  <td>
                    {k.pasien?.alamat || '-'}<br/>
                    <small>Tel: {k.pasien?.no_telp || '-'}</small>
                  </td>
                  <td>{k.tgl_kunjungan}</td>
                  <td>
                    <span className="badge-poli">{k.poli}</span><br/>
                    <small>{k.pelayanan}</small>
                  </td>
                  <td>
                    {k.tanda_vital ? (
                      <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                        <span>TD: <strong>{k.tanda_vital.tekanan_darah}</strong></span><br/>
                        <span>Suhu: {k.tanda_vital.suhu} | Nadi: {k.tanda_vital.nadi}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#d97706', fontSize: '0.8rem' }}>Belum Asesmen</span>
                    )}
                  </td>
                  <td>
                    {k.status_alur === 'selesai' || k.status === 'finished' ? (
                      <span className="badge-status-completed">Selesai</span>
                    ) : k.status_alur === 'siap_dokter' ? (
                      <span className="badge-status-dispensed">Siap Dokter</span>
                    ) : (
                      <span className="badge-status-pending">Menunggu Perawat</span>
                    )}
                  </td>
                  <td>
                    {k.pemeriksaan_dokter?.diagnosa_utama ? (
                      <div>
                        <strong>{k.pemeriksaan_dokter.diagnosa_utama}</strong>
                        {k.pemeriksaan_dokter.tindakan && <div style={{ fontSize: '0.75rem', color: '#555' }}>Tindakan: {k.pemeriksaan_dokter.tindakan}</div>}
                      </div>
                    ) : (
                      <span>{k.keluhan.length > 30 ? k.keluhan.substring(0, 30) + '...' : k.keluhan}</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-hasil"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      onClick={() => setSelectedDetail(k)}
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETAIL REKAM MEDIS LENGKAP */}
      {selectedDetail && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ color: '#0f172a', margin: 0, fontSize: '1.2rem' }}>Detail Rekam Medis Kunjungan Pasien</h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 0' }}>
                  No. Registrasi: <strong>{selectedDetail.id}</strong> &bull; Tgl Kunjungan: {selectedDetail.tgl_kunjungan}
                </p>
              </div>
              <button 
                className="btn-back" 
                style={{ padding: '6px 12px' }}
                onClick={() => setSelectedDetail(null)}
              >
                Tutup
              </button>
            </div>

            {/* KARTU BIODATA PASIEN */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h4 style={{ color: '#1e40af', fontSize: '0.9rem', marginBottom: '10px' }}>1. Identitas Pasien</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.84rem' }}>
                <div><span style={{ color: '#64748b' }}>Nama Pasien:</span> <strong>{selectedDetail.pasien?.nama || '-'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Nomor Rekam Medis:</span> <strong>{selectedDetail.pasien?.no_rm || '-'}</strong></div>
                <div><span style={{ color: '#64748b' }}>NIK:</span> <strong>{selectedDetail.pasien?.nik || '-'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Jenis Kelamin:</span> <strong>{selectedDetail.pasien?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Tanggal Lahir / Usia:</span> <strong>{selectedDetail.pasien?.tgl_lahir || '-'} ({calculateAge(selectedDetail.pasien?.tgl_lahir)} Tahun)</strong></div>
                <div><span style={{ color: '#64748b' }}>Nomor Telepon:</span> <strong>{selectedDetail.pasien?.no_telp || '-'}</strong></div>
                <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#64748b' }}>Alamat Domisili:</span> <strong>{selectedDetail.pasien?.alamat || '-'}</strong></div>
              </div>
            </div>

            {/* KARTU LAYANAN & KELUHAN */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h4 style={{ color: '#1e40af', fontSize: '0.9rem', marginBottom: '10px' }}>2. Data Pelayanan & Keluhan Awal</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.84rem' }}>
                <div><span style={{ color: '#64748b' }}>Poliklinik Tujuan:</span> <strong className="badge-poli">{selectedDetail.poli}</strong></div>
                <div><span style={{ color: '#64748b' }}>Jenis Pelayanan:</span> <strong>{selectedDetail.pelayanan}</strong></div>
                <div><span style={{ color: '#64748b' }}>Penjamin Biaya:</span> <strong>{selectedDetail.penjamin || 'Umum'}</strong></div>
                <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                  <span style={{ color: '#64748b' }}>Keluhan Utama:</span>
                  <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', fontStyle: 'italic' }}>
                    "{selectedDetail.keluhan || '-'}"
                  </div>
                </div>
              </div>
            </div>

            {/* KARTU ASESMEN TANDA VITAL (PERAWAT) */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ color: '#1e40af', fontSize: '0.9rem', margin: 0 }}>3. Asesmen Tanda-Tanda Vital & Triase (Keperawatan)</h4>
                <small style={{ color: '#64748b' }}>Petugas: {selectedDetail.tanda_vital?.perawat_nama || 'Perawat'}</small>
              </div>
              {selectedDetail.tanda_vital ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '0.84rem', marginBottom: '10px' }}>
                    <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Tekanan Darah</span>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{selectedDetail.tanda_vital.tekanan_darah}</strong>
                    </div>
                    <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Suhu Tubuh</span>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{selectedDetail.tanda_vital.suhu}</strong>
                    </div>
                    <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Denyut Nadi</span>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{selectedDetail.tanda_vital.nadi}</strong>
                    </div>
                    <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Pernapasan (RR)</span>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{selectedDetail.tanda_vital.pernapasan}</strong>
                    </div>
                    <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Berat & Tinggi</span>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{selectedDetail.tanda_vital.berat_badan} / {selectedDetail.tanda_vital.tinggi_badan}</strong>
                    </div>
                    {selectedDetail.triage_level && (
                      <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Kategori Triase</span>
                        <strong className="badge-triage-p2">{selectedDetail.triage_level}</strong>
                      </div>
                    )}
                  </div>
                  {selectedDetail.tanda_vital.catatan_perawat && (
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                      Catatan Keperawatan: <em>"{selectedDetail.tanda_vital.catatan_perawat}"</em>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#d97706', fontSize: '0.85rem' }}>Belum ada asesmen tanda vital dari perawat.</div>
              )}
            </div>

            {/* KARTU PEMERIKSAAN DOKTER */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ color: '#1e40af', fontSize: '0.9rem', margin: 0 }}>4. Hasil Pemeriksaan Medis (Dokter)</h4>
                <small style={{ color: '#64748b' }}>Dokter Pemeriksa: {selectedDetail.pemeriksaan_dokter?.dokter_nama || 'Dokter'}</small>
              </div>
              {selectedDetail.pemeriksaan_dokter ? (
                <div style={{ fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Diagnosa Utama (ICD-10):</span>{' '}
                    <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{selectedDetail.pemeriksaan_dokter.diagnosa_utama}</strong>
                  </div>
                  {selectedDetail.pemeriksaan_dokter.diagnosa_sekunder && (
                    <div>
                      <span style={{ color: '#64748b' }}>Diagnosa Sekunder:</span>{' '}
                      <strong>{selectedDetail.pemeriksaan_dokter.diagnosa_sekunder}</strong>
                    </div>
                  )}
                  {selectedDetail.pemeriksaan_dokter.tindakan && (
                    <div>
                      <span style={{ color: '#64748b' }}>Tindakan Medis:</span>{' '}
                      <strong>{selectedDetail.pemeriksaan_dokter.tindakan}</strong>
                    </div>
                  )}
                  {selectedDetail.pemeriksaan_dokter.catatan_dokter && (
                    <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Catatan / Anjuran Dokter:</span>
                      <em>"{selectedDetail.pemeriksaan_dokter.catatan_dokter}"</em>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Pemeriksaan dokter belum dilakukan.</div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn-action"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                onClick={() => window.print()}
              >
                Cetak Resume Medis Pasien
              </button>
              <button 
                type="button" 
                className="btn-back"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                onClick={() => setSelectedDetail(null)}
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
