'use client';

// 1. Importa o Suspense do React
import { useState, useContext, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';

// Importação dos Formulários
import AddAbilityForm from './AddAbilityForm';
import AddRitualForm from './AddRitualForm';
import AddRuleForm from './AddRuleForm';
import AddItemForm from './AddItemForm';
import AddClassForm from './AddClassForm';
import AddTrackForm from './AddTrackForm';
import AddOriginForm from './AddOriginForm';
import AddWeaponForm from './AddWeaponForm';
import AddThreatForm from './AddThreatForm';

// Componentes Globais
import ThemeToggle from '../components/ThemeToggle';
import ImportJsonModal from '../components/ImportJsonModal';
import styles from './page.module.css';

// 2. O conteúdo principal passa a ser um componente interno
function ManageContent() {
  const [activeTab, setActiveTab] = useState('abilities');
  const [showImportModal, setShowImportModal] = useState(false);
  
  const { user, loading, hasPermission } = useContext(AuthContext);
  const router = useRouter();
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    
    if (categoryFromUrl) {
      const validTabs = ['abilities', 'rituals', 'rules', 'items', 'classes', 'tracks', 'origins', 'weapons', 'threats'];
      
      if (validTabs.includes(categoryFromUrl)) {
        setActiveTab(categoryFromUrl);
      }
    }
  }, [searchParams]);

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

          <div className={styles.headerBottom}>
            <div>
              <h1 className={styles.title}>Gerenciador de Conteúdo</h1>
              <p className={styles.subtitle}>
                Olá, <strong>{user.shownName || user.username}</strong>. Adicione novos elementos ao arquivo.
              </p>
            </div>
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
          <button className={`${styles.tab} ${activeTab === 'origins' ? styles.active : ''}`} onClick={() => setActiveTab('origins')}>
            <span className={styles.tabIcon}>🧬</span> Origens
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
          {activeTab === 'origins' && <AddOriginForm />}
          {activeTab === 'weapons' && <AddWeaponForm />}
          {activeTab === 'threats' && <AddThreatForm />}
        </main>
      </div>

      {showImportModal && (
        <ImportJsonModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            // Callback vazio, conforme o teu original
          }}
        />
      )}
    </div>
  );
}

// 3. A exportação principal envolve o conteúdo no Suspense
export default function ManagePage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontFamily: 'var(--font-titles)', 
        color: 'var(--text-accent)',
        fontSize: '1.5rem',
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}>
        A aceder à base de dados da Ordem...
      </div>
    }>
      <ManageContent />
    </Suspense>
  );
}