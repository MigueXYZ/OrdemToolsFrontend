// app/layout.jsx
import { Special_Elite } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './lib/ThemeContext'; 
import "./styles/globals.css"; 

export const metadata = {
  title: 'Ordem Tools',
  description: 'Arquivo confidencial da Ordem Paranormal.',
};

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