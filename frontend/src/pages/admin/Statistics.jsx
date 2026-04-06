// src/pages/admin/Statistics.jsx
import { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import { adminApi } from '../../api/admin.api.js';

const STATUS_COLORS = { new: '#0288D1', inProgress: '#F57C00', done: '#2E7D32' };
const STATUS_LABELS = { new: 'Нові', inProgress: 'В обробці', done: 'Виконано' };

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(({ data }) => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}><CircularProgress size={56} /></Box>
        <Footer />
      </Box>
    );
  }

  const statusData = stats
    ? Object.entries(stats.requests.byStatus).map(([key, value]) => ({
        name: STATUS_LABELS[key] || key,
        value,
        color: STATUS_COLORS[key] || '#64748B',
      }))
    : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Статистика</Typography>

        {/* Summary cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: 'Всього користувачів', value: stats?.users.total, color: 'primary.main' },
            { label: 'Всього звернень',     value: stats?.requests.total, color: 'info.main'    },
            { label: 'Нових',               value: stats?.requests.byStatus.new, color: '#0288D1' },
            { label: 'В обробці',           value: stats?.requests.byStatus.inProgress, color: 'warning.main' },
            { label: 'Виконано',            value: stats?.requests.byStatus.done, color: 'success.main'  },
          ].map((s) => (
            <Grid item xs={6} md={2.4} key={s.label}>
              <Paper sx={{ p: 2.5, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={800} color={s.color}>{s.value ?? 0}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Pie chart */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, height: 340 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Розподіл за статусами</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={110} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`} labelLine>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Bar chart */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, height: 340 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Звернення за статусами</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={statusData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Кількість" radius={[8, 8, 0, 0]}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
