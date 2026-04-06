// src/router/AppRouter.jsx — головний маршрутизатор
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute.jsx';
import AdminRoute from './AdminRoute.jsx';

// Public pages
import HomePage from '../pages/public/HomePage.jsx';
import LoginPage from '../pages/public/LoginPage.jsx';
import RegisterPage from '../pages/public/RegisterPage.jsx';

// User pages
import DashboardPage from '../pages/user/DashboardPage.jsx';
import AppealsPage from '../pages/user/AppealsPage.jsx';
import NewAppealPage from '../pages/user/NewAppealPage.jsx';
import ProfilePage from '../pages/user/ProfilePage.jsx';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import UsersManagement from '../pages/admin/UsersManagement.jsx';
import AppealsManagement from '../pages/admin/AppealsManagement.jsx';
import Statistics from '../pages/admin/Statistics.jsx';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/appeals" element={<AppealsPage />} />
        <Route path="/appeals/new" element={<NewAppealPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin / Doctor */}
        <Route element={<AdminRoute allowedRoles={['ADMIN', 'DOCTOR']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/appeals" element={<AppealsManagement />} />
        </Route>

        {/* Admin only */}
        <Route element={<AdminRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/stats" element={<Statistics />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
