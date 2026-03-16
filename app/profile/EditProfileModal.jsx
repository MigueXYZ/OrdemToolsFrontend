'use client';

import { useState } from 'react';
import axios from 'axios';
import styles from './EditProfileModal.module.css';

export default function EditProfileModal({ user, token, onClose, onSuccess }) {
  const [shownName, setShownName] = useState(user?.shownName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Ajusta este endpoint de acordo com a rota real da tua API para atualizar o perfil
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/updatedetails`, 
        { shownName },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Chamamos o onSuccess passando os dados atualizados para atualizar o Contexto
      onSuccess(response.data.data || { ...user, shownName });
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.response?.data?.error || 'Ocorreu um erro ao atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Editar Perfil</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Nome de Exibição</label>
            <input
              type="text"
              className={styles.input}
              value={shownName}
              onChange={(e) => setShownName(e.target.value)}
              placeholder="Como quer ser chamado?"
              maxLength={30}
            />
            <span className={styles.hint}>Este nome será visível para os outros agentes.</span>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveButton} disabled={loading}>
              {loading ? 'A Guardar...' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}