'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddAbilityForm from './AddAbilityForm';
import AddRitualForm from './AddRitualForm';
import AddRuleForm from './AddRuleForm';
import AddItemForm from './AddItemForm';
import AddClassForm from './AddClassForm';
import AddTrackForm from './AddTrackForm';
import AddWeaponForm from './AddWeaponForm';
import AddThreatForm from './AddThreatForm';
import ThemeToggle from '../components/ThemeToggle';
import styles from './page.module.css';
import { useContext } from 'react'; // Adiciona isto junto ao import do useState
import { AuthContext } from '../context/AuthContext'; // Confirma se o caminho está correto

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState('abilities');
  const router = useRouter();

  const handleback = () => {
    router.push('/');
  };

  // Dentro do teu export default function ManagePage() {
const { user, loading } = useContext(AuthContext); // Precisas de importar o useContext e AuthContext

// Se ainda está a carregar o token do localStorage, não mostra nada
if (loading) return null;

// Se não há utilizador, redireciona para o login ou mostra erro
if (!user) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Acesso Negado</h1>
      <p>Precisas de iniciar sessão para gerir o conteúdo.</p>
      <button onClick={() => router.push('/login')}>Ir para Login</button>
    </div>
  );
}

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <button 
              onClick={handleback}
              className={styles.homeLink}
            >
              ← Voltar à Pesquisa
            </button>
            <ThemeToggle />
          </div>
          <h1 className={styles.title}>Gerenciador de Conteúdo</h1>
          <p className={styles.subtitle}>Adicione poderes, rituais, regras, itens, classes, trilhas ou armas ao banco de dados</p>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.tabNavigation}>
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
            <span className={styles.tabIcon}>⚔️</span>
            Armas
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'threats' ? styles.active : ''}`}
            onClick={() => setActiveTab('threats')}
          >
            <span className={styles.tabIcon}></span>
            Ameaças
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'abilities' && <AddAbilityForm />}
          {activeTab === 'rituals' && <AddRitualForm />}
          {activeTab === 'rules' && <AddRuleForm />}
          {activeTab === 'items' && <AddItemForm />}
          {activeTab === 'classes' && <AddClassForm />}
          {activeTab === 'tracks' && <AddTrackForm />}
          {activeTab === 'weapons' && <AddWeaponForm />}
          {activeTab === 'threats' && <AddThreatForm />}
        </div>
      </div>
    </div>
  );
}
