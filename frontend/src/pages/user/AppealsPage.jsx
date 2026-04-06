// src/pages/user/AppealsPage.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, MenuItem, TextField,
  Pagination, InputAdornment,
} from '@mui/material';
import { AddCircle, Search } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import AppealCard from '../../components/appeals/AppealCard.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { fetchAppeals } from '../../store/appealsSlice.js';

const STATUSES = [
  { value: '', label: 'Всі статуси' },
  { value: 'PENDING', label: 'Очікує' },
  { value: 'IN_PROGRESS', label: 'В обробці' },
  { value: 'RESOLVED', label: 'Вирішено' },
  { value: 'REJECTED', label: 'Відхилено' },
];

const CATEGORIES = [
  { value: '', label: 'Всі категорії' },
  { value: 'GENERAL', label: 'Загальне' },
  { value: 'COMPLAINT', label: 'Скарга' },
  { value: 'SUGGESTION', label: 'Пропозиція' },
  { value: 'REQUEST', label: 'Запит' },
  { value: 'MEDICAL', label: 'Медичне' },
  { value: 'ADMINISTRATIVE', label: 'Адміністративне' },
];

export default function AppealsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: appeals, isLoading, meta } = useSelector((s) => s.appeals);

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    dispatch(fetchAppeals({ page, limit: 9, ...(status && { status }), ...(category && { category }) }));
  }, [dispatch, page, status, category]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>Мої звернення</Typography>
            <Typography color="text.secondary">Всього: {meta.total} звернень</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddCircle />} onClick={() => navigate('/appeals/new')}>
            Нове звернення
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <TextField select label="Статус" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} sx={{ minWidth: 160 }}>
            {STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </TextField>
          <TextField select label="Категорія" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} sx={{ minWidth: 180 }}>
            {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
          </TextField>
        </Box>

        {isLoading ? (
          <LoadingSpinner />
        ) : appeals.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Звернень не знайдено</Typography>
            <Button variant="contained" onClick={() => navigate('/appeals/new')} startIcon={<AddCircle />} sx={{ mt: 2 }}>
              Подати звернення
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {appeals.map((appeal) => (
                <Grid item xs={12} sm={6} md={4} key={appeal.id}>
                  <AppealCard appeal={appeal} />
                </Grid>
              ))}
            </Grid>

            {meta.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination count={meta.pages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="large" />
              </Box>
            )}
          </>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
