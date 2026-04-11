// src/pages/user/DashboardPage.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Paper, Typography, Button, List, ListItem,
  ListItemText, ListItemSecondaryAction, Divider, Avatar,
} from '@mui/material';
import { AddCircle, Description, CheckCircle, HourglassEmpty, FiberNew } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import { fetchAppeals } from '../../store/appealsSlice.js';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import 'dayjs/locale/en';
import { useTranslation } from 'react-i18next';
export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { list: appeals, isLoading, meta } = useSelector((s) => s.appeals);
  const { t, i18n } = useTranslation();

  const currentLangCode = i18n.language === 'en' ? 'en' : 'uk';
  dayjs.locale(currentLangCode);

  useEffect(() => {
    dispatch(fetchAppeals({ limit: 5 }));
  }, [dispatch]);

  const newCount      = (Array.isArray(appeals) ? appeals : []).filter((a) => a.status === 'NEW').length;
  const inProgCount   = (Array.isArray(appeals) ? appeals : []).filter((a) => a.status === 'IN_PROGRESS').length;
  const doneCount     = (Array.isArray(appeals) ? appeals : []).filter((a) => a.status === 'DONE').length;

  const stats = [
    { label: t('dashboard.totalAppeals', 'Всього звернень'), value: meta.total,   icon: <Description />,  color: '#1565C0', bg: '#E3F2FD' },
    { label: t('dashboard.newAppeals', 'Нових'),           value: newCount,      icon: <FiberNew />,      color: '#0288D1', bg: '#E1F5FE' },
    { label: t('dashboard.inProgressAppeals', 'В обробці'),       value: inProgCount,   icon: <HourglassEmpty />,color: '#F57C00', bg: '#FFF3E0' },
    { label: t('dashboard.doneAppeals', 'Виконано'),        value: doneCount,     icon: <CheckCircle />,  color: '#2E7D32', bg: '#E8F5E9' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {t('dashboard.greeting', 'Вітаємо, {{name}}! 👋', { name: user?.name?.split(' ')[0] })}
            </Typography>
            <Typography color="text.secondary">
              {user?.role === 'ADMIN' ? t('common.admin') : t('common.patient')} · {dayjs().format('DD MMMM YYYY')}
            </Typography>
          </Box>
          <Button variant="contained" size="large" startIcon={<AddCircle />} onClick={() => navigate('/appeals/new')}>
            {t('common.newAppeal', 'Нове звернення')}
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {(Array.isArray(stats) ? stats : []).map((s) => (
            <Grid item xs={6} md={3} key={s.label}>
              <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: s.bg, color: s.color, width: 48, height: 48 }}>{s.icon}</Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} color={s.color}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Recent appeals */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>{t('dashboard.recentAppeals', 'Останні звернення')}</Typography>
            <Button size="small" onClick={() => navigate('/appeals')}>{t('dashboard.viewAll', 'Переглянути всі')}</Button>
          </Box>

          {isLoading ? (
            <LoadingSpinner />
          ) : (Array.isArray(appeals) ? appeals : []).length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Description sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary" gutterBottom>{t('dashboard.noRecentAppeals', 'У вас ще немає звернень')}</Typography>
              <Button variant="contained" onClick={() => navigate('/appeals/new')} startIcon={<AddCircle />} sx={{ mt: 1 }}>
                {t('dashboard.createFirstAppeal', 'Подати перше звернення')}
              </Button>
            </Box>
          ) : (
            <List disablePadding>
              {(Array.isArray(appeals) ? appeals : []).map((appeal, i) => (
                <Box key={appeal.id}>
                  {i > 0 && <Divider />}
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemText
                      primary={<Typography fontWeight={500}>{appeal.title}</Typography>}
                      secondary={dayjs(appeal.createdAt).format('DD.MM.YYYY')}
                    />
                    <ListItemSecondaryAction>
                      <StatusChip status={appeal.status} />
                    </ListItemSecondaryAction>
                  </ListItem>
                </Box>
              ))}
            </List>
          )}
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
