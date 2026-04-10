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

const STATUS_OPTIONS = [
  { value: '', label: 'Усі статуси' },
  { value: 'NEW', label: 'Нові' },
  { value: 'IN_PROGRESS', label: 'В обробці' },
  { value: 'DONE', label: 'Виконані' },
  { value: 'REJECTED', label: 'Відхилені' },
];

export default function RegistrarAppealsPage() {
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
      toast.error('Не вдалося завантажити список звернень');
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
    }).catch(() => {});
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
      toast.success('Звернення оновлено');
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Помилка оновлення');
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
          <Typography variant="h4" fontWeight={700}>Управління зверненнями</Typography>
          <Typography color="text.secondary" mt={0.5}>Реєстратура: перегляд черги, призначення спеціальностей та лікарів</Typography>
        </Box>

        {/* Filters */}
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList color="action" fontSize="small" />
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>Фільтри</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth select label="Статус" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} size="small">
                {STATUS_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth select label="Спеціальність" value={filterSpecialtyId} onChange={e => setFilterSpecialtyId(e.target.value)} size="small">
                <MenuItem value="">Усі спеціальності</MenuItem>
                {specialties.map(s => <MenuItem key={s.id} value={s.id}>{s.nameUA}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth size="small"
                label="Пошук пацієнта або теми"
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') load(); }}
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
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Дата</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Пацієнт</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Тема</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Спеціальність</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Лікар</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Дії</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appeals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      Звернень не знайдено
                    </TableCell>
                  </TableRow>
                ) : (
                  appeals.map(item => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.appointmentDate ? new Date(item.appointmentDate).toLocaleDateString('uk-UA') : '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{item.appointmentTime || ''}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{item.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.user?.phone || item.user?.email}</Typography>
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.specialty?.nameUA || <Chip label="Не призначено" size="small" />}</TableCell>
                      <TableCell>{item.doctor?.name || <Chip label="Не призначено" size="small" />}</TableCell>
                      <TableCell><StatusChip status={item.status} /></TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" size="small" onClick={() => openEdit(item)} title="Редагувати">
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
        <DialogTitle fontWeight={700}>Редагування звернення</DialogTitle>
        {selected && (
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>{selected.user?.name}</strong> · {selected.title}
              </Typography>

              <TextField select label="Статус" value={editStatus} onChange={e => setEditStatus(e.target.value)} fullWidth>
                <MenuItem value="NEW">Нове</MenuItem>
                <MenuItem value="IN_PROGRESS">В обробці</MenuItem>
                <MenuItem value="DONE">Виконане</MenuItem>
                <MenuItem value="REJECTED">Відхилене</MenuItem>
              </TextField>

              <TextField select label="Спеціальність" value={editSpecialtyId} onChange={e => { setEditSpecialtyId(e.target.value); setEditDoctorId(''); }} fullWidth>
                <MenuItem value="">— Не призначено —</MenuItem>
                {specialties.map(s => <MenuItem key={s.id} value={s.id}>{s.nameUA}</MenuItem>)}
              </TextField>

              <TextField select label="Лікар" value={editDoctorId} onChange={e => setEditDoctorId(e.target.value)} fullWidth>
                <MenuItem value="">— Не призначено —</MenuItem>
                {filteredDoctors.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
              {editSpecialtyId && filteredDoctors.length === 0 && (
                <Typography variant="caption" color="warning.main">
                  У цій спеціальності поки немає зареєстрованих лікарів
                </Typography>
              )}
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setSelected(null)} color="inherit">Скасувати</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}>
            {saving ? 'Збереження...' : 'Зберегти'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
