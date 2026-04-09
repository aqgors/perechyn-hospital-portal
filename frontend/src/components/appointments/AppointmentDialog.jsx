// src/components/appointments/AppointmentDialog.jsx
import { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, TextField, Grid,
  IconButton, Zoom, Divider, CircularProgress, Chip, Paper
} from '@mui/material';
import {
  Close, CalendarMonth, AccessTime, Send,
  CheckCircleOutline
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { uk, enUS } from 'date-fns/locale';
import { format, isToday, isBefore, parse } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { createAppeal } from '../../store/appealsSlice.js';
import { appealsApi } from '../../api/appeals.api.js';
import toast from 'react-hot-toast';

const ALL_TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

export default function AppointmentDialog({ open, onClose, doctor }) {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { isLoading } = useSelector((s) => s.appeals);

  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  const dateLocale = i18n.language === 'en' ? enUS : uk;

  // Fetch occupied slots when date or doctor changes
  useEffect(() => {
    if (!open || !doctor || !date) return;
    setIsSlotsLoading(true);
    appealsApi.getOccupiedSlots({
      date: format(date, 'yyyy-MM-dd'),
      doctorId: doctor.id,
    }).then(res => {
      setOccupiedSlots(res.data?.occupied || []);
    }).catch(() => setOccupiedSlots([]))
      .finally(() => setIsSlotsLoading(false));
  }, [date, doctor, open]);

  const isSlotPast = (slot) => {
    if (!isToday(date)) return false;
    const slotTime = parse(slot, 'HH:mm', new Date());
    return isBefore(slotTime, new Date());
  };

  const slotsWithState = useMemo(() =>
    ALL_TIME_SLOTS.map(slot => ({
      slot,
      occupied: occupiedSlots.includes(slot),
      past: isSlotPast(slot),
    })),
    [occupiedSlots, date]
  );

  const handleClose = () => {
    setDate(new Date());
    setSelectedTime('');
    setMessage('');
    setIsSuccess(false);
    setOccupiedSlots([]);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedTime) {
      toast.error(t('appointment.selectTime', 'Оберіть час прийому'));
      return;
    }

    const payload = {
      title: `Запис до лікаря: ${doctor.name}`,
      description: message || 'Запис через каталог лікарів',
      specialtyId: doctor.specialtyId,
      doctorId: doctor.id,
      appointmentDate: date.toISOString(),
      appointmentTime: selectedTime,
    };

    const result = await dispatch(createAppeal(payload));
    if (!result.error) {
      setIsSuccess(true);
      setTimeout(handleClose, 2200);
    }
  };

  if (!doctor) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Zoom}
      PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
        <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarMonth color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={800}>{t('appointment.dialogTitle', 'Запис на прийом')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('appointment.dialogSubtitle', 'до')} <strong>{doctor?.name}</strong>
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}><Close /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: 1 }}>
          {isSuccess ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CheckCircleOutline sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={700}>{t('common.success', 'Успішно!')}</Typography>
              <Typography color="text.secondary">{t('appointment.success', 'Ваш запис прийнято!')}</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Date picker */}
              <Grid item xs={12} md={5}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth fontSize="small" /> {t('appointment.selectDate', 'Дата')}
                </Typography>
                <DatePicker
                  value={date}
                  onChange={(val) => { setDate(val); setSelectedTime(''); }}
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                  minDate={new Date()}
                />
              </Grid>

              {/* Time slot grid */}
              <Grid item xs={12} md={7}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime fontSize="small" /> {t('appointment.selectTime', 'Час')}
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, minHeight: 110, bgcolor: 'action.hover' }}>
                  {isSlotsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 90 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                      {slotsWithState.map(({ slot, occupied, past }) => {
                        const disabled = occupied || past;
                        const isSelected = selectedTime === slot;
                        return (
                          <Chip
                            key={slot}
                            label={slot}
                            onClick={() => !disabled && setSelectedTime(slot)}
                            disabled={disabled}
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            size="small"
                            title={occupied ? 'Зайнятий' : past ? 'Час минув' : 'Вільний'}
                            sx={{ fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}
                          />
                        );
                      })}
                    </Box>
                  )}
                </Paper>
                {!selectedTime && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Оберіть вільний часовий слот
                  </Typography>
                )}
              </Grid>

              {/* Message */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t('appointment.messageLabel', 'Повідомлення (за бажанням)')}
                  placeholder="Опишіть причину звернення або побажання..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        {!isSuccess && (
          <DialogActions sx={{ p: 4, pt: 0 }}>
            <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 700 }}>
              {t('common.cancel', 'Скасувати')}
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={isLoading || !selectedTime}
              startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
              sx={{ px: 4, py: 1, borderRadius: 3, fontWeight: 700 }}
            >
              {t('appointment.submit', 'Записатись')}
            </Button>
          </DialogActions>
        )}
      </LocalizationProvider>
    </Dialog>
  );
}
