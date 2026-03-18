'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import EditAdminUserModal from './EditAdminUserModal';
import styles from './page.module.css';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, hasPermission } = useContext(AuthContext);
  
  const [isClient, setIsClient] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para o modal que faremos a seguir
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDeleteSuccess = (deletedId) => {
    // Filtra o utilizador apagado da tabela
    setUsers(prevUsers => prevUsers.filter(u => u._id !== deletedId));
    setSelectedUser(null);
  };

  useEffect(() => {
    if (!isClient) return;

    // Verificação estrita de segurança
    if (!user || !hasPermission('admin')) {
      router.push('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setUsers(response.data);
      } catch (err) {
        console.error('Erro ao carregar agentes:', err);
        setError('Não foi possível carregar a lista de agentes. Verifique a ligação ao servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, hasPermission, router, isClient]);

  // A função deve estar AQUI FORA para poder ser passada ao Modal
  const handleSuccess = (updatedUser) => {
    // Atualiza a tabela na interface imediatamente usando o estado anterior para segurança
    setUsers(prevUsers => prevUsers.map(u => u._id === updatedUser._id ? updatedUser : u));
    
    // Fecha o modal
    setSelectedUser(null);
  };

  if (!isClient || loading) {
    return <div className={styles.loadingBox}><p>A estabelecer ligação segura...</p></div>;
  }

  if (error) {
    return <div className={styles.errorBox}><p>{error}</p></div>;
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/profile" className={styles.backLink}>&larr; Voltar ao Perfil</Link>
            <ThemeToggle />
          </div>
          <h1 className={styles.title}>Gestão de Agentes</h1>
          <p className={styles.subtitle}>Administração de credenciais e níveis de acesso da base de dados.</p>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.categorySection}>
          <h3 className={styles.categoryTitle}>
            Pessoal Registado <span className={styles.itemCount}>({users.length})</span>
          </h3>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Nome de Exibição</th>
                  <th>Nome de Utilizador</th>
                  <th>Nível de Acesso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((agent) => (
                  <tr key={agent._id} className={styles.tableRow}>
                    <td className={styles.nameCell}>{agent.shownName || 'Não definido'}</td>
                    <td>{agent.username}</td>
                    <td>
                      <div className={styles.tagsCell}>
                        {(agent.permissions || []).length > 0 ? (
                          agent.permissions.map(perm => (
                            <span key={perm} className={`${styles.tag} ${perm === 'admin' ? styles.tagAdmin : ''}`}>
                              {perm}
                            </span>
                          ))
                        ) : (
                          <span className={styles.tag}>Agente Base</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button 
                        className={styles.editButton}
                        onClick={() => setSelectedUser(agent)}
                      >
                        Gerir Permissões
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selectedUser && (
        <EditAdminUserModal 
          targetUser={selectedUser} 
          token={user.token} 
          onClose={() => setSelectedUser(null)} 
          onSuccess={handleSuccess} 
          onDelete={handleDeleteSuccess}
        />
      )}
    </div>
  );
}