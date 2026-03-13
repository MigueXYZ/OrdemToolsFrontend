// app/layout.jsx
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './lib/ThemeContext'; // Ou o caminho correto do teu ThemeContext
import "./styles/globals.css"; // Teus estilos

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
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