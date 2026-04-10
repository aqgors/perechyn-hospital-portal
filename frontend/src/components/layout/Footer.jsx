// src/components/layout/Footer.jsx
import { Box, Container, Typography, Link, Divider, useTheme } from '@mui/material';
import { LocalHospital, Phone, Email, LocationOn } from '@mui/icons-material';

export default function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 4,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        color: 'text.secondary',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 4 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <LocalHospital sx={{ fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={700} color="text.primary">Перечинська ЦРЛ</Typography>
            </Box>
            <Typography variant="body2" sx={{ maxWidth: 300, lineHeight: 1.7 }}>
              Комунальне некомерційне підприємство «Перечинська центральна районна лікарня» Перечинської районної ради.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom color="text.primary">Контакти</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" color="primary" />
                <Typography variant="body2">+38 (03145) 2-12-34</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" color="primary" />
                <Link href="mailto:info@perechyn-hospital.gov.ua" color="primary" underline="hover" variant="body2">
                  info@perechyn-hospital.gov.ua
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn fontSize="small" color="primary" sx={{ mt: 0.2 }} />
                <Typography variant="body2">89100, Закарпатська обл., м. Перечин, вул. Лікарняна, 1</Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom color="text.primary">Посилання</Typography>
            {['Портал державних послуг', 'МОЗ України', 'Закарпатська ОДА'].map((label) => (
              <Typography key={label} variant="body2" sx={{ mb: 0.5 }}>{label}</Typography>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption">
            © {new Date().getFullYear()} Перечинська ЦРЛ. Усі права захищені.
          </Typography>
          <Typography variant="caption">
            Розроблено для автоматизації роботи лікарні
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
