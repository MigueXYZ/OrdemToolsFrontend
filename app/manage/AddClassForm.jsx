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

      setMessage({ type: 'success', text: 'Classe adicionada com sucesso!' });
      setFormData({
        name: '',
        description: '',
        book: ''
      });
      onSuccess?.();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Erro: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3>Adicionar Nova Classe</h3>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.grid}>
        <FormField
          label="Nome"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="ex: Guerreiro"
          required
        />

        <FormField
          label="Livro"
          name="book"
          value={formData.book}
          onChange={handleChange}
          placeholder="Nome do livro onde aparece"
        />
      </div>

      <FormField
        label="Descrição"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Breve descrição da classe"
        isTextarea
        required
      />

      <button
        type="submit"
        disabled={loading}
        className={styles.submitButton}
      >
        {loading ? 'Adicionando...' : 'Adicionar Classe'}
      </button>
    </form>
  );
}