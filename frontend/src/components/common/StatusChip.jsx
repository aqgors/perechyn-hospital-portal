// src/components/common/StatusChip.jsx
import { Chip } from '@mui/material';

const STATUS_CONFIG = {
  NEW:         { label: 'Нове',       color: 'info'    },
  IN_PROGRESS: { label: 'В обробці', color: 'warning' },
  DONE:        { label: 'Виконано',  color: 'success' },
};

const ROLE_CONFIG = {
  ADMIN: { label: 'Адміністратор', color: 'error'   },
  USER:  { label: 'Пацієнт',       color: 'primary' },
};

export function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
}

export function RoleChip({ role }) {
  const cfg = ROLE_CONFIG[role] || { label: role, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
}

export function CategoryChip({ category }) {
  if (!category) return null;
  const labels = {
    GENERAL: 'Загальне', COMPLAINT: 'Скарга', SUGGESTION: 'Пропозиція',
    REQUEST: 'Запит', MEDICAL: 'Медичне', ADMINISTRATIVE: 'Адміністративне'
  };
  return <Chip label={labels[category] || category} size="small" variant="outlined" sx={{ fontWeight: 500 }} />;
}

export function PriorityChip({ priority }) {
  if (!priority) return null;
  const labels = { LOW: 'Низький', MEDIUM: 'Середній', HIGH: 'Високий' };
  const colors = { LOW: 'success', MEDIUM: 'warning', HIGH: 'error' };
  return <Chip label={labels[priority] || priority} color={colors[priority] || 'default'} size="small" variant="outlined" sx={{ fontWeight: 500 }} />;
}
