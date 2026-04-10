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

export default function DoctorAppealsPage() {
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
      toast.error('Не вдалося завантажити чергу звернень');
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
      toast.success('Звернення опрацьовано. ' + (comment.trim() ? 'Пацієнта сповіщено електронною поштою.' : ''));
      fetchAppeals();
      handleClose();
    } catch {
      toast.error('Помилка при оновленні звернення');
    }
    setSaving(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          Черга пацієнтів
        </Typography>

        {/* Filters Panel */}
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList color="action" fontSize="small" />
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>Фільтри</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Статус"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                size="small"
              >
                <MenuItem value="">Усі статуси</MenuItem>
                <MenuItem value="NEW">Нові</MenuItem>
                <MenuItem value="IN_PROGRESS">В обробці</MenuItem>
                <MenuItem value="DONE">Виконані</MenuItem>
                <MenuItem value="REJECTED">Відхилені</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Пошук пацієнта або теми"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchAppeals(); }}
                size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                placeholder="Enter — пошук..."
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
                  <TableCell>Дата та Час</TableCell>
                  <TableCell>Пацієнт</TableCell>
                  <TableCell>Тема звернення</TableCell>
                  <TableCell>Спеціаліст</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="center">Дії</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appeals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      Немає активних звернень за обраними фільтрами
                    </TableCell>
                  </TableRow>
                ) : (
                  appeals.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {item.appointmentDate ? new Date(item.appointmentDate).toLocaleDateString() : 'Без дати'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.appointmentTime || ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{item.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.user?.phone || 'Немає номеру'}</Typography>
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.specialty?.nameUA || '—'}</TableCell>
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
            <DialogTitle sx={{ fontWeight: 700 }}>Опрацювання звернення</DialogTitle>
            <DialogContent dividers>

              {/* Patient Info Card */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Контакти пацієнта</Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Person color="primary" fontSize="small" />
                    <Typography>{selectedAppeal.user?.name}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone color="primary" fontSize="small" />
                    <Typography>{selectedAppeal.user?.phone || 'Не вказано'}</Typography>
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
                  label="Статус виконання"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="NEW">Нове</MenuItem>
                  <MenuItem value="IN_PROGRESS">В обробці / Очікує</MenuItem>
                  <MenuItem value="DONE">Виконане / Прийнято</MenuItem>
                  <MenuItem value="REJECTED">Відхилене / Скасоване</MenuItem>
                </TextField>

                <TextField
                  label="Додати повідомлення (необов'язково)"
                  multiline
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Введіть результати огляду, рекомендації або причину скасування..."
                  fullWidth
                  helperText="Це повідомлення буде доступне пацієнту в кабінеті, а також йому надійде email-сповіщення (якщо поле не пусте)."
                />
              </Box>

            </DialogContent>
            <DialogActions sx={{ p: 2, px: 3 }}>
              <Button onClick={handleClose} color="inherit">Скасувати</Button>
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={saving}
                startIcon={saving && <CircularProgress size={16} />}
              >
                Зберегти
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <Footer />
    </Box>
  );
}
