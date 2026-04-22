'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const AVAILABLE_THEMES = ['light', 'dark', 'cyberpunk', 'minimal'];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Carregar tema do localStorage ao montar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    // Validate theme exists
    const validTheme = AVAILABLE_THEMES.includes(savedTheme) ? savedTheme : 'light';
    setTheme(validTheme);
    document.documentElement.setAttribute('data-theme', validTheme);
    setMounted(true);
  }, []);

  // Atualizar documento quando tema mudar
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const currentIndex = AVAILABLE_THEMES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
    setTheme(AVAILABLE_THEMES[nextIndex]);
  };

  const setSpecificTheme = (newTheme) => {
    if (AVAILABLE_THEMES.includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setSpecificTheme,
      availableThemes: AVAILABLE_THEMES,
      mounted
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
}
