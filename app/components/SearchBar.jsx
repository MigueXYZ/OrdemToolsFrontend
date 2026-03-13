'use client';

import { useState, useEffect, useRef } from 'react';
import { searchAPI, getTagSuggestions } from '../lib/api';
import styles from './SearchBar.module.css';

export default function SearchBar({ onSearch, onLoading }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', () => {});
    };
  }, []);

  // fetch suggestions when user types
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const load = async () => {
      const tags = await getTagSuggestions(query);
      if (!cancelled) {
        setSuggestions(tags);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleSubmit = async (e, opts = {}) => {
    if (e) e.preventDefault();
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
    onSearch(null);
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.searchForm} autoComplete="off">
        <div className={styles.searchBox}>
          <input
            ref={inputRef}
            type="text"
            name="search" // makes autocomplete attr more effective
            placeholder="Pesquise poderes, rituais, regras ou itens (frase completa melhora a busca)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className={styles.input}
            autoComplete="new-password"
            spellCheck="false"
            autoCorrect="off"
            autoCapitalize="none"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map((tag) => (
                <li
                  key={tag}
                  onMouseDown={() => {
                    // use mouseDown to avoid losing focus before click
                    setQuery(tag);
                    setShowSuggestions(false);
                    handleSubmit(null, { tagOnly: true });
                  }}
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <button 
            type="submit" 
            disabled={loading} 
            className={styles.searchButton}
          >
            <span className={styles.buttonIcon}>🔍</span>
            {loading ? 'Pesquisando...' : 'Pesquisar'}
          </button>
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearButton}
              title="Limpar pesquisa"
            >
              ✕
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
