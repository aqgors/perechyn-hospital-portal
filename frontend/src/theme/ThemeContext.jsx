import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme';
import i18n from '../i18n';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    // Fallback if provider is missing
    console.warn('useSettings must be used within a SettingsProvider. Using default values.');
    return {
      mode: 'light',
      toggleMode: () => console.warn('toggleMode called without SettingsProvider'),
      language: 'ua',
      changeLanguage: (lng) => console.warn('changeLanguage called without SettingsProvider', lng),
    };
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');
  const [language, setLanguage] = useState(() => i18n.language || 'ua');

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const changeLanguage = (lng) => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  useEffect(() => {
    const handleLangChange = (lng) => setLanguage(lng);
    i18n.on('languageChanged', handleLangChange);
    return () => i18n.off('languageChanged', handleLangChange);
  }, []);

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <SettingsContext.Provider value={{ mode, toggleMode, language, changeLanguage }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SettingsContext.Provider>
  );
};
