// src/pages/admin/AppealsManagement.jsx
import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, MenuItem, TextField, Pagination,
  Avatar, Select, FormControl, InputLabel, InputAdornment, Chip,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import { adminApi } from '../../api/admin.api.js';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
dayjs.locale('uk');

const STATUSES = [
  { value: 'NEW',         label: 'Нове'       },
  { value: 'IN_PROGRESS', label: 'В обробці'  },
  { value: 'DONE',        label: 'Виконано'   },
];

export default function AppealsManagement() {
  const [appeals, setAppeals] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    setLoading(true);
    adminApi
      .getAppeals({ page, limit: 15, ...(search && { search }), ...(statusFilter && { status: statusFilter }) })
      .then(({ data }) => { setAppeals(data.data); setMeta(data.meta); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminApi.updateAppealStatus(id, newStatus);
      toast.success('Статус оновлено');
      load();
    } catch {}
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Управління зверненнями</Typography>
        <Typography color="text.secondary" mb={3}>Всього: {meta.total} звернень</Typography>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Пошук за темою..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 220 }}
          />
          <TextField
            select label="Фільтр статусу" value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Всі статуси</MenuItem>
            {STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </TextField>
        </Box>

        <Paper>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Заявник</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Тема</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Опис</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Поточний статус</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Змінити статус</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Дата</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appeals.map((appeal) => (
                    <TableRow key={appeal.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}>
                            {appeal.user?.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{appeal.user?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{appeal.user?.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 180 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {appeal.title}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {appeal.description}
                        </Typography>
                      </TableCell>
                      <TableCell><StatusChip status={appeal.status} /></TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select
                            value={appeal.status}
                            onChange={(e) => handleStatusChange(appeal.id, e.target.value)}
                            sx={{ fontSize: '0.875rem' }}
                          >
                            {STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{dayjs(appeal.createdAt).format('DD.MM.YYYY HH:mm')}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {appeals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                        Звернень не знайдено
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {meta.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination count={meta.pages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </Box>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
