'use client';

import { useTheme } from '@/app/lib/ThemeContext';
import styles from './ThemeToggle.module.css';

const themeIcons = {
  light: '☀️',
  dark: '🌙',
  cyberpunk: '🤖',
  minimal: '⚪'
};

const themeNames = {
  light: 'Vista',
  dark: 'Noite',
  cyberpunk: 'Cyberpunk',
  minimal: 'Minimal'
};

export default function ThemeToggle() {
  const { theme, toggleTheme, availableThemes } = useTheme();

  const currentIndex = availableThemes.indexOf(theme);
  const nextTheme = availableThemes[(currentIndex + 1) % availableThemes.length];

  return (
    <button
      className={styles.toggleButton}
      onClick={toggleTheme}
      title={`Tema atual: ${themeNames[theme]} | Próximo: ${themeNames[nextTheme]}`}
      aria-label={`Alternar tema para ${themeNames[nextTheme]}`}
    >
      <div className={styles.iconContainer}>
        <span className={styles.themeIcon}>{themeIcons[theme]}</span>
      </div>
    </button>
  );
}