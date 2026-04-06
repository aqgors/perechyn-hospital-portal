// src/components/appeals/AppealCard.jsx
import { Card, CardContent, CardActions, Typography, Box, Button, Divider } from '@mui/material';
import { AccessTime, Category } from '@mui/icons-material';
import { StatusChip, CategoryChip, PriorityChip } from '../common/StatusChip.jsx';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
dayjs.locale('uk');

export default function AppealCard({ appeal }) {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
          <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.3, flex: 1 }}>
            {appeal.title}
          </Typography>
          <StatusChip status={appeal.status} />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {appeal.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <CategoryChip category={appeal.category} />
          <PriorityChip priority={appeal.priority} />
        </Box>

        {appeal.response && (
          <Box sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200', borderRadius: 2, p: 1.5, mb: 1 }}>
            <Typography variant="caption" color="success.dark" fontWeight={600}>Відповідь:</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>{appeal.response}</Typography>
          </Box>
        )}

        <Divider sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AccessTime fontSize="small" sx={{ color: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary">
            {dayjs(appeal.createdAt).format('DD MMMM YYYY, HH:mm')}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button size="small" variant="outlined" onClick={() => navigate(`/appeals/${appeal.id}`)}>
          Детальніше
        </Button>
      </CardActions>
    </Card>
  );
}
