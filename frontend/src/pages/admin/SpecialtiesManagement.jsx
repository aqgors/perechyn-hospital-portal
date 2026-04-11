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
import { useTranslation } from 'react-i18next';

const EMPTY_FORM = { nameUA: '', nameEN: '' };

export default function SpecialtiesManagement() {
  const { t } = useTranslation();
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
      toast.error(t('toast.loadSpecialtiesError', 'Не вдалося завантажити спеціальності'));
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
      setFormError(t('admin.bothNamesRequired', "Обидві назви (UA та EN) є обов'язковими"));
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await specialtiesApi.update(editing.id, form);
        toast.success(t('toast.specialtyUpdated', 'Спеціальність оновлено'));
      } else {
        await specialtiesApi.create(form);
        toast.success(t('toast.specialtyAdded', 'Спеціальність додано'));
      }
      handleClose();
      load();
    } catch (err) {
      setFormError(err.response?.data?.message ? t(`api.${err.response.data.message}`, err.response.data.message) : t('toast.saveError', 'Помилка збереження'));
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await specialtiesApi.remove(id);
      toast.success(t('toast.specialtyDeleted', 'Спеціальність видалено'));
      setDeleteConfirmId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message ? t(`api.${err.response.data.message}`, err.response.data.message) : t('toast.deleteError', 'Помилка видалення'));
      setDeleteConfirmId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>{t('admin.manageSpecialties', 'Управління спеціальностями')}</Typography>
            <Typography color="text.secondary" mt={0.5}>{t('admin.manageSpecialtiesDesc', 'Довідник медичних спеціальностей для каталогу лікарів та звернень пацієнтів.')}</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ alignSelf: 'center' }}>
            {t('admin.addSpecialty', 'Додати спеціальність')}
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
                    <TableCell sx={{ fontWeight: 700 }}>{t('admin.nameUA', 'Назва (UKR)')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('admin.nameEN', 'Назва (ENG)')}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{t('common.actions', 'Дії')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(Array.isArray(specialties) ? specialties : []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        {t('admin.noSpecialtiesYet', 'Спеціальностей ще немає. Додайте першу!')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    (Array.isArray(specialties) ? specialties : []).map((spec, i) => (
                      <TableRow key={spec.id} hover>
                        <TableCell sx={{ color: 'text.disabled', fontSize: 13 }}>{i + 1}</TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>{spec.nameUA}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="text.secondary">{spec.nameEN}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="primary" onClick={() => handleOpen(spec)} title={t('common.edit', 'Редагувати')}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteConfirmId(spec.id)} title={t('common.delete', 'Видалити')}>
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
        <DialogTitle fontWeight={700}>{editing ? t('admin.editSpecialtyTitle', 'Редагування спеціальності') : t('admin.newSpecialty', 'Нова спеціальність')}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label={t('admin.nameUALabel', 'Назва (Українська) *')}
              value={form.nameUA}
              onChange={(e) => setForm(f => ({ ...f, nameUA: e.target.value }))}
              fullWidth
              autoFocus
              placeholder={t('admin.nameUAPlaceholder', 'наприклад: Кардіологія')}
            />
            <TextField
              label={t('admin.nameENLabel', 'Назва (English) *')}
              value={form.nameEN}
              onChange={(e) => setForm(f => ({ ...f, nameEN: e.target.value }))}
              fullWidth
              placeholder={t('admin.nameENPlaceholder', 'e.g.: Cardiology')}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={handleClose} color="inherit">{t('common.cancel', 'Скасувати')}</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? t('common.saving', 'Збереження...') : (editing ? t('common.update', 'Оновити') : t('common.add', 'Додати'))}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>{t('admin.deleteConfirmTitle', 'Підтвердження видалення')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('admin.deleteSpecialtyMsg', "Ви впевнені, що хочете видалити цю спеціальність? Якщо до неї прив'язані лікарі — видалення буде заблоковано.")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setDeleteConfirmId(null)} color="inherit">{t('common.cancel', 'Скасувати')}</Button>
          <Button variant="contained" color="error" onClick={() => handleDelete(deleteConfirmId)}>
            {t('common.delete', 'Видалити')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
