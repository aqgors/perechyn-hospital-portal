// src/components/common/StatusChip.jsx
import { Chip } from '@mui/material';

const STATUS_CONFIG = {
  NEW:         { label: 'Нове',       color: 'info'    },
  IN_PROGRESS: { label: 'В обробці', color: 'warning' },
  DONE:        { label: 'Виконано',  color: 'success' },
  REJECTED:    { label: 'Відхилено', color: 'error'   },
};

const ROLE_CONFIG = {
  ADMIN:  { label: 'Адміністратор', color: 'error'   },
  USER:   { label: 'Пацієнт',       color: 'primary' },
  DOCTOR: { label: 'Лікар',         color: 'secondary' },
};

export function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
}

export function RoleChip({ role }) {
  const cfg = ROLE_CONFIG[role] || { label: role, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
}
