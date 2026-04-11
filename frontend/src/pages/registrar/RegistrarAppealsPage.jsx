// src/pages/registrar/RegistrarAppealsPage.jsx
import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, TextField, MenuItem, CircularProgress,
  Grid, InputAdornment, Chip
} from '@mui/material';
import { Edit, Search, FilterList } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import registrarApi from '../../api/registrar.api.js';
import specialtiesApi from '../../api/specialties.api.js';
import { doctorsApi } from '../../api/doctors.api.js';
import toast from 'react-hot-toast';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import { useTranslation } from 'react-i18next';

const getStatusOptions = (t) => [
  { value: '', label: t('doctor.allStatuses', 'Усі статуси') },
  { value: 'NEW', label: t('appeals.statusNew', 'Нові') },
  { value: 'IN_PROGRESS', label: t('appeals.statusInProgress', 'В обробці') },
  { value: 'DONE', label: t('appeals.statusDone', 'Виконані') },
  { value: 'REJECTED', label: t('appeals.statusRejected', 'Відхилені') },
];

export default function RegistrarAppealsPage() {
  const { t, i18n } = useTranslation();
  const [appeals, setAppeals] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSpecialtyId, setFilterSpecialtyId] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // Edit dialog
  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editSpecialtyId, setEditSpecialtyId] = useState('');
  const [editDoctorId, setEditDoctorId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filterStatus) params.status = filterStatus;
      if (filterSpecialtyId) params.specialtyId = filterSpecialtyId;
      if (filterSearch) params.search = filterSearch;
      const { data } = await registrarApi.getAppeals(params);
      setAppeals(data.data || []);
    } catch {
      toast.error(t('toast.loadAppealsListError', 'Не вдалося завантажити список звернень'));
    }
    setLoading(false);
  };

  useEffect(() => {
    Promise.all([
      specialtiesApi.getAll(),
      doctorsApi.getDoctors(),
    ]).then(([specRes, docRes]) => {
      setSpecialties(specRes.data?.data || specRes.data || []);
      setDoctors(docRes.data?.data || docRes.data || []);
    }).catch(() => { });
  }, []);

  useEffect(() => { load(); }, [filterStatus, filterSpecialtyId]);

  const openEdit = (appeal) => {
    setSelected(appeal);
    setEditStatus(appeal.status);
    setEditSpecialtyId(appeal.specialtyId || '');
    setEditDoctorId(appeal.doctorId || '');
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await registrarApi.updateAppeal(selected.id, {
        status: editStatus,
        specialtyId: editSpecialtyId || null,
        doctorId: editDoctorId || null,
      });
      toast.success(t('toast.appealUpdated', 'Звернення оновлено'));
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message ? t(`api.${err.response.data.message}`, err.response.data.message) : t('toast.updateError', 'Помилка оновлення'));
    }
    setSaving(false);
  };

  // Filter doctors by selected specialty
  const filteredDoctors = editSpecialtyId
    ? doctors.filter(d => d.specialtyId === editSpecialtyId)
    : doctors;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700}>{t('admin.manageAppealsTitle', 'Управління зверненнями')}</Typography>
          <Typography color="text.secondary" mt={0.5}>{t('admin.manageAppealsSub', 'Реєстратура')}</Typography>
        </Box>

        {/* Filters */}
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList color="action" fontSize="small" />
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>{t('common.filters', 'Фільтри')}</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth select label={t('common.status', 'Статус')} value={filterStatus} onChange={e => setFilterStatus(e.target.value)} size="small">
                {getStatusOptions(t).map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth select label={t('common.specialty', 'Спеціальність')} value={filterSpecialtyId} onChange={e => setFilterSpecialtyId(e.target.value)} size="small">
                <MenuItem value="">{t('admin.allSpecs', 'Усі спеціальності')}</MenuItem>
                {(Array.isArray(specialties) ? specialties : []).map(s => <MenuItem key={s.id} value={s.id}>{i18n.language === 'en' ? s.nameEN : s.nameUA}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth size="small"
                label={t('doctor.searchLabel', 'Пошук пацієнта або теми')}
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') load(); }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                placeholder={t('doctor.searchPlaceholder', 'Enter — пошук...')}
              />
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{t('common.date', 'Дата')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('common.patient', 'Пацієнт')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('doctor.appealTheme', 'Тема')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('common.specialty', 'Спеціальність')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('common.doctor', 'Лікар')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('common.status', 'Статус')}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>{t('common.actions', 'Дії')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(Array.isArray(appeals) ? appeals : []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      {t('appeals.notFound', 'Звернень не знайдено')}
                    </TableCell>
                  </TableRow>
                ) : (
                  (Array.isArray(appeals) ? appeals : []).map(item => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.appointmentDate ? new Date(item.appointmentDate).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'uk-UA') : '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{item.appointmentTime || ''}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{item.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.user?.phone || item.user?.email}</Typography>
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{i18n.language === 'en' ? item.specialty?.nameEN : item.specialty?.nameUA || <Chip label={t('registrar.unassigned', 'Не призначено')} size="small" />}</TableCell>
                      <TableCell>{item.doctor?.name || <Chip label={t('registrar.unassigned', 'Не призначено')} size="small" />}</TableCell>
                      <TableCell><StatusChip status={item.status} /></TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" size="small" onClick={() => openEdit(item)} title={t('common.edit', 'Редагувати')}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
      <Footer />

      {/* Edit Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{t('appeals.editAppeal', 'Редагування звернення')}</DialogTitle>
        {selected && (
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>{selected.user?.name}</strong> · {selected.title}
              </Typography>

              <TextField select label={t('common.status', 'Статус')} value={editStatus} onChange={e => setEditStatus(e.target.value)} fullWidth>
                <MenuItem value="NEW">{t('appeals.statusNew', 'Нове')}</MenuItem>
                <MenuItem value="IN_PROGRESS">{t('appeals.statusInProgress', 'В обробці')}</MenuItem>
                <MenuItem value="DONE">{t('appeals.statusDone', 'Виконане')}</MenuItem>
                <MenuItem value="REJECTED">{t('appeals.statusRejected', 'Відхилене')}</MenuItem>
              </TextField>

              <TextField select label={t('common.specialty', 'Спеціальність')} value={editSpecialtyId} onChange={e => { setEditSpecialtyId(e.target.value); setEditDoctorId(''); }} fullWidth>
                <MenuItem value="">{t('registrar.unassignedDash', '— Не призначено —')}</MenuItem>
                {(Array.isArray(specialties) ? specialties : []).map(s => <MenuItem key={s.id} value={s.id}>{i18n.language === 'en' ? s.nameEN : s.nameUA}</MenuItem>)}
              </TextField>

              <TextField select label={t('common.doctor', 'Лікар')} value={editDoctorId} onChange={e => setEditDoctorId(e.target.value)} fullWidth>
                <MenuItem value="">{t('registrar.unassignedDash', '— Не призначено —')}</MenuItem>
                {(Array.isArray(filteredDoctors) ? filteredDoctors : []).map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
              {editSpecialtyId && filteredDoctors.length === 0 && (
                <Typography variant="caption" color="warning.main">
                  {t('registrar.noDoctorsForSpec', 'У цій спеціальності поки немає зареєстрованих лікарів')}
                </Typography>
              )}
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setSelected(null)} color="inherit">{t('common.cancel', 'Скасувати')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}>
            {saving ? t('common.saving', 'Збереження...') : t('common.save', 'Зберегти')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
