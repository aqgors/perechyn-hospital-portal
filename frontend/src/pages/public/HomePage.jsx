import { Box, Container, Typography, Button, Grid, Paper, Chip, useTheme } from '@mui/material';
import {
  LocalHospital, Description, Security, Speed, PhoneInTalk,
  CheckCircle, ArrowForward,
} from '@mui/icons-material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import DoctorCatalog from '../../components/home/DoctorCatalog.jsx';

const getFeatures = (t) => [
  { icon: <Description sx={{ fontSize: 32, color: '#1E88E5' }} />, title: t('homePage.feature1Title', 'Реєстрація звернень'), desc: t('homePage.feature1Desc', 'Подавайте звернення онлайн 24/7 без необхідності відвідувати лікарню особисто') },
  { icon: <Speed sx={{ fontSize: 32, color: '#00897B' }} />, title: t('homePage.feature2Title', 'Швидка обробка'), desc: t('homePage.feature2Desc', 'Ваші звернення опрацьовуються оперативно. Відстежуйте статус у реальному часі') },
  { icon: <Security sx={{ fontSize: 32, color: '#F57C00' }} />, title: t('homePage.feature3Title', 'Безпека даних'), desc: t('homePage.feature3Desc', 'Ваші персональні дані захищені сучасними стандартами безпеки та шифрування') },
  { icon: <PhoneInTalk sx={{ fontSize: 32, color: '#D32F2F' }} />, title: t('homePage.feature4Title', "Зворотній зв'язок"), desc: t('homePage.feature4Desc', 'Отримуйте відповіді від лікарів та адміністрації безпосередньо на порталі') },
];

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const features = getFeatures(t);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'REGISTRAR') navigate('/registrar/appeals', { replace: true });
      if (user?.role === 'DOCTOR') navigate('/doctor/appeals', { replace: true });
      if (user?.role === 'ADMIN') navigate('/admin/stats', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      {/* Hero */}
      <Box
        sx={{
          background: isDark ? 'linear-gradient(135deg, #0B0F19 0%, #111827 100%)' : 'linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #1E88E5 100%)',
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
              <Chip label={t('homePage.officialPortalLabel', '🏥 Офіційний портал лікарні')} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', mb: 3, fontWeight: 600 }} />
              <Typography variant="h1" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2.2rem', md: '3rem' } }}>
                {t('homePage.heroTitlePre')} <br />
                <Box component="span" sx={{ color: '#90CAF9' }}>{t('homePage.heroTitleFocus')}</Box>
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: 400, maxWidth: 500 }}>
                {t('homePage.heroSubtitle')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <Button variant="contained" size="large" onClick={() => navigate('/appeals/new')} endIcon={<ArrowForward />}
                    sx={{ bgcolor: '#fff', color: 'primary.dark', '&:hover': { bgcolor: '#E3F2FD' }, px: 4 }}>
                    {t('common.newAppeal')}
                  </Button>
                ) : (
                  <>
                    <Button variant="contained" size="large" component={RouterLink} to="/register" endIcon={<ArrowForward />}
                      sx={{ bgcolor: '#fff', color: 'primary.dark', '&:hover': { bgcolor: '#E3F2FD' }, px: 4 }}>
                      {t('common.register')}
                    </Button>
                    <Button variant="outlined" size="large" component={RouterLink} to="/login"
                      sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                      {t('common.login')}
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
      <Box sx={{ bgcolor: isDark ? 'background.paper' : '#fff', py: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {[
              { value: '2500+', label: t('homePage.stat1Label', 'Пацієнтів щороку') },
              { value: '50+', label: t('homePage.stat2Label', 'Лікарів та медперсоналу') },
              { value: '24/7', label: t('homePage.stat3Label', 'Надання допомоги 24/7') },
              { value: '< 48', label: t('homePage.stat4Label', 'Час обробки звернень') },
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
          <Typography variant="h2" fontWeight={700} gutterBottom>{t('homePage.featuresTitle', 'Можливості порталу')}</Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>{t('homePage.featuresSubtitle', 'Зручні інструменти для взаємодії з лікарнею')}</Typography>
        </Box>
        <Grid container spacing={3}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Paper elevation={0} sx={{ p: 3, height: '100%', textAlign: 'center', border: '1px solid', borderColor: isDark ? 'divider' : 'grey.200', bgcolor: isDark ? 'background.paper' : '#fff', borderRadius: 3, transition: 'all 0.2s', '&:hover': { boxShadow: 4, borderColor: 'primary.light', transform: 'translateY(-4px)' } }}>
                <Box sx={{ mb: 2 }}>{f.icon}</Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Removed Categories Section as per user request */}

      {/* Doctor Catalog Section */}
      <DoctorCatalog />

      {/* CTA */}
      <Box sx={{ bgcolor: 'primary.main', background: isDark ? 'linear-gradient(135deg, #1F2937 0%, #111827 100%)' : 'linear-gradient(135deg, #1565C0 0%, #00897B 100%)', py: 8, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <CheckCircle sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)', mb: 2 }} />
          <Typography variant="h3" fontWeight={700} color="#fff" gutterBottom>{t('homePage.ctaTitle', 'Готові до взаємодії?')}</Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.85)" mb={4}>
            {t('homePage.ctaSubtitle', 'Зареєструйтесь та подавайте звернення онлайн. Ми опрацюємо їх якнайшвидше.')}
          </Typography>
          {!isAuthenticated && (
            <Button variant="contained" size="large" component={RouterLink} to="/register" endIcon={<ArrowForward />}
              sx={{ bgcolor: '#fff', color: 'primary.dark', fontWeight: 700, px: 5, '&:hover': { bgcolor: '#E3F2FD' } }}>
              {t('homePage.ctaStart')}
            </Button>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
