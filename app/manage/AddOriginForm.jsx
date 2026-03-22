'use client';

import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import styles from './AddOriginForm.module.css';

const SKILLS_LIST = [
  'Acrobacia', 'Adestramento', 'Artes', 'Atletismo', 'Atualidades', 'Ciências', 'Crime', 
  'Diplomacia', 'Enganação', 'Fortitude', 'Furtividade', 'Iniciativa', 'Intimidação', 
  'Intuição', 'Investigação', 'Luta', 'Medicina', 'Ocultismo', 'Percepção', 'Pilotagem', 
  'Pontaria', 'Profissão', 'Reflexos', 'Religião', 'Sobrevivência', 'Tática', 'Tecnologia', 'Vontade'
];

export default function AddOriginForm() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    book: '',
    description: '',
    powerName: '',
    powerDescription: '',
    trainedSkills: []
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      trainedSkills: prev.trainedSkills.includes(skill)
        ? prev.trainedSkills.filter(s => s !== skill)
        : [...prev.trainedSkills, skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/origins`, formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setMessage({ type: 'success', text: 'Origem adicionada com sucesso!' });
      setFormData({ name: '', book: '', description: '', powerName: '', powerDescription: '', trainedSkills: [] });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao adicionar origem.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>Adicionar Nova Origem</h2>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className={styles.formGroup} style={{ flex: 2 }}>
          <label>Nome da Origem *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Académico" />
        </div>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label>Livro / Suplemento</label>
          <input type="text" name="book" value={formData.book} onChange={handleChange} placeholder="Ex: OP Livro Básico" />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Descrição da Origem</label>
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="História e contexto..." rows="2" />
      </div>

      <div className={styles.formGroup}>
        <label>Perícias Treinadas (Selecionar as que a Origem oferece)</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', background: 'rgba(128,128,128,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(128,128,128,0.2)' }}>
          {SKILLS_LIST.map(skill => (
            <label key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)', textTransform: 'none' }}>
              <input 
                type="checkbox" 
                checked={formData.trainedSkills.includes(skill)} 
                onChange={() => handleSkillToggle(skill)} 
              />
              {skill}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Nome do Poder de Origem *</label>
        <input type="text" name="powerName" value={formData.powerName} onChange={handleChange} required placeholder="Ex: Saber é Poder" />
      </div>

      <div className={styles.formGroup}>
        <label>Descrição do Poder *</label>
        <textarea name="powerDescription" value={formData.powerDescription} onChange={handleChange} required placeholder="Descrição mecânica do poder..." rows="3" />
      </div>

      {message.text && (
        <div className={message.type === 'success' ? styles.successMsg : styles.errorMsg}>
          {message.text}
        </div>
      )}

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? 'A adicionar...' : 'Gravar Origem'}
      </button>
    </form>
  );
}