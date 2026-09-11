import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import api from '../api/axios';

export default function IGDPage() {
  const [antrian, setAntrian] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triageSelect, setTriageSelect] = useState({});

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTriage, setFilterTriage] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/igd/antrian');
      setAntrian(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching IGD antrian:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriageChange = (id, value) => {
    setTriageSelect(prev => ({ ...prev, [id]: value }));
  };

  const submitTriage = async (id) => {
    const level = triageSelect[id];
    if (!level) return;
    try {
      await api.put(`/igd/triage/${id}`, { triage_level: level });
      fetchData();
    } catch (error) {
      console.error('Error setting triage:', error);
    }
  };

  const handleSelesai = async (id) => {
    try {
      await api.put(`/igd/selesai/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error finishing IGD:', error);
    }
  };

  const getTriageBadgeClass = (level) => {
    if (!level) return '';
    return `badge-triage-${level.toLowerCase()}`;
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setFilterTriage('ALL');
    setFilterStatus('ALL');
  };

  // Filtered list
  const filteredAntrian = antrian.filter(item => {
    const q = searchTerm.toLowerCase();
    const nama = (item.pasien?.nama || '').toLowerCase();
    const norm = (item.pasien?.no_rm || '').toLowerCase();
    const nik = (item.pasien?.nik || '').toLowerCase();
    const keluhan = (item.keluhan || '').toLowerCase();

    const matchSearch = !searchTerm || nama.includes(q) || norm.includes(q) || nik.includes(q) || keluhan.includes(q);

    let matchTriage = true;
    if (filterTriage === 'BELUM') {
      matchTriage = !item.triage_level;
    } else if (filterTriage !== 'ALL') {
      matchTriage = item.triage_level === filterTriage;
    }

    let matchStatus = true;
    if (filterStatus !== 'ALL') {
      matchStatus = item.status === filterStatus;
    }

    return matchSearch && matchTriage && matchStatus;
  });

  return (
    <MainLayout
      title="Unit Gawat Darurat (IGD)"
      subtitle="Monitor antrean, pencarian data pasien, dan penentuan triase kegawatdaruratan medis"
    >
      {/* FILTER & SEARCH BAR */}
      <div className="search-filter-box">
        <div className="filter-group" style={{ flex: 2 }}>
          <label>Pencarian Pasien IGD</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Cari nama pasien, no. RM, NIK, atau keluhan..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Filter Triase</label>
          <select
            className="filter-input"
            value={filterTriage}
            onChange={e => setFilterTriage(e.target.value)}
          >
            <option value="ALL">Semua Level Triase</option>
            <option value="P1">P1 - Merah (Resusitasi)</option>
            <option value="P2">P2 - Oranye (Emergensi)</option>
            <option value="P3">P3 - Kuning (Urgent)</option>
            <option value="P4">P4 - Hijau (Non-Urgent)</option>
            <option value="P5">P5 - Biru (Bukan Gawat)</option>
            <option value="BELUM">Belum Triase</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter Status</label>
          <select
            className="filter-input"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Semua Status</option>
            <option value="in-progress">Dalam Penanganan</option>
            <option value="finished">Selesai</option>
          </select>
        </div>

        {(searchTerm || filterTriage !== 'ALL' || filterStatus !== 'ALL') && (
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
          Menampilkan <strong>{filteredAntrian.length}</strong> dari {antrian.length} total antrean IGD
        </span>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Pasien</th>
              <th>Keluhan Utama</th>
              <th>Level Triase</th>
              <th>Tanggal Kunjungan</th>
              <th>Status Alur</th>
              <th>Aksi Medis</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="empty-row">Memuat data antrean IGD...</td>
              </tr>
            ) : filteredAntrian.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  {antrian.length === 0
                    ? 'Tidak ada antrean aktif di Unit IGD saat ini.'
                    : 'Tidak ada data antrean yang cocok dengan kriteria pencarian / filter Anda.'}
                </td>
              </tr>
            ) : (
              filteredAntrian.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div><strong>{item.pasien?.nama || '-'}</strong></div>
                    <small>No. RM: {item.pasien?.no_rm || '-'} | NIK: {item.pasien?.nik || '-'}</small>
                  </td>
                  <td>{item.keluhan || '-'}</td>
                  <td>
                    {item.triage_level ? (
                      <span className={getTriageBadgeClass(item.triage_level)}>
                        {item.triage_level}
                      </span>
                    ) : (
                      <span className="badge-status-pending">Belum Triase</span>
                    )}
                  </td>
                  <td>{item.tgl_kunjungan || '-'}</td>
                  <td>
                    <span className={item.status === 'in-progress' ? 'badge-status-pending' : 'badge-status-completed'}>
                      {item.status === 'in-progress' ? 'Dalam Penanganan' : 'Selesai'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select 
                        className="form-control" 
                        style={{ width: 'auto', padding: '6px 8px', fontSize: '0.8rem' }}
                        value={triageSelect[item.id] || ''}
                        onChange={(e) => handleTriageChange(item.id, e.target.value)}
                      >
                        <option value="">Pilih Triase...</option>
                        <option value="P1">P1 - Merah (Resusitasi)</option>
                        <option value="P2">P2 - Oranye (Emergensi)</option>
                        <option value="P3">P3 - Kuning (Urgent)</option>
                        <option value="P4">P4 - Hijau (Tidak Mendesak)</option>
                        <option value="P5">P5 - Biru (Bukan Gawat)</option>
                      </select>
                      <button 
                        className="btn-triage"
                        onClick={() => submitTriage(item.id)}
                        disabled={!triageSelect[item.id]}
                      >
                        Set Triase
                      </button>
                      
                      {item.status === 'in-progress' && (
                        <button 
                          className="btn-dispense"
                          onClick={() => handleSelesai(item.id)}
                        >
                          Selesai
                        </button>
                      )}
                    </div>
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
