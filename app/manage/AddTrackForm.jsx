'use client';

// 1. IMPORTAR O useContext (junto com os outros hooks)
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import FormField from './FormField';
import AeroSelect from '../components/AeroSelect';
import { AuthContext } from '../context/AuthContext'; // Ajustar caminho se necessário
import styles from './AddTrackForm.module.css';

export default function AddTrackForm({ onSuccess }) {
  // 2. IR BUSCAR O UTILIZADOR AO CONTEXTO
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    class: '',
    abilities: [],
    description: '',
    book: ''
  });
  const [classes, setClasses] = useState([]);
  const [abilities, setAbilities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, abilitiesRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/classes?limit=1000`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/abilities?limit=1000`)
        ]);
        setClasses(classesRes.data.data);
        setAbilities(abilitiesRes.data.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAbilityChange = (abilityId) => {
    setFormData((prev) => {
      const abilities = prev.abilities.includes(abilityId)
        ? prev.abilities.filter(id => id !== abilityId)
        : prev.abilities.length < 4
        ? [...prev.abilities, abilityId]
        : prev.abilities;
      return { ...prev, abilities };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.abilities.length !== 4) {
      setMessage({ type: 'error', text: 'Protocolo incompleto: selecione exatamente 4 poderes' });
      setLoading(false);
      return;
    }

    // SEGURANÇA BÁSICA: Verificar se existe token
    if (!user || !user.token) {
      setMessage({ type: 'error', text: 'Não tem sessão iniciada ou o token é inválido.' });
      setLoading(false);
      return;
    }

    try {
      // 3. USAR O user.token DO CONTEXTO NO CABEÇALHO
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      
      setMessage({ type: 'success', text: 'Nova Trilha registada no arquivo!' });
      setFormData({ name: '', class: '', abilities: [], description: '', book: '' });
      onSuccess?.();
    } catch (error) {
      setMessage({ type: 'error', text: `Erro: ${error.response?.data?.message || error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.aeroForm}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Adicionar Nova Trilha</h3>
      </div>

      <div className={styles.formContent}>
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.type === 'success' ? '👣 ' : '⚠️ '} {message.text}
          </div>
        )}

        <div className={styles.grid}>
          <FormField
            label="Nome da Trilha *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="ex: Trilha do Guerreiro"
            required
          />

          <AeroSelect
            label="Classe Base *"
            name="class"
            options={classes.map(cls => ({ label: cls.name, value: cls._id }))}
            value={formData.class}
            onChange={handleChange}
            placeholder="-- Selecionar Classe --"
            required
          />
        </div>

        <FormField
          label="Descrição da Trilha *"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Resumo das capacidades desta trilha..."
          isTextarea
          required
        />

        <div className={styles.grid}>
          <FormField
            label="Livro de Referência"
            name="book"
            value={formData.book}
            onChange={handleChange}
            placeholder="Nome do livro e pág."
          />
        </div>

        <div className={styles.abilitiesSection}>
          <label className={styles.sectionLabel}>
            Poderes da Trilha ({formData.abilities.length}/4 selecionados)
          </label>
          
          <input
            type="text"
            placeholder="🔍 Filtrar base de dados de poderes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.aeroSearch}
          />

          <div className={styles.abilitiesContainer}>
            <div className={styles.abilitiesList}>
              {abilities
                .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((ability) => (
                  <div
                    key={ability._id}
                    className={`${styles.abilityCard} ${formData.abilities.includes(ability._id) ? styles.selected : ''}`}
                    onClick={() => handleAbilityChange(ability._id)}
                  >
                    <div className={styles.abilityHeader}>
                      <div className={styles.abilityInfo}>
                        <span className={styles.abilityName}>{ability.name}</span>
                        <span className={styles.abilityCategory}>{ability.category || 'Sem Categoria'}</span>
                      </div>
                      {formData.abilities.includes(ability._id) && <span className={styles.checkIcon}>✓</span>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className={styles.aeroButton}>
          {loading ? 'Sincronizando...' : 'Adicionar Trilha'}
        </button>
      </div>
    </form>
  );
}