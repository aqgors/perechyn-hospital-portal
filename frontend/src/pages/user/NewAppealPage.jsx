// src/pages/user/NewAppealPage.jsx
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext, Description } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import AppealForm from '../../components/appeals/AppealForm.jsx';
import { createAppeal } from '../../store/appealsSlice.js';

export default function NewAppealPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((s) => s.appeals);

  const handleSubmit = async (data) => {
    const result = await dispatch(createAppeal(data));
    if (!result.error) navigate('/appeals');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/dashboard" underline="hover" color="text.secondary">{t('common.dashboard')}</Link>
          <Link component={RouterLink} to="/appeals" underline="hover" color="text.secondary">{t('common.appeals')}</Link>
          <Typography color="text.primary">{t('common.newAppeal')}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderRadius: 2 }}>
            <Description sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700}>{t('newAppealPage.title')}</Typography>
            <Typography color="text.secondary">{t('newAppealPage.subtitle')}</Typography>
          </Box>
        </Box>

        <Paper sx={{ p: { xs: 3, sm: 5 } }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, p: 2, bgcolor: 'info.50', borderRadius: 2, border: '1px solid', borderColor: 'info.200' }}>
            💡 {t('newAppealPage.helperText', 'Ваше звернення буде розглянуто протягом 48 робочих годин. Ви отримаєте відповідь на цьому порталі.')}
          </Typography>
          <AppealForm onSubmit={handleSubmit} isLoading={isLoading} />
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
