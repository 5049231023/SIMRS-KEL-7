import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <p>Halaman yang Anda cari tidak ditemukan.</p>
      <Link to="/" className="btn-action">Kembali ke Beranda</Link>
    </div>
  );
}
