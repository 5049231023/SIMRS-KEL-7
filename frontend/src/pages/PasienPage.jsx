import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import api from '../api/axios';

export default function PasienPage() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPoli, setFilterPoli] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

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
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-row">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
