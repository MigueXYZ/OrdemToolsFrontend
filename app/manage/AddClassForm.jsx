'use client';

import { useState } from 'react';
import axios from 'axios';
import FormField from './FormField';
import styles from './AddClassForm.module.css';

export default function AddClassForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    book: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/classes`,
        formData
      );

      setMessage({ type: 'success', text: 'Classe de prestígio registada com sucesso!' });
      setFormData({ name: '', description: '', book: '' });
      onSuccess?.();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Falha na Ordem: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.aeroForm}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Adicionar Nova Classe</h3>
      </div>

      <div className={styles.formContent}>
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.type === 'success' ? '🛡️ ' : '❌ '}
            {message.text}
          </div>
        )}

        <div className={styles.grid}>
          <FormField
            label="Nome da Classe *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="ex: Guerreiro"
            required
          />

          <FormField
            label="Livro de Referência"
            name="book"
            value={formData.book}
            onChange={handleChange}
            placeholder="Nome do livro e pág."
          />
        </div>

        <FormField
          label="Descrição da Classe *"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Breve descrição das capacidades da classe..."
          isTextarea
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={styles.aeroButton}
        >
          {loading ? 'Processando Arquivos...' : 'Adicionar Classe'}
        </button>
      </div>
    </form>
  );
}