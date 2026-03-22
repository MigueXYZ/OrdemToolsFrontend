'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import styles from './page.module.css';

export default function CharactersPage() {
  const [characters, setCharacters] = useState([]);
  const [loadingChars, setLoadingChars] = useState(true);
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  // Proteção de rota e carregamento inicial
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchCharacters();
    }
  }, [user, loading, router]);

  const fetchCharacters = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/characters`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCharacters(res.data);
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
    } finally {
      setLoadingChars(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Tens a certeza que queres eliminar o agente ${name}? Esta ação é irreversível e o registo será apagado da base de dados.`)) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/characters/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Atualiza a lista removendo o personagem apagado
      setCharacters(characters.filter(char => char._id !== id));
    } catch (error) {
      console.error('Erro ao eliminar:', error);
      alert('Falha ao eliminar o agente. Verifica a tua ligação.');
    }
  };

  if (loading || loadingChars) {
    return (
      <div className={styles.loadingWrapper}>
        <p>A aceder aos arquivos da Ordem...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/" className={styles.backLink}>&larr; Voltar ao Início</Link>
            <ThemeToggle />
          </div>

          <div className={styles.headerTitleRow}>
            <div>
              <h1 className={styles.title}>Os Meus Agentes</h1>
              <p className={styles.subtitle}>Acede, edita e gere as tuas fichas de personagem.</p>
            </div>

            <Link href="/characters/new" className={styles.newButton}>
              + Criar Novo Agente
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.container}>
        {characters.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>Nenhum agente encontrado</h2>
            <p>Ainda não registaste nenhum personagem no arquivo ativo.</p>
            <Link href="/characters/new" className={styles.newButtonLarge}>
              Iniciar Recrutamento
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {characters.map(char => (
              <div key={char._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>
                    {char.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.cardTitleBox}>
                    <h3 className={styles.cardName}>{char.name}</h3>
                    <span className={styles.cardClass}>
                      {char.class?.name || 'Sem Classe'} {char.track ? `- ${char.track.name}` : ''}
                    </span>
                  </div>
                </div>

                <div className={styles.cardStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>NEX</span>
                    <span className={styles.statValue}>{char.nex}%</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Origem</span>
                    <span className={styles.statValue}>
                      {char.origin?.name || (typeof char.origin === 'string' ? char.origin : 'N/A')}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Patente</span>
                    <span className={styles.statValue}>{char.patente}</span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  {/* Este link vai apontar para a página de edição/visualização que faremos mais tarde */}
                  <Link href={`/characters/${char._id}`} className={styles.openBtn}>
                    Abrir Ficha
                  </Link>
                  <button onClick={() => handleDelete(char._id, char.name)} className={styles.deleteBtn}>
                    Apagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}