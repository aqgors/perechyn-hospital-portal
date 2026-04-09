// src/pages/user/NewAppealPage.jsx
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext, AssignmentInd, Assignment } from '@mui/icons-material';
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
          <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderRadius: 3, display: 'flex' }}>
            <AssignmentInd sx={{ color: '#fff', fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800}>{t('newAppealPage.title')}</Typography>
            <Typography color="text.secondary">{t('newAppealPage.subtitle')}</Typography>
          </Box>
        </Box>

        <Paper sx={{ p: { xs: 3, sm: 6 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', elevation: 0 }}>
          <AppealForm onSubmit={handleSubmit} isLoading={isLoading} />
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
