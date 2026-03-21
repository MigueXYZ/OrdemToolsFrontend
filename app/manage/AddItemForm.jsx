'use client';

// 1. IMPORTAR O useContext
import { useState, useContext } from 'react';
import axios from 'axios';
import FormField from './FormField';
import AeroSelect from '../components/AeroSelect';
import { AuthContext } from '../context/AuthContext'; // Ajusta o caminho se necessário
import styles from './AddItemForm.module.css';

export default function AddItemForm({ onSuccess }) {
  // 2. IR BUSCAR O UTILIZADOR AO CONTEXTO
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    paranormal: 'false', 
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

    // SEGURANÇA BÁSICA: Verificar se existe token
    if (!user || !user.token) {
      setMessage({ type: 'error', text: 'Não tem sessão iniciada ou o token é inválido.' });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        paranormal: formData.paranormal === 'true', 
        space: parseFloat(formData.space) || 0,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      };

      // 3. USAR O user.token DO CONTEXTO NO CABEÇALHO DO PEDIDO
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/items`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      setMessage({ type: 'success', text: 'Item de inventário adicionado com sucesso!' });
      
      // Limpar formulário
      setFormData({ name: '', description: '', category: '', paranormal: 'false', space: '1', tags: '', book: '' });
      
      onSuccess?.();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Falha no Inventário: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.aeroForm}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Adicionar Novo Item</h3>
      </div>

      <div className={styles.formContent}>
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.type === 'success' ? '🧭 ' : '❌ '}
            {message.text}
          </div>
        )}

        <div className={styles.singleColumn}>
          <FormField
            label="Nome do Item *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="ex: Amuleto de Proteção"
            required
          />
        </div>

        <div className={styles.tripleGrid}>
          <AeroSelect
            label="Categoria"
            name="category"
            options={['0', '1', '2', '3', '4']}
            value={formData.category}
            onChange={handleChange}
            placeholder="--"
          />
          
          <FormField
            label="Espaço"
            name="space"
            value={formData.space}
            onChange={handleChange}
            placeholder="1"
          />

          <AeroSelect
            label="Paranormal?"
            name="paranormal"
            options={[
              { label: 'Sim', value: 'true' },
              { label: 'Não', value: 'false' }
            ]}
            value={formData.paranormal}
            onChange={handleChange}
          />
        </div>

        <FormField
          label="Descrição dos Efeitos"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descreva as propriedades do item..."
          isTextarea
        />

        <div className={styles.grid}>
          <FormField label="Livro" name="book" value={formData.book} onChange={handleChange} placeholder="Livro e pág." />
          <FormField label="Tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="artefato, amaldiçoado..." />
        </div>

        <button type="submit" disabled={loading} className={styles.aeroButton}>
          {loading ? 'Equipando...' : 'Adicionar Item ao Banco'}
        </button>
      </div>
    </form>
  );
}