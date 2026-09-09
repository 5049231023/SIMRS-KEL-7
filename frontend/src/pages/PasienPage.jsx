import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function PasienPage() {
  const [data, setData] = useState([]);
  const [filterNik, setFilterNik] = useState('');
  const [filterNama, setFilterNama] = useState('');

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

  const filteredData = data.filter(k => 
    (k.pasien.nik.toLowerCase().includes(filterNik.toLowerCase())) &&
    (k.pasien.nama.toLowerCase().includes(filterNama.toLowerCase()))
  );

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="header-title">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>Data Kunjungan & Rekam Medis Pasien</h2>
              <p>Monitor riwayat kunjungan hari ini dan kelola rekam medis terpadu</p>
            </div>
            <Link to="/pendaftaran" className="btn-action" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Pendaftaran Baru</Link>
          </div>
        </div>

        <div className="search-filter-box">
          <div className="filter-group">
            <label>Pencarian berdasarkan NIK</label>
            <input type="text" className="filter-input" placeholder="Masukkan 16 digit NIK..." value={filterNik} onChange={e => setFilterNik(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Pencarian berdasarkan Nama Pasien</label>
            <input type="text" className="filter-input" placeholder="Ketik nama pasien..." value={filterNama} onChange={e => setFilterNama(e.target.value)} />
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>No. RM</th>
                <th>NIK</th>
                <th>Nama Pasien</th>
                <th>JK / Usia</th>
                <th>Alamat & Telp</th>
                <th>Tgl Kunjungan</th>
                <th>Poli</th>
                <th>Keluhan</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-row">Belum ada data kunjungan ditemukan</td>
                </tr>
              ) : (
                filteredData.map(k => (
                  <tr key={k.id}>
                    <td><strong>{k.pasien.no_rm}</strong></td>
                    <td>{k.pasien.nik}</td>
                    <td>{k.pasien.nama}</td>
                    <td>{k.pasien.jenis_kelamin} / {calculateAge(k.pasien.tgl_lahir)} thn</td>
                    <td>{k.pasien.alamat}<br/>📞 {k.pasien.no_telp || '-'}</td>
                    <td>{k.tgl_kunjungan}</td>
                    <td><span className="badge-poli">{k.poli}</span></td>
                    <td>{k.keluhan.length > 20 ? k.keluhan.substring(0,20)+'...' : k.keluhan}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
