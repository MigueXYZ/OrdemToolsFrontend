'use client';

import { useState } from 'react';
import axios from 'axios';
import FormField from './FormField';
import styles from './AddWeaponForm.module.css';

const PROFICIENCIES = ['Simples', 'Tática', 'Pesada'];
const TYPES = ['Corpo a Corpo', 'Arremesso', 'Disparo', 'Fogo'];
const GRIPS = ['Leve', 'Uma Mão', 'Duas Mãos'];
const DAMAGE_TYPES = ['Corte', 'Impacto', 'Perfuração', 'Balístico', 'Fogo'];
const CATEGORIES = ['0', '1', '2', '3', '4'];
const RANGES = ['Nenhum', 'Curto', 'Médio', 'Longo', 'Extremo'];

export default function AddWeaponForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    proficiency: '',
    type: '',
    grip: '',
    damage: '',
    critical: '20/x2',
    range: '',
    damageType: '',
    space: '1',
    notes: '',
    book: '',
    tags: ''
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
        name: formData.name,
        description: formData.description,
        category: formData.category,
        proficiency: formData.proficiency,
        type: formData.type,
        grip: formData.grip,
        damage: formData.damage,
        critical: formData.critical,
        damageType: formData.damageType,
        space: parseInt(formData.space),
        notes: formData.notes,
        book: formData.book,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      };

      // Apenas adiciona range se estiver preenchido
      if (formData.range) {
        payload.range = formData.range;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/weapons`,
        payload
      );

      setMessage({ type: 'success', text: 'Arma adicionada com sucesso!' });
      setFormData({
        name: '',
        description: '',
        category: '',
        proficiency: '',
        type: '',
        grip: '',
        damage: '',
        critical: '20/x2',
        range: '',
        damageType: '',
        space: '1',
        notes: '',
        book: '',
        tags: ''
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
      <h3>Adicionar Nova Arma</h3>

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
          placeholder="ex: Espada Longa"
          required
        />

        <FormField
          label="Tipo de Dano"
          name="damageType"
          value={formData.damageType}
          onChange={handleChange}
          isSelect
          options={DAMAGE_TYPES}
          required
        />
      </div>

      <FormField
        label="Descrição"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Breve descrição da arma"
        isTextarea
      />

      <div className={styles.grid}>
        <FormField
          label="Categoria"
          name="category"
          value={formData.category}
          onChange={handleChange}
          isSelect
          options={CATEGORIES}
          required
        />

        <FormField
          label="Proficiência"
          name="proficiency"
          value={formData.proficiency}
          onChange={handleChange}
          isSelect
          options={PROFICIENCIES}
          required
        />
      </div>

      <div className={styles.grid}>
        <FormField
          label="Tipo"
          name="type"
          value={formData.type}
          onChange={handleChange}
          isSelect
          options={TYPES}
          required
        />

        <FormField
          label="Empunhadura"
          name="grip"
          value={formData.grip}
          onChange={handleChange}
          isSelect
          options={GRIPS}
          required
        />
      </div>

      <div className={styles.grid3}>
        <FormField
          label="Dano"
          name="damage"
          value={formData.damage}
          onChange={handleChange}
          placeholder="ex: 1d8+2, 2d6"
          required
        />

        <FormField
          label="Crítico"
          name="critical"
          value={formData.critical}
          onChange={handleChange}
          placeholder="ex: 19/x3, 20/x2"
          required
        />

        <FormField
          label="Alcance"
          name="range"
          value={formData.range}
          onChange={handleChange}
          isSelect
          options={RANGES}
          placeholder="Deixe vazio ou selecione 'Nenhum' para corpo a corpo"
        />
      </div>

      <div className={styles.grid}>
        <FormField
          label="Espaço"
          name="space"
          value={formData.space}
          onChange={handleChange}
          type="number"
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
        label="Notas Adicionais"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Informações extras sobre a arma"
        isTextarea
      />

      <FormField
        label="Tags"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="ex: fogo, mágica, especial (separadas por vírgula)"
      />

      <button
        type="submit"
        disabled={loading}
        className={styles.submitButton}
      >
        {loading ? 'Adicionando...' : 'Adicionar Arma'}
      </button>
    </form>
  );
}
