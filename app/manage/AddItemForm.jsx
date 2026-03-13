'use client';

import { useState } from 'react';
import axios from 'axios';
import FormField from './FormField';
import styles from './AddItemForm.module.css';

export default function AddItemForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    paranormal: false,
    space: '1',
    tags: '',
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
      const payload = {
        ...formData,
        paranormal: formData.paranormal || false,
        space: parseFloat(formData.space),
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/items`,
        payload
      );

      setMessage({ type: 'success', text: 'Item adicionado com sucesso!' });
      setFormData({ name: '', description: '', category: '', paranormal: false, space: '1', tags: '', book: '' });
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
      <h3>Adicionar Novo Item</h3>

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
          placeholder="ex: Amuleto de Proteção"
          required
        />

        <FormField
          label="Categoria"
          name="category"
          value={formData.category}
          onChange={handleChange}
          isSelect
          options={['0', '1', '2', '3', '4']}
          placeholder="Selecione a categoria"
        />

        <FormField
          label="Paranormal?"
          name="paranormal"
          type="checkbox"
          value={formData.paranormal}
          onChange={handleChange}
        />

        <FormField
          label="Espaço"
          name="space"
          value={formData.space}
          onChange={handleChange}
          placeholder="ex: 1, 2, 0.5"
        />
      </div>

      <FormField
        label="Descrição"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Breve descrição do item"
        isTextarea
      />

      <div className={styles.grid}>
        <FormField
          label="Livro"
          name="book"
          value={formData.book}
          onChange={handleChange}
          placeholder="Nome do livro onde aparece"
        />
      </div>

      <FormField
        label="Tags"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="Separadas por vírgula (ex: artefato, mágico)"
      />

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'Adicionando...' : 'Adicionar Item'}
      </button>
    </form>
  );
}