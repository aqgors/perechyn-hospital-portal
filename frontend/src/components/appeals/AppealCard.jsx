// src/components/appeals/AppealCard.jsx
import { Card, CardContent, CardActions, Typography, Box, Button, Divider } from '@mui/material';
import { AccessTime, Edit, Delete, CalendarMonth, LocalHospital, Schedule } from '@mui/icons-material';
import { StatusChip } from '../common/StatusChip.jsx';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
dayjs.locale('uk');

/**
 * Permission rules:
 * NEW         → Edit + Delete
 * IN_PROGRESS → (nothing - read only)
 * DONE        → Delete only
 * REJECTED    → Delete only
 */
export default function AppealCard({ appeal, onEdit, onDelete }) {
  const { t } = useTranslation();

  const canEdit   = appeal.status === 'NEW';
  const canDelete = appeal.status === 'NEW' || appeal.status === 'DONE' || appeal.status === 'REJECTED';

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Title + status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
          <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.3, flex: 1 }}>
            {appeal.title}
          </Typography>
          <StatusChip status={appeal.status} />
        </Box>

        {/* Description preview */}
        <Typography variant="body2" color="text.secondary" sx={{
          mb: 2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '3em'
        }}>
          {appeal.description}
        </Typography>

        {/* Doctor */}
        {appeal.doctor && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
            <LocalHospital fontSize="small" color="primary" />
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                {t('appealsPage.doctor', 'Лікар')}
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {appeal.doctor.name}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Specialty */}
        {appeal.specialty && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
            <LocalHospital fontSize="small" color="secondary" />
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                Спеціальність
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {appeal.specialty?.nameUA}
              </Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ mb: 1.5 }} />

        {/* Appointment date + time */}
        {appeal.appointmentDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <CalendarMonth fontSize="small" sx={{ color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">
              {dayjs(appeal.appointmentDate).format('DD MMMM YYYY')}
              {appeal.appointmentTime && (
                <Box component="span" sx={{ ml: 1 }}>
                  <Schedule sx={{ fontSize: 13, verticalAlign: 'middle', mr: 0.3 }} />
                  {appeal.appointmentTime}
                </Box>
              )}
            </Typography>
          </Box>
        )}

        {/* Created at */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AccessTime fontSize="small" sx={{ color: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary">
            {dayjs(appeal.createdAt).format('DD MMMM YYYY, HH:mm')}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2.5, pb: 2.5, justifyContent: 'flex-end', mt: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canEdit && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<Edit />}
              onClick={() => onEdit(appeal)}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {t('common.edit', 'Редагувати')}
            </Button>
          )}
          {canDelete && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => onDelete(appeal.id)}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {t('common.delete', 'Видалити')}
            </Button>
          )}
        </Box>
      </CardActions>
    </Card>
  );
}
