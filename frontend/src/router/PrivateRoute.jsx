// src/router/PrivateRoute.jsx — захищений маршрут
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

export default function PrivateRoute() {
  const { isAuthenticated, initialized } = useSelector((s) => s.auth);

  if (!initialized) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={48} />
      </Box>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
