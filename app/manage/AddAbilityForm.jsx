'use client';

import { useState } from 'react';
import axios from 'axios';
import FormField from './FormField';
import styles from './AddAbilityForm.module.css';

const ABILITY_CATEGORIES = ['Poderes de Ocultista', 'Poderes de Especialista', 'Poderes de Combatente', 'Poderes Paranormais', 'Poder de Origem'];

export default function AddAbilityForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    origin: '',
    requirements: '',
    category: '',
    trainedSkills: '',
    tags: '',
    book: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'category' && value !== 'Poder de Origem') {
        updated.origin = '';
        updated.trainedSkills = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      };
      if (formData.category === 'Poder de Origem') {
        if (formData.origin) payload.origin = formData.origin;
        payload.associatedPower = formData.name;
        payload.trainedSkills = formData.trainedSkills
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/abilities`,
        payload
      );

      setMessage({ type: 'success', text: 'Poder adicionado com sucesso!' });
      setFormData({
        name: '',
        description: '',
        origin: '',
        requirements: '',
        category: '',
        trainedSkills: '',
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
      <h3>Adicionar Novo Poder</h3>

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
          placeholder="ex: Telecinesia (ou nome do poder)"
          required
        />

        <FormField
          label="Categoria"
          name="category"
          value={formData.category}
          onChange={handleChange}
          isSelect
          options={ABILITY_CATEGORIES}
          cacheKey="ability_category"
          required
        />
      </div>

      <FormField
        label="Descrição"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Breve descrição do poder"
        isTextarea
        required
      />

      <FormField
        label="Requisitos"
        name="requirements"
        value={formData.requirements}
        onChange={handleChange}
        placeholder="O que o personagem precisa para usar este poder?"
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

      {formData.category === 'Poder de Origem' && (
        <>
          <FormField
            label="Nome da Origem"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            placeholder="ex: Acadêmico"
            required
          />

          <FormField
            label="Perícias treinadas"
            name="trainedSkills"
            value={formData.trainedSkills}
            onChange={handleChange}
            placeholder="Separadas por vírgula (ex: Ciências, Investigação)"
          />
        </>
      )}

      <FormField
        label="Tags"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="Separadas por vírgula (ex: paranormal, telecinesia, combate)"
      />

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'Adicionando...' : 'Adicionar Poder'}
      </button>
    </form>
  );
}
