'use client';

// 1. IMPORTAR O useContext
import { useState, useContext } from 'react';
import axios from 'axios';
import FormField from './FormField';
import AeroSelect from '../components/AeroSelect';
import { AuthContext } from '../context/AuthContext'; // Ajustar o caminho se necessário
import styles from './AddThreatForm.module.css';

const TYPES = ['Criatura', 'Humano', 'Animal'];
const SIZES = ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal'];
const ACTION_TYPES = ['Padrão', 'Movimento', 'Livre', 'Reação', 'Completa'];
const BOOLEAN_OPTIONS = ['Não', 'Sim'];

export default function AddThreatForm({ onSuccess }) {
  // 2. IR BUSCAR O UTILIZADOR AO CONTEXTO
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    vd: '',
    description: '',
    type: '',
    size: '',
    elements: '',
    defense: '',
    hpTotal: '',
    hpBloodied: '',
    movement: '',
    resistances: '',
    vulnerabilities: '',
    attributes: { agi: 0, for: 0, int: 0, pre: 0, vig: 0 },
    senses: { perception: '', initiative: '', notes: '' },
    savingThrows: { fortitude: '', reflexes: '', will: '' },
    skills: [],
    passives: [],
    actions: [],
    enigmaOfFear: { hasEnigma: false, description: '', mechanics: '' },
    book: '' 
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttributeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [name]: parseInt(value) || 0 }
    }));
  };

  const handleNestedChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleEnigmaDropdown = (e) => {
    const value = e.target.value;
    const hasEnigma = value === 'Sim';
    setFormData((prev) => ({
      ...prev,
      enigmaOfFear: { ...prev.enigmaOfFear, hasEnigma }
    }));
  };

  // --- Funções de Blocos Dinâmicos ---
  const addSkillBlock = () => {
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, { name: '', value: '' }] }));
  };

  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index][field] = value;
    setFormData((prev) => ({ ...prev, skills: updatedSkills }));
  };

  const removeSkillBlock = (indexToRemove) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((_, index) => index !== indexToRemove) }));
  };

  const addPassiveBlock = () => {
    setFormData((prev) => ({ ...prev, passives: [...prev.passives, { name: '', description: '' }] }));
  };

  const handlePassiveChange = (index, field, value) => {
    const updatedPassives = [...formData.passives];
    updatedPassives[index][field] = value;
    setFormData((prev) => ({ ...prev, passives: updatedPassives }));
  };

  const removePassiveBlock = (indexToRemove) => {
    setFormData((prev) => ({ ...prev, passives: prev.passives.filter((_, index) => index !== indexToRemove) }));
  };

  const addActionBlock = () => {
    setFormData((prev) => ({
      ...prev,
      actions: [...prev.actions, { actionType: 'Padrão', name: '', description: '', test: '', damage: '' }]
    }));
  };

  const handleActionChange = (index, field, value) => {
    const updatedActions = [...formData.actions];
    updatedActions[index][field] = value;
    setFormData((prev) => ({ ...prev, actions: updatedActions }));
  };

  const removeActionBlock = (indexToRemove) => {
    setFormData((prev) => ({ ...prev, actions: prev.actions.filter((_, index) => index !== indexToRemove) }));
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
        vd: parseInt(formData.vd) || 0,
        defense: parseInt(formData.defense) || 0,
        hp: {
          total: parseInt(formData.hpTotal) || 0,
          bloodied: parseInt(formData.hpBloodied) || Math.floor((parseInt(formData.hpTotal) || 0) / 2)
        },
        elements: formData.elements.split(',').map((e) => e.trim()).filter(Boolean),
        resistances: formData.resistances.split(',').map((r) => r.trim()).filter(Boolean),
        vulnerabilities: formData.vulnerabilities.split(',').map((v) => v.trim()).filter(Boolean)
      };

      // 3. USAR O user.token DO CONTEXTO NO CABEÇALHO
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/threats`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      setMessage({ type: 'success', text: 'Ameaça registada na base de dados.' });
      
      // Limpeza opcional do form aqui (ou podes deixar fechado pelo onSuccess)
      onSuccess?.();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Falha na Contenção: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.aeroForm}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Adicionar Nova Ameaça</h3>
      </div>

      <div className={styles.formContent}>
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.type === 'success' ? '💀 ' : '⚠️ '} {message.text}
          </div>
        )}

        <FormField 
          label="Descrição da Ameaça" 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          isTextarea 
          placeholder="Descrição narrativa da criatura, comportamento, aparência, etc." 
        />

        <h4 className={styles.sectionTitle}>Identificação</h4>
        <div className={styles.grid3}>
          <FormField label="Nome *" name="name" value={formData.name} onChange={handleChange} required />
          <FormField label="VD (Valor de Desafio) *" name="vd" type="number" value={formData.vd} onChange={handleChange} required />
          <FormField label="Elementos" name="elements" value={formData.elements} onChange={handleChange} placeholder="ex: Sangue, Morte" />
        </div>

        <div className={styles.grid}>
          <AeroSelect 
            label="Tipo *" 
            name="type"
            options={TYPES} 
            value={formData.type} 
            onChange={handleChange} 
            required 
            placeholder="-- Selecionar Tipo --"
          />
          <AeroSelect 
            label="Tamanho *" 
            name="size"
            options={SIZES} 
            value={formData.size} 
            onChange={handleChange} 
            required 
            placeholder="-- Selecionar Tamanho --"
          />
        </div>

        <h4 className={styles.sectionTitle}>Combate e Vidas</h4>
        <div className={styles.grid3}>
          <FormField label="Defesa *" name="defense" type="number" value={formData.defense} onChange={handleChange} required />
          <FormField label="PV Totais *" name="hpTotal" type="number" value={formData.hpTotal} onChange={handleChange} required />
          <FormField label="PV Machucado" name="hpBloodied" type="number" value={formData.hpBloodied} onChange={handleChange} placeholder="Metade por defeito" />
        </div>

        <div className={styles.grid3}>
          <FormField label="Deslocamento" name="movement" value={formData.movement} onChange={handleChange} placeholder="ex: Terrestre 12m, Voo 9m" />
          <FormField label="Resistências" name="resistances" value={formData.resistances} onChange={handleChange} placeholder="ex: Corte 10, Impacto 10" />
          <FormField label="Vulnerabilidades" name="vulnerabilities" value={formData.vulnerabilities} onChange={handleChange} placeholder="ex: Energia, Fogo" />
        </div>

        <h4 className={styles.sectionTitle}>Sentidos e Resistências</h4>
        <div className={styles.grid3}>
          <FormField label="Percepção" value={formData.senses.perception} onChange={(e) => handleNestedChange('senses', 'perception', e.target.value)} placeholder="ex: 3d20+15" />
          <FormField label="Iniciativa" value={formData.senses.initiative} onChange={(e) => handleNestedChange('senses', 'initiative', e.target.value)} placeholder="ex: 4d20+15" />
          <FormField label="Notas (Sentidos)" value={formData.senses.notes} onChange={(e) => handleNestedChange('senses', 'notes', e.target.value)} placeholder="ex: Percepção às cegas" />
        </div>
        <div className={styles.grid3}>
          <FormField label="Fortitude" value={formData.savingThrows.fortitude} onChange={(e) => handleNestedChange('savingThrows', 'fortitude', e.target.value)} placeholder="ex: 5d20+25" />
          <FormField label="Reflexos" value={formData.savingThrows.reflexes} onChange={(e) => handleNestedChange('savingThrows', 'reflexes', e.target.value)} placeholder="ex: 4d20+20" />
          <FormField label="Vontade" value={formData.savingThrows.will} onChange={(e) => handleNestedChange('savingThrows', 'will', e.target.value)} placeholder="ex: 3d20+15" />
        </div>

        <h4 className={styles.sectionTitle}>Atributos</h4>
        <div className={styles.grid5}>
          <FormField label="AGI" name="agi" type="number" value={formData.attributes.agi} onChange={handleAttributeChange} />
          <FormField label="FOR" name="for" type="number" value={formData.attributes.for} onChange={handleAttributeChange} />
          <FormField label="INT" name="int" type="number" value={formData.attributes.int} onChange={handleAttributeChange} />
          <FormField label="PRE" name="pre" type="number" value={formData.attributes.pre} onChange={handleAttributeChange} />
          <FormField label="VIG" name="vig" type="number" value={formData.attributes.vig} onChange={handleAttributeChange} />
        </div>

        <h4 className={styles.sectionTitle}>Perícias</h4>
        {/* CORREÇÃO AQUI: JSX das perícias fechado corretamente */}
        {formData.skills.map((skill, index) => (
          <div key={index} className={styles.dynamicBlock}>
            <button type="button" className={styles.removeBtn} onClick={() => removeSkillBlock(index)}>X</button>
            <div className={styles.grid}>
              <FormField label="Nome da Perícia" value={skill.name} onChange={(e) => handleSkillChange(index, 'name', e.target.value)} placeholder="ex: Atletismo" />
              <FormField label="Teste/Valor" value={skill.value} onChange={(e) => handleSkillChange(index, 'value', e.target.value)} placeholder="ex: 5d20+25" />
            </div>
          </div>
        ))}
        <button type="button" className={styles.addBtn} onClick={addSkillBlock}>+ Adicionar Perícia</button>

        <h4 className={styles.sectionTitle}>Enigma de Medo</h4>
        <div className={styles.singleColumn}>
          <AeroSelect 
            label="Ameaça possui Enigma de Medo?" 
            name="hasEnigma"
            options={BOOLEAN_OPTIONS} 
            value={formData.enigmaOfFear.hasEnigma ? 'Sim' : 'Não'} 
            onChange={handleEnigmaDropdown} 
          />
        </div>
        
        {formData.enigmaOfFear.hasEnigma && (
          <div className={styles.enigmaBox}>
            <FormField label="Descrição do Enigma" value={formData.enigmaOfFear.description} isTextarea onChange={(e) => handleNestedChange('enigmaOfFear', 'description', e.target.value)} placeholder="Narrativa de como se descobre e resolve o enigma" />
            <div style={{ marginTop: '1rem' }}>
              <FormField label="Consequências Mecânicas" value={formData.enigmaOfFear.mechanics} isTextarea onChange={(e) => handleNestedChange('enigmaOfFear', 'mechanics', e.target.value)} placeholder="ex: Perde a imunidade a dano..." />
            </div>
          </div>
        )}

        <h4 className={styles.sectionTitle}>Habilidades Passivas</h4>
        {formData.passives.map((passive, index) => (
          <div key={index} className={styles.dynamicBlock}>
            <button type="button" className={styles.removeBtn} onClick={() => removePassiveBlock(index)}>X</button>
            <FormField label="Nome da Passiva" value={passive.name} onChange={(e) => handlePassiveChange(index, 'name', e.target.value)} />
            <div style={{ marginTop: '1rem' }}>
              <FormField label="Descrição" value={passive.description} isTextarea onChange={(e) => handlePassiveChange(index, 'description', e.target.value)} />
            </div>
          </div>
        ))}
        <button type="button" className={styles.addBtn} onClick={addPassiveBlock}>+ Adicionar Passiva</button>

        <h4 className={styles.sectionTitle}>Ações</h4>
        {formData.actions.map((action, index) => (
          <div key={index} className={styles.dynamicBlock}>
            <button type="button" className={styles.removeBtn} onClick={() => removeActionBlock(index)}>X</button>
            <div className={styles.grid}>
              <FormField label="Nome da Ação" value={action.name} onChange={(e) => handleActionChange(index, 'name', e.target.value)} />
              <AeroSelect 
                label="Tipo de Ação" 
                name={`actionType-${index}`}
                options={ACTION_TYPES} 
                value={action.actionType} 
                onChange={(e) => handleActionChange(index, 'actionType', e.target.value)} 
              />
            </div>
            <FormField label="Descrição da Ação" value={action.description} isTextarea onChange={(e) => handleActionChange(index, 'description', e.target.value)} placeholder="Efeito mecânico ou narrativo da ação" />
            <div className={styles.grid} style={{ marginTop: '1rem' }}>
              <FormField label="Teste (ex: 5d20+40)" value={action.test} onChange={(e) => handleActionChange(index, 'test', e.target.value)} />
              <FormField label="Dano (ex: 4d12+30 Sangue)" value={action.damage} onChange={(e) => handleActionChange(index, 'damage', e.target.value)} />
            </div>
          </div>
        ))}
        <button type="button" className={styles.addBtn} onClick={addActionBlock}>+ Adicionar Ação</button>

        <h4 className={styles.sectionTitle}>Metadados</h4>
        <FormField label="Livro de Referência" name="book" value={formData.book} onChange={handleChange} placeholder="Livro e pág." />

        <button type="submit" disabled={loading} className={styles.aeroButton}>
          {loading ? 'A Guardar...' : 'Adicionar Ameaça ao Arquivo'}
        </button>
      </div>
    </form>
  );
}