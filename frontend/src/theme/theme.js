// src/theme/theme.js — Медична тема MUI для Перечинської ЦРЛ
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565C0',
      light: '#1E88E5',
      dark: '#0D47A1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00897B',
      light: '#26A69A',
      dark: '#00695C',
      contrastText: '#ffffff',
    },
    error: { main: '#D32F2F' },
    warning: { main: '#F57C00' },
    success: { main: '#2E7D32' },
    info: { main: '#0288D1' },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 2px 8px rgba(0,0,0,0.10)',
    '0px 4px 16px rgba(0,0,0,0.10)',
    '0px 8px 24px rgba(0,0,0,0.10)',
    '0px 12px 32px rgba(0,0,0,0.10)',
    '0px 16px 40px rgba(0,0,0,0.10)',
    '0px 20px 48px rgba(0,0,0,0.10)',
    '0px 24px 56px rgba(0,0,0,0.10)',
    '0px 28px 64px rgba(0,0,0,0.10)',
    '0px 32px 72px rgba(0,0,0,0.10)',
    '0px 36px 80px rgba(0,0,0,0.10)',
    '0px 40px 88px rgba(0,0,0,0.10)',
    '0px 44px 96px rgba(0,0,0,0.10)',
    '0px 48px 104px rgba(0,0,0,0.10)',
    '0px 52px 112px rgba(0,0,0,0.10)',
    '0px 56px 120px rgba(0,0,0,0.10)',
    '0px 60px 128px rgba(0,0,0,0.10)',
    '0px 64px 136px rgba(0,0,0,0.10)',
    '0px 68px 144px rgba(0,0,0,0.10)',
    '0px 72px 152px rgba(0,0,0,0.10)',
    '0px 76px 160px rgba(0,0,0,0.10)',
    '0px 80px 168px rgba(0,0,0,0.10)',
    '0px 84px 176px rgba(0,0,0,0.10)',
    '0px 88px 184px rgba(0,0,0,0.10)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0px 4px 12px rgba(21, 101, 192, 0.25)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'medium' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover fieldset': { borderColor: '#1E88E5' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500, borderRadius: 8 } },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%)',
          boxShadow: '0px 2px 20px rgba(13, 71, 161, 0.3)',
        },
      },
    },
  },
});
