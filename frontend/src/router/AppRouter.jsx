// src/router/AppRouter.jsx — головний маршрутизатор
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute.jsx';
import AdminRoute from './AdminRoute.jsx';

// Public pages
import HomePage from '../pages/public/HomePage.jsx';
import LoginPage from '../pages/public/LoginPage.jsx';
import RegisterPage from '../pages/public/RegisterPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';

// User pages
import DashboardPage from '../pages/user/DashboardPage.jsx';
import AppealsPage from '../pages/user/AppealsPage.jsx';
import NewAppealPage from '../pages/user/NewAppealPage.jsx';
import ProfilePage from '../pages/user/ProfilePage.jsx';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import UsersManagement from '../pages/admin/UsersManagement.jsx';
import DoctorsManagement from '../pages/admin/DoctorsManagement.jsx';
import SpecialtiesManagement from '../pages/admin/SpecialtiesManagement.jsx';
import Statistics from '../pages/admin/Statistics.jsx';

// Doctor pages
import DoctorAppealsPage from '../pages/doctor/DoctorAppealsPage.jsx';

// Registrar pages
import RegistrarAppealsPage from '../pages/registrar/RegistrarAppealsPage.jsx';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected */}
      <Route element={<PrivateRoute />}>
        <Route path="/profile" element={<ProfilePage />} />

        {/* Patient only */}
        <Route element={<AdminRoute allowedRoles={['USER']} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/appeals" element={<AppealsPage />} />
          <Route path="/appeals/new" element={<NewAppealPage />} />
        </Route>

        {/* Doctor only */}
        <Route element={<AdminRoute allowedRoles={['DOCTOR']} />}>
          <Route path="/doctor/appeals" element={<DoctorAppealsPage />} />
        </Route>

        {/* Registrar only */}
        <Route element={<AdminRoute allowedRoles={['REGISTRAR']} />}>
          <Route path="/registrar/appeals" element={<RegistrarAppealsPage />} />
        </Route>

        {/* Admin only */}
        <Route element={<AdminRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/doctors" element={<DoctorsManagement />} />
          <Route path="/admin/specialties" element={<SpecialtiesManagement />} />
          <Route path="/admin/stats" element={<Statistics />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
