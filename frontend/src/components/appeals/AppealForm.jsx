// src/components/appeals/AppealForm.jsx
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, TextField, MenuItem, Button, Typography, CircularProgress } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const schema = yup.object({
  title: yup.string().min(5, 'Мінімум 5 символів').max(200).required('Тема є обов\'язковою'),
  description: yup.string().min(20, 'Мінімум 20 символів').required('Опис є обов\'язковим'),
  priority: yup.string().required(),
});

const PRIORITIES = [
  { value: 'LOW', label: 'common.priorityLow', fallback: 'Низький' },
  { value: 'MEDIUM', label: 'common.priorityMedium', fallback: 'Середній' },
  { value: 'HIGH', label: 'common.priorityHigh', fallback: 'Високий' },
  { value: 'URGENT', label: 'common.priorityUrgent', fallback: 'Терміново' },
];

export default function AppealForm({ onSubmit, isLoading }) {
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: '', description: '', priority: 'MEDIUM' },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Controller name="title" control={control} render={({ field }) => (
        <TextField {...field} label={t('newAppealPage.formTitle')} error={!!errors.title} helperText={errors.title?.message} placeholder={t('newAppealPage.placeholderTitle')} />
      )} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr' }, gap: 2 }}>
        <Controller name="priority" control={control} render={({ field }) => (
          <TextField {...field} select label={t('newAppealPage.formPriority')} error={!!errors.priority} helperText={errors.priority?.message}>
            {PRIORITIES.map((p) => <MenuItem key={p.value} value={p.value}>{t(p.label, p.fallback)}</MenuItem>)}
          </TextField>
        )} />
      </Box>

      <Controller name="description" control={control} render={({ field }) => (
        <TextField
          {...field}
          label={t('newAppealPage.formDescription')}
          multiline
          rows={6}
          error={!!errors.description}
          helperText={errors.description?.message || `${field.value.length} / ${t('common.minChars', 'мінімум 20 символів')}`}
          placeholder={t('newAppealPage.placeholderDescription')}
        />
      )} />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
        sx={{ alignSelf: 'flex-start', px: 4 }}
      >
        {isLoading ? 'Подається...' : 'Подати звернення'}
      </Button>
    </Box>
  );
}
