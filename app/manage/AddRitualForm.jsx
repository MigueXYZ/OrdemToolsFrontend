'use client';

import { useState } from 'react';
import axios from 'axios';
import FormField from './FormField';
import styles from './AddRitualForm.module.css';


export default function AddRitualForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    circle: '',
    elements: '',
    duration: '',
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
        circle: formData.circle ? parseInt(formData.circle) : undefined,
        elements: formData.elements
          .split(',')
          .map((el) => el.trim().toLowerCase())
          .filter((el) => el.length > 0),
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/rituals`,
        payload
      );

      setMessage({ type: 'success', text: 'Ritual adicionado com sucesso!' });
      setFormData({
        name: '',
        description: '',
        circle: '',
        elements: '',
        duration: '',
        tags: '',
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
      <h3>Adicionar Novo Ritual</h3>

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
          placeholder="ex: Círculo de Banimento"
          required
        />
      </div>

      <FormField
        label="Descrição"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Breve descrição do ritual"
        isTextarea
        required
      />

      <div className={styles.grid}>
        <FormField
          label="Círculo"
          name="circle"
          value={formData.circle}
          onChange={handleChange}
          isSelect
          options={[1,2,3,4].map((n) => n.toString())}
          cacheKey="ritual_circle"
        />

        <FormField
          label="Elementos"
          name="elements"
          value={formData.elements}
          onChange={handleChange}
          placeholder="Separados por vírgula (sangue, morte, energia, conhecimento, medo)"
        />
      </div>

      <div className={styles.grid}>
        <FormField
          label="Duração"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder="ex: 30 minutos"
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
        label="Tags"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="Tags separadas por vírgula"
      />

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'Adicionando...' : 'Adicionar Ritual'}
      </button>
    </form>
  );
}
