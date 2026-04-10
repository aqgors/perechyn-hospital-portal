import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function StatusChip({ status }) {
  const { t } = useTranslation();
  
  const STATUS_CONFIG = {
    NEW:         { label: t('appeals.statusNew', 'Нове'),       color: 'info'    },
    IN_PROGRESS: { label: t('appeals.statusInProgress', 'В обробці'), color: 'warning' },
    DONE:        { label: t('appeals.statusDone', 'Виконано'),  color: 'success' },
    REJECTED:    { label: t('appeals.statusRejected', 'Відхилено'), color: 'error'   },
  };

  const cfg = STATUS_CONFIG[status] || { label: status, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
}

export function RoleChip({ role }) {
  const { t } = useTranslation();
  
  const ROLE_CONFIG = {
    ADMIN:     { label: t('common.admin', 'Адміністратор'), color: 'error'   },
    USER:      { label: t('common.patient', 'Пацієнт'),       color: 'primary' },
    DOCTOR:    { label: t('common.doctor', 'Лікар'),         color: 'secondary' },
    REGISTRAR: { label: t('common.registrar', 'Реєстратура'), color: 'warning' }
  };

  const cfg = ROLE_CONFIG[role] || { label: role, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
}
