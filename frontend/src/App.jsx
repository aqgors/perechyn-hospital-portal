// src/App.jsx — кореневий компонент з ініціалізацією auth
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/authSlice.js';
import AppRouter from './router/AppRouter.jsx';
import { Box, CircularProgress } from '@mui/material';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

export default function App() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((s) => s.auth);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(fetchMe());
    } else {
      // Позначаємо як ініціалізований без токена
      dispatch({ type: 'auth/fetchMe/rejected' });
    }
  }, [dispatch]);

  if (!initialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)' }}
      >
        <CircularProgress size={56} sx={{ color: '#fff' }} />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}
