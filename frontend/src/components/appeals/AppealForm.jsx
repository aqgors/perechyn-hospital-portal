// src/components/appeals/AppealForm.jsx
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box, TextField, MenuItem, Button, Typography,
  CircularProgress, Grid, Chip, Paper
} from '@mui/material';
import { Send, AccessTime } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { uk, enUS } from 'date-fns/locale';
import { format, isToday, isBefore, parse } from 'date-fns';
import specialtiesApi from '../../api/specialties.api.js';
import { doctorsApi } from '../../api/doctors.api.js';
import { appealsApi } from '../../api/appeals.api.js';

const getSchema = (t) => yup.object({
  title: yup.string().min(5, t('validation.min5', 'Мінімум 5 символів')).max(200).required(t('validation.requiredTitle', "Тема є обов'язковою")),
  description: yup.string().min(20, t('validation.min20', 'Мінімум 20 символів')).required(t('validation.requiredDesc', "Опис є обов'язковим")),
  specialtyId: yup.string().required(t('validation.requiredSpec', "Спеціальність обов'язкова")),
  doctorId: yup.string().nullable(),
  appointmentDate: yup.date().required(t('validation.requiredDate', "Дата обов'язкова")),
  appointmentTime: yup.string().required(t('validation.requiredTime', 'Будь ласка, оберіть час прийому')),
});

const ALL_TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

export default function AppealForm({ onSubmit, isLoading, initialData }) {
  const { t, i18n } = useTranslation();
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  const dateLocale = i18n.language === 'en' ? enUS : uk;

  const buildDefaults = (data) => {
    if (!data) return {
      title: '', description: '', specialtyId: '', doctorId: null,
      appointmentDate: new Date(), appointmentTime: '',
    };
    return {
      title: data.title || '',
      description: data.description || '',
      specialtyId: data.specialtyId || data.specialty?.id || '',
      doctorId: data.doctorId || data.doctor?.id || null,
      appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : new Date(),
      appointmentTime: data.appointmentTime || '',
    };
  };

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(getSchema(t)),
    defaultValues: buildDefaults(initialData),
  });

  const selectedSpecialty = watch('specialtyId');
  const selectedDoctor = watch('doctorId');
  const selectedDate = watch('appointmentDate');
  const selectedTime = watch('appointmentTime');

  // Load all specialties + doctors once
  useEffect(() => {
    specialtiesApi.getAll().then(res => {
      const list = res.data?.data || res.data || [];
      const safeList = Array.isArray(list) ? list : [];
      const unique = Array.from(new Map(safeList.map(item => [item.id, item])).values());
      setSpecialties(unique);
    }).catch(console.error);
    doctorsApi.getDoctors().then(res => setDoctors(Array.isArray(res.data) ? res.data : [])).catch(console.error);
  }, []);

  // Filter doctors by specialty
  useEffect(() => {
    if (selectedSpecialty) {
      const filtered = doctors.filter(d => d.specialtyId === selectedSpecialty);
      setFilteredDoctors(filtered);
      // Reset doctor if it doesn't belong to the new specialty
      const currentDoc = doctors.find(d => d.id === selectedDoctor);
      if (currentDoc && currentDoc.specialtyId !== selectedSpecialty) {
        setValue('doctorId', null);
      }
    } else {
      setFilteredDoctors([]);
      setValue('doctorId', null);
    }
    setValue('appointmentTime', '');
  }, [selectedSpecialty, doctors, setValue]);

  // Fetch occupied slots when date or doctor/specialty changes
  useEffect(() => {
    if (!selectedDate || (!selectedDoctor && !selectedSpecialty)) return;
    setIsSlotsLoading(true);
    appealsApi.getOccupiedSlots({
      date: format(selectedDate, 'yyyy-MM-dd'),
      doctorId: selectedDoctor || undefined,
      specialtyId: selectedDoctor ? undefined : selectedSpecialty,
    }).then(res => {
      setOccupiedSlots(res.data?.occupied || []);
    }).catch(() => setOccupiedSlots([]))
      .finally(() => setIsSlotsLoading(false));
  }, [selectedDate, selectedDoctor, selectedSpecialty]);

  // Determine if a slot is in the past for today
  const isSlotPast = (slot) => {
    if (!selectedDate || !isToday(selectedDate)) return false;
    const slotTime = parse(slot, 'HH:mm', new Date());
    return isBefore(slotTime, new Date());
  };

  const availableSlots = useMemo(() =>
    (Array.isArray(ALL_TIME_SLOTS) ? ALL_TIME_SLOTS : []).map(slot => ({
      slot,
      occupied: (Array.isArray(occupiedSlots) ? occupiedSlots : []).includes(slot),
      past: isSlotPast(slot),
    })),
    [occupiedSlots, selectedDate]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Title */}
        <Controller name="title" control={control} render={({ field }) => (
          <TextField
            {...field}
            label={t('newAppealPage.formTitle', 'Тема звернення')}
            error={!!errors.title}
            helperText={errors.title?.message}
            fullWidth
          />
        )} />

        {/* Specialty + Doctor */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Controller name="specialtyId" control={control} render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label={t('newAppealPage.formSpecialty', 'Спеціальність *')}
                error={!!errors.specialtyId}
                helperText={errors.specialtyId?.message}
                value={field.value || ''}
              >
                {(Array.isArray(specialties) ? specialties : []).length > 0
                  ? (Array.isArray(specialties) ? specialties : []).map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      {i18n.language === 'en' ? s.nameEN : s.nameUA}
                    </MenuItem>
                  ))
                  : <MenuItem disabled>{t('common.loading', 'Завантаження...')}</MenuItem>
                }
              </TextField>
            )} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="doctorId" control={control} render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label={t('newAppealPage.formDoctor', "Лікар (необов'язково)")}
                error={!!errors.doctorId}
                helperText={errors.doctorId?.message}
                disabled={!selectedSpecialty}
                value={field.value || ''}
                onChange={e => field.onChange(e.target.value || null)}
              >
                <MenuItem value="">
                  <em>{t('appeals.noDoctorAssigned', '— Не вказано (буде призначено) —')}</em>
                </MenuItem>
                {(Array.isArray(filteredDoctors) ? filteredDoctors : []).length > 0
                  ? (Array.isArray(filteredDoctors) ? filteredDoctors : []).map(d => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))
                  : <MenuItem disabled>
                    {selectedSpecialty
                      ? t('appeals.noDoctorsForSpec', 'Лікарів не знайдено для цієї спеціальності')
                      : t('appeals.chooseSpecFirst', 'Спочатку оберіть спеціальність')}
                  </MenuItem>
                }
              </TextField>
            )} />
          </Grid>
        </Grid>

        {/* Date + Time slots */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5}>
            <Controller name="appointmentDate" control={control} render={({ field }) => (
              <DatePicker
                {...field}
                label={t('appointment.selectDate', 'Дата запису')}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.appointmentDate,
                    helperText: errors.appointmentDate?.message
                  }
                }}
                onChange={(val) => {
                  field.onChange(val);
                  setValue('appointmentTime', '');
                }}
              />
            )} />
          </Grid>
          <Grid item xs={12} sm={7}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 14 }} />
              {t('appointment.selectTime', 'Оберіть час')}
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, minHeight: 110, bgcolor: 'action.hover' }}>
              {isSlotsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 90 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {(Array.isArray(availableSlots) ? availableSlots : []).map(({ slot, occupied, past }) => {
                    const disabled = occupied || past;
                    const isSelected = selectedTime === slot;
                    return (
                      <Chip
                        key={slot}
                        label={slot}
                        onClick={() => !disabled && setValue('appointmentTime', slot)}
                        disabled={disabled}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        size="small"
                        title={occupied ? t('appeals.slotOccupied', 'Зайнятий') : past ? t('appeals.slotPast', 'Час минув') : ''}
                        sx={{
                          fontWeight: 700,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          fontSize: '0.75rem',
                        }}
                      />
                    );
                  })}
                </Box>
              )}
              {errors.appointmentTime && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.appointmentTime.message}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Description */}
        <Controller name="description" control={control} render={({ field }) => (
          <TextField
            {...field}
            label={t('newAppealPage.formDescription', 'Опис звернення')}
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description?.message}
            fullWidth
          />
        )} />

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
          sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
        >
          {initialData ? t('common.save', 'Зберегти') : t('newAppealPage.submit', 'Подати звернення')}
        </Button>
      </Box>
    </LocalizationProvider>
  );
}
