'use client';

import { useState } from 'react';
import axios from 'axios';
import styles from './SearchResults.module.css';
import ResultCard from './ResultCard';

export default function SearchResults({ results, loading }) {
  const [searchResults, setSearchResults] = useState(results);
  const [abilityFilter, setAbilityFilter] = useState('all'); // 'all', 'powers', 'origins'

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
          <p>Pesquisando banco de dados de Ordem Paranormal...</p>
        </div>
      </div>
    );
  }

  if (!currentResults) {
    return null;
  }

  const { query, results: resultsData, count } = currentResults;

  // Separar poderes normais de origens
  const normalAbilities = resultsData.abilities.filter(a => a.category !== 'Poder de Origem');
  const originAbilities = resultsData.abilities.filter(a => a.category === 'Poder de Origem');
  
  // Agrupar origens por nome de origem
  const groupedOrigins = {};
  originAbilities.forEach(ability => {
    const originName = ability.origin || 'Sem Origem';
    if (!groupedOrigins[originName]) {
      groupedOrigins[originName] = [];
    }
    groupedOrigins[originName].push(ability);
  });

  // Ordenar origens alfabeticamente
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
        <div className={`${styles.noResults} aero-glass`}>
          <div className={styles.noResultsIcon}>🔍</div>
          <p>Nenhum resultado encontrado. Tente um termo de pesquisa diferente.</p>
        </div>
      ) : (
        <>
          {count.abilities > 0 && (
            <>
              <div className={styles.abilityFilter}>
                <button 
                  className={`${styles.filterButton} ${abilityFilter === 'all' ? styles.active : ''}`}
                  onClick={() => setAbilityFilter('all')}
                >
                  Todos ({count.abilities})
                </button>
                {normalAbilities.length > 0 && (
                  <button 
                    className={`${styles.filterButton} ${abilityFilter === 'powers' ? styles.active : ''}`}
                    onClick={() => setAbilityFilter('powers')}
                  >
                    Poderes ({normalAbilities.length})
                  </button>
                )}
                {originAbilities.length > 0 && (
                  <button 
                    className={`${styles.filterButton} ${abilityFilter === 'origins' ? styles.active : ''}`}
                    onClick={() => setAbilityFilter('origins')}
                  >
                    Origens ({originAbilities.length})
                  </button>
                )}
              </div>

              {(abilityFilter === 'all' || abilityFilter === 'powers') && normalAbilities.length > 0 && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    Poderes ({normalAbilities.length})
                  </h3>
                  <div className={styles.resultsList}>
                    {normalAbilities.map((item) => (
                      <ResultCard 
                        key={item._id} 
                        item={item} 
                        type="ability"
                        onUpdate={() => handleRefresh(query)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {(abilityFilter === 'all' || abilityFilter === 'origins') && originAbilities.length > 0 && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    Origens ({originAbilities.length})
                  </h3>
                  {sortedOrigins.map((originName) => (
                    <div key={originName} className={styles.originGroup}>
                      <h4 className={styles.originGroupTitle}>{originName}</h4>
                      <div className={styles.resultsList}>
                        {groupedOrigins[originName].map((item) => (
                          <ResultCard 
                            key={item._id} 
                            item={item} 
                            type="ability"
                            onUpdate={() => handleRefresh(query)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </>
          )}

          {count.rituals > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Rituais ({count.rituals})
              </h3>
              <div className={styles.resultsList}>
                {resultsData.rituals.map((item) => (
                  <ResultCard 
                    key={item._id} 
                    item={item} 
                    type="ritual"
                    onUpdate={() => handleRefresh(query)}
                  />
                ))}
              </div>
            </section>
          )}

          {count.rules > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Regras ({count.rules})
              </h3>
              <div className={styles.resultsList}>
                {resultsData.rules.map((item) => (
                  <ResultCard 
                    key={item._id} 
                    item={item} 
                    type="rule"
                    onUpdate={() => handleRefresh(query)}
                  />
                ))}
              </div>
            </section>
          )}

          {count.items > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Itens ({count.items})
              </h3>
              <div className={styles.resultsList}>
                {resultsData.items.map((item) => (
                  <ResultCard 
                    key={item._id} 
                    item={item} 
                    type="item"
                    onUpdate={() => handleRefresh(query)}
                  />
                ))}
              </div>
            </section>
          )}

          {count.classes > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Classes ({count.classes})
              </h3>
              <div className={styles.resultsList}>
                {resultsData.classes.map((item) => (
                  <ResultCard 
                    key={item._id} 
                    item={item} 
                    type="class"
                    onUpdate={() => handleRefresh(query)}
                  />
                ))}
              </div>
            </section>
          )}

          {count.tracks > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Trilhas ({count.tracks})
              </h3>
              <div className={styles.resultsList}>
                {resultsData.tracks.map((item) => (
                  <ResultCard 
                    key={item._id} 
                    item={item} 
                    type="track"
                    onUpdate={() => handleRefresh(query)}
                  />
                ))}
              </div>
            </section>
          )}

          {count.weapons > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Armas ({count.weapons})
              </h3>
              <div className={styles.resultsList}>
                {resultsData.weapons.map((item) => (
                  <ResultCard 
                    key={item._id} 
                    item={item} 
                    type="weapon"
                    onUpdate={() => handleRefresh(query)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
