// src/components/layout/Navbar.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Avatar, Menu, MenuItem,
  Box, Divider, ListItemIcon, Chip, useMediaQuery, useTheme, Drawer, List,
  ListItemButton, ListItemText,
} from '@mui/material';
import {
  LocalHospital, Menu as MenuIcon, AccountCircle, Dashboard, Description,
  AdminPanelSettings, Logout, Person, AddCircle,
} from '@mui/icons-material';
import { logout } from '../../store/authSlice.js';

const ROLE_LABELS = { ADMIN: 'Адміністратор', DOCTOR: 'Лікар', USER: 'Пацієнт' };

export default function Navbar() {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setAnchorEl(null);
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'DOCTOR';

  const navLinks = isAuthenticated
    ? [
        { label: 'Кабінет', to: '/dashboard', icon: <Dashboard fontSize="small" /> },
        { label: 'Мої звернення', to: '/appeals', icon: <Description fontSize="small" /> },
        { label: 'Нове звернення', to: '/appeals/new', icon: <AddCircle fontSize="small" /> },
        ...(isAdmin ? [{ label: 'Адмінка', to: '/admin', icon: <AdminPanelSettings fontSize="small" /> }] : []),
      ]
    : [];

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 1 }}>
        {isMobile && isAuthenticated && (
          <IconButton color="inherit" onClick={() => setDrawerOpen(true)} edge="start">
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo */}
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', flexGrow: { xs: 1, md: 0 }, mr: { md: 3 } }}
        >
          <LocalHospital sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1}>
              Перечинська ЦРЛ
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: { xs: 'none', sm: 'block' } }}>
              Вебпортал лікарні
            </Typography>
          </Box>
        </Box>

        {/* Desktop Nav */}
        {!isMobile && isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                startIcon={link.icon}
                sx={{ color: 'rgba(255,255,255,0.9)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ flexGrow: { xs: 0, md: 1 } }} />

        {/* Auth buttons / avatar */}
        {isAuthenticated ? (
          <>
            <Chip
              label={ROLE_LABELS[user?.role]}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, display: { xs: 'none', sm: 'flex' } }}
            />
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.25)', fontSize: '0.9rem', fontWeight: 700 }}>
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
              <MenuItem disabled>
                <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
              </MenuItem>
              <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>{user?.email}</Typography>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
                <ListItemIcon><Person fontSize="small" /></ListItemIcon>Профіль
              </MenuItem>
              {isAdmin && (
                <MenuItem onClick={() => { navigate('/admin'); setAnchorEl(null); }}>
                  <ListItemIcon><AdminPanelSettings fontSize="small" /></ListItemIcon>Адмінпанель
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>Вийти
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button component={RouterLink} to="/login" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
              Увійти
            </Button>
            <Button component={RouterLink} to="/register" variant="contained" sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
              Реєстрація
            </Button>
          </Box>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalHospital color="primary" />
            <Typography fontWeight={700}>Перечинська ЦРЛ</Typography>
          </Box>
          <Divider />
          <List>
            {navLinks.map((link) => (
              <ListItemButton key={link.to} component={RouterLink} to={link.to} onClick={() => setDrawerOpen(false)}>
                <ListItemIcon>{link.icon}</ListItemIcon>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <List>
            <ListItemButton component={RouterLink} to="/profile" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon><AccountCircle /></ListItemIcon>
              <ListItemText primary="Профіль" secondary={user?.name} />
            </ListItemButton>
            <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon><Logout color="error" /></ListItemIcon>
              <ListItemText primary="Вийти" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
