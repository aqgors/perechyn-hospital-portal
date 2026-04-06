// src/router/AdminRoute.jsx — маршрут тільки для адмінів
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute({ allowedRoles = ['ADMIN'] }) {
  const { user } = useSelector((s) => s.auth);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
