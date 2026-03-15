'use client';

import { useState } from 'react';
import axios from 'axios';
import FormField from './FormField';
import AeroSelect from '../components/AeroSelect';
import styles from './AddRuleForm.module.css';

const RULE_SECTIONS = ['Personagem', 'Combate', 'Perícias', 'Sanidade', 'Investigação', 'Equipamento', 'Geral'];

export default function AddRuleForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    section: '',
    content: '',
    subsection: '',
    tags: '',
    source: '',
    pageReference: ''
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
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/rules`, payload);

      setMessage({ type: 'success', text: 'Regra de investigação adicionada com sucesso!' });
      setFormData({
        title: '', section: '', content: '', subsection: '',
        tags: '', source: '', pageReference: ''
      });
      onSuccess?.();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Erro de Protocolo: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.aeroForm}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Adicionar Nova Regra</h3>
      </div>

      <div className={styles.formContent}>
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.type === 'success' ? '📖 ' : '❌ '}
            {message.text}
          </div>
        )}

        <div className={styles.grid}>
          <FormField
            label="Título da Regra *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="ex: Teste de Sanidade"
            required
          />

          {/* CORREÇÃO: Usando name="section" e o handleChange padrão */}
          <AeroSelect
            label="Seção *"
            name="section"
            options={RULE_SECTIONS}
            value={formData.section}
            onChange={handleChange}
            placeholder="-- Escolher Seção --"
            required
          />
        </div>

        <FormField
          label="Conteúdo Detalhado *"
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="O texto completo da regra..."
          isTextarea
          required
        />

        <div className={styles.grid}>
          <FormField
            label="Subseção"
            name="subsection"
            value={formData.subsection}
            onChange={handleChange}
            placeholder="Opcional: nome da subseção"
          />

          <FormField
            label="Referência de Página"
            name="pageReference"
            value={formData.pageReference}
            onChange={handleChange}
            placeholder="ex: p. 42"
          />
        </div>

        <div className={styles.grid}>
          <FormField
            label="Fonte / Livro"
            name="source"
            value={formData.source}
            onChange={handleChange}
            placeholder="ex: Livro Base"
          />

          <FormField
            label="Tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Tags separadas por vírgula"
          />
        </div>

        <button type="submit" disabled={loading} className={styles.aeroButton}>
          {loading ? 'Arquivando...' : 'Adicionar Regra'}
        </button>
      </div>
    </form>
  );
}