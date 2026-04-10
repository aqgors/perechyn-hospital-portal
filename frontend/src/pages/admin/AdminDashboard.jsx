// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Paper, Typography, Avatar, Chip, List, ListItem,
  ListItemText, ListItemAvatar, Divider, Button, CircularProgress,
} from '@mui/material';
import {
  People, Description, CheckCircle, HourglassEmpty, AdminPanelSettings,
  TrendingUp, Warning,
} from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import { adminApi } from '../../api/admin.api.js';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import 'dayjs/locale/en';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { t, i18n } = useTranslation();

  const currentLangCode = i18n.language === 'en' ? 'en' : 'uk';
  dayjs.locale(currentLangCode);

  const [stats, setStats] = useState({
    users: { total: 0 },
    appeals: { total: 0, byStatus: { pending: 0, resolved: 0 } },
    recentAppeals: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      adminApi.getStats().then(({ data }) => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const statCards = [
    { label: t('admin.usersTotal', 'Користувачів'), value: stats?.users?.total || 0, icon: <People />, color: '#1565C0', bg: '#E3F2FD' },
    { label: t('admin.appealsTotal', 'Всього звернень'), value: stats?.appeals?.total || 0, icon: <Description />, color: '#00897B', bg: '#E0F2F1' },
    { label: t('admin.appealsPending', 'Очікують обробки'), value: stats?.appeals?.byStatus?.pending || 0, icon: <HourglassEmpty />, color: '#F57C00', bg: '#FFF3E0' },
    { label: t('admin.appealsResolved', 'Вирішено'), value: stats?.appeals?.byStatus?.resolved || 0, icon: <CheckCircle />, color: '#2E7D32', bg: '#E8F5E9' },
  ];

  const adminLinks = [
    { label: t('admin.manageAppeals', 'Управління зверненнями'), desc: t('admin.manageAppealsDesc', 'Переглядати та відповідати на звернення'), to: '/admin/appeals', icon: <Description />, color: 'primary' },
    ...(user?.role === 'ADMIN'
      ? [
          { label: t('admin.manageUsers', 'Управління користувачами'), desc: t('admin.manageUsersDesc', 'Ролі, статуси, редагування'), to: '/admin/users', icon: <People />, color: 'secondary' },
          { label: t('admin.stats', 'Статистика'), desc: t('admin.statsDesc', 'Аналітика та звіти'), to: '/admin/stats', icon: <TrendingUp />, color: 'success' },
        ]
      : []),
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderRadius: 2 }}>
            <AdminPanelSettings sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700}>{t('admin.title', 'Адміністрування')}</Typography>
            <Chip label={user?.role === 'ADMIN' ? t('common.admin') : t('common.doctor')} color={user?.role === 'ADMIN' ? 'error' : 'secondary'} size="small" sx={{ fontWeight: 600 }} />
          </Box>
        </Box>

        {/* Stats (Admin only) */}
        {user?.role === 'ADMIN' && (
          loading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {statCards.map((s) => (
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
          )
        )}

        <Grid container spacing={3}>
          {/* Admin links */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>{t('admin.sections', 'Розділи адмінки')}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {adminLinks.map((link) => (
                  <Button key={link.to} variant="outlined" color={link.color} fullWidth onClick={() => navigate(link.to)}
                    startIcon={link.icon} sx={{ justifyContent: 'flex-start', py: 1.5, px: 2 }}>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body2" fontWeight={600}>{link.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{link.desc}</Typography>
                    </Box>
                  </Button>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Recent appeals */}
          {stats?.recentAppeals?.length > 0 && (
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>{t('admin.newAppeals', 'Нові звернення')}</Typography>
                  <Button size="small" onClick={() => navigate('/admin/appeals')}>{t('common.all', 'Всі')}</Button>
                </Box>
                <List disablePadding>
                  {stats.recentAppeals.map((appeal, i) => (
                    <Box key={appeal.id}>
                      {i > 0 && <Divider />}
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.50', color: 'primary.main', fontSize: '0.8rem' }}>
                            {appeal.user?.name?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={500} noWrap>{appeal.title}</Typography>}
                          secondary={`${appeal.user?.name} · ${dayjs(appeal.createdAt).format('DD.MM.YYYY')}`}
                        />
                        <StatusChip status={appeal.status} />
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
