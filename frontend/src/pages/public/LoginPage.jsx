// src/pages/public/LoginPage.jsx
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Container, Paper, Typography, TextField, Button, Link, Alert, Divider, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { LocalHospital, Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/authSlice.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const getSchema = (t) => yup.object({
  email: yup.string().email(t('validation.invalidEmail', 'Невірний email')).required(t('validation.requiredEmail', "Email є обов'язковим")),
  password: yup.string().required(t('validation.requiredPassword', "Пароль є обов'язковим")),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoading, error, isAuthenticated, user } = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'DOCTOR') navigate('/doctor/appeals');
      else if (user.role === 'REGISTRAR') navigate('/registrar/appeals');
      else if (user.role === 'ADMIN') navigate('/admin/stats');
      else navigate('/dashboard');
    }
    return () => dispatch(clearError());
  }, [isAuthenticated, user, navigate, dispatch]);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(getSchema(t)),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data) => dispatch(loginUser(data));

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ bgcolor: 'primary.main', width: 64, height: 64, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <LocalHospital sx={{ color: '#fff', fontSize: 36 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>{t('loginPage.title', 'Вхід до системи')}</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>{t('common.appTitle')} — {t('common.appSubtitle')}</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Controller name="email" control={control} render={({ field }) => (
              <TextField {...field} label={t('loginPage.email', 'Email')} type="email" autoComplete="email" error={!!errors.email} helperText={errors.email?.message} />
            )} />

            <Controller name="password" control={control} render={({ field }) => (
              <TextField
                {...field}
                label={t('loginPage.password', 'Пароль')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )} />

            <Button type="submit" variant="contained" size="large" disabled={isLoading} fullWidth
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null} sx={{ py: 1.5, mt: 1 }}>
              {isLoading ? t('common.loading', 'Вхід...') : t('loginPage.submit', 'Увійти')}
            </Button>

            <Box sx={{ textAlign: 'right' }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2" color="text.secondary">
                {t('loginPage.forgotPassword', 'Забули пароль?')}
              </Link>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">{t('common.or', 'або')}</Typography>
          </Divider>

          <Typography variant="body2" textAlign="center">
            {t('loginPage.noAccount', 'Немає акаунту? ')}
            <Link component={RouterLink} to="/register" fontWeight={600}>{t('common.register', 'Зареєструватись')}</Link>
          </Typography>
          <Typography variant="body2" textAlign="center" mt={1}>
            <Link component={RouterLink} to="/" color="text.secondary">{t('common.backToHome', '← Повернутись на головну')}</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
