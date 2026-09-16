import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import Modal from '../components/Modal';
import api from '../api/axios';

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  // Modal State
  const [modalFeedback, setModalFeedback] = useState({ show: false, isError: false, title: '', text: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form edit
  const [editForm, setEditForm] = useState({
    nama: '',
    unit: '',
    role: 'admin',
    active: true,
    password: '',
    tgl_lahir: ''
  });

  // Form add
  const [addForm, setAddForm] = useState({
    nama: '',
    nip: '',
    unit: 'Rekam Medis',
    role: 'admin',
    password: '',
    tgl_lahir: '1995-01-01'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      nama: user.nama || '',
      unit: user.unit || '',
      role: user.role || 'admin',
      active: user.active ?? true,
      password: '',
      tgl_lahir: user.birthDate || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const payload = {
        nama: editForm.nama,
        unit: editForm.unit,
        role: editForm.role,
        active: editForm.active,
        tgl_lahir: editForm.tgl_lahir
      };
      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      await api.put(`/admin/users/${selectedUser.id}`, payload);
      setShowEditModal(false);
      setModalFeedback({
        show: true,
        isError: false,
        title: 'Profil Diperbarui',
        text: `Data akun ${editForm.nama} berhasil disimpan.`
      });
      fetchUsers();
    } catch (err) {
      setModalFeedback({
        show: true,
        isError: true,
        title: 'Gagal Memperbarui',
        text: 'Terjadi kesalahan saat menyimpan perubahan profil akun.'
      });
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', addForm);
      setShowAddModal(false);
      setAddForm({
        nama: '',
        nip: '',
        unit: 'Rekam Medis',
        role: 'admin',
        password: '',
        tgl_lahir: '1995-01-01'
      });
      setModalFeedback({
        show: true,
        isError: false,
        title: 'Akun Berhasil Dibuat',
        text: 'Akun staf baru berhasil didaftarkan ke dalam sistem.'
      });
      fetchUsers();
    } catch (err) {
      setModalFeedback({
        show: true,
        isError: true,
        title: 'Gagal Menambah Akun',
        text: 'Pastikan seluruh isian formulir telah diisi dengan benar.'
      });
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.delete(`/admin/users/${user.id}`);
      fetchUsers();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase();
    const nama = (u.nama || '').toLowerCase();
    const nip = (u.nip || '').toLowerCase();
    const unit = (u.unit || '').toLowerCase();
    const role = (u.role || '').toLowerCase();

    const matchSearch = !searchTerm || nama.includes(q) || nip.includes(q) || unit.includes(q) || role.includes(q);
    const matchRole = filterRole === 'ALL' || u.role === filterRole;

    return matchSearch && matchRole;
  });

  return (
    <MainLayout
      title="Manajemen Pengguna & Staf"
      subtitle="Otoritas admin untuk mengelola profil, unit kerja, peran akses, dan keamanan akun petugas"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3>Daftar Akun Petugas Rumah Sakit</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Total {users.length} akun staf terdaftar dalam sistem SIMRS</p>
        </div>
        <button 
          className="btn-action"
          onClick={() => setShowAddModal(true)}
          style={{ fontSize: '0.85rem', padding: '8px 16px' }}
        >
          + Tambah Akun Staf Baru
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="search-filter-box">
        <div className="filter-group" style={{ flex: 2 }}>
          <label>Pencarian Akun</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Cari NIP, nama petugas, unit kerja, atau peran akses..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Filter Peran Akses (Role)</label>
          <select
            className="filter-input"
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
          >
            <option value="ALL">Semua Peran</option>
            <option value="admin">Administrator</option>
            <option value="dokter">Dokter</option>
            <option value="perawat">Perawat</option>
            <option value="farmasi">Farmasi</option>
            <option value="laboratorium">Laboratorium</option>
            <option value="kasir">Kasir</option>
          </select>
        </div>

        {(searchTerm || filterRole !== 'ALL') && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              className="btn-back"
              style={{ paddingBottom: '9px' }}
              onClick={() => { setSearchTerm(''); setFilterRole('ALL'); }}
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          Menampilkan <strong>{filteredUsers.length}</strong> dari {users.length} total akun
        </span>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>NIP</th>
              <th>Nama Lengkap Staf</th>
              <th>Unit / Penugasan</th>
              <th>Peran Akses</th>
              <th>Tgl Lahir</th>
              <th>Status Akun</th>
              <th>Aksi Admin</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="empty-row">Memuat data akun staf...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">Tidak ada akun staf yang cocok dengan kriteria pencarian.</td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.nip}</strong></td>
                  <td>
                    <strong>{u.nama}</strong><br/>
                    <small style={{ color: '#64748b' }}>ID: {u.id}</small>
                  </td>
                  <td>{u.unit}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>
                      {u.role ? u.role.toUpperCase() : 'ADMIN'}
                    </span>
                  </td>
                  <td>{u.birthDate || '-'}</td>
                  <td>
                    <span 
                      style={{ 
                        cursor: 'pointer',
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.72rem', 
                        fontWeight: 600,
                        background: u.active ? '#dcfce7' : '#fee2e2',
                        color: u.active ? '#166534' : '#991b1b',
                        display: 'inline-block'
                      }}
                      onClick={() => handleToggleActive(u)}
                      title="Klik untuk mengubah status aktif"
                    >
                      {u.active ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn-hasil" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => handleOpenEdit(u)}
                      >
                        Edit Profil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL EDIT USER */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '520px', textAlign: 'left' }}>
            <h3 style={{ color: '#0f172a', marginBottom: '4px' }}>Edit Profil Akun Petugas</h3>
            <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '16px' }}>
              Memodifikasi data akun <strong>{selectedUser.nama}</strong> (NIP: {selectedUser.nip})
            </p>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Nama Lengkap Petugas</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editForm.nama} 
                  onChange={e => setEditForm(prev => ({ ...prev, nama: e.target.value }))} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Unit / Bagian</label>
                  <select 
                    className="form-control"
                    value={editForm.unit}
                    onChange={e => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                  >
                    <option value="Rekam Medis">Rekam Medis</option>
                    <option value="Poli Umum">Poli Umum</option>
                    <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
                    <option value="Poli Bedah">Poli Bedah</option>
                    <option value="IGD">IGD / Gawat Darurat</option>
                    <option value="Farmasi">Farmasi & Apotek</option>
                    <option value="Laboratorium">Laboratorium</option>
                    <option value="Kasir">Kasir & Billing</option>
                    <option value="Admin IT">Admin IT & Manajemen</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Peran Otoritas (Role)</label>
                  <select 
                    className="form-control"
                    value={editForm.role}
                    onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="admin">Administrator</option>
                    <option value="dokter">Dokter</option>
                    <option value="perawat">Perawat</option>
                    <option value="farmasi">Farmasi</option>
                    <option value="laboratorium">Laboratorium</option>
                    <option value="kasir">Kasir</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tanggal Lahir</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={editForm.tgl_lahir} 
                    onChange={e => setEditForm(prev => ({ ...prev, tgl_lahir: e.target.value }))} 
                  />
                </div>

                <div className="form-group">
                  <label>Status Akun</label>
                  <select 
                    className="form-control"
                    value={editForm.active ? '1' : '0'}
                    onChange={e => setEditForm(prev => ({ ...prev, active: e.target.value === '1' }))}
                  >
                    <option value="1">Aktif (Dapat Login)</option>
                    <option value="0">Non-Aktif (Blokir Akses)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Reset Password (Kosongkan bila tidak diubah)</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Ketik password baru untuk mereset..."
                  value={editForm.password}
                  onChange={e => setEditForm(prev => ({ ...prev, password: e.target.value }))} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-submit" style={{ flex: 1 }}>
                  Simpan Perubahan
                </button>
                <button 
                  type="button" 
                  className="btn-back"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH USER BARU */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '520px', textAlign: 'left' }}>
            <h3 style={{ color: '#0f172a', marginBottom: '4px' }}>Tambah Akun Petugas Baru</h3>
            <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '16px' }}>
              Mendaftarkan staf baru untuk mengakses portal pelayanan SIMRS
            </p>

            <form onSubmit={handleSaveAdd}>
              <div className="form-group">
                <label>Nama Lengkap Petugas</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Contoh: dr. Handoko, Sp.PD atau Ns. Siti Rahayu"
                  value={addForm.nama} 
                  onChange={e => setAddForm(prev => ({ ...prev, nama: e.target.value }))} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nomor Induk Pegawai (NIP)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Contoh: 105 (Kosongkan untuk otomatis)"
                    value={addForm.nip} 
                    onChange={e => setAddForm(prev => ({ ...prev, nip: e.target.value }))} 
                  />
                </div>

                <div className="form-group">
                  <label>Tanggal Lahir</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={addForm.tgl_lahir} 
                    onChange={e => setAddForm(prev => ({ ...prev, tgl_lahir: e.target.value }))} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Unit / Penugasan</label>
                  <select 
                    className="form-control"
                    value={addForm.unit}
                    onChange={e => setAddForm(prev => ({ ...prev, unit: e.target.value }))}
                  >
                    <option value="Rekam Medis">Rekam Medis</option>
                    <option value="Poli Umum">Poli Umum</option>
                    <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
                    <option value="Poli Bedah">Poli Bedah</option>
                    <option value="IGD">IGD / Gawat Darurat</option>
                    <option value="Farmasi">Farmasi & Apotek</option>
                    <option value="Laboratorium">Laboratorium</option>
                    <option value="Kasir">Kasir & Billing</option>
                    <option value="Admin IT">Admin IT & Manajemen</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Peran Otoritas (Role)</label>
                  <select 
                    className="form-control"
                    value={addForm.role}
                    onChange={e => setAddForm(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="admin">Administrator</option>
                    <option value="dokter">Dokter</option>
                    <option value="perawat">Perawat</option>
                    <option value="farmasi">Farmasi</option>
                    <option value="laboratorium">Laboratorium</option>
                    <option value="kasir">Kasir</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Kata Sandi (Password) *</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Ketik password akun baru..."
                  value={addForm.password}
                  onChange={e => setAddForm(prev => ({ ...prev, password: e.target.value }))} 
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-submit" style={{ flex: 1 }}>
                  Buat Akun Staf
                </button>
                <button 
                  type="button" 
                  className="btn-back"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal
        show={modalFeedback.show}
        icon={modalFeedback.isError ? '!' : '✓'}
        isError={modalFeedback.isError}
        title={modalFeedback.title}
        text={modalFeedback.text}
        onClose={() => setModalFeedback({ show: false })}
      />
    </MainLayout>
  );
}