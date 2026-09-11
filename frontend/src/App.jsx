import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PendaftaranPage from './pages/PendaftaranPage';
import PasienPage from './pages/PasienPage';
import IGDPage from './pages/IGDPage';
import FarmasiPage from './pages/FarmasiPage';
import LaboratoriumPage from './pages/LaboratoriumPage';
import KasirPage from './pages/KasirPage';
import RuangPeriksaDokterPage from './pages/RuangPeriksaDokterPage';
import NotFoundPage from './pages/NotFoundPage';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/pendaftaran" element={<ProtectedRoute><PendaftaranPage /></ProtectedRoute>} />
          <Route path="/pasien" element={<ProtectedRoute><PasienPage /></ProtectedRoute>} />
          <Route path="/igd" element={<ProtectedRoute><IGDPage /></ProtectedRoute>} />
          <Route path="/pemeriksaan-dokter" element={<ProtectedRoute><RuangPeriksaDokterPage /></ProtectedRoute>} />
          <Route path="/farmasi" element={<ProtectedRoute><FarmasiPage /></ProtectedRoute>} />
          <Route path="/laboratorium" element={<ProtectedRoute><LaboratoriumPage /></ProtectedRoute>} />
          <Route path="/kasir" element={<ProtectedRoute><KasirPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
