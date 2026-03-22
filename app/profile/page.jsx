'use client';

import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import styles from './page.module.css';
import EditProfileModal from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';

export default function ProfilePage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { user, logout, hasPermission, updateUser } = useContext(AuthContext);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Garantir que a hidratação do cliente ocorreu para evitar erros de renderização
  useEffect(() => {
    setIsClient(true);
    if (!user && isClient) {
      router.push('/login');
    }
  }, [user, isClient, router]);

  const handleUpdateSuccess = (updatedUser) => {
    setShowEditModal(false);

    if (updateUser) {
      updateUser(updatedUser);
    } else {
      window.location.reload();
    }
  };

  if (!isClient || !user) {
    return (
      <div className={styles.loadingBox}>
        <p>A carregar credenciais...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/" className={styles.backLink}>&larr; Voltar à Base de Dados</Link>
            <ThemeToggle />
          </div>
          <h1 className={styles.title}>Perfil de Agente</h1>
          <p className={styles.subtitle}>Gerencie as suas credenciais e informações pessoais.</p>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarPlaceholder}>
              {user.shownName ? user.shownName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
            </div>
            <div className={styles.roleBadge}>
              {hasPermission('admin') ? 'Administrador' : hasPermission('editor') ? 'Editor' : 'Agente'}
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nome de Exibição</label>
              <div className={styles.value}>{user.shownName || 'Não definido'}</div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nome de Utilizador</label>
              <div className={styles.value}>{user.username}</div>
            </div>

            {user.email && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Registado</label>
                <div className={styles.value}>{user.email}</div>
              </div>
            )}
          </div>

          <div className={styles.actionsContainer}>
            
            {/* SECÇÃO PRINCIPAL: ACESSO ÀS FICHAS DE PERSONAGEM */}
            <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <Link 
                href="/characters" 
                className={styles.editButton} 
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  textAlign: 'center', 
                  padding: '1.2rem', 
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  border: '2px solid var(--text-accent)'
                }}
              >
                Aceder aos Meus Agentes (Fichas RPG)
              </Link>
            </div>

            <div className={styles.actionsRow}>
              <button className={styles.editButton} onClick={() => setShowEditModal(true)}>
                Editar Perfil
              </button>
              <button className={styles.logoutButton} onClick={logout}>
                Terminar Sessão
              </button>
            </div>

            <button className={styles.passwordButton} onClick={() => setShowPasswordModal(true)}>
              Alterar Palavra-passe
            </button>
          </div>

          {/* SECÇÃO EXCLUSIVA PARA ADMINS */}
          {hasPermission('admin') && (
            <div className={styles.adminSection}>
              <Link href="/admin/users" className={styles.adminButton}>
                Gestão de Agentes
              </Link>
            </div>
          )}

          {showEditModal && (
            <EditProfileModal
              user={user}
              token={user.token}
              onClose={() => setShowEditModal(false)}
              onSuccess={handleUpdateSuccess}
            />
          )}
          {showPasswordModal && (
            <ChangePasswordModal
              token={user.token}
              onClose={() => setShowPasswordModal(false)}
            />
          )}
        </div>
      </main>
    </div>
  );
}