'use client';

import { useState } from 'react';
import axios from 'axios';
import styles from './EditAdminUserModal.module.css';

export default function EditAdminUserModal({ targetUser, token, onClose, onSuccess, onDelete }) {
  const [permissions, setPermissions] = useState(targetUser.permissions || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Novos estados
  const [tempPassword, setTempPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleTogglePermission = (role) => {
    if (permissions.includes(role)) {
      setPermissions(permissions.filter(p => p !== role));
    } else {
      setPermissions([...permissions, role]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/update-permissions/${targetUser._id}`,
        { permissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar o nível de acesso.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm('Tem a certeza que deseja gerar uma nova palavra-passe para este agente?')) return;
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users/${targetUser._id}/reset-password`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTempPassword(response.data.tempPassword);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao redefinir palavra-passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users/${targetUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onDelete) onDelete(targetUser._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao apagar conta.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Privilégios: {targetUser.username}</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.formContent}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.infoBox}>
              <p><strong>Nome:</strong> {targetUser.shownName || 'N/A'}</p>
              <p>Selecione as permissões a atribuir a este agente.</p>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={`${styles.checkboxLabel} ${permissions.includes('editor') ? styles.active : ''}`}>
                <input 
                  type="checkbox" 
                  checked={permissions.includes('editor')}
                  onChange={() => handleTogglePermission('editor')}
                  className={styles.hiddenInput}
                />
                <span className={styles.customCheck}></span>
                <div className={styles.checkText}>
                  <span className={styles.roleName}>Editor</span>
                  <span className={styles.roleDesc}>Pode adicionar e editar itens na base de dados.</span>
                </div>
              </label>

              <label className={`${styles.checkboxLabel} ${permissions.includes('admin') ? styles.activeAdmin : ''}`}>
                <input 
                  type="checkbox" 
                  checked={permissions.includes('admin')}
                  onChange={() => handleTogglePermission('admin')}
                  className={styles.hiddenInput}
                />
                <span className={styles.customCheck}></span>
                <div className={styles.checkText}>
                  <span className={styles.roleName}>Administrador</span>
                  <span className={styles.roleDesc}>Acesso total. Pode alterar permissões de outros agentes.</span>
                </div>
              </label>
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? 'A Aplicar...' : 'Confirmar Acessos'}
              </button>
            </div>
          </form>

          {/* ZONA DE PERIGO */}
          <div className={styles.dangerZone}>
            <h3 className={styles.dangerTitle}>Gestão de Conta</h3>
            
            {tempPassword && (
              <div className={styles.tempPasswordBox}>
                <p>Nova Palavra-passe Gerada:</p>
                <code className={styles.passwordCode}>{tempPassword}</code>
                <p className={styles.passwordWarning}>Copie e envie esta credencial ao agente. Ela não voltará a ser mostrada.</p>
              </div>
            )}

            <div className={styles.dangerActions}>
              <button 
                type="button" 
                className={styles.resetButton} 
                onClick={handleResetPassword}
                disabled={loading}
              >
                Gerar Nova Password
              </button>

              {!showDeleteConfirm ? (
                <button 
                  type="button" 
                  className={styles.deleteButton} 
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                >
                  Apagar Conta
                </button>
              ) : (
                <div className={styles.deleteConfirmBox}>
                  <span>Tem a certeza absoluta?</span>
                  <div className={styles.deleteConfirmButtons}>
                    <button type="button" className={styles.cancelDeleteButton} onClick={() => setShowDeleteConfirm(false)}>
                      Cancelar
                    </button>
                    <button type="button" className={styles.confirmDeleteButton} onClick={handleDeleteAccount}>
                      Sim, Apagar Definitivamente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}