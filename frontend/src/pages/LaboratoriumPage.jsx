import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import api from '../api/axios';

const LAB_TEMPLATES = {
  darah: [
    { param: 'Hemoglobin (Hb)', unit: 'g/dL', ref: '13.0 - 17.5' },
    { param: 'Leukosit', unit: '/uL', ref: '4,500 - 11,000' },
    { param: 'Trombosit', unit: '/uL', ref: '150,000 - 450,000' },
    { param: 'Hematokrit', unit: '%', ref: '40 - 52' },
    { param: 'Eritrosit', unit: '10^6/uL', ref: '4.5 - 5.5' },
    { param: 'Laju Endap Darah (LED)', unit: 'mm/jam', ref: '0 - 20' }
  ],
  gula: [
    { param: 'Gula Darah Puasa (GDP)', unit: 'mg/dL', ref: '70 - 100' },
    { param: 'Gula Darah Sewaktu (GDS)', unit: 'mg/dL', ref: '< 140' },
    { param: 'HbA1c', unit: '%', ref: '< 5.7' }
  ],
  widal: [
    { param: 'S. Typhi O', unit: 'Titer', ref: 'Negatif / < 1/80' },
    { param: 'S. Typhi H', unit: 'Titer', ref: 'Negatif / < 1/80' },
    { param: 'S. Paratyphi A-H', unit: 'Titer', ref: 'Negatif' },
    { param: 'S. Paratyphi B-H', unit: 'Titer', ref: 'Negatif' }
  ],
  urine: [
    { param: 'Warna & Kejernihan', unit: '-', ref: 'Kuning Jernih' },
    { param: 'pH Urine', unit: '-', ref: '4.5 - 8.0' },
    { param: 'Berat Jenis', unit: '-', ref: '1.005 - 1.030' },
    { param: 'Protein Urine', unit: '-', ref: 'Negatif' },
    { param: 'Glukosa Urine', unit: '-', ref: 'Negatif' },
    { param: 'Sedimen Leukosit', unit: '/LPB', ref: '0 - 5' },
    { param: 'Sedimen Eritrosit', unit: '/LPB', ref: '0 - 2' }
  ],
  ginjal: [
    { param: 'Ureum Darah', unit: 'mg/dL', ref: '15 - 45' },
    { param: 'Kreatinin Serum', unit: 'mg/dL', ref: '0.6 - 1.2' },
    { param: 'SGOT / AST', unit: 'U/L', ref: '0 - 35' },
    { param: 'SGPT / ALT', unit: 'U/L', ref: '0 - 45' }
  ],
  lipid: [
    { param: 'Kolesterol Total', unit: 'mg/dL', ref: '< 200' },
    { param: 'Trigliserida', unit: 'mg/dL', ref: '< 150' },
    { param: 'Kolesterol HDL', unit: 'mg/dL', ref: '> 40' },
    { param: 'Kolesterol LDL', unit: 'mg/dL', ref: '< 100' }
  ]
};

function getTemplate(testName) {
  const name = (testName || '').toLowerCase();
  if (name.includes('darah') || name.includes('trombosit') || name.includes('hematologi')) return LAB_TEMPLATES.darah;
  if (name.includes('gula') || name.includes('gdp') || name.includes('gds')) return LAB_TEMPLATES.gula;
  if (name.includes('widal') || name.includes('tifoid')) return LAB_TEMPLATES.widal;
  if (name.includes('urine')) return LAB_TEMPLATES.urine;
  if (name.includes('ginjal') || name.includes('ureum') || name.includes('kreatinin') || name.includes('sgot')) return LAB_TEMPLATES.ginjal;
  if (name.includes('lipid') || name.includes('kolesterol')) return LAB_TEMPLATES.lipid;
  return [
    { param: 'Hasil Analisis Kualitatif', unit: '-', ref: 'Negatif / Normal' },
    { param: 'Hasil Analisis Kuantitatif', unit: 'Satuan', ref: 'Nilai Normal' }
  ];
}

export default function LaboratoriumPage() {
  const [labOrders, setLabOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ordered');
  const [expandedId, setExpandedId] = useState(null);

  // Form structured entries: { [orderId]: { rows: [...], kesimpulan: '', analis: '' } }
  const [formData, setFormData] = useState({});

  // Report Print Modal
  const [selectedReport, setSelectedReport] = useState(null);

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

  const handleOpenForm = (item) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);

    if (!formData[item.id]) {
      const tpl = getTemplate(item.jenis_pemeriksaan);
      setFormData(prev => ({
        ...prev,
        [item.id]: {
          rows: tpl.map(t => ({ param: t.param, value: '', unit: t.unit, ref: t.ref, status: 'Normal' })),
          kesimpulan: 'Parameter pemeriksaan dalam batas nilai normal.',
          analis: 'Petugas Laboratorium Klinis'
        }
      }));
    }
  };

  const handleRowChange = (orderId, idx, field, value) => {
    setFormData(prev => {
      const orderForm = { ...prev[orderId] };
      const rows = [...orderForm.rows];
      rows[idx][field] = value;
      orderForm.rows = rows;
      return { ...prev, [orderId]: orderForm };
    });
  };

  const handleFormMetaChange = (orderId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value
      }
    }));
  };

  const handleAddCustomParam = (orderId) => {
    setFormData(prev => {
      const orderForm = { ...prev[orderId] };
      orderForm.rows = [...orderForm.rows, { param: '', value: '', unit: '', ref: '', status: 'Normal' }];
      return { ...prev, [orderId]: orderForm };
    });
  };

  const submitHasil = async (item) => {
    const data = formData[item.id];
    if (!data || !data.rows.length) return;

    // Compile into standardized human-readable & structured format
    const lines = [
      `=== HASIL ANALISIS LABORATORIUM RESMI ===`,
      `Pemeriksaan: ${item.jenis_pemeriksaan}`,
      `-----------------------------------------`,
      ...data.rows.filter(r => r.param.trim()).map(r => 
        `• ${r.param}: ${r.value || '-'} ${r.unit} | Rujukan: ${r.ref} | Ket: ${r.status}`
      ),
      `-----------------------------------------`,
      `Kesimpulan Analis: ${data.kesimpulan}`,
      `Diverifikasi oleh: ${data.analis}`
    ];

    const resultText = lines.join('\n');

    try {
      await api.put(`/lab/permintaan/${item.id}`, { hasil: resultText });
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
      subtitle="Pemeriksaan spesimen klinis, hematologi, kimia darah, dan entri terstandar analisis laboratorium"
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
                          onClick={() => handleOpenForm(item)}
                        >
                          {expandedId === item.id ? 'Tutup Form' : 'Input Hasil Standar'}
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn-action"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => setSelectedReport(item)}
                          >
                            Lihat & Cetak Hasil (PDF)
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* FORM INPUT HASIL TERSTANDARISASI */}
                  {expandedId === item.id && activeTab === 'ordered' && formData[item.id] && (
                    <tr>
                      <td colSpan="7">
                        <div className="inline-form" style={{ background: '#ffffff', border: '2px solid #3b82f6', borderRadius: '10px', padding: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div>
                              <h4 style={{ margin: 0, color: '#1e40af', fontSize: '1rem' }}>
                                Format Standar Entri Laboratorium: {item.jenis_pemeriksaan}
                              </h4>
                              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                                Pasien: <strong>{item.patient_nama}</strong> &bull; Nomor Order: {item.id}
                              </p>
                            </div>
                            <button type="button" className="btn-triage" onClick={() => handleAddCustomParam(item.id)}>
                              + Tambah Parameter Uji
                            </button>
                          </div>

                          <table style={{ width: '100%', marginBottom: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <thead>
                              <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '8px 10px', fontSize: '0.8rem', width: '35%' }}>Nama Parameter Uji</th>
                                <th style={{ padding: '8px 10px', fontSize: '0.8rem', width: '25%' }}>Nilai Hasil</th>
                                <th style={{ padding: '8px 10px', fontSize: '0.8rem', width: '15%' }}>Satuan</th>
                                <th style={{ padding: '8px 10px', fontSize: '0.8rem', width: '25%' }}>Nilai Rujukan Normal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {formData[item.id].rows.map((row, idx) => (
                                <tr key={idx}>
                                  <td style={{ padding: '6px 10px' }}>
                                    <input 
                                      type="text" 
                                      className="form-control" 
                                      style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                                      value={row.param} 
                                      onChange={(e) => handleRowChange(item.id, idx, 'param', e.target.value)} 
                                    />
                                  </td>
                                  <td style={{ padding: '6px 10px' }}>
                                    <input 
                                      type="text" 
                                      className="form-control" 
                                      placeholder="Masukkan nilai"
                                      style={{ padding: '6px 8px', fontSize: '0.82rem', fontWeight: 'bold' }}
                                      value={row.value} 
                                      onChange={(e) => handleRowChange(item.id, idx, 'value', e.target.value)} 
                                    />
                                  </td>
                                  <td style={{ padding: '6px 10px' }}>
                                    <input 
                                      type="text" 
                                      className="form-control" 
                                      style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                                      value={row.unit} 
                                      onChange={(e) => handleRowChange(item.id, idx, 'unit', e.target.value)} 
                                    />
                                  </td>
                                  <td style={{ padding: '6px 10px' }}>
                                    <input 
                                      type="text" 
                                      className="form-control" 
                                      style={{ padding: '6px 8px', fontSize: '0.82rem', color: '#475569' }}
                                      value={row.ref} 
                                      onChange={(e) => handleRowChange(item.id, idx, 'ref', e.target.value)} 
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>Kesimpulan & Interpretasi Analis Lab:</label>
                            <textarea
                              className="form-control"
                              rows="2"
                              value={formData[item.id].kesimpulan}
                              onChange={(e) => handleFormMetaChange(item.id, 'kesimpulan', e.target.value)}
                            />
                          </div>

                          <div className="form-row">
                            <div className="form-group" style={{ flex: 1 }}>
                              <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>Petugas Analis Laboratorium:</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                value={formData[item.id].analis}
                                onChange={(e) => handleFormMetaChange(item.id, 'analis', e.target.value)}
                              />
                            </div>
                          </div>

                          <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                            <button 
                              type="button"
                              className="btn-submit"
                              onClick={() => submitHasil(item)}
                            >
                              Simpan & Terbitkan Hasil Resmi
                            </button>
                            <button 
                              type="button"
                              className="btn-back" 
                              onClick={() => setExpandedId(null)}
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

      {/* MODAL LAPORAN HASIL LABORATORIUM (CETAK / EXPORT PDF) */}
      {selectedReport && (
        <div className="modal-overlay">
          <div className="modal-box print-document" style={{ maxWidth: '750px', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* KOP RESMI RS */}
            <div style={{ textAlign: 'center', borderBottom: '3px double #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#1e40af', fontSize: '1.25rem', letterSpacing: '0.5px' }}>RUMAH SAKIT KELOMPOK 7</h2>
              <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#475569' }}>
                INSTALASI LABORATORIUM PATOLOGI KLINIK & DIAGNOSTIK TERPADU
              </p>
              <small style={{ color: '#64748b' }}>Jl. Raya Kesehatan No. 7 &bull; Telp: (031) 555-7777 &bull; Layanan Terintegrasi SATUSEHAT</small>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <h3 style={{ textDecoration: 'underline', margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
                LEMBAR HASIL PEMERIKSAAN LABORATORIUM
              </h3>
              <small style={{ color: '#64748b' }}>No. Laboratorium: <strong>{selectedReport.id}</strong></small>
            </div>

            {/* IDENTITAS PASIEN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.84rem', background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div><span style={{ color: '#64748b' }}>Nama Pasien:</span> <strong>{selectedReport.patient_nama}</strong></div>
              <div><span style={{ color: '#64748b' }}>No. Rekam Medis:</span> <strong>{selectedReport.patient_id}</strong></div>
              <div><span style={{ color: '#64748b' }}>Jenis Pemeriksaan:</span> <strong>{selectedReport.jenis_pemeriksaan}</strong></div>
              <div><span style={{ color: '#64748b' }}>Tanggal Order:</span> <strong>{selectedReport.created_at || '-'}</strong></div>
              <div><span style={{ color: '#64748b' }}>Indikasi Klinis / Catatan:</span> <em>{selectedReport.catatan_dokter || '-'}</em></div>
              <div><span style={{ color: '#64748b' }}>Tanggal Verifikasi:</span> <strong>{selectedReport.completed_at || selectedReport.created_at}</strong></div>
            </div>

            {/* RINCIAN HASIL ANALISIS */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.88rem', color: '#1e40af', marginBottom: '8px' }}>Rincian Nilai Parameter Uji:</h4>
              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5' }}>
                {selectedReport.hasil || 'Belum ada data hasil pengujian.'}
              </div>
            </div>

            {/* TANDA TANGAN PETUGAS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
              <div style={{ color: '#64748b' }}>
                Dokumen resmi rekam medis elektronik.<br/>
                Dicetak pada: {new Date().toLocaleString('id-ID')}
              </div>
              <div style={{ textAlign: 'center', minWidth: '180px' }}>
                <span>Penanggung Jawab Laboratorium,</span>
                <div style={{ height: '48px' }}></div>
                <strong style={{ textDecoration: 'underline' }}>Analis Patologi Klinik</strong><br/>
                <small style={{ color: '#64748b' }}>RS Kelompok 7</small>
              </div>
            </div>

            {/* TOMBOL AKSI MODAL */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn-action"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                onClick={() => window.print()}
              >
                Cetak / Simpan PDF (Ctrl+P)
              </button>
              <button 
                type="button" 
                className="btn-back"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                onClick={() => setSelectedReport(null)}
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