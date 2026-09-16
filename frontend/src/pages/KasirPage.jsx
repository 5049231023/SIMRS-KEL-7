import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import api from '../api/axios';

export default function KasirPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unpaid');
  const [expandedId, setExpandedId] = useState(null);
  const [metodeBayar, setMetodeBayar] = useState({});
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMetode, setFilterMetode] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/kasir/tagihan?status=${activeTab}`);
      setInvoices(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    if (!metodeBayar[id]) {
      setMetodeBayar(prev => ({ ...prev, [id]: 'Tunai' }));
    }
  };

  const handleMetodeChange = (id, value) => {
    setMetodeBayar(prev => ({ ...prev, [id]: value }));
  };

  const submitBayar = async (id) => {
    const metode = metodeBayar[id] || 'Tunai';
    try {
      await api.put(`/kasir/tagihan/${id}`, { metode_bayar: metode });
      setExpandedId(null);
      fetchData();
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setFilterMetode('ALL');
  };

  const filteredInvoices = invoices.filter(item => {
    const q = searchTerm.toLowerCase();
    const noInv = (item.id || '').toLowerCase();
    const nama = (item.patient_nama || '').toLowerCase();
    const idPasien = (item.patient_id || '').toLowerCase();
    const metode = (item.metode_bayar || '').toLowerCase();
    const itemMatch = (item.items || []).some(it => 
      (it.deskripsi || '').toLowerCase().includes(q)
    );

    const matchSearch = !searchTerm || noInv.includes(q) || nama.includes(q) || idPasien.includes(q) || metode.includes(q) || itemMatch;

    let matchMetode = true;
    if (filterMetode !== 'ALL' && activeTab === 'paid') {
      matchMetode = item.metode_bayar === filterMetode;
    }

    return matchSearch && matchMetode;
  });

  const calculateTotalFiltered = () => {
    return filteredInvoices.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  };

  return (
    <MainLayout
      title="Kasir & Billing Pelayanan"
      subtitle="Pengelolaan rincian tagihan periksa, farmasi, lab, dan pembayaran pasien"
    >
      <div className="page-tabs">
        <button 
          className={`tab-item ${activeTab === 'unpaid' ? 'active' : ''}`}
          onClick={() => { setActiveTab('unpaid'); setExpandedId(null); }}
        >
          Tagihan Belum Dibayar (Open)
        </button>
        <button 
          className={`tab-item ${activeTab === 'paid' ? 'active' : ''}`}
          onClick={() => { setActiveTab('paid'); setExpandedId(null); }}
        >
          Riwayat Pembayaran Lunas (Paid)
        </button>
      </div>

      <div className="summary-card">
        <div className="summary-label">
          {activeTab === 'unpaid' ? 'Total Tagihan Belum Dibayar:' : 'Total Pembayaran Diterima:'}
        </div>
        <div className="summary-value">
          Rp {calculateTotalFiltered().toLocaleString('id-ID')}
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="search-filter-box">
        <div className="filter-group" style={{ flex: 2 }}>
          <label>Pencarian Invoice & Pasien</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Cari no. invoice, nama pasien, ID pasien, atau rincian tindakan/obat..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'paid' && (
          <div className="filter-group">
            <label>Filter Cara Bayar</label>
            <select
              className="filter-input"
              value={filterMetode}
              onChange={e => setFilterMetode(e.target.value)}
            >
              <option value="ALL">Semua Metode</option>
              <option value="Tunai">Tunai / Cash</option>
              <option value="BPJS Kesehatan">BPJS Kesehatan</option>
              <option value="Asuransi">Asuransi Swasta</option>
            </select>
          </div>
        )}

        {(searchTerm || (activeTab === 'paid' && filterMetode !== 'ALL')) && (
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
          Menampilkan <strong>{filteredInvoices.length}</strong> dari {invoices.length} invoice ({activeTab === 'unpaid' ? 'belum dibayar' : 'lunas'})
        </span>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>No. Invoice</th>
              <th>Nama Pasien</th>
              <th>Rincian Biaya Layanan</th>
              <th>Total Tagihan</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Aksi Kasir</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="empty-row">Memuat data tagihan...</td>
              </tr>
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  {invoices.length === 0
                    ? `Tidak ada invoice dengan status ${activeTab === 'unpaid' ? 'belum dibayar' : 'lunas'}.`
                    : 'Tidak ada invoice yang cocok dengan kriteria pencarian Anda.'}
                </td>
              </tr>
            ) : (
              filteredInvoices.map((item) => (
                <React.Fragment key={item.id}>
                  <tr>
                    <td><strong>{item.id}</strong></td>
                    <td>
                      <div><strong>{item.patient_nama || '-'}</strong></div>
                      <small>ID Pasien: {item.patient_id || '-'}</small>
                    </td>
                    <td>
                      <div className="detail-items">
                        {item.items && item.items.map((it, idx) => (
                          <div key={idx} className="detail-item">
                            <span>{it.deskripsi}</span>
                            <span>Rp {(Number(it.jumlah) || 0).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#1e3c72', fontSize: '1rem' }}>
                        Rp {(Number(item.total) || 0).toLocaleString('id-ID')}
                      </strong>
                    </td>
                    <td>{item.created_at || '-'}</td>
                    <td>
                      <span className={item.status === 'unpaid' ? 'badge-status-unpaid' : 'badge-status-paid'}>
                        {item.status === 'unpaid' ? 'Belum Dibayar' : 'Lunas'}
                      </span>
                      {item.metode_bayar && (
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#065f46' }}>
                          via {item.metode_bayar}
                        </div>
                      )}
                    </td>
                    <td>
                      {activeTab === 'unpaid' ? (
                        <button 
                          className="btn-bayar"
                          onClick={() => toggleExpand(item.id)}
                        >
                          {expandedId === item.id ? 'Tutup' : 'Bayar'}
                        </button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#166534' }}>
                            Tuntas {item.paid_at || '-'}
                          </span>
                          <button 
                            type="button"
                            className="btn-action"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                            onClick={() => setSelectedReceipt(item)}
                          >
                            Cetak Kuitansi
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* FORM PEMBAYARAN KASIR */}
                  {expandedId === item.id && activeTab === 'unpaid' && (
                    <tr>
                      <td colSpan="7">
                        <div className="inline-form">
                          <h4 style={{ marginBottom: '8px', color: '#1e3c72' }}>
                            Proses Pembayaran Tagihan: Rp {(Number(item.total) || 0).toLocaleString('id-ID')}
                          </h4>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Metode Bayar:</label>
                            <select 
                              className="form-control" 
                              style={{ width: 'auto' }}
                              value={metodeBayar[item.id] || 'Tunai'}
                              onChange={(e) => handleMetodeChange(item.id, e.target.value)}
                            >
                              <option value="Tunai">Tunai / Cash</option>
                              <option value="BPJS Kesehatan">Klaim BPJS Kesehatan</option>
                              <option value="Asuransi">Asuransi Swasta</option>
                            </select>
                            <button 
                              className="btn-bayar"
                              onClick={() => submitBayar(item.id)}
                            >
                              Konfirmasi Pembayaran
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
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL KUITANSI RESMI BUKTI PEMBAYARAN (PRINT/PDF) */}
      {selectedReceipt && (
        <div className="modal-overlay">
          <div className="modal-box print-document" style={{ maxWidth: '680px', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* KOP RESMI RS */}
            <div style={{ textAlign: 'center', borderBottom: '3px double #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#1e40af', fontSize: '1.25rem', letterSpacing: '0.5px' }}>RUMAH SAKIT KELOMPOK 7</h2>
              <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#475569' }}>
                BAGIAN KASIR & ADMINISTRASI KEUANGAN PASIEN
              </p>
              <small style={{ color: '#64748b' }}>Jl. Raya Kesehatan No. 7 &bull; Telp: (031) 555-7777 &bull; Layanan Terintegrasi SIMRS</small>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 style={{ textDecoration: 'underline', margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
                KUITANSI BUKTI PEMBAYARAN PELAYANAN
              </h3>
              <small style={{ color: '#64748b' }}>Nomor Kuitansi: <strong>{selectedReceipt.id}</strong></small>
            </div>

            {/* IDENTITAS TRANSAKSI & PASIEN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.84rem', background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div><span style={{ color: '#64748b' }}>Telah Diterima Dari:</span> <strong>{selectedReceipt.patient_nama}</strong></div>
              <div><span style={{ color: '#64748b' }}>No. Rekam Medis:</span> <strong>{selectedReceipt.patient_id}</strong></div>
              <div><span style={{ color: '#64748b' }}>Tanggal Pembayaran:</span> <strong>{selectedReceipt.paid_at || selectedReceipt.created_at}</strong></div>
              <div><span style={{ color: '#64748b' }}>Metode Pembayaran:</span> <strong className="badge-poli">{selectedReceipt.metode_bayar || 'Tunai'}</strong></div>
            </div>

            {/* RINCIAN TAGIHAN */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.88rem', color: '#1e40af', marginBottom: '8px' }}>Rincian Layanan & Tindakan Medis:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '70%' }}>Deskripsi Layanan / Obat / Tindakan</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '30%' }}>Biaya (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedReceipt.items || []).map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px' }}>{it.deskripsi}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        {(Number(it.jumlah) || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #cbd5e1', background: '#f8fafc' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>TOTAL PEMBAYARAN</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', fontSize: '1rem', color: '#1e40af' }}>
                      Rp {(Number(selectedReceipt.total) || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* STATUS CAP & TTD KASIR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
              <div style={{ textAlign: 'center', border: '2px solid #166534', padding: '8px 16px', borderRadius: '6px', color: '#166534', fontWeight: 'bold', letterSpacing: '1px' }}>
                LUNAS / TELAH DIBAYAR
              </div>
              <div style={{ textAlign: 'center', minWidth: '180px' }}>
                <span>Petugas Kasir Rumah Sakit,</span>
                <div style={{ height: '48px' }}></div>
                <strong style={{ textDecoration: 'underline' }}>Bagian Kasir & Billing</strong><br/>
                <small style={{ color: '#64748b' }}>RS Kelompok 7</small>
              </div>
            </div>

            {/* TOMBOL AKSI */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn-action"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                onClick={() => window.print()}
              >
                Cetak Kuitansi (Ctrl+P)
              </button>
              <button 
                type="button" 
                className="btn-back"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                onClick={() => setSelectedReceipt(null)}
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
