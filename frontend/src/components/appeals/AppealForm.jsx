// src/components/appeals/AppealForm.jsx
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, TextField, MenuItem, Button, Typography, CircularProgress } from '@mui/material';
import { Send } from '@mui/icons-material';

const schema = yup.object({
  title: yup.string().min(5, 'Мінімум 5 символів').max(200).required('Тема є обов\'язковою'),
  description: yup.string().min(20, 'Мінімум 20 символів').required('Опис є обов\'язковим'),
  category: yup.string().required(),
  priority: yup.string().required(),
});

const CATEGORIES = [
  { value: 'GENERAL', label: 'Загальне' },
  { value: 'COMPLAINT', label: 'Скарга' },
  { value: 'SUGGESTION', label: 'Пропозиція' },
  { value: 'REQUEST', label: 'Запит' },
  { value: 'MEDICAL', label: 'Медичне питання' },
  { value: 'ADMINISTRATIVE', label: 'Адміністративне' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Низький' },
  { value: 'MEDIUM', label: 'Середній' },
  { value: 'HIGH', label: 'Високий' },
  { value: 'URGENT', label: 'Терміново' },
];

export default function AppealForm({ onSubmit, isLoading }) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: '', description: '', category: 'GENERAL', priority: 'MEDIUM' },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Controller name="title" control={control} render={({ field }) => (
        <TextField {...field} label="Тема звернення" error={!!errors.title} helperText={errors.title?.message} placeholder="Коротко опишіть суть вашого звернення" />
      )} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Controller name="category" control={control} render={({ field }) => (
          <TextField {...field} select label="Категорія" error={!!errors.category} helperText={errors.category?.message}>
            {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
          </TextField>
        )} />

        <Controller name="priority" control={control} render={({ field }) => (
          <TextField {...field} select label="Пріоритет" error={!!errors.priority} helperText={errors.priority?.message}>
            {PRIORITIES.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
          </TextField>
        )} />
      </Box>

      <Controller name="description" control={control} render={({ field }) => (
        <TextField
          {...field}
          label="Детальний опис"
          multiline
          rows={6}
          error={!!errors.description}
          helperText={errors.description?.message || `${field.value.length} / мінімум 20 символів`}
          placeholder="Детально опишіть вашу проблему або запит..."
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
