// src/pages/admin/DoctorsManagement.jsx
import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Grid, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, InputAdornment, IconButton
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import DoctorCard from '../../components/doctors/DoctorCard.jsx';
import { doctorsApi } from '../../api/doctors.api.js';
import { adminApi } from '../../api/admin.api.js';
import specialtiesApi from '../../api/specialties.api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import toast from 'react-hot-toast';

export default function DoctorsManagement() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [specialtyId, setSpecialtyId] = useState('');
  const [bioUA, setBioUA] = useState('');
  const [bioEN, setBioEN] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [docRes, specRes] = await Promise.all([
        doctorsApi.getDoctors(), // Public endpoint fetches users with role=DOCTOR
        specialtiesApi.getAll()
      ]);
      setDoctors(docRes.data?.data || docRes.data || []);
      setSpecialties(specRes.data?.data || []);
    } catch (error) {
      toast.error('Помилка завантаження лікарів');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (doc) => {
    setSelectedDoctor(doc);
    setSpecialtyId(doc.specialtyId || '');
    setBioUA(doc.bioUA || '');
    setBioEN(doc.bioEN || '');
    setPhotoUrl(doc.photoUrl || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateUser(selectedDoctor.id, {
        role: 'DOCTOR',
        specialtyId,
        bioUA,
        bioEN,
        photoUrl
      });
      toast.success('Картку лікаря оновлено');
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Не вдалося зберегти зміни');
    }
    setSaving(false);
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Зняти цього користувача з публікації як лікаря? Його роль буде змінено на Пацієнт (USER).')) return;
    try {
      await adminApi.updateUser(id, { role: 'USER' });
      toast.success('Лікаря прибрано з каталогу');
      loadData();
    } catch (error) {
      toast.error('Помилка видалення лікаря');
    }
  };

  // The endpoint currently returns all doctors without search filtering, 
  // so we'll do simple client side filtering for rapid UX
  const filteredDoctors = doctors.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) || 
    d.specialty?.nameUA?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>Каталог лікарів сайту</Typography>
            <Typography color="text.secondary">Управління публічними картками лікарів, що відображаються пацієнтам.</Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => {
              // Creating a doctor requires elevating an existing user.
              // Instruct admin to do it via Users tab.
              window.alert("Щоб додати нового лікаря, перейдіть у вкладку 'Користувачі', знайдіть його акаунт, натисніть 'Редагувати' (олівець) і змініть роль на 'DOCTOR'.");
            }}
          >
            Додати лікаря
          </Button>
        </Box>

        <Box sx={{ mb: 4, maxWidth: 400 }}>
          <TextField
            fullWidth
            placeholder="Пошук за іменем або спеціальністю..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
        </Box>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <Grid container spacing={3}>
            {filteredDoctors.map(doctor => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doctor.id}>
                <DoctorCard 
                  doctor={doctor} 
                  onEdit={handleEdit}
                  onDelete={() => handleRemove(doctor.id)}
                />
              </Grid>
            ))}
            {filteredDoctors.length === 0 && (
              <Grid item xs={12}>
                <Box textAlign="center" py={8}>
                  <Typography variant="h6" color="text.secondary">Лікарів не знайдено</Typography>
                  <Typography variant="body2" color="text.disabled">Спробуйте змінити критерії пошуку</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
      <Footer />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Редагування картки лікаря</DialogTitle>
        <DialogContent dividers>
          {selectedDoctor && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>{selectedDoctor.name}</Typography>
              
              <TextField select label="Спеціальність" value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)} fullWidth>
                <MenuItem value=""><em>Не обрано</em></MenuItem>
                {specialties.map(s => <MenuItem key={s.id} value={s.id}>{s.nameUA}</MenuItem>)}
              </TextField>
              
              <TextField label="Посилання на фото (Photo URL)" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} fullWidth helperText="Додайте пряме посилання на зображення (jpg, png)" />
              <TextField label="Біографія (UKR)" multiline rows={4} value={bioUA} onChange={(e) => setBioUA(e.target.value)} fullWidth />
              <TextField label="Біографія (ENG)" multiline rows={4} value={bioEN} onChange={(e) => setBioEN(e.target.value)} fullWidth />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Скасувати</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Збереження...' : 'Зберегти картку'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
