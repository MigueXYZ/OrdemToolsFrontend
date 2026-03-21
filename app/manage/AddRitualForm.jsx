'use client';

// 1. IMPORTAR O useContext
import { useState, useContext } from 'react';
import axios from 'axios';
import FormField from './FormField';
import AeroSelect from '../components/AeroSelect'; 
import { AuthContext } from '../context/AuthContext'; // Ajustar o caminho se necessário
import styles from './AddRitualForm.module.css';

export default function AddRitualForm({ onSuccess }) {
  // 2. IR BUSCAR O UTILIZADOR AO CONTEXTO
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    circle: '',
    elements: '',
    execution: '', // NOVO
    range: '',     // NOVO
    target: '',    // NOVO
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

    // SEGURANÇA BÁSICA: Verificar se existe token
    if (!user || !user.token) {
      setMessage({ type: 'error', text: 'Não tem sessão iniciada ou o token é inválido.' });
      setLoading(false);
      return;
    }

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

      // 3. USAR O user.token DO CONTEXTO NO CABEÇALHO
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/rituals`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      setMessage({ type: 'success', text: 'Ritual de Ordem adicionado com sucesso!' });
      
      // Limpar formulário após o sucesso
      setFormData({
        name: '', description: '', circle: '', elements: '',
        execution: '', range: '', target: '', // NOVOS
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
            placeholder="ex: Alterar Destino"
            required
          />
        </div>

        <FormField
          label="Descrição Paranormal *"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descreva os efeitos do ritual e suas versões verdadeiro/discente..."
          isTextarea
          required
        />

        <div className={styles.grid}>
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
            placeholder="Energia, Conhecimento..."
          />
        </div>

        {/* NOVA LINHA: EXECUÇÃO, ALCANCE E ALVO (3 COLUNAS) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <FormField
            label="Execução"
            name="execution"
            value={formData.execution}
            onChange={handleChange}
            placeholder="ex: reação"
          />

          <FormField
            label="Alcance"
            name="range"
            value={formData.range}
            onChange={handleChange}
            placeholder="ex: pessoal"
          />

          <FormField
            label="Alvo"
            name="target"
            value={formData.target}
            onChange={handleChange}
            placeholder="ex: você"
          />
        </div>

        <div className={styles.grid}>
          <FormField
            label="Duração"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="ex: instantânea"
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