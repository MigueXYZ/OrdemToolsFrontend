'use client';

// 1. IMPORTAR O useContext E useRouter
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import FormField from './FormField';
import AeroSelect from '../components/AeroSelect';
import { AuthContext } from '../context/AuthContext';
import styles from './AddTrackForm.module.css';

export default function AddTrackForm({ onSuccess }) {
  const { user } = useContext(AuthContext);
  const router = useRouter();

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
    console.log("🛠️ O botão de submeter foi clicado! A iniciar validações...");
    
    setLoading(true);
    setMessage(null);

    // 1. VALIDAÇÃO MANUAL (Substitui os "required" do HTML)
    if (!formData.name.trim() || !formData.class || !formData.description.trim()) {
      setMessage({ type: 'error', text: 'Por favor, preencha o Nome, a Classe Base e a Descrição da Trilha.' });
      setLoading(false);
      return;
    }

    // 2. VALIDAÇÃO DOS PODERES
    if (formData.abilities.length !== 4) {
      setMessage({ type: 'error', text: `Protocolo incompleto: selecione exatamente 4 poderes (tem ${formData.abilities.length}).` });
      setLoading(false);
      return;
    }

    // 3. SEGURANÇA BÁSICA: Verificar se existe token
    if (!user || !user.token) {
      setMessage({ type: 'error', text: 'Não tem sessão iniciada ou o token é inválido.' });
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 A enviar dados para a API:", formData);
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      
      // Limpar form
      setFormData({ name: '', class: '', abilities: [], description: '', book: '' });
      
      onSuccess?.();

      alert('Nova Trilha registada no arquivo com sucesso!');
      window.location.assign('/manage?category=tracks');

    } catch (error) {
      console.error("❌ Erro na API:", error);
      setMessage({ type: 'error', text: `Erro: ${error.response?.data?.message || error.message}` });
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
          {/* REMOVIDO O 'required' DAQUI */}
          <FormField
            label="Nome da Trilha *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="ex: Trilha do Guerreiro"
          />

          {/* REMOVIDO O 'required' DAQUI */}
          <AeroSelect
            label="Classe Base *"
            name="class"
            options={classes.map(cls => ({ label: cls.name, value: cls._id }))}
            value={formData.class}
            onChange={handleChange}
            placeholder="-- Selecionar Classe --"
          />
        </div>

        {/* REMOVIDO O 'required' DAQUI */}
        <FormField
          label="Descrição da Trilha *"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Resumo das capacidades desta trilha..."
          isTextarea
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
            /* Se pressionares Enter na barra de pesquisa, impede que o form seja submetido acidentalmente */
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} 
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