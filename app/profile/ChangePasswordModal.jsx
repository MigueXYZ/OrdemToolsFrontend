'use client';

import { useState } from 'react';
import axios from 'axios';
import styles from './EditProfileModal.module.css'; // Podemos reciclar o CSS do modal de edição!

export default function ChangePasswordModal({ token, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('As novas palavras-passe não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000); // Fecha automaticamente após 2 segundos de sucesso
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar a palavra-passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Alterar Palavra-passe</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        {success ? (
          <div className={styles.form} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <h3 style={{ color: '#00cc66', marginBottom: '1rem' }}>Sucesso!</h3>
            <p style={{ color: 'var(--text-primary)' }}>A sua palavra-passe foi atualizada de forma segura.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.field}>
              <label className={styles.label}>Palavra-passe Atual</label>
              <input
                type="password"
                className={styles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nova Palavra-passe</label>
              <input
                type="password"
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Confirmar Nova Palavra-passe</label>
              <input
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? 'A processar...' : 'Guardar Alterações'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}