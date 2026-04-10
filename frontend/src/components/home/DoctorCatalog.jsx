// src/components/home/DoctorCatalog.jsx
import { useEffect, useState, useMemo } from 'react';
import { 
  Box, Container, Typography, Tabs, Tab, Grid, 
  Skeleton, useTheme, Fade, TextField, InputAdornment
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Search } from '@mui/icons-material';
import specialtiesApi from '../../api/specialties.api.js';
import { doctorsApi } from '../../api/doctors.api.js';
import DoctorCard from '../doctors/DoctorCard.jsx';
import AppointmentDialog from '../appointments/AppointmentDialog.jsx';

export default function DoctorCatalog() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [specialties, setSpecialties] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDoctor, setBookingDoctor] = useState(null);

  const currentLang = i18n.language === 'en' ? 'EN' : 'UA';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specRes, docRes] = await Promise.all([
          specialtiesApi.getAll(),
          doctorsApi.getDoctors()
        ]);
        setSpecialties(specRes.data?.data || specRes.data || []);
        setAllDoctors(docRes.data?.data || docRes.data || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredDoctors = useMemo(() => {
    if (selectedSpecialty === 'all') return allDoctors;
    return allDoctors.filter(d => d.specialtyId === selectedSpecialty);
  }, [selectedSpecialty, allDoctors]);

  return (
    <Box sx={{ py: 10, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" fontWeight={800} gutterBottom>
            {t('homePage.doctorsTitle')}
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ maxWidth: 700, mx: 'auto' }}>
            {t('homePage.doctorsSubtitle')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', flexGrow: 1, width: '100%' }}>
            <Tabs 
              value={selectedSpecialty} 
              onChange={(_, v) => setSelectedSpecialty(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                '& .MuiTab-root': { fontWeight: 700, fontSize: '1rem', px: 3, py: 2 }
              }}
            >
              <Tab label={t('doctorCatalog.allDoctors')} value="all" />
              {specialties.map(s => (
                <Tab key={s.id} label={s[`name${currentLang}`] || s.nameUA} value={s.id} />
              ))}
            </Tabs>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
              </Grid>
            ))
          ) : filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={3} key={doctor.id} sx={{ display: 'flex' }}>
                <Fade in timeout={500}>
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <DoctorCard 
                      doctor={doctor} 
                      onBook={(doc) => setBookingDoctor(doc)} 
                    />
                  </Box>
                </Fade>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography color="text.secondary">{t('doctorCatalog.noDoctors')}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Booking Dialog */}
      <AppointmentDialog 
        open={Boolean(bookingDoctor)} 
        onClose={() => setBookingDoctor(null)} 
        doctor={bookingDoctor} 
      />
    </Box>
  );
}
