// src/pages/admin/SpecialtiesManagement.jsx
import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import specialtiesApi from '../../api/specialties.api.js';
import toast from 'react-hot-toast';

const EMPTY_FORM = { nameUA: '', nameEN: '' };

export default function SpecialtiesManagement() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editing, setEditing] = useState(null); // null = create mode
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await specialtiesApi.getAll();
      setSpecialties(data?.data || data || []);
    } catch {
      toast.error('Не вдалося завантажити спеціальності');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (specialty = null) => {
    setEditing(specialty);
    setForm(specialty ? { nameUA: specialty.nameUA, nameEN: specialty.nameEN } : EMPTY_FORM);
    setFormError('');
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleSave = async () => {
    if (!form.nameUA.trim() || !form.nameEN.trim()) {
      setFormError('Обидві назви (UA та EN) є обов\'язковими');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await specialtiesApi.update(editing.id, form);
        toast.success('Спеціальність оновлено');
      } else {
        await specialtiesApi.create(form);
        toast.success('Спеціальність додано');
      }
      handleClose();
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Помилка збереження');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await specialtiesApi.remove(id);
      toast.success('Спеціальність видалено');
      setDeleteConfirmId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Помилка видалення');
      setDeleteConfirmId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Управління спеціальностями</Typography>
            <Typography color="text.secondary" mt={0.5}>Довідник медичних спеціальностей для каталогу лікарів та звернень пацієнтів.</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ alignSelf: 'center' }}>
            Додати спеціальність
          </Button>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Назва (UKR)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Назва (ENG)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Дії</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {specialties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        Спеціальностей ще немає. Додайте першу!
                      </TableCell>
                    </TableRow>
                  ) : (
                    specialties.map((spec, i) => (
                      <TableRow key={spec.id} hover>
                        <TableCell sx={{ color: 'text.disabled', fontSize: 13 }}>{i + 1}</TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>{spec.nameUA}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="text.secondary">{spec.nameEN}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="primary" onClick={() => handleOpen(spec)} title="Редагувати">
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteConfirmId(spec.id)} title="Видалити">
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
      <Footer />

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>{editing ? 'Редагування спеціальності' : 'Нова спеціальність'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Назва (Українська) *"
              value={form.nameUA}
              onChange={(e) => setForm(f => ({ ...f, nameUA: e.target.value }))}
              fullWidth
              autoFocus
              placeholder="наприклад: Кардіологія"
            />
            <TextField
              label="Назва (English) *"
              value={form.nameEN}
              onChange={(e) => setForm(f => ({ ...f, nameEN: e.target.value }))}
              fullWidth
              placeholder="e.g.: Cardiology"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={handleClose} color="inherit">Скасувати</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? 'Збереження...' : (editing ? 'Оновити' : 'Додати')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Підтвердження видалення</DialogTitle>
        <DialogContent>
          <Typography>
            Ви впевнені, що хочете видалити цю спеціальність? Якщо до неї прив'язані лікарі — видалення буде заблоковано.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setDeleteConfirmId(null)} color="inherit">Скасувати</Button>
          <Button variant="contained" color="error" onClick={() => handleDelete(deleteConfirmId)}>
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
