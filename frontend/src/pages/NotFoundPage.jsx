import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found-container">
      <h1>403</h1>
      <p>Maaf, Anda tidak memiliki akses ke halaman ini.<br/>Hanya petugas unit <strong>Rekam Medis</strong> yang diizinkan.</p>
      <Link to="/login" className="btn-action">Kembali ke Login</Link>
    </div>
  );
}
