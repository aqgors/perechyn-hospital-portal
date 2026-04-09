// src/components/appointments/AppointmentDialog.jsx
import { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Box, TextField, Grid, 
  IconButton, useTheme, Zoom, Divider, CircularProgress
} from '@mui/material';
import { 
  Close, CalendarMonth, AccessTime, Send, 
  CheckCircleOutline 
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { uk, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { createAppeal } from '../../store/appealsSlice.js';
import toast from 'react-hot-toast';

export default function AppointmentDialog({ open, onClose, doctor }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { isLoading } = useSelector((s) => s.appeals);

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const dateLocale = i18n.language === 'en' ? enUS : uk;

  const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  const handleSubmit = async () => {
    if (!time) {
      toast.error(t('appointment.selectTime'));
      return;
    }

    const payload = {
      title: `${t('appealsPage.appointment')}: ${doctor.name}`,
      description: message || t('appointment.submit'),
      doctorId: doctor.id,
      appointmentDate: date.toISOString(),
      appointmentTime: typeof time === 'string' ? time : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const result = await dispatch(createAppeal(payload));
    if (!result.error) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setMessage('');
        setTime(null);
      }, 2000);
    }
  };

  if (!doctor) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      TransitionComponent={Zoom}
      PaperProps={{
        sx: { borderRadius: 4, p: 1 }
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
        <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarMonth color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={800}>{t('appointment.dialogTitle')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('appointment.dialogSubtitle')} <strong>{doctor?.name}</strong>
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}><Close /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: 1 }}>
          {isSuccess ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CheckCircleOutline sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={700}>{t('common.success')}</Typography>
              <Typography color="text.secondary">{t('appointment.success')}</Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth fontSize="small" /> {t('appointment.selectDate')}
                </Typography>
                <DatePicker
                  value={date}
                  onChange={(newValue) => setDate(newValue)}
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                  minDate={new Date()}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime fontSize="small" /> {t('appointment.selectTime')}
                </Typography>
                <TimePicker
                  value={time}
                  onChange={(newValue) => setTime(newValue)}
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                  ampm={false}
                  minutesStep={15}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    {t('common.or', 'АБО')}
                  </Typography>
                </Divider>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {TIME_SLOTS.map((slot) => (
                    <Button 
                      key={slot} 
                      variant={time === slot ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setTime(slot)}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      {slot}
                    </Button>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t('appointment.messageLabel')}
                  placeholder={t('newAppealPage.placeholderDescription')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        {!isSuccess && (
          <DialogActions sx={{ p: 4, pt: 0 }}>
            <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
              sx={{ px: 4, py: 1, borderRadius: 3, fontWeight: 700 }}
            >
              {t('appointment.submit')}
            </Button>
          </DialogActions>
        )}
      </LocalizationProvider>
    </Dialog>
  );
}
