'use client';

import { useTheme } from '@/app/lib/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className={styles.toggleButton}
      onClick={toggleTheme}
      title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
      aria-label="Alternar tema"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
