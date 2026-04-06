// src/pages/public/HomePage.jsx
import { Box, Container, Typography, Button, Grid, Paper, Chip } from '@mui/material';
import {
  LocalHospital, Description, Security, Speed, PhoneInTalk,
  CheckCircle, ArrowForward,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';

const FEATURES = [
  { icon: <Description sx={{ fontSize: 32, color: '#1E88E5' }} />, title: 'Реєстрація звернень', desc: 'Подавайте звернення онлайн 24/7 без необхідності відвідувати лікарню особисто' },
  { icon: <Speed sx={{ fontSize: 32, color: '#00897B' }} />, title: 'Швидка обробка', desc: 'Ваші звернення опрацьовуються оперативно. Відстежуйте статус у реальному часі' },
  { icon: <Security sx={{ fontSize: 32, color: '#F57C00' }} />, title: 'Безпека даних', desc: 'Ваші персональні дані захищені сучасними стандартами безпеки та шифрування' },
  { icon: <PhoneInTalk sx={{ fontSize: 32, color: '#D32F2F' }} />, title: 'Зворотній зв\'язок', desc: 'Отримуйте відповіді від лікарів та адміністрації безпосередньо на порталі' },
];

const CATEGORIES = [
  { label: 'Скарги', color: 'error' }, { label: 'Пропозиції', color: 'success' },
  { label: 'Запити', color: 'primary' }, { label: 'Медичні питання', color: 'secondary' },
  { label: 'Адміністративні', color: 'default' }, { label: 'Загальні', color: 'info' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #1E88E5 100%)',
          color: '#fff',
          py: { xs: 8, md: 14 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip label="🏥 Офіційний портал лікарні" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', mb: 3, fontWeight: 600 }} />
              <Typography variant="h1" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2.2rem', md: '3rem' } }}>
                Перечинська<br />Центральна Районна<br />
                <Box component="span" sx={{ color: '#90CAF9' }}>Лікарня</Box>
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: 400, maxWidth: 500 }}>
                Офіційний вебпортал для реєстрації звернень громадян, отримання медичних послуг та взаємодії з адміністрацією лікарні.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <Button variant="contained" size="large" onClick={() => navigate('/appeals/new')} endIcon={<ArrowForward />}
                    sx={{ bgcolor: '#fff', color: 'primary.dark', '&:hover': { bgcolor: '#E3F2FD' }, px: 4 }}>
                    Подати звернення
                  </Button>
                ) : (
                  <>
                    <Button variant="contained" size="large" component={RouterLink} to="/register" endIcon={<ArrowForward />}
                      sx={{ bgcolor: '#fff', color: 'primary.dark', '&:hover': { bgcolor: '#E3F2FD' }, px: 4 }}>
                      Зареєструватись
                    </Button>
                    <Button variant="outlined" size="large" component={RouterLink} to="/login"
                      sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                      Увійти
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4, p: 4, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <LocalHospital sx={{ fontSize: 120, color: 'rgba(255,255,255,0.7)' }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats */}
      <Box sx={{ bgcolor: '#fff', py: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {[
              { value: '2500+', label: 'Пацієнтів щороку' },
              { value: '50+', label: 'Лікарів та медперсоналу' },
              { value: '24/7', label: 'Надання екстреної допомоги' },
              { value: '< 48 год', label: 'Час обробки звернень' },
            ].map((stat) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="h4" fontWeight={800} color="primary.main">{stat.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" fontWeight={700} gutterBottom>Можливості порталу</Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>Зручні інструменти для взаємодії з лікарнею</Typography>
        </Box>
        <Grid container spacing={3}>
          {FEATURES.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Paper elevation={0} sx={{ p: 3, height: '100%', textAlign: 'center', border: '1px solid', borderColor: 'grey.200', borderRadius: 3, transition: 'all 0.2s', '&:hover': { boxShadow: 4, borderColor: 'primary.light', transform: 'translateY(-4px)' } }}>
                <Box sx={{ mb: 2 }}>{f.icon}</Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>Категорії звернень</Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" mb={4}>Оберіть відповідну категорію при подачі звернення</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
            {CATEGORIES.map((c) => (
              <Chip key={c.label} label={c.label} color={c.color} size="medium" sx={{ fontSize: '0.95rem', px: 1 }} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ bgcolor: 'primary.main', background: 'linear-gradient(135deg, #1565C0 0%, #00897B 100%)', py: 8, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <CheckCircle sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)', mb: 2 }} />
          <Typography variant="h3" fontWeight={700} color="#fff" gutterBottom>Готові до взаємодії?</Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.85)" mb={4}>
            Зареєструйтесь та подавайте звернення онлайн. Ми опрацюємо їх якнайшвидше.
          </Typography>
          {!isAuthenticated && (
            <Button variant="contained" size="large" component={RouterLink} to="/register" endIcon={<ArrowForward />}
              sx={{ bgcolor: '#fff', color: 'primary.dark', fontWeight: 700, px: 5, '&:hover': { bgcolor: '#E3F2FD' } }}>
              Розпочати зараз
            </Button>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
