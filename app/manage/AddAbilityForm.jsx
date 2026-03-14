'use client';

import { useState } from 'react';
import axios from 'axios';
import FormField from './FormField'; // Assumindo que este componente existe
import AeroSelect from '../components/AeroSelect';
import styles from './AddAbilityForm.module.css';

const ABILITY_CATEGORIES = [
  'Poderes de Ocultista',
  'Poderes de Especialista',
  'Poderes de Combatente',
  'Poderes Paranormais',
  'Poder de Origem'
];

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
      // Configurar payload
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

      // Enviar para a API
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/abilities`,
        payload
      );

      // Sucesso
      setMessage({ type: 'success', text: 'Poder paranormal adicionado ao banco de dados!' });
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
      // Erro
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Falha na conexão: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.aeroForm}>
      {/* Cabeçalho do formulário com efeito de vidro polido */}
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Adicionar Novo Poder</h3>
        <div className={styles.glossyReflect}></div>
      </div>

      <div className={styles.formContent}>
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.type === 'success' ? '✅ ' : '❌ '}
            {message.text}
          </div>
        )}

        <div className={styles.grid}>
          <FormField
            label="Nome do Poder *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="ex: Telecinesia"
            required
            className={styles.aeroInput}
          />

          <AeroSelect
            label="Categoria *"
            options={ABILITY_CATEGORIES}
            value={formData.category}
            onChange={handleChange}
            placeholder="-- Selecionar categoria *"
            required
          />
        </div>

        <FormField
          label="Descrição do Poder *"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descreva os efeitos paranormais..."
          isTextarea
          required
          className={styles.aeroTextarea}
        />

        <FormField
          label="Requisitos"
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          placeholder="O que o personagem precisa? (ex: NEX 30%)"
          isTextarea
          className={styles.aeroTextarea}
        />

        <div className={styles.grid}>
          <FormField
            label="Livro de Referência"
            name="book"
            value={formData.book}
            onChange={handleChange}
            placeholder="ex: Livro Básico - pág. 120"
            className={styles.aeroInput}
          />
        </div>

        {/* Campos dinâmicos para Poder de Origem */}
        {formData.category === 'Poder de Origem' && (
          <div className={`${styles.grid} ${styles.extraFields} ${styles.fadeIn}`}>
            <FormField
              label="Nome da Origem *"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              placeholder="ex: Acadêmico"
              required
              className={styles.aeroInput}
            />

            <FormField
              label="Perícias Treinadas"
              name="trainedSkills"
              value={formData.trainedSkills}
              onChange={handleChange}
              placeholder="Separadas por vírgula (ex: Ciências, Investigação)"
              className={styles.aeroInput}
            />
          </div>
        )}

        <FormField
          label="Tags de Pesquisa"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="ex: paranormal, combate, dano (separadas por vírgula)"
          className={styles.aeroInput}
        />

        {/* Botão estilo bolha/gelatina Aero */}
        <button type="submit" disabled={loading} className={styles.aeroButton}>
          {loading ? 'Adicionando...' : 'Adicionar Poder Paranormal'}
        </button>
      </div>
    </form>
  );
}