import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_kunjungan: 0, bor: 0, rawat_inap: 0, igd: 0 });

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <Navbar />
      
      <div className="dashboard-hero">
        <div className="hero-text">
          <h1>Selamat Datang di SIM RS Terpadu</h1>
          <p>Sistem Informasi Manajemen Rumah Sakit yang terintegrasi dengan SATUSEHAT. Mengelola data pasien, pendaftaran, dan rekam medis secara realtime.</p>
          <Link to="/pendaftaran" className="btn-action">Mulai Pendaftaran Pasien</Link>
        </div>
        <div className="card-akses">
          <div className="row-info">
            <span>Akses Petugas</span>
            <strong>{user?.nama}</strong>
          </div>
          <div className="row-info">
            <span>Unit / Poli</span>
            <strong>{user?.unit}</strong>
          </div>
          <div className="row-info">
            <span>NIP / ID</span>
            <strong>{user?.nip}</strong>
          </div>
          <span className="badge-status">● AKTIF</span>
        </div>
      </div>

      <div className="content-grid">
        <div>
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card">
              <h3>Total Kunjungan Hari Ini</h3>
              <p>{stats.total_kunjungan}</p>
            </div>
            <div className="stat-card">
              <h3>Bed Occupancy Rate (BOR)</h3>
              <p>{stats.bor}%</p>
            </div>
            <div className="stat-card">
              <h3>Pasien Rawat Inap Aktif</h3>
              <p>{stats.rawat_inap}</p>
            </div>
            <div className="stat-card">
              <h3>Antrean IGD</h3>
              <p>{stats.igd}</p>
            </div>
          </div>
          <p className="stat-footer-note">*Data diperbarui secara realtime dan otomatis sinkron dengan IHS SATUSEHAT Kementerian Kesehatan.</p>
        </div>

        <div className="announcement-card">
          <h3>📌 Informasi & Pengumuman</h3>
          <div className="announcement-item">
            <strong>Update Sistem v2.4</strong>
            <span>Integrasi SATUSEHAT fase 2 berhasil diimplementasikan. Modul pendaftaran kini wajib mengecek NIK.</span>
          </div>
          <div className="announcement-item">
            <strong>Jadwal Maintenance</strong>
            <span>Server akan mengalami down-time pada hari Sabtu pukul 02:00 - 04:00 WIB untuk pemeliharaan rutin.</span>
          </div>
        </div>
      </div>

      <h3 className="section-title">Modul Utama SIMRS</h3>
      <div className="modules-grid">
        <Link to="/pendaftaran" className="module-card clickable">
          <div className="module-icon">📝</div>
          <div className="module-name">Pendaftaran Pasien</div>
        </Link>
        <Link to="/pasien" className="module-card clickable">
          <div className="module-icon">🗂️</div>
          <div className="module-name">Rekam Medis</div>
        </Link>
        <div className="module-card">
          <div className="module-icon">🧑‍⚕️</div>
          <div className="module-name">Poliklinik</div>
        </div>
        <div className="module-card">
          <div className="module-icon">🛏️</div>
          <div className="module-name">Rawat Inap</div>
        </div>
        <div className="module-card">
          <div className="module-icon">🚑</div>
          <div className="module-name">IGD</div>
        </div>
        <div className="module-card">
          <div className="module-icon">💊</div>
          <div className="module-name">Farmasi & Apotek</div>
        </div>
        <div className="module-card">
          <div className="module-icon">🔬</div>
          <div className="module-name">Laboratorium</div>
        </div>
        <div className="module-card">
          <div className="module-icon">💰</div>
          <div className="module-name">Kasir & Billing</div>
        </div>
      </div>
    </>
  );
}
