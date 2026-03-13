'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import ThemeToggle from './components/ThemeToggle';
import './styles/globals.css';
import styles from './page.module.css';

export default function Home() {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/manage" className={styles.manageLink}>
              + Adicionar Conteúdo
            </Link>
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
              <span className={styles.browseIcon}>⚡</span>
              <span>Todos os Poderes</span>
            </Link>
            <Link href="/browse?tab=rituals" className={styles.browseButton}>
              <span className={styles.browseIcon}>✨</span>
              <span>Todos os Rituais</span>
            </Link>
            <Link href="/browse?tab=items" className={styles.browseButton}>
              <span className={styles.browseIcon}>🧭</span>
              <span>Todos os Itens</span>
            </Link>
            <Link href="/browse?tab=rules" className={styles.browseButton}>
              <span className={styles.browseIcon}>📖</span>
              <span>Todas as Regras</span>
            </Link>
            <Link href="/browse?tab=classes" className={styles.browseButton}>
              <span className={styles.browseIcon}>⚔️</span>
              <span>Todas as Classes</span>
            </Link>
            <Link href="/browse?tab=tracks" className={styles.browseButton}>
              <span className={styles.browseIcon}>🛤️</span>
              <span>Todas as Trilhas</span>
            </Link>
            <Link href="/browse?tab=weapons" className={styles.browseButton}>
              <span className={styles.browseIcon}>🗡️</span>
              <span>Todas as Armas</span>
            </Link>
          </div>
        </div>
      )}

      <SearchResults results={searchResults} loading={loading} />
    </div>
  );
}
