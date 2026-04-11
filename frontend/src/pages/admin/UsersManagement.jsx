// src/pages/admin/UsersManagement.jsx
import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, TextField, Pagination, Avatar,
  InputAdornment, IconButton, Select, FormControl, Alert,
} from '@mui/material';
import { Edit, Search, Delete } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import { adminApi } from '../../api/admin.api.js';
import specialtiesApi from '../../api/specialties.api.js';
import { RoleChip } from '../../components/common/StatusChip.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import 'dayjs/locale/en';
import { useTranslation } from 'react-i18next';

export default function UsersManagement() {
  const { t, i18n } = useTranslation();
  
  const currentLangCode = i18n.language === 'en' ? 'en' : 'uk';
  dayjs.locale(currentLangCode);

  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('USER');
  const [specialtyId, setSpecialtyId] = useState('');
  const [bioUA, setBioUA] = useState('');
  const [bioEN, setBioEN] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    specialtiesApi.getAll().then(({ data }) => setSpecialties(data.data)).catch(() => { });
  }, []);

  const load = () => {
    setLoading(true);
    adminApi.getUsers({ page, limit: 15, ...(search && { search }) })
      .then(({ data }) => { setUsers(data.data); setMeta(data.meta); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const openEdit = (user) => {
    setSelected(user);
    setNewRole(user.role);
    setSpecialtyId(user.specialtyId || '');
    setBioUA(user.bioUA || '');
    setBioEN(user.bioEN || '');
    setPhotoUrl(user.photoUrl || '');
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    // Validate: DOCTOR requires specialtyId
    if (newRole === 'DOCTOR' && !specialtyId) {
      setFormError('Для ролі Лікар обов\'язково виберіть спеціальність лікаря');
      return;
    }
    setSaving(true);
    try {
      const updateData = { role: newRole };
      if (newRole === 'DOCTOR') {
        updateData.specialtyId = specialtyId || null;
        updateData.bioUA = bioUA;
        updateData.bioEN = bioEN;
        updateData.photoUrl = photoUrl;
      }
      await adminApi.updateUser(selected.id, updateData);
      toast.success(t('toast.roleUpdated', 'Роль оновлено'));
      setDialogOpen(false);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.deleteUserConfirm', 'Видалити користувача? Всі його звернення також буде видалено.'))) return;
    try {
      await adminApi.deleteUser(id);
      toast.success(t('toast.userDeleted', 'Користувача видалено'));
      load();
    } catch { }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>{t('admin.manageUsers', 'Управління користувачами')}</Typography>
        <Typography color="text.secondary" mb={3}>{t('admin.totalUsers', 'Всього: {{total}} користувачів', { total: meta.total })}</Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder={t('admin.searchUsers', 'Пошук за іменем або email...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ flex: 1, maxWidth: 400 }}
          />
        </Box>

        <Paper>
          {loading ? <LoadingSpinner /> : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700 }}>{t('common.user', 'Користувач')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('common.email', 'Email')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('common.role', 'Роль')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('admin.dateJoined', 'Дата реєстрації')}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{t('common.actions', 'Дії')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(Array.isArray(users) ? users : []).map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: user.role === 'ADMIN' ? 'error.main' : 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
                            {user.name?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>{user.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2">{user.email}</Typography></TableCell>
                      <TableCell><RoleChip role={user.role} /></TableCell>
                      <TableCell><Typography variant="caption">{dayjs(user.createdAt).format('DD.MM.YYYY')}</Typography></TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={() => openEdit(user)} title={t('common.edit', 'Змінити')}><Edit /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(user.id)} title={t('common.delete', 'Видалити')}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(Array.isArray(users) ? users : []).length === 0 && (
                    <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>{t('admin.noUsersFound', 'Користувачів не знайдено')}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {meta.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination count={meta.pages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </Box>
        )}
      </Container>
      <Footer />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>{t('admin.changeRoleTitle', 'Зміна ролі')}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          {selected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">{selected.name} · {selected.email}</Typography>
              <TextField select label={t('common.role', 'Роль')} value={newRole} onChange={(e) => { setNewRole(e.target.value); setFormError(''); }} fullWidth>
                <MenuItem value="USER">{t('common.patient', 'Пацієнт')} (USER)</MenuItem>
                <MenuItem value="ADMIN">{t('common.admin', 'Адміністратор')} (ADMIN)</MenuItem>
                <MenuItem value="DOCTOR">{t('common.doctor', 'Лікар')} (DOCTOR)</MenuItem>
                <MenuItem value="REGISTRAR">{t('common.registrar', 'Реєстратура')} (REGISTRAR)</MenuItem>
              </TextField>

              {newRole === 'DOCTOR' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="primary">{t('admin.docProfileCatalog', 'Профіль лікаря (публічний каталог)')}</Typography>
                  <TextField
                    select
                    label={t('common.specialty', 'Спеціальність *')}
                    value={specialtyId}
                    onChange={(e) => { setSpecialtyId(e.target.value); setFormError(''); }}
                    fullWidth
                    error={Boolean(formError && !specialtyId)}
                    helperText={formError && !specialtyId ? formError : ''}
                  >
                    {(Array.isArray(specialties) ? specialties : []).map(s => <MenuItem key={s.id} value={s.id}>{i18n.language === 'en' ? s.nameEN : s.nameUA}</MenuItem>)}
                  </TextField>
                  <TextField label="Photo URL" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} fullWidth />
                  <TextField label={t('admin.docBioUA', 'Біографія (UKR)')} multiline rows={3} value={bioUA} onChange={(e) => setBioUA(e.target.value)} fullWidth />
                  <TextField label={t('admin.docBioEN', 'Біографія (ENG)')} multiline rows={3} value={bioEN} onChange={(e) => setBioEN(e.target.value)} fullWidth />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel', 'Скасувати')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? t('common.saving', 'Збереження...') : t('common.save', 'Зберегти')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
