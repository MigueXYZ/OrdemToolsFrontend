'use client';

import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import styles from './page.module.css';
import EditProfileModal from './EditProfileModal';

export default function ProfilePage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { user, logout, hasPermission, updateUser } = useContext(AuthContext); 
  const [showEditModal, setShowEditModal] = useState(false);

  // Garantir que a hidratação do cliente ocorreu para evitar erros de renderização
  useEffect(() => {
    setIsClient(true);
    if (!user && isClient) {
      router.push('/login');
    }
  }, [user, isClient, router]);

  // A função deve estar AQUI FORA do useEffect, para poder ser usada no return lá em baixo
  const handleUpdateSuccess = (updatedUser) => {
    setShowEditModal(false);
    
    // Se o teu AuthContext tiver uma função updateUser, usa-a aqui:
    if (updateUser) {
      updateUser(updatedUser);
    } else {
      // Se não tiver, a solução mais rápida é recarregar a página para o contexto ir buscar os novos dados
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

          <div className={styles.actionsSection}>
            <button className={styles.editButton} onClick={() => setShowEditModal(true)}>
              Editar Perfil
            </button>
            <button onClick={logout} className={styles.logoutButton}>Terminar Sessão</button>
          </div>
          
          {showEditModal && (
            <EditProfileModal
              user={user}
              token={user.token}
              onClose={() => setShowEditModal(false)}
              onSuccess={handleUpdateSuccess}
            />
          )}
        </div>
      </main>
    </div>
  );
}