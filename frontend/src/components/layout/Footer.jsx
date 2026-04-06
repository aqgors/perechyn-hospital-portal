// src/components/layout/Footer.jsx
import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { LocalHospital, Phone, Email, LocationOn } from '@mui/icons-material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 4,
        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
        color: 'rgba(255,255,255,0.9)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 4 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <LocalHospital sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700}>Перечинська ЦРЛ</Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: 300, lineHeight: 1.7 }}>
              Комунальне некомерційне підприємство «Перечинська центральна районна лікарня» Перечинської районної ради.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Контакти</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" sx={{ opacity: 0.7 }} />
                <Typography variant="body2">+38 (03145) 2-12-34</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" sx={{ opacity: 0.7 }} />
                <Link href="mailto:info@perechyn-hospital.gov.ua" color="inherit" underline="hover" variant="body2">
                  info@perechyn-hospital.gov.ua
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn fontSize="small" sx={{ opacity: 0.7, mt: 0.2 }} />
                <Typography variant="body2">89100, Закарпатська обл., м. Перечин, вул. Лікарняна, 1</Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Посилання</Typography>
            {['Портал державних послуг', 'МОЗ України', 'Закарпатська ОДА'].map((label) => (
              <Typography key={label} variant="body2" sx={{ mb: 0.5, opacity: 0.8 }}>{label}</Typography>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} Перечинська ЦРЛ. Усі права захищені.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Розроблено для автоматизації роботи лікарні
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
