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
// 1. IMPORTAR O NOVO MODAL DE IMPORTAÇÃO
import ImportJsonModal from '../components/ImportJsonModal';
import styles from './page.module.css';

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState('abilities');
  // 2. ADICIONAR ESTADO PARA O MODAL
  const [showImportModal, setShowImportModal] = useState(false);
  const { user, loading, hasPermission } = useContext(AuthContext);
  const router = useRouter();

  // Proteção de Rota Reforçada
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      const isAuthorized = hasPermission('admin') || hasPermission('editor');
      
      if (!isAuthorized) {
        router.push('/');
      }
    }
  }, [user, loading, router, hasPermission]);

  const handleBack = () => {
    router.push('/');
  };

  // Enquanto verifica o estado do login ou se não estiver autorizado, não renderiza nada
  if (loading) return null;
  if (!user || (!hasPermission('admin') && !hasPermission('editor'))) return null;

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
          
          {/* Organização do Título e Botão de Importação */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <h1 className={styles.title}>Gerenciador de Conteúdo</h1>
              <p className={styles.subtitle}>
                Olá, <strong>{user.shownName || user.username}</strong>. Adicione novos elementos ao arquivo.
              </p>
            </div>
            
            {/* 3. BOTÃO DE IMPORTAÇÃO APENAS PARA ADMINS */}
            {hasPermission('admin') && (
              <button 
                onClick={() => setShowImportModal(true)}
                style={{
                  background: 'linear-gradient(180deg, rgba(75, 0, 130, 0.9) 0%, rgba(50, 0, 90, 0.95) 100%)',
                  color: 'white',
                  border: '1px solid #2d004d',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-titles)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 4px 10px rgba(0,0,0,0.2)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                📦 Importação JSON
              </button>
            )}
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <nav className={styles.tabNavigation}>
          <button className={`${styles.tab} ${activeTab === 'abilities' ? styles.active : ''}`} onClick={() => setActiveTab('abilities')}>
            <span className={styles.tabIcon}>⚡</span> Poderes
          </button>
          <button className={`${styles.tab} ${activeTab === 'rituals' ? styles.active : ''}`} onClick={() => setActiveTab('rituals')}>
            <span className={styles.tabIcon}>✨</span> Rituais
          </button>
          <button className={`${styles.tab} ${activeTab === 'rules' ? styles.active : ''}`} onClick={() => setActiveTab('rules')}>
            <span className={styles.tabIcon}>📖</span> Regras
          </button>
          <button className={`${styles.tab} ${activeTab === 'items' ? styles.active : ''}`} onClick={() => setActiveTab('items')}>
            <span className={styles.tabIcon}>🧭</span> Itens
          </button>
          <button className={`${styles.tab} ${activeTab === 'classes' ? styles.active : ''}`} onClick={() => setActiveTab('classes')}>
            <span className={styles.tabIcon}>⚔️</span> Classes
          </button>
          <button className={`${styles.tab} ${activeTab === 'tracks' ? styles.active : ''}`} onClick={() => setActiveTab('tracks')}>
            <span className={styles.tabIcon}>🛤️</span> Trilhas
          </button>
          <button className={`${styles.tab} ${activeTab === 'weapons' ? styles.active : ''}`} onClick={() => setActiveTab('weapons')}>
            <span className={styles.tabIcon}>🗡️</span> Armas
          </button>
          <button className={`${styles.tab} ${activeTab === 'threats' ? styles.active : ''}`} onClick={() => setActiveTab('threats')}>
            <span className={styles.tabIcon}>💀</span> Ameaças
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

      {/* 4. RENDERIZAR O MODAL SE O ESTADO FOR TRUE */}
      {showImportModal && (
        <ImportJsonModal 
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            // Se quiseres recarregar ou mudar a tab quando tem sucesso, podes fazer aqui.
          }}
        />
      )}
    </div>
  );
}