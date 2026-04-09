// src/theme/theme.js — Медична тема MUI для Перечинської ЦРЛ
import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Palette for light mode
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
          // Palette for dark mode
          primary: {
            main: '#90CAF9',
            light: '#E3F2FD',
            dark: '#42A5F5',
            contrastText: 'rgba(0, 0, 0, 0.87)',
          },
          secondary: {
            main: '#4DB6AC',
            light: '#B2DFDB',
            dark: '#00796B',
            contrastText: 'rgba(0, 0, 0, 0.87)',
          },
          background: {
            default: '#0F172A',
            paper: '#1E293B',
          },
          text: {
            primary: '#F1F5F9',
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
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
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
              : '0px 4px 12px rgba(144, 202, 249, 0.2)',
          },
        },
        containedPrimary: {
          background: mode === 'light'
            ? 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)'
            : 'linear-gradient(135deg, #90CAF9 0%, #42A5F5 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: mode === 'light'
            ? '0px 2px 12px rgba(0,0,0,0.06)'
            : '0px 4px 20px rgba(0,0,0,0.25)',
          border: mode === 'light'
            ? '1px solid rgba(226, 232, 240, 0.8)'
            : '1px solid rgba(51, 65, 85, 0.5)',
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
            : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          boxShadow: mode === 'light'
            ? '0px 2px 20px rgba(13, 71, 161, 0.2)'
            : '0px 4px 20px rgba(0,0,0,0.4)',
        },
      },
    },
  },
});

export const getTheme = (mode) => createTheme(getDesignTokens(mode));
export const theme = getTheme('light'); // Backward compatibility
