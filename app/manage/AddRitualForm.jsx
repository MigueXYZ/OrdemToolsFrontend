'use client';

import { useState } from 'react';
import axios from 'axios';
import FormField from './FormField';
import AeroSelect from '../components/AeroSelect'; 
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

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/rituals`, payload);

      setMessage({ type: 'success', text: 'Ritual de Ordem adicionado com sucesso!' });
      setFormData({
        name: '', description: '', circle: '', elements: '',
        duration: '', tags: '', book: ''
      });
      onSuccess?.();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Falha no Sigilo: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.aeroForm}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Adicionar Novo Ritual</h3>
      </div>

      <div className={styles.formContent}>
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.type === 'success' ? '✨ ' : '❌ '}
            {message.text}
          </div>
        )}

        <div className={styles.singleColumn}>
          <FormField
            label="Nome do Ritual *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="ex: Círculo de Banimento"
            required
          />
        </div>

        <FormField
          label="Descrição Paranormal *"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descreva os efeitos do ritual..."
          isTextarea
          required
        />

        <div className={styles.grid}>
          {/* CORREÇÃO: Usando name="circle" e o handleChange padrão */}
          <AeroSelect
            label="Círculo"
            name="circle"
            options={['1', '2', '3', '4']}
            value={formData.circle}
            onChange={handleChange}
            placeholder="-- Escolher Círculo --"
          />

          <FormField
            label="Elementos"
            name="elements"
            value={formData.elements}
            onChange={handleChange}
            placeholder="sangue, morte, energia..."
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
            label="Livro de Referência"
            name="book"
            value={formData.book}
            onChange={handleChange}
            placeholder="Nome do livro e pág."
          />
        </div>

        <FormField
          label="Tags de Pesquisa"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Tags separadas por vírgula"
        />

        <button type="submit" disabled={loading} className={styles.aeroButton}>
          {loading ? 'Invocando...' : 'Adicionar Ritual'}
        </button>
      </div>
    </form>
  );
}