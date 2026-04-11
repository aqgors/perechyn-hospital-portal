// src/pages/doctor/DoctorAppealsPage.jsx
import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, CircularProgress, Grid, InputAdornment
} from '@mui/material';
import { Visibility, Phone, Email, Person, Search, FilterList } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import { doctorApi } from '../../api/doctor.api.js';
import toast from 'react-hot-toast';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import { useTranslation } from 'react-i18next';

export default function DoctorAppealsPage() {
  const { t, i18n } = useTranslation();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // Dialog state
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filterStatus) params.status = filterStatus;
      if (filterSearch) params.search = filterSearch;
      const { data } = await doctorApi.getAppeals(params);
      setAppeals(data.data);
    } catch {
      toast.error(t('toast.queueLoadError', 'Не вдалося завантажити чергу звернень'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleOpen = (appeal) => {
    setSelectedAppeal(appeal);
    setStatus(appeal.status);
    setComment('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAppeal(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await doctorApi.handleAppeal(selectedAppeal.id, {
        status,
        message: comment
      });
      toast.success(t('toast.appealProcessed', 'Звернення опрацьовано. ') + (comment.trim() ? t('toast.patientNotified', 'Пацієнта сповіщено електронною поштою.') : ''));
      fetchAppeals();
      handleClose();
    } catch {
      toast.error(t('toast.appealUpdateError', 'Помилка при оновленні звернення'));
    }
    setSaving(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          {t('doctor.queueTitle', 'Черга пацієнтів')}
        </Typography>

        {/* Filters Panel */}
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList color="action" fontSize="small" />
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>{t('common.filters', 'Фільтри')}</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label={t('common.status', 'Статус')}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                size="small"
              >
                <MenuItem value="">{t('doctor.allStatuses', 'Усі статуси')}</MenuItem>
                <MenuItem value="NEW">{t('appeals.statusNew', 'Нові')}</MenuItem>
                <MenuItem value="IN_PROGRESS">{t('appeals.statusInProgress', 'В обробці')}</MenuItem>
                <MenuItem value="DONE">{t('appeals.statusDone', 'Виконані')}</MenuItem>
                <MenuItem value="REJECTED">{t('appeals.statusRejected', 'Відхилені')}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('doctor.searchLabel', 'Пошук пацієнта або теми')}
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchAppeals(); }}
                size="small"
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
              <TableHead sx={{ bgcolor: 'background.paper' }}>
                <TableRow>
                  <TableCell>{t('doctor.dateAndTime', 'Дата та Час')}</TableCell>
                  <TableCell>{t('common.patient', 'Пацієнт')}</TableCell>
                  <TableCell>{t('doctor.appealTheme', 'Тема звернення')}</TableCell>
                  <TableCell>{t('doctor.specialist', 'Спеціаліст')}</TableCell>
                  <TableCell>{t('common.status', 'Статус')}</TableCell>
                  <TableCell align="center">{t('common.actions', 'Дії')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(Array.isArray(appeals) ? appeals : []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      {t('doctor.noActiveAppeals', 'Немає активних звернень за обраними фільтрами')}
                    </TableCell>
                  </TableRow>
                ) : (
                  (Array.isArray(appeals) ? appeals : []).map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {item.appointmentDate ? new Date(item.appointmentDate).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'uk-UA') : t('doctor.noDate', 'Без дати')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.appointmentTime || ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{item.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.user?.phone || t('doctor.noPhone', 'Немає номеру')}</Typography>
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{i18n.language === 'en' ? item.specialty?.nameEN || item.specialty?.nameUA || '—' : item.specialty?.nameUA || '—'}</TableCell>
                      <TableCell>
                        <StatusChip status={item.status} />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" onClick={() => handleOpen(item)}>
                          <Visibility />
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

      {/* Process Appeal Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        {selectedAppeal && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{t('doctor.processAppeal', 'Опрацювання звернення')}</DialogTitle>
            <DialogContent dividers>

              {/* Patient Info Card */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('doctor.patientContacts', 'Контакти пацієнта')}</Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Person color="primary" fontSize="small" />
                    <Typography>{selectedAppeal.user?.name}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone color="primary" fontSize="small" />
                    <Typography>{selectedAppeal.user?.phone || t('doctor.notSpecified', 'Не вказано')}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email color="primary" fontSize="small" />
                    <Typography>{selectedAppeal.user?.email}</Typography>
                  </Box>
                </Box>
              </Paper>

              <Typography variant="h6" gutterBottom>{selectedAppeal.title}</Typography>
              <Typography variant="body1" paragraph>{selectedAppeal.description}</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 4 }}>
                <TextField
                  select
                  label={t('doctor.executionStatus', 'Статус виконання')}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="NEW">{t('common.newAppeal', 'Нове')}</MenuItem>
                  <MenuItem value="IN_PROGRESS">{t('appeals.statusInProgress', 'В обробці')}</MenuItem>
                  <MenuItem value="DONE">{t('appeals.statusDone', 'Виконане')}</MenuItem>
                  <MenuItem value="REJECTED">{t('appeals.statusRejected', 'Відхилене')}</MenuItem>
                </TextField>

                <TextField
                  label={t('doctor.addMessage', "Додати повідомлення (необов'язково)")}
                  multiline
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('doctor.messagePlaceholder', 'Введіть результати огляду, рекомендації або причину скасування...')}
                  fullWidth
                  helperText={t('doctor.messageHelper', 'Це повідомлення буде доступне пацієнту в кабінеті, а також йому надійде email-сповіщення (якщо поле не пусте).')}
                />
              </Box>

            </DialogContent>
            <DialogActions sx={{ p: 2, px: 3 }}>
              <Button onClick={handleClose} color="inherit">{t('common.cancel', 'Скасувати')}</Button>
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={saving}
                startIcon={saving && <CircularProgress size={16} />}
              >
                {t('common.save', 'Зберегти')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <Footer />
    </Box>
  );
}
