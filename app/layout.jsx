// app/layout.jsx
import { Special_Elite } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './lib/ThemeContext'; // Ou o caminho correto do teu ThemeContext
import "./styles/globals.css"; // Teus estilos

const specialElite = Special_Elite({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="pt" className={specialElite.className}>
      <body>
        {/* A ordem dos providers não costuma importar, desde que AMBOS envolvam o children */}
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}