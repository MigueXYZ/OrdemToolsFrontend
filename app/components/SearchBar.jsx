// components/SearchBar.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { searchAPI, getTagSuggestions } from '../lib/api';
import styles from './SearchBar.module.css';

export default function SearchBar({ onSearch, onLoading, isRealTime = false, onQueryChange }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  // Comportamento para Tempo Real (Browse)
  useEffect(() => {
    if (isRealTime && onQueryChange) {
      onQueryChange(query);
    }
  }, [query, isRealTime, onQueryChange]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Só carrega sugestões da API se NÃO for tempo real
  useEffect(() => {
    if (isRealTime || !query.trim()) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const load = async () => {
      const tags = await getTagSuggestions(query);
      if (!cancelled) setSuggestions(tags);
    };

    load();
    return () => { cancelled = true; };
  }, [query, isRealTime]);

  const handleSubmit = async (e, opts = {}) => {
    if (e) e.preventDefault();
    if (isRealTime) return; // No Browse, não queremos submeter à API
    if (!query.trim()) return;

    setLoading(true);
    onLoading?.(true);
    try {
      const results = await searchAPI(query, null, 50, opts);
      onSearch(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
      onLoading?.(false);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    if (!isRealTime) onSearch(null);
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.searchForm} autoComplete="off">
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder={isRealTime ? "Filtrar resultados nesta página..." : "Pesquise na base de dados global..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => !isRealTime && setShowSuggestions(true)}
            className={styles.input}
          />
          
          {/* Só mostra botão de pesquisar se não for Real Time */}
          {!isRealTime && (
            <button type="submit" disabled={loading} className={styles.searchButton}>
              <span className={styles.buttonIcon}>🔍</span>
              {loading ? '...' : 'Pesquisar'}
            </button>
          )}

          {query && (
            <button type="button" onClick={handleClear} className={styles.clearButton}>
              ✕
            </button>
          )}
        </div>
      </form>
    </div>
  );
}