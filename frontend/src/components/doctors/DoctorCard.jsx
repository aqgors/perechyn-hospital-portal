// src/components/doctors/DoctorCard.jsx
import { 
  Card, CardContent, CardMedia, Typography, Button, 
  Box, Chip, useTheme, Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CalendarMonth, Star } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function DoctorCard({ doctor, onBook }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  
  const currentLang = i18n.language === 'en' ? 'EN' : 'UA';
  const bio = doctor[`bio${currentLang}`] || doctor.bioUA;
  const specialtyName = doctor.specialty ? (doctor.specialty[`name${currentLang}`] || doctor.specialty.nameUA) : '';

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    onBook(doctor);
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 4,
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px)',
        '& .doctor-image': { transform: 'scale(1.05)' }
      }
    }}>
      {/* Specialty Badge */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
        <Chip 
          label={specialtyName} 
          color="primary" 
          size="small"
          sx={{ 
            fontWeight: 700, 
            px: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(4px)',
            bgcolor: 'primary.main',
          }} 
        />
      </Box>

      {/* Image Container */}
      <Box sx={{ position: 'relative', overflow: 'hidden', height: 260 }}>
        <CardMedia
          className="doctor-image"
          component="img"
          image={doctor.photoUrl || 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=400'}
          alt={doctor.name}
          sx={{ 
            height: '100%', 
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            objectPosition: 'top' 
          }}
        />
        <Box sx={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, 
          height: '40%', 
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' 
        }} />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800} gutterBottom sx={{ lineHeight: 1.2 }}>
            {doctor.name}
          </Typography>
          <Typography 
            variant="subtitle2" 
            color="primary" 
            fontWeight={700} 
            sx={{ 
              textTransform: 'uppercase', 
              letterSpacing: 1,
              fontSize: '0.75rem',
              mb: 1
            }}
          >
            {specialtyName}
          </Typography>
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 3, 
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.6,
            height: '4.8em'
          }}
        >
          {bio}
        </Typography>

        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ mb: 2, opacity: 0.1 }} />
          <Button 
            variant="contained" 
            fullWidth 
            startIcon={<CalendarMonth />}
            onClick={handleBookClick}
            sx={{ 
              borderRadius: 3, 
              py: 1.2,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s'
            }}
          >
            {t('doctorCatalog.bookButton')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
