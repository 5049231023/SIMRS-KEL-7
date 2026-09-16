import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import api from '../api/axios';

export default function FarmasiPage() {
  const [resep, setResep] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingResep, setEditingResep] = useState(null);
  const [editItems, setEditItems] = useState([]);

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
      await api.put(`/farmasi/resep/${id}/dispense`, { dispense: true });
      fetchData();
    } catch (error) {
      console.error('Error dispensing resep:', error);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingResep(item);
    setEditItems(item.items ? JSON.parse(JSON.stringify(item.items)) : []);
  };

  const handleAddMedicine = () => {
    setEditItems(prev => [...prev, { nama_obat: '', jumlah: 1, aturan: '' }]);
  };

  const handleItemChange = (index, field, value) => {
    setEditItems(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleRemoveMedicine = (index) => {
    setEditItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveResep = async (e) => {
    e.preventDefault();
    if (!editingResep) return;
    try {
      const validItems = editItems.filter(i => i.nama_obat && i.nama_obat.trim());
      await api.put(`/farmasi/resep/${editingResep.id}`, { items: validItems });
      setEditingResep(null);
      fetchData();
    } catch (err) {
      console.error('Error saving resep:', err);
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
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          type="button"
                          className="btn-hasil"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleOpenEdit(item)}
                        >
                          Edit Resep
                        </button>
                        <button 
                          type="button"
                          className="btn-dispense"
                          onClick={() => handleDispense(item.id)}
                        >
                          Serahkan Obat
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL EDIT RESEP OBAT OLEH FARMASI */}
      {editingResep && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '640px', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ color: '#0f172a', margin: 0 }}>Edit Resep Obat Pasien</h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 0' }}>
                  No. Resep: <strong>{editingResep.id}</strong> &bull; Pasien: <strong>{editingResep.patient_nama}</strong>
                </p>
              </div>
              <button className="btn-back" style={{ padding: '4px 10px' }} onClick={() => setEditingResep(null)}>Tutup</button>
            </div>

            <form onSubmit={handleSaveResep}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.88rem' }}>Daftar Obat & Aturan Pakai</label>
                <button type="button" className="btn-triage" onClick={handleAddMedicine}>+ Tambah Obat</button>
              </div>

              {editItems.map((med, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nama Obat & Sediaan (contoh: Paracetamol 500mg)"
                    value={med.nama_obat}
                    onChange={(e) => handleItemChange(idx, 'nama_obat', e.target.value)}
                    style={{ flex: 2 }}
                    required
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Jml"
                    min="1"
                    value={med.jumlah}
                    onChange={(e) => handleItemChange(idx, 'jumlah', parseInt(e.target.value) || 1)}
                    style={{ width: '80px' }}
                    required
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Aturan Pakai (contoh: 3x1 sesudah makan)"
                    value={med.aturan}
                    onChange={(e) => handleItemChange(idx, 'aturan', e.target.value)}
                    style={{ flex: 2 }}
                    required
                  />
                  {editItems.length > 1 && (
                    <button
                      type="button"
                      className="btn-back"
                      style={{ color: '#b91c1c', borderColor: '#fecaca', padding: '6px 10px' }}
                      onClick={() => handleRemoveMedicine(idx)}
                      title="Hapus obat ini"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-submit" style={{ flex: 1 }}>
                  Simpan Perubahan Resep
                </button>
                <button type="button" className="btn-back" onClick={() => setEditingResep(null)}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
