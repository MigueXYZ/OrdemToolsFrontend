'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import FormField from './FormField';
import styles from './AddTrackForm.module.css';

export default function AddTrackForm({ onSuccess }) {
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
        console.error('Error fetching data:', error);
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
    setMessage(null);

    if (formData.abilities.length !== 4) {
      setMessage({ type: 'error', text: 'Selecione exatamente 4 poderes' });
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks`,
        formData
      );

      setMessage({ type: 'success', text: 'Trilha adicionada com sucesso!' });
      setFormData({
        name: '',
        class: '',
        abilities: [],
        description: '',
        book: ''
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
      <h3>Adicionar Nova Trilha</h3>

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
          placeholder="ex: Trilha do Guerreiro"
          required
        />

        <div className={styles.fieldGroup}>
          <label htmlFor="class" className={styles.label}>
            Classe
            <span className={styles.required}>*</span>
          </label>
          <select
            id="class"
            name="class"
            value={formData.class}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="">-- Selecione uma classe --</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FormField
        label="Descrição"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Breve descrição da trilha"
        isTextarea
        required
      />

      <div className={styles.grid}>
        <FormField
          label="Livro"
          name="book"
          value={formData.book}
          onChange={handleChange}
          placeholder="Nome do livro onde aparece"
        />
      </div>

      <div className={styles.abilitiesSection}>
        <label className={styles.abilitiesLabel}>
          Poderes (selecione exatamente 4)
          <span className={styles.required}>*</span>
        </label>

        <input
          type="text"
          placeholder="🔍 Procurar poderes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.selectedPreview}>
          {formData.abilities.length > 0 && (
            <div>
              <strong>Selecionados ({formData.abilities.length}/4):</strong>
              <div className={styles.selectedList}>
                {formData.abilities.map((id) => {
                  const ability = abilities.find(a => a._id === id);
                  return (
                    <div key={id} className={styles.selectedItem}>
                      <span>{ability?.name}</span>
                      <button
                        type="button"
                        onClick={() => handleAbilityChange(id)}
                        className={styles.removeButton}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={styles.abilitiesList}>
          {abilities
            .filter((ability) =>
              ability.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ability.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((ability) => (
              <div
                key={ability._id}
                className={`${styles.abilityItem} ${
                  formData.abilities.includes(ability._id) ? styles.selected : ''
                }`}
                onClick={() => handleAbilityChange(ability._id)}
              >
                <input
                  type="checkbox"
                  checked={formData.abilities.includes(ability._id)}
                  onChange={() => handleAbilityChange(ability._id)}
                  disabled={!formData.abilities.includes(ability._id) && formData.abilities.length >= 4}
                  className={styles.checkbox}
                />
                <div className={styles.abilityInfo}>
                  <div className={styles.abilityName}>{ability.name}</div>
                  {ability.description && (
                    <div className={styles.abilityDescription}>{ability.description}</div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={styles.submitButton}
      >
        {loading ? 'Adicionando...' : 'Adicionar Trilha'}
      </button>
    </form>
  );
}