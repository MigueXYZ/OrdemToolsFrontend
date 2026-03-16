'use client';

import { useState, useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from './context/AuthContext';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import ThemeToggle from './components/ThemeToggle';
import './styles/globals.css';
import styles from './page.module.css';

export default function Home() {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Extraímos também o hasPermission para controlar a visibilidade do link
  const { user, logout, hasPermission } = useContext(AuthContext);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <div className={styles.authControls}>
              {user ? (
                <>
                  {/* NOVO: Link para a página de perfil */}
                  <Link href="/profile" className={styles.profileLink}>
                    👤 Perfil
                  </Link>

                  {/* Só mostramos o link de gerenciar se for admin ou editor */}
                  {(hasPermission('admin') || hasPermission('editor')) && (
                    <Link href="/manage" className={styles.manageLink}>
                      + Gerenciar Conteúdo
                    </Link>
                  )}
                </>
              ) : (
                <Link href="/login" className={styles.loginLink}>
                  Acesso Restrito
                </Link>
              )}
            </div>
            <ThemeToggle />
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleMain}>Ordem</span>
            <span className={styles.titleSub}>Paranormal</span>
          </h1>
          <p className={styles.subtitle}>Banco de Dados RPG • Referência Consultável</p>
        </div>
      </header>

      <SearchBar onSearch={setSearchResults} onLoading={setLoading} />

      {!searchResults && (
        <div className={styles.browseSection}>
          <h2 className={styles.browseTitle}>Ou navegue por categoria:</h2>
          <div className={styles.browseButtons}>
            <Link href="/browse?tab=abilities" className={styles.browseButton}>
              <span>⚡ Poderes</span>
            </Link>
            <Link href="/browse?tab=rituals" className={styles.browseButton}>
              <span>✨ Rituais</span>
            </Link>
            <Link href="/browse?tab=items" className={styles.browseButton}>
              <span>🧭 Itens</span>
            </Link>
            <Link href="/browse?tab=rules" className={styles.browseButton}>
              <span>📖 Regras</span>
            </Link>
            <Link href="/browse?tab=classes" className={styles.browseButton}>
              <span>⚔️ Classes</span>
            </Link>
            <Link href="/browse?tab=tracks" className={styles.browseButton}>
              <span>🛤️ Trilhas</span>
            </Link>
            <Link href="/browse?tab=weapons" className={styles.browseButton}>
              <span>🗡️ Armas</span>
            </Link>
            <Link href="/browse?tab=threats" className={styles.browseButton}>
              <span>💀 Ameaças</span>
            </Link>
          </div>
        </div>
      )}

      <SearchResults results={searchResults} loading={loading} />
    </div>
  );
}