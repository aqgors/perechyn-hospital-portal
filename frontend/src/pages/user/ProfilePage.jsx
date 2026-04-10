// src/pages/user/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Container, Grid, Paper, Typography, TextField, Button,
  Avatar, Divider, Alert, Chip, CircularProgress, InputAdornment
} from '@mui/material';
import { Person, Security, Save, PhoneIphone, Mail, VerifiedUser } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import { authApi } from '../../api/auth.api.js';
import { fetchMe } from '../../store/authSlice.js';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ROLE_COLORS = { ADMIN: 'error', DOCTOR: 'secondary', USER: 'primary', REGISTRAR: 'warning' };

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { t, i18n } = useTranslation();

  const ROLE_LABELS = { 
    ADMIN: t('common.admin', 'Адміністратор'), 
    DOCTOR: t('common.doctor', 'Лікар'), 
    USER: t('common.patient', 'Пацієнт'), 
    REGISTRAR: t('common.registrar', 'Реєстратура') 
  };

  // States
  const [saving, setSaving] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // Password flow state: 0 = Default, 1 = Entering Code, 2 = Entering New Password
  const [passStep, setPassStep] = useState(0);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const profileForm = useForm({
    defaultValues: { name: '', phone: '' }
  });

  // Init form
  useEffect(() => {
    if (user) {
      let phoneStr = user.phone || '';
      if (phoneStr && !phoneStr.startsWith('+')) {
        phoneStr = '+' + phoneStr;
      }
      profileForm.reset({ name: user.name || '', phone: phoneStr });
    }
  }, [user, profileForm]);

  // Enforce +380 logic
  const handlePhoneChange = (e, field) => {
    let val = e.target.value.replace(/[^\d+]/g, ''); // keep only numbers and plus
    if (!val.startsWith('+380') && val.length > 0) {
      if (val.startsWith('380')) val = '+' + val;
      else if (val.startsWith('80')) val = '+3' + val;
      else if (val.startsWith('0')) val = '+38' + val;
      else if (val.startsWith('+')) val = '+380' + val.substring(1);
      else val = '+380' + val;
    }
    field.onChange(val);
  };

  const onSaveProfile = async (data) => {
    setSaving(true);
    try {
      await authApi.updateMe({ name: data.name, phone: data.phone });
      await dispatch(fetchMe());
      toast.success(t('toast.profileUpdated', 'Профіль успішно оновлено'));
    } catch { /* handled by interceptor */ }
    setSaving(false);
  };

  // ---- Password flow functions ---- //
  const handleRequestCode = async () => {
    setPassLoading(true);
    try {
      await authApi.forgotPassword({ identifier: user.email });
      toast.success(t('toast.codeSent', 'Код підтвердження відправлено на ваш email'));
      setPassStep(1);
    } catch {
      toast.error(t('toast.codeSendError', 'Не вдалося надіслати код. Спробуйте пізніше.'));
    }
    setPassLoading(false);
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) return toast.error(t('toast.enterCode', 'Введіть 6-значний код'));
    setPassLoading(true);
    try {
      await authApi.verifyCode({ identifier: user.email, code });
      toast.success(t('toast.codeVerified', 'Код підтверджено!'));
      setPassStep(2);
    } catch {
      toast.error(t('toast.invalidCode', 'Невірний або прострочений код'));
    }
    setPassLoading(false);
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) return toast.error(t('toast.passMin', 'Пароль має містити щонайменше 8 символів'));
    if (newPassword !== confirmPassword) return toast.error(t('toast.passNoMatch', 'Паролі не співпадають'));

    setPassLoading(true);
    try {
      await authApi.resetPassword({ identifier: user.email, code, newPassword });
      toast.success(t('toast.passChanged', 'Пароль успішно змінено!'));

      // Reset flow
      setPassStep(0);
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error(t('toast.passChangeError', 'Помилка при зміні паролю'));
    }
    setPassLoading(false);
  };

  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
          {t('profilePage.title', 'Особистий кабінет')}
        </Typography>

        <Grid container spacing={4}>
          {/* Left Column - Profile Card */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider' }}>
              <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2.5rem', fontWeight: 800, mx: 'auto', mb: 3, boxShadow: 2 }}>
                {user?.name?.charAt(0)}
              </Avatar>
              <Typography variant="h5" fontWeight={700} gutterBottom>{user?.name}</Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
                <Mail fontSize="small" />
                <Typography variant="body2">{user?.email}</Typography>
              </Box>

              <Box sx={{ mt: 1, mb: 3 }}>
                <Chip icon={<VerifiedUser />} label={ROLE_LABELS[user?.role]} color={ROLE_COLORS[user?.role]} sx={{ fontWeight: 700, px: 1 }} />
              </Box>

              <Divider sx={{ my: 'auto' }} />

              <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
                {t('profilePage.joined', 'Користувач системи з')} {new Date(user?.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'uk-UA')}
              </Typography>
            </Paper>
          </Grid>

          {/* Right Column - Forms */}
          <Grid item xs={12} md={8}>

            {/* Edit Profile Info */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                <Person color="primary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700}>{t('profilePage.personalData', 'Персональні дані')}</Typography>
              </Box>

              <Box component="form" onSubmit={profileForm.handleSubmit(onSaveProfile)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Controller name="name" control={profileForm.control} render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('registerPage.name', "Повне ім'я")}
                    fullWidth
                    variant="outlined"
                  />
                )} />

                {/* Phone — only for patients */}
                {user?.role === 'USER' && (
                  <Box>
                    <Controller name="phone" control={profileForm.control} render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('profilePage.phone', 'Мобільний телефон')}
                        onChange={(e) => handlePhoneChange(e, field)}
                        placeholder="+380"
                        fullWidth
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><PhoneIphone fontSize="small" /></InputAdornment>,
                        }}
                      />
                    )} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', ml: 1 }}>
                      {t('profilePage.phoneHint', "Додайте номер телефону, щоб лікар міг зв'язатися з вами")}
                    </Typography>
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  disabled={saving}
                  sx={{ alignSelf: 'flex-start', mt: 1, px: 4, py: 1.5, borderRadius: 3, fontWeight: 700 }}
                >
                  {saving ? t('common.loading', 'Збереження...') : t('common.save', 'Зберегти дані')}
                </Button>
              </Box>
            </Paper>

            {/* Security Settings (Email verified password reset) */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                <Security color="warning" sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700}>{t('profilePage.security', 'Безпека та пароль')}</Typography>
              </Box>

              <Box sx={{ maxWidth: 500 }}>
                {passStep === 0 && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                      {t('profilePage.resetInfoPre', 'Для зміни пароля ми надішлемо код підтвердження на вашу електронну пошту ')} <b>{user.email}</b>.
                    </Alert>
                    <Button
                      onClick={handleRequestCode}
                      variant="outlined"
                      color="warning"
                      size="large"
                      startIcon={passLoading ? <CircularProgress size={20} /> : <Security />}
                      disabled={passLoading}
                      sx={{ borderRadius: 3, fontWeight: 700, px: 4 }}
                    >
                      {passLoading ? t('profilePage.sending', 'Надсилання...') : t('profilePage.changePass', 'Змінити пароль')}
                    </Button>
                  </Box>
                )}

                {passStep === 1 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      {t('profilePage.codeSentTo')} <b>{user.email}</b>
                    </Alert>
                    <TextField
                      label={t('profilePage.codeStr', "Код підтвердження")}
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      inputProps={{ maxLength: 6 }}
                      fullWidth
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button onClick={() => setPassStep(0)} disabled={passLoading} sx={{ fontWeight: 700 }}>{t('common.cancel', 'Скасувати')}</Button>
                      <Button
                        onClick={handleVerifyCode}
                        variant="contained"
                        color="warning"
                        disabled={passLoading || code.length !== 6}
                        sx={{ fontWeight: 700, borderRadius: 3, px: 4 }}
                      >
                        {passLoading ? <CircularProgress size={20} /> : t('profilePage.verifyCode', 'Перевірити код')}
                      </Button>
                    </Box>
                  </Box>
                )}

                {passStep === 2 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>{t('profilePage.codeVerifiedAndPass', 'Код підтверджено. Придумайте новий надійний пароль.')}</Alert>
                    <TextField
                      label={t('profilePage.newPass', 'Новий пароль')}
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      helperText="Мінімум 8 символів"
                      fullWidth
                    />
                    <TextField
                      label={t('registerPage.confirm', 'Підтвердження паролю')}
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                      helperText={confirmPassword.length > 0 && newPassword !== confirmPassword ? t('validation.noMatch', "Паролі не співпадають") : ""}
                      fullWidth
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button onClick={() => setPassStep(0)} disabled={passLoading} sx={{ fontWeight: 700 }}>{t('common.cancel', 'Скасувати')}</Button>
                      <Button
                        onClick={handleResetPassword}
                        variant="contained"
                        color="success"
                        disabled={passLoading || newPassword.length < 8 || newPassword !== confirmPassword}
                        sx={{ fontWeight: 700, borderRadius: 3, px: 4 }}
                      >
                        {passLoading ? <CircularProgress size={20} /> : t('profilePage.savePass', 'Зберегти пароль')}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>

          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
