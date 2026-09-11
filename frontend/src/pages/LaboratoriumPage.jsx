import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import api from '../api/axios';

export default function LaboratoriumPage() {
  const [labOrders, setLabOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ordered');
  const [expandedId, setExpandedId] = useState(null);
  const [hasilText, setHasilText] = useState({});

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lab/permintaan?status=${activeTab}`);
      setLabOrders(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching lab orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleHasilChange = (id, text) => {
    setHasilText(prev => ({ ...prev, [id]: text }));
  };

  const submitHasil = async (id) => {
    const text = hasilText[id];
    if (!text || !text.trim()) return;
    try {
      await api.put(`/lab/permintaan/${id}`, { hasil: text });
      setExpandedId(null);
      fetchData();
    } catch (error) {
      console.error('Error submitting lab hasil:', error);
    }
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setFilterJenis('ALL');
  };

  const filteredOrders = labOrders.filter(item => {
    const q = searchTerm.toLowerCase();
    const noLab = (item.id || '').toLowerCase();
    const nama = (item.patient_nama || '').toLowerCase();
    const idPasien = (item.patient_id || '').toLowerCase();
    const jenis = (item.jenis_pemeriksaan || '').toLowerCase();
    const catatan = (item.catatan_dokter || '').toLowerCase();
    const hasil = (item.hasil || '').toLowerCase();

    const matchSearch = !searchTerm || noLab.includes(q) || nama.includes(q) || idPasien.includes(q) || jenis.includes(q) || catatan.includes(q) || hasil.includes(q);

    let matchJenis = true;
    if (filterJenis !== 'ALL') {
      matchJenis = (item.jenis_pemeriksaan || '').toLowerCase().includes(filterJenis.toLowerCase());
    }

    return matchSearch && matchJenis;
  });

  return (
    <MainLayout
      title="Laboratorium Medis"
      subtitle="Pemeriksaan spesimen, hematologi, kimia darah, dan entri hasil analisis laboratorium"
    >
      <div className="page-tabs">
        <button 
          className={`tab-item ${activeTab === 'ordered' ? 'active' : ''}`}
          onClick={() => { setActiveTab('ordered'); setExpandedId(null); }}
        >
          Permintaan Pemeriksaan Masuk
        </button>
        <button 
          className={`tab-item ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => { setActiveTab('completed'); setExpandedId(null); }}
        >
          Hasil Pengujian Selesai
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="search-filter-box">
        <div className="filter-group" style={{ flex: 2 }}>
          <label>Pencarian Pemeriksaan Lab</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Cari no. lab, nama pasien, parameter uji, atau catatan..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Filter Kategori Uji</label>
          <select
            className="filter-input"
            value={filterJenis}
            onChange={e => setFilterJenis(e.target.value)}
          >
            <option value="ALL">Semua Parameter Uji</option>
            <option value="Darah">Hematologi / Darah</option>
            <option value="Gula">Gula Darah</option>
            <option value="Widal">Widal / Tifoid</option>
            <option value="Urine">Urinalisis</option>
            <option value="Ginjal">Fungsi Ginjal</option>
            <option value="Lipid">Profil Lipid / Kolesterol</option>
          </select>
        </div>

        {(searchTerm || filterJenis !== 'ALL') && (
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
          Menampilkan <strong>{filteredOrders.length}</strong> dari {labOrders.length} data pemeriksaan ({activeTab === 'ordered' ? 'menunggu' : 'selesai'})
        </span>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>No. Permintaan</th>
              <th>Nama Pasien</th>
              <th>Jenis Parameter Uji</th>
              <th>Catatan / Indikasi Dokter</th>
              <th>Tanggal Order</th>
              <th>Status Pengujian</th>
              <th>Aksi Laboratorium</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="empty-row">Memuat data laboratorium...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  {labOrders.length === 0
                    ? 'Tidak ada data laboratorium pada tab ini.'
                    : 'Tidak ada data pengujian yang cocok dengan kata kunci pencarian Anda.'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((item) => (
                <React.Fragment key={item.id}>
                  <tr>
                    <td><strong>{item.id}</strong></td>
                    <td>
                      <div><strong>{item.patient_nama || '-'}</strong></div>
                      <small>ID Pasien: {item.patient_id || '-'}</small>
                    </td>
                    <td><span className="badge-poli">{item.jenis_pemeriksaan || '-'}</span></td>
                    <td>{item.catatan_dokter || '-'}</td>
                    <td>{item.created_at || '-'}</td>
                    <td>
                      <span className={item.status === 'ordered' ? 'badge-status-pending' : 'badge-status-completed'}>
                        {item.status === 'ordered' ? 'Menunggu Hasil' : 'Hasil Terbit'}
                      </span>
                    </td>
                    <td>
                      {activeTab === 'ordered' ? (
                        <button 
                          className="btn-hasil"
                          onClick={() => toggleExpand(item.id)}
                        >
                          {expandedId === item.id ? 'Tutup Form' : 'Input Hasil'}
                        </button>
                      ) : (
                        <button 
                          className="btn-action"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => toggleExpand(item.id)}
                        >
                          {expandedId === item.id ? 'Tutup' : 'Lihat Hasil'}
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* FORM INPUT HASIL */}
                  {expandedId === item.id && activeTab === 'ordered' && (
                    <tr>
                      <td colSpan="7">
                        <div className="inline-form">
                          <h4 style={{ marginBottom: '8px', color: '#1e3c72' }}>Entri Hasil Uji Laboratorium: {item.jenis_pemeriksaan}</h4>
                          <textarea 
                            className="form-control" 
                            rows="3" 
                            placeholder="Tuliskan nilai hasil pemeriksaan, satuan, serta nilai rujukan normal..."
                            value={hasilText[item.id] || ''}
                            onChange={(e) => handleHasilChange(item.id, e.target.value)}
                          />
                          <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn-hasil"
                              onClick={() => submitHasil(item.id)}
                              disabled={!hasilText[item.id] || !hasilText[item.id].trim()}
                            >
                              Simpan & Terbitkan Hasil
                            </button>
                            <button 
                              className="btn-back" 
                              onClick={() => toggleExpand(item.id)}
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* LIHAT HASIL SELESAI */}
                  {expandedId === item.id && activeTab === 'completed' && (
                    <tr>
                      <td colSpan="7">
                        <div className="inline-form" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                          <h4 style={{ color: '#166534', marginBottom: '4px' }}>Hasil Pemeriksaan Resmi:</h4>
                          <p style={{ whiteSpace: 'pre-wrap', color: '#1f2937' }}>{item.hasil || 'Belum ada catatan hasil.'}</p>
                          <small style={{ color: '#666', display: 'block', marginTop: '6px' }}>
                            Diverifikasi pada: {item.completed_at || '-'}
                          </small>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
