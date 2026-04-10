// src/router/AdminRoute.jsx — маршрут тільки для адмінів
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute({ allowedRoles = ['ADMIN'] }) {
  const { user } = useSelector((s) => s.auth);

  if (!user || !allowedRoles.includes(user.role)) {
    if (user?.role === 'REGISTRAR') return <Navigate to="/registrar/appeals" replace />;
    if (user?.role === 'DOCTOR') return <Navigate to="/doctor/appeals" replace />;
    if (user?.role === 'ADMIN') return <Navigate to="/admin/stats" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
