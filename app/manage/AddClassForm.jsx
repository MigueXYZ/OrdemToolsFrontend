'use client';

import { useState } from 'react';
import axios from 'axios';
import FormField from './FormField';
import styles from './AddClassForm.module.css';

export default function AddClassForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    book: '',
    hpInitial: '',
    hpPerLevel: '',
    epInitial: '',
    epPerLevel: '',
    sanInitial: '',
    sanPerLevel: '',
    trainedSkills: '',
    proficiencies: ''
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
      // Reconstruir o payload para corresponder à nova estrutura do Backend
      const payload = {
        name: formData.name,
        description: formData.description,
        book: formData.book,
        hp: {
          initial: formData.hpInitial,
          perLevel: formData.hpPerLevel
        },
        ep: {
          initial: formData.epInitial,
          perLevel: formData.epPerLevel
        },
        san: {
          initial: formData.sanInitial,
          perLevel: formData.sanPerLevel
        },
        trainedSkills: formData.trainedSkills,
        proficiencies: formData.proficiencies
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/classes`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` // Garantir autenticação
          }
        }
      );

      setMessage({ type: 'success', text: 'Classe de prestígio registada com sucesso!' });
      
      // Limpar formulário após sucesso
      setFormData({ 
        name: '', description: '', book: '',
        hpInitial: '', hpPerLevel: '',
        epInitial: '', epPerLevel: '',
        sanInitial: '', sanPerLevel: '',
        trainedSkills: '', proficiencies: ''
      });
      
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

        {/* Informação Básica */}
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

        {/* Estatísticas Vitais */}
        <h4 className={styles.sectionDivider}>Características Iniciais</h4>
        
        <div className={styles.statsGrid}>
          {/* Pontos de Vida */}
          <div className={styles.statBox}>
            <h5 className={styles.statBoxTitle}>Pontos de Vida (PV)</h5>
            <FormField label="Iniciais" name="hpInitial" value={formData.hpInitial} onChange={handleChange} placeholder="ex: 20 + Vigor" />
            <FormField label="A cada novo NEX" name="hpPerLevel" value={formData.hpPerLevel} onChange={handleChange} placeholder="ex: 4 PV (+Vig)" />
          </div>

          {/* Pontos de Esforço */}
          <div className={styles.statBox}>
            <h5 className={styles.statBoxTitle}>Pontos de Esforço (PE)</h5>
            <FormField label="Iniciais" name="epInitial" value={formData.epInitial} onChange={handleChange} placeholder="ex: 2 + Presença" />
            <FormField label="A cada novo NEX" name="epPerLevel" value={formData.epPerLevel} onChange={handleChange} placeholder="ex: 2 PE (+Pre)" />
          </div>

          {/* Sanidade */}
          <div className={styles.statBox}>
            <h5 className={styles.statBoxTitle}>Sanidade (SAN)</h5>
            <FormField label="Inicial" name="sanInitial" value={formData.sanInitial} onChange={handleChange} placeholder="ex: 12" />
            <FormField label="A cada novo NEX" name="sanPerLevel" value={formData.sanPerLevel} onChange={handleChange} placeholder="ex: 3 SAN" />
          </div>
        </div>

        {/* Proficiências e Perícias */}
        <h4 className={styles.sectionDivider}>Treino</h4>
        <div className={styles.grid}>
          <FormField
            label="Perícias Treinadas"
            name="trainedSkills"
            value={formData.trainedSkills}
            onChange={handleChange}
            placeholder="ex: Luta ou Pontaria (uma das duas)..."
            isTextarea
          />
          <FormField
            label="Proficiências"
            name="proficiencies"
            value={formData.proficiencies}
            onChange={handleChange}
            placeholder="ex: Armas simples e proteções leves..."
            isTextarea
          />
        </div>

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