'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';

// Importação dos Formulários
import AddAbilityForm from './AddAbilityForm';
import AddRitualForm from './AddRitualForm';
import AddRuleForm from './AddRuleForm';
import AddItemForm from './AddItemForm';
import AddClassForm from './AddClassForm';
import AddTrackForm from './AddTrackForm';
import AddWeaponForm from './AddWeaponForm';
import AddThreatForm from './AddThreatForm';

// Componentes Globais
import ThemeToggle from '../components/ThemeToggle';
import styles from './page.module.css';

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState('abilities');
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  // Proteção de Rota: Se não estiver logado, volta para o login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleBack = () => {
    router.push('/');
  };

  // Enquanto verifica o estado do login, mostra um ecrã vazio ou loading
  if (loading) return null;
  if (!user) return null;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <button 
              onClick={handleBack}
              className={styles.homeLink}
            >
              ← Voltar à Pesquisa
            </button>
            <ThemeToggle />
          </div>
          <h1 className={styles.title}>Gerenciador de Conteúdo</h1>
          <p className={styles.subtitle}>
            Olá, **{user.username}**. Adicione novos elementos ao banco de dados do Ordem.
          </p>
        </div>
      </header>

      <div className={styles.container}>
        <nav className={styles.tabNavigation}>
          <button
            className={`${styles.tab} ${activeTab === 'abilities' ? styles.active : ''}`}
            onClick={() => setActiveTab('abilities')}
          >
            <span className={styles.tabIcon}>⚡</span>
            Poderes
          </button>
          
          <button
            className={`${styles.tab} ${activeTab === 'rituals' ? styles.active : ''}`}
            onClick={() => setActiveTab('rituals')}
          >
            <span className={styles.tabIcon}>✨</span>
            Rituais
          </button>
          
          <button
            className={`${styles.tab} ${activeTab === 'rules' ? styles.active : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            <span className={styles.tabIcon}>📖</span>
            Regras
          </button>
          
          <button
            className={`${styles.tab} ${activeTab === 'items' ? styles.active : ''}`}
            onClick={() => setActiveTab('items')}
          >
            <span className={styles.tabIcon}>🧭</span>
            Itens
          </button>
          
          <button
            className={`${styles.tab} ${activeTab === 'classes' ? styles.active : ''}`}
            onClick={() => setActiveTab('classes')}
          >
            <span className={styles.tabIcon}>⚔️</span>
            Classes
          </button>
          
          <button
            className={`${styles.tab} ${activeTab === 'tracks' ? styles.active : ''}`}
            onClick={() => setActiveTab('tracks')}
          >
            <span className={styles.tabIcon}>🛤️</span>
            Trilhas
          </button>
          
          <button
            className={`${styles.tab} ${activeTab === 'weapons' ? styles.active : ''}`}
            onClick={() => setActiveTab('weapons')}
          >
            <span className={styles.tabIcon}>🗡️</span>
            Armas
          </button>
          
          <button
            className={`${styles.tab} ${activeTab === 'threats' ? styles.active : ''}`}
            onClick={() => setActiveTab('threats')}
          >
            <span className={styles.tabIcon}>💀</span>
            Ameaças
          </button>
        </nav>

        <main className={styles.content}>
          {activeTab === 'abilities' && <AddAbilityForm />}
          {activeTab === 'rituals' && <AddRitualForm />}
          {activeTab === 'rules' && <AddRuleForm />}
          {activeTab === 'items' && <AddItemForm />}
          {activeTab === 'classes' && <AddClassForm />}
          {activeTab === 'tracks' && <AddTrackForm />}
          {activeTab === 'weapons' && <AddWeaponForm />}
          {activeTab === 'threats' && <AddThreatForm />}
        </main>
      </div>
    </div>
  );
}