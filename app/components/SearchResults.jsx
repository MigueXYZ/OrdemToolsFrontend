'use client';

import { useState } from 'react';
import axios from 'axios';
import styles from './SearchResults.module.css';
import ResultCard from './ResultCard';

export default function SearchResults({ results, loading }) {
  const [searchResults, setSearchResults] = useState(results);
  const [activeCategory, setActiveCategory] = useState('all'); // Filtro global

  const handleRefresh = async (query) => {
    if (!query) return;
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/search`, {
        params: { q: query }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  const currentResults = searchResults || results;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner}></div>
          <p>A desencriptar ficheiros da base de dados...</p>
        </div>
      </div>
    );
  }

  if (!currentResults) {
    return null;
  }

  const { query, results: resultsData, count } = currentResults;

  // Lógica para separar poderes normais de origens (apenas para organização visual)
  const normalAbilities = resultsData.abilities.filter(a => a.category !== 'Poder de Origem');
  const originAbilities = resultsData.abilities.filter(a => a.category === 'Poder de Origem');
  
  const groupedOrigins = {};
  originAbilities.forEach(ability => {
    const originName = ability.origin || 'Sem Origem';
    if (!groupedOrigins[originName]) {
      groupedOrigins[originName] = [];
    }
    groupedOrigins[originName].push(ability);
  });
  const sortedOrigins = Object.keys(groupedOrigins).sort();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Resultados para "{query}"</h2>
        <p className={styles.resultCount}>
          Encontrado <strong>{count.total}</strong> {count.total === 1 ? 'resultado' : 'resultados'}
        </p>
      </div>

      {count.total === 0 ? (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>[ ! ]</div>
          <p>Nenhum registo encontrado com essa designação.</p>
        </div>
      ) : (
        <>
          {/* Filtro Global de Categorias */}
          <div className={styles.categoryFilter}>
            <button 
              className={`${styles.filterButton} ${activeCategory === 'all' ? styles.active : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Todos ({count.total})
            </button>
            {count.abilities > 0 && (
              <button 
                className={`${styles.filterButton} ${activeCategory === 'abilities' ? styles.active : ''}`}
                onClick={() => setActiveCategory('abilities')}
              >
                Poderes ({count.abilities})
              </button>
            )}
            {count.rituals > 0 && (
              <button 
                className={`${styles.filterButton} ${activeCategory === 'rituals' ? styles.active : ''}`}
                onClick={() => setActiveCategory('rituals')}
              >
                Rituais ({count.rituals})
              </button>
            )}
            {count.rules > 0 && (
              <button 
                className={`${styles.filterButton} ${activeCategory === 'rules' ? styles.active : ''}`}
                onClick={() => setActiveCategory('rules')}
              >
                Regras ({count.rules})
              </button>
            )}
            {count.items > 0 && (
              <button 
                className={`${styles.filterButton} ${activeCategory === 'items' ? styles.active : ''}`}
                onClick={() => setActiveCategory('items')}
              >
                Itens ({count.items})
              </button>
            )}
            {count.classes > 0 && (
              <button 
                className={`${styles.filterButton} ${activeCategory === 'classes' ? styles.active : ''}`}
                onClick={() => setActiveCategory('classes')}
              >
                Classes ({count.classes})
              </button>
            )}
            {count.tracks > 0 && (
              <button 
                className={`${styles.filterButton} ${activeCategory === 'tracks' ? styles.active : ''}`}
                onClick={() => setActiveCategory('tracks')}
              >
                Trilhas ({count.tracks})
              </button>
            )}
            {count.weapons > 0 && (
              <button 
                className={`${styles.filterButton} ${activeCategory === 'weapons' ? styles.active : ''}`}
                onClick={() => setActiveCategory('weapons')}
              >
                Armas ({count.weapons})
              </button>
            )}
            {count.threats > 0 && (
              <button 
                className={`${styles.filterButton} ${activeCategory === 'threats' ? styles.active : ''}`}
                onClick={() => setActiveCategory('threats')}
              >
                Ameaças ({count.threats})
              </button>
            )}
          </div>

          {/* Secção de Poderes */}
          {(activeCategory === 'all' || activeCategory === 'abilities') && count.abilities > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Poderes</h3>
              
              {normalAbilities.length > 0 && (
                <div className={styles.resultsList}>
                  {normalAbilities.map((item) => (
                    <ResultCard key={item._id} item={item} type="ability" onUpdate={() => handleRefresh(query)} />
                  ))}
                </div>
              )}

              {originAbilities.length > 0 && (
                <div className={styles.originContainer}>
                  {sortedOrigins.map((originName) => (
                    <div key={originName} className={styles.originGroup}>
                      <h4 className={styles.originGroupTitle}>{originName}</h4>
                      <div className={styles.resultsList}>
                        {groupedOrigins[originName].map((item) => (
                          <ResultCard key={item._id} item={item} type="ability" onUpdate={() => handleRefresh(query)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Secção de Rituais */}
          {(activeCategory === 'all' || activeCategory === 'rituals') && count.rituals > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Rituais</h3>
              <div className={styles.resultsList}>
                {resultsData.rituals.map((item) => (
                  <ResultCard key={item._id} item={item} type="ritual" onUpdate={() => handleRefresh(query)} />
                ))}
              </div>
            </section>
          )}

          {/* Secção de Regras */}
          {(activeCategory === 'all' || activeCategory === 'rules') && count.rules > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Regras</h3>
              <div className={styles.resultsList}>
                {resultsData.rules.map((item) => (
                  <ResultCard key={item._id} item={item} type="rule" onUpdate={() => handleRefresh(query)} />
                ))}
              </div>
            </section>
          )}

          {/* Secção de Itens */}
          {(activeCategory === 'all' || activeCategory === 'items') && count.items > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Itens</h3>
              <div className={styles.resultsList}>
                {resultsData.items.map((item) => (
                  <ResultCard key={item._id} item={item} type="item" onUpdate={() => handleRefresh(query)} />
                ))}
              </div>
            </section>
          )}

          {/* Secção de Classes */}
          {(activeCategory === 'all' || activeCategory === 'classes') && count.classes > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Classes</h3>
              <div className={styles.resultsList}>
                {resultsData.classes.map((item) => (
                  <ResultCard key={item._id} item={item} type="class" onUpdate={() => handleRefresh(query)} />
                ))}
              </div>
            </section>
          )}

          {/* Secção de Trilhas */}
          {(activeCategory === 'all' || activeCategory === 'tracks') && count.tracks > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Trilhas</h3>
              <div className={styles.resultsList}>
                {resultsData.tracks.map((item) => (
                  <ResultCard key={item._id} item={item} type="track" onUpdate={() => handleRefresh(query)} />
                ))}
              </div>
            </section>
          )}

          {/* Secção de Armas */}
          {(activeCategory === 'all' || activeCategory === 'weapons') && count.weapons > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Armas</h3>
              <div className={styles.resultsList}>
                {resultsData.weapons.map((item) => (
                  <ResultCard key={item._id} item={item} type="weapon" onUpdate={() => handleRefresh(query)} />
                ))}
              </div>
            </section>
          )}

          {/* Secção de Ameaças */}
          {(activeCategory === 'all' || activeCategory === 'threats') && count.threats > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Ameaças</h3>
              <div className={styles.resultsList}>
                {resultsData.threats.map((item) => (
                  <ResultCard key={item._id} item={item} type="threat" onUpdate={() => handleRefresh(query)} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}