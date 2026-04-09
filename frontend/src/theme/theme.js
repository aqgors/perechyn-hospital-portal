// src/theme/theme.js — Медична тема MUI для Перечинської ЦРЛ
import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#1565C0',
            light: '#42a5f5',
            dark: '#0d47a1',
            contrastText: '#fff',
          },
          secondary: {
            main: '#00897B',
            light: '#4db6ac',
            dark: '#004d40',
            contrastText: '#fff',
          },
          background: {
            default: '#F8FAFC',
            paper: '#FFFFFF',
          },
          text: {
            primary: '#1E293B',
            secondary: '#64748B',
          },
        }
      : {
          primary: {
            main: '#3B82F6', // Softer, deeper blue than #90CAF9
            light: '#60A5FA',
            dark: '#2563EB',
            contrastText: '#fff',
          },
          secondary: {
            main: '#14B8A6', // Muting the teal to be more balanced
            light: '#2DD4BF',
            dark: '#0D9488',
            contrastText: '#fff',
          },
          background: {
            default: '#0F172A',
            paper: '#1E293B',
          },
          text: {
            primary: '#F8FAFC',
            secondary: '#94A3B8',
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.02em' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': { 
            boxShadow: mode === 'light' 
              ? '0px 4px 12px rgba(21, 101, 192, 0.2)' 
              : '0px 4px 12px rgba(59, 130, 246, 0.25)',
          },
        },
        containedPrimary: {
          background: mode === 'light'
            ? 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)'
            : '#3B82F6', // Flat color in dark mode to prevent neon glow
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: mode === 'light'
            ? '0px 2px 12px rgba(0,0,0,0.06)'
            : '0px 2px 10px rgba(0,0,0,0.4)',
          border: mode === 'light'
            ? '1px solid rgba(226, 232, 240, 0.8)'
            : '1px solid rgba(51, 65, 85, 0.8)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'light'
            ? 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)'
            : '#0F172A', // Seamless with background in dark mode
          boxShadow: mode === 'light'
            ? '0px 2px 20px rgba(13, 71, 161, 0.2)'
            : 'border-bottom: 1px solid rgba(51, 65, 85, 0.8)',
        },
      },
    },
  },
});

export const getTheme = (mode) => createTheme(getDesignTokens(mode));
export const theme = getTheme('light'); // Backward compatibility
