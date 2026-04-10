// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Alert, RadioGroup, FormControlLabel, Radio, CircularProgress } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LocalHospital } from '@mui/icons-material';
import { authApi } from '../../api/auth.api.js';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [step, setStep] = useState(1); // 1 = Запит, 2 = Код, 3 = Новий пароль
  
  const [identifier, setIdentifier] = useState('');
  
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ identifier });
      toast.success(t('toast.codeSent', 'Код відправлено на email'));
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message ? t(`api.${err.response.data.message}`, err.response.data.message) : t('toast.requestError', 'Помилка при створенні запиту'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.verifyCode({ identifier, code, type: 'RESET_PASS' });
      toast.success(t('toast.codeValid', 'Код валідний'));
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message ? t(`api.${err.response.data.message}`, err.response.data.message) : t('toast.verifyError', 'Помилка верифікації'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.resetPassword({ identifier, code, newPassword });
      toast.success(t('toast.passChanged', 'Пароль успішно змінено!'));
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message ? t(`api.${err.response.data.message}`, err.response.data.message) : t('toast.passChangeError', 'Помилка зміни паролю'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box component="header" sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'primary.main' }}>
          <LocalHospital sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700}>{t('common.appTitle')}</Typography>
        </Box>
      </Box>

      <Container maxWidth="xs" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', pb: 10 }}>
        <Paper elevation={0} sx={{ p: 4, width: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
            {t('forgotPass.title', 'Відновлення паролю')}
          </Typography>
          
          {step === 1 && (
            <form onSubmit={handleRequest}>
              <Typography variant="body2" color="text.secondary" mb={2} textAlign="center">
                {t('forgotPass.emailPrompt', 'Введіть ваш Email для отримання коду підтвердження.')}
              </Typography>

              <TextField
                label={t('loginPage.email', 'Електронна пошта')}
                type="email"
                required
                fullWidth
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : t('profilePage.verifyCode', 'Надіслати код')}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerify}>
              <Typography variant="body2" color="text.secondary" mb={3} textAlign="center">
                {t('forgotPass.codePrompt', 'Введіть 6-значний код, відправлений на')} {identifier}
              </Typography>
              <TextField
                label={t('profilePage.codeStr', 'Код підтвердження')}
                required
                fullWidth
                value={code}
                onChange={(e) => setCode(e.target.value)}
                sx={{ mb: 3 }}
                inputProps={{ maxLength: 6 }}
              />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading || code.length !== 6}>
                {loading ? <CircularProgress size={24} /> : t('profilePage.verifyCode', 'Перевірити код')}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleReset}>
              <Alert severity="success" sx={{ mb: 3 }}>
                {t('forgotPass.codeValidAndPass', 'Код підтверджено. Введіть новий пароль.')}
              </Alert>
              <TextField
                label={t('profilePage.newPass', 'Новий пароль')}
                type="password"
                required
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading || newPassword.length < 8}>
                {loading ? <CircularProgress size={24} /> : t('profilePage.savePass', 'Зберегти пароль')}
              </Button>
            </form>
          )}

          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('forgotPass.remembered', 'Згадали пароль? ')}
              <Box component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
                {t('common.login', 'Увійти')}
              </Box>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
