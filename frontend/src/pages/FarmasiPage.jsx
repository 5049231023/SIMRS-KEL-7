import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import api from '../api/axios';

export default function FarmasiPage() {
  const [resep, setResep] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/farmasi/resep?status=${activeTab}`);
      setResep(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching resep:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleDispense = async (id) => {
    try {
      await api.put(`/farmasi/resep/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error dispensing resep:', error);
    }
  };

  const filteredResep = resep.filter(item => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    const noResep = (item.id || '').toLowerCase();
    const namaPasien = (item.patient_nama || '').toLowerCase();
    const idPasien = (item.patient_id || '').toLowerCase();
    const dokter = (item.dokter || '').toLowerCase();
    const obatMatch = (item.items || []).some(m => 
      (m.nama_obat || '').toLowerCase().includes(q) || 
      (m.aturan || '').toLowerCase().includes(q)
    );

    return noResep.includes(q) || namaPasien.includes(q) || idPasien.includes(q) || dokter.includes(q) || obatMatch;
  });

  return (
    <MainLayout
      title="Instalasi Farmasi & Apotek"
      subtitle="Manajemen resep digital dari dokter, telaah farmasi klinis, dan dispensing obat"
    >
      <div className="page-tabs">
        <button 
          className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Resep Masuk (Menunggu Penyiapan)
        </button>
        <button 
          className={`tab-item ${activeTab === 'dispensed' ? 'active' : ''}`}
          onClick={() => setActiveTab('dispensed')}
        >
          Riwayat Resep Diserahkan (Selesai)
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="search-filter-box">
        <div className="filter-group" style={{ flex: 1 }}>
          <label>Pencarian Resep Obat</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Cari no. resep, nama pasien, dokter, atau nama obat (contoh: Paracetamol)..."
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          Menampilkan <strong>{filteredResep.length}</strong> dari {resep.length} resep ({activeTab === 'pending' ? 'antrean masuk' : 'riwayat selesai'})
        </span>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>No. Resep</th>
              <th>Nama Pasien</th>
              <th>Dokter Penulis</th>
              <th>Rincian Obat & Aturan Pakai</th>
              <th>Tanggal Order</th>
              <th>Status</th>
              {activeTab === 'pending' && <th>Aksi Petugas</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={activeTab === 'pending' ? '7' : '6'} className="empty-row">
                  Memuat data resep...
                </td>
              </tr>
            ) : filteredResep.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'pending' ? '7' : '6'} className="empty-row">
                  {resep.length === 0
                    ? `Tidak ada resep dengan status ${activeTab === 'pending' ? 'menunggu' : 'selesai'}.`
                    : 'Tidak ada resep yang cocok dengan kata kunci pencarian Anda.'}
                </td>
              </tr>
            ) : (
              filteredResep.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.id}</strong></td>
                  <td>
                    <div><strong>{item.patient_nama || '-'}</strong></div>
                    <small>ID: {item.patient_id || '-'}</small>
                  </td>
                  <td>{item.dokter || '-'}</td>
                  <td>
                    <div className="detail-items">
                      {item.items && item.items.map((med, idx) => (
                        <div key={idx} className="detail-item">
                          <span><strong>{med.nama_obat}</strong> ({med.jumlah}x)</span>
                          <span style={{ color: '#555', fontStyle: 'italic' }}>{med.aturan}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>{item.created_at || '-'}</td>
                  <td>
                    <span className={item.status === 'pending' ? 'badge-status-pending' : 'badge-status-dispensed'}>
                      {item.status === 'pending' ? 'Menunggu Penyiapan' : 'Obat Diserahkan'}
                    </span>
                  </td>
                  {activeTab === 'pending' && (
                    <td>
                      <button 
                        className="btn-dispense"
                        onClick={() => handleDispense(item.id)}
                      >
                        Serahkan Obat
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
