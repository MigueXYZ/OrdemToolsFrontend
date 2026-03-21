'use client';

// 1. IMPORTAR O useContext
import { useState, useContext } from 'react';
import axios from 'axios';
import FormField from './FormField';
import AeroSelect from '../components/AeroSelect';
import { AuthContext } from '../context/AuthContext'; // Ajustar caminho se necessário
import styles from './AddWeaponForm.module.css';

const PROFICIENCIES = ['Simples', 'Tática', 'Pesada'];
const TYPES = ['Corpo a Corpo', 'Arremesso', 'Disparo', 'Fogo'];
const GRIPS = ['Leve', 'Uma Mão', 'Duas Mãos'];
const DAMAGE_TYPES = ['Corte', 'Impacto', 'Perfuração', 'Balístico', 'Fogo'];
const CATEGORIES = ['0', '1', '2', '3', '4'];
const RANGES = ['Nenhum', 'Curto', 'Médio', 'Longo', 'Extremo'];

export default function AddWeaponForm({ onSuccess }) {
  // 2. IR BUSCAR O UTILIZADOR AO CONTEXTO
  const { user } = useContext(AuthContext);

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

    // SEGURANÇA BÁSICA: Verificar se existe token
    if (!user || !user.token) {
      setMessage({ type: 'error', text: 'Não tem sessão iniciada ou o token é inválido.' });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        space: parseInt(formData.space) || 1,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      };

      if (formData.range === 'Nenhum' || !formData.range) delete payload.range;

      // 3. USAR O user.token DO CONTEXTO NO CABEÇALHO
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/weapons`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      setMessage({ type: 'success', text: 'Armamento registado no arsenal!' });
      setFormData({
        name: '', description: '', category: '', proficiency: '',
        type: '', grip: '', damage: '', critical: '20/x2',
        range: '', damageType: '', space: '1', notes: '', book: '', tags: ''
      });
      onSuccess?.();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Erro balístico: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.aeroForm}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Adicionar Nova Arma</h3>
      </div>

      <div className={styles.formContent}>
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.type === 'success' ? '⚔️ ' : '⚠️ '} {message.text}
          </div>
        )}

        <div className={styles.grid}>
          <FormField
            label="Nome da Arma *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="ex: Espada Longa"
            required
          />

          <AeroSelect
            label="Tipo de Dano *"
            name="damageType"
            options={DAMAGE_TYPES}
            value={formData.damageType}
            onChange={handleChange}
            placeholder="-- Selecionar --"
            required
          />
        </div>

        <FormField
          label="Descrição Visual"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descreva a aparência e detalhes da arma..."
          isTextarea
        />

        <div className={styles.grid}>
          <AeroSelect
            label="Categoria *"
            name="category"
            options={CATEGORIES}
            value={formData.category}
            onChange={handleChange}
            required
          />
          <AeroSelect
            label="Proficiência *"
            name="proficiency"
            options={PROFICIENCIES}
            value={formData.proficiency}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.grid}>
          <AeroSelect
            label="Tipo *"
            name="type"
            options={TYPES}
            value={formData.type}
            onChange={handleChange}
            required
          />
          <AeroSelect
            label="Empunhadura *"
            name="grip"
            options={GRIPS}
            value={formData.grip}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.grid3}>
          <FormField
            label="Dano *"
            name="damage"
            value={formData.damage}
            onChange={handleChange}
            placeholder="ex: 1d8, 2d6"
            required
          />
          <FormField
            label="Crítico *"
            name="critical"
            value={formData.critical}
            onChange={handleChange}
            placeholder="20/x2"
            required
          />
          <AeroSelect
            label="Alcance"
            name="range"
            options={RANGES}
            value={formData.range}
            onChange={handleChange}
            placeholder="Nenhum"
          />
        </div>

        <div className={styles.grid}>
          <FormField
            label="Espaço *"
            name="space"
            value={formData.space}
            onChange={handleChange}
            type="number"
            required
          />
          <FormField
            label="Livro de Origem"
            name="book"
            value={formData.book}
            onChange={handleChange}
            placeholder="Livro e pág."
          />
        </div>

        <FormField
          label="Propriedades e Notas"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Regras especiais da arma (ex: Versátil, Defensiva...)"
          isTextarea
        />

        <FormField
          label="Tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="mágica, pesada, ágil (separadas por vírgula)"
        />

        <button type="submit" disabled={loading} className={styles.aeroButton}>
          {loading ? 'Forjando...' : 'Adicionar Arma ao Arsenal'}
        </button>
      </div>
    </form>
  );
}