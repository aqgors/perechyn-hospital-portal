// src/pages/user/ProfilePage.jsx
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Container, Grid, Paper, Typography, TextField, Button,
  Avatar, Divider, Alert, Chip, CircularProgress,
} from '@mui/material';
import { Person, Lock, Save } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import { authApi } from '../../api/auth.api.js';
import { fetchMe } from '../../store/authSlice.js';
import toast from 'react-hot-toast';

const ROLE_LABELS = { ADMIN: 'Адміністратор', DOCTOR: 'Лікар', USER: 'Пацієнт' };
const ROLE_COLORS = { ADMIN: 'error', DOCTOR: 'secondary', USER: 'primary' };

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const profileForm = useForm({ defaultValues: { name: user?.name || '', phone: user?.phone || '' } });
  const passForm = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });

  const onSaveProfile = async (data) => {
    setSaving(true);
    try {
      await authApi.updateMe(data);
      await dispatch(fetchMe());
      toast.success('Профіль оновлено');
    } catch { /* handled by interceptor */ }
    setSaving(false);
  };

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      return toast.error('Паролі не співпадають');
    }
    setChangingPass(true);
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Пароль змінено успішно');
      passForm.reset();
    } catch { /* handled by interceptor */ }
    setChangingPass(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Мій профіль</Typography>

        <Grid container spacing={3}>
          {/* Profile card */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem', fontWeight: 700, mx: 'auto', mb: 2 }}>
                {user?.name?.charAt(0)}
              </Avatar>
              <Typography variant="h6" fontWeight={600}>{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>{user?.email}</Typography>
              <Chip label={ROLE_LABELS[user?.role]} color={ROLE_COLORS[user?.role]} size="small" sx={{ fontWeight: 600 }} />
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Зареєстровано: {new Date(user?.createdAt).toLocaleDateString('uk-UA')}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            {/* Edit profile */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Person color="primary" />
                <Typography variant="h6" fontWeight={600}>Редагувати профіль</Typography>
              </Box>
              <Box component="form" onSubmit={profileForm.handleSubmit(onSaveProfile)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Controller name="name" control={profileForm.control} render={({ field }) => (
                  <TextField {...field} label="Повне ім'я" />
                )} />
                <Controller name="phone" control={profileForm.control} render={({ field }) => (
                  <TextField {...field} label="Телефон" placeholder="+380501234567" />
                )} />
                <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />} disabled={saving} sx={{ alignSelf: 'flex-start' }}>
                  {saving ? 'Збереження...' : 'Зберегти зміни'}
                </Button>
              </Box>
            </Paper>

            {/* Change password */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Lock color="warning" />
                <Typography variant="h6" fontWeight={600}>Зміна паролю</Typography>
              </Box>
              <Box component="form" onSubmit={passForm.handleSubmit(onChangePassword)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Controller name="currentPassword" control={passForm.control} render={({ field }) => (
                  <TextField {...field} label="Поточний пароль" type="password" />
                )} />
                <Controller name="newPassword" control={passForm.control} render={({ field }) => (
                  <TextField {...field} label="Новий пароль" type="password" helperText="Мін. 8 символів, велика літера та цифра" />
                )} />
                <Controller name="confirmPassword" control={passForm.control} render={({ field }) => (
                  <TextField {...field} label="Підтвердження нового паролю" type="password" />
                )} />
                <Button type="submit" variant="outlined" color="warning" startIcon={changingPass ? <CircularProgress size={18} /> : <Lock />} disabled={changingPass} sx={{ alignSelf: 'flex-start' }}>
                  {changingPass ? 'Збереження...' : 'Змінити пароль'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
