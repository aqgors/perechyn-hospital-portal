// src/pages/user/AppealsPage.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, 
  Pagination, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Paper, Divider, ToggleButtonGroup, ToggleButton, Chip,
} from '@mui/material';
import { AddCircle, Close, WarningTwoTone, Assignment } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar.jsx';
import { useTranslation } from 'react-i18next';
import Footer from '../../components/layout/Footer.jsx';
import AppealCard from '../../components/appeals/AppealCard.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import AppealForm from '../../components/appeals/AppealForm.jsx';
import { fetchAppeals, deleteAppeal, updateAppeal } from '../../store/appealsSlice.js';

const STATUSES = [
  { value: '',            label: 'Усі',        labelKey: 'appeals.statusAll', color: 'default'  },
  { value: 'NEW',         label: 'Нові',       labelKey: 'appeals.statusNew', color: 'info'     },
  { value: 'IN_PROGRESS', label: 'В обробці',  labelKey: 'appeals.statusInProgress', color: 'warning'  },
  { value: 'DONE',        label: 'Виконано',   labelKey: 'appeals.statusDone', color: 'success'  },
  { value: 'REJECTED',    label: 'Відхилено',  labelKey: 'appeals.statusRejected', color: 'error'    },
];

export default function AppealsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: appeals, isLoading, meta = { total: 0, pages: 0 } } = useSelector((s) => s.appeals);

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  // Modals state
  const [editingAppeal, setEditingAppeal] = useState(null);
  const [deletingAppealId, setDeletingAppealId] = useState(null);

  useEffect(() => {
    dispatch(fetchAppeals({ page, limit: 9, ...(status && { status }) }));
  }, [dispatch, page, status]);

  const handleStatusChange = (_, newStatus) => {
    if (newStatus !== null) {
      setStatus(newStatus);
      setPage(1);
    }
  };

  const handleDelete = async () => {
    if (deletingAppealId) {
      await dispatch(deleteAppeal(deletingAppealId));
      setDeletingAppealId(null);
    }
  };

  const handleUpdate = async (data) => {
    if (editingAppeal) {
      const result = await dispatch(updateAppeal({ id: editingAppeal.id, data }));
      if (!result.error) setEditingAppeal(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1 }}>
        {/* Header */}
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: 3, display: 'flex' }}>
                <Assignment sx={{ color: '#fff', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{t('common.appeals', 'Мої звернення')}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {t('appealsPage.totalAppeals', 'Всього звернень:')} {meta?.total ?? 0}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddCircle />}
              onClick={() => navigate('/appeals/new')}
              sx={{ borderRadius: 3, px: 4, height: 56, fontWeight: 700 }}
            >
              {t('common.newAppeal', 'Нове звернення')}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Status Filter */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              {t('appealsPage.statusFilter', 'Фільтр за статусом:')}
            </Typography>
            <ToggleButtonGroup
              value={status}
              exclusive
              onChange={handleStatusChange}
              sx={{ flexWrap: 'wrap', gap: 1 }}
            >
              {STATUSES.map((s) => (
                <ToggleButton
                  key={s.value}
                  value={s.value}
                  sx={{
                    borderRadius: '20px !important',
                    fontWeight: 700,
                    border: '1px solid !important',
                    px: 2,
                    py: 0.75,
                    '&.Mui-selected': {
                      bgcolor: s.value === '' ? 'grey.800' :
                               s.value === 'NEW' ? '#0288d1' :
                               s.value === 'IN_PROGRESS' ? '#f57c00' :
                               s.value === 'DONE' ? '#388e3c' : '#d32f2f',
                      color: '#fff',
                      '&:hover': { opacity: 0.9 },
                    },
                  }}
                >
                  {t(s.labelKey, s.label)}
                  {s.value === status && meta?.total > 0 && (
                    <Chip
                      label={meta.total}
                      size="small"
                      sx={{ ml: 1, height: 18, fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.3)', color: 'inherit' }}
                    />
                  )}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Paper>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (Array.isArray(appeals) ? appeals : []).length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight={600}>
              {status ? t('appeals.notFoundStatus', `Немає звернень зі статусом "${STATUSES.find(s => s.value === status)?.label}"`) : t('appeals.notFound', 'Звернень не знайдено')}
            </Typography>
            <Typography color="text.disabled" sx={{ mb: 4 }}>
              {t('appeals.noAppealsYet', 'Поки що ви не створювали жодного звернення')}
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/appeals/new')} startIcon={<AddCircle />} size="large" sx={{ borderRadius: 3 }}>
              {t('common.newAppeal', 'Нове звернення')}
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {(Array.isArray(appeals) ? appeals : []).map((appeal) => (
                <Grid item xs={12} sm={6} md={4} key={appeal.id}>
                  <AppealCard appeal={appeal} onEdit={setEditingAppeal} onDelete={setDeletingAppealId} />
                </Grid>
              ))}
            </Grid>

            {(meta?.pages ?? 0) > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={meta.pages}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  color="primary"
                  size="large"
                  sx={{ '& .MuiPaginationItem-root': { fontWeight: 700 } }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Edit Modal */}
      <Dialog open={!!editingAppeal} onClose={() => setEditingAppeal(null)} maxWidth="md" fullWidth scroll="body">
        <DialogTitle sx={{ m: 0, p: 3, fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {t('appeals.editAppeal', 'Редагувати звернення')}
          <IconButton onClick={() => setEditingAppeal(null)} color="secondary"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {editingAppeal && (
            <AppealForm
              initialData={editingAppeal}
              onSubmit={handleUpdate}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingAppealId} onClose={() => setDeletingAppealId(null)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800 }}>
          <WarningTwoTone color="error" /> {t('appeals.deleteConfirmation', 'Видалити звернення?')}
        </DialogTitle>
        <DialogContent>
          <Typography>{t('appeals.deleteWarning', 'Ви впевнені, що хочете видалити це звернення? Цю дію неможливо буде скасувати.')}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeletingAppealId(null)} color="inherit" sx={{ fontWeight: 700 }}>{t('common.cancel', 'Скасувати')}</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ fontWeight: 700, px: 3 }}>
            {t('common.deleteConfirm', 'Так, видалити')}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
}
