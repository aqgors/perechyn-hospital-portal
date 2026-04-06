// src/pages/public/RegisterPage.jsx
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box, Container, Paper, Typography, TextField, Button, Link,
  Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import { LocalHospital, Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/authSlice.js';

const schema = yup.object({
  name: yup.string().min(2, 'Мінімум 2 символи').required("Ім'я є обов'язковим"),
  email: yup.string().email('Невірний email').required('Email є обов\'язковим'),
  password: yup
    .string()
    .min(8, 'Мінімум 8 символів')
    .matches(/[A-Z]/, 'Потрібна хоча б одна велика літера')
    .matches(/[0-9]/, 'Потрібна хоча б одна цифра')
    .required('Пароль є обов\'язковим'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Паролі не співпадають')
    .required('Підтвердження паролю є обов\'язковим'),
});

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = ({ confirmPassword, ...data }) => dispatch(registerUser(data));

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, py: 6 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ bgcolor: 'secondary.main', width: 64, height: 64, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <LocalHospital sx={{ color: '#fff', fontSize: 36 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>Реєстрація</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>Перечинська ЦРЛ — Вебпортал</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Controller name="name" control={control} render={({ field }) => (
              <TextField {...field} label="Повне ім'я" placeholder="Іваненко Іван Іванович" error={!!errors.name} helperText={errors.name?.message} />
            )} />

            <Controller name="email" control={control} render={({ field }) => (
              <TextField {...field} label="Email" type="email" autoComplete="email" error={!!errors.email} helperText={errors.email?.message} />
            )} />

            <Controller name="password" control={control} render={({ field }) => (
              <TextField
                {...field} label="Пароль" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                error={!!errors.password} helperText={errors.password?.message || 'Мін. 8 символів, велика літера та цифра'}
                InputProps={{ endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )}}
              />
            )} />

            <Controller name="confirmPassword" control={control} render={({ field }) => (
              <TextField {...field} label="Підтвердження паролю" type={showPassword ? 'text' : 'password'} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
            )} />

            <Button type="submit" variant="contained" color="secondary" size="large" disabled={isLoading} fullWidth
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null} sx={{ py: 1.5, mt: 1 }}>
              {isLoading ? 'Реєстрація...' : 'Зареєструватись'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2">
              Вже є акаунт?{' '}
              <Link component={RouterLink} to="/login" fontWeight={600}>Увійти</Link>
            </Typography>
            <Typography variant="body2" mt={1}>
              <Link component={RouterLink} to="/" color="text.secondary">← Головна</Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
