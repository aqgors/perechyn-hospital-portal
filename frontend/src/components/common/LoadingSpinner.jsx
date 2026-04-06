// src/components/common/LoadingSpinner.jsx
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingSpinner({ message = 'Завантаження...' }) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} gap={2}>
      <CircularProgress size={48} thickness={4} />
      <Typography color="text.secondary" variant="body2">{message}</Typography>
    </Box>
  );
}
