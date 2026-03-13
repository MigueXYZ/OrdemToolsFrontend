'use client';

import { useState } from 'react';
import axios from 'axios';
import FormField from './FormField';
import styles from './AddWeaponForm.module.css';

const TYPES = ['Criatura', 'Humano', 'Animal'];
const SIZES = ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal'];
const ACTION_TYPES = ['Padrão', 'Movimento', 'Livre', 'Reação', 'Completa'];

export default function AddThreatForm({ onSuccess }) {
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

  // Atualização de objetos aninhados (Sentidos, Resistências e Enigma)
  const handleNestedChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleEnigmaToggle = (e) => {
    // O teu FormField envia um e.target.value booleano no caso dos checkboxes
    setFormData((prev) => ({
      ...prev,
      enigmaOfFear: { ...prev.enigmaOfFear, hasEnigma: e.target.value }
    }));
  };

  // Gestão das Perícias
  const addSkillBlock = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: '', value: '' }]
    }));
  };

  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index][field] = value;
    setFormData((prev) => ({ ...prev, skills: updatedSkills }));
  };

  const removeSkillBlock = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Gestão das Habilidades Passivas
  const addPassiveBlock = () => {
    setFormData((prev) => ({
      ...prev,
      passives: [...prev.passives, { name: '', description: '' }]
    }));
  };

  const handlePassiveChange = (index, field, value) => {
    const updatedPassives = [...formData.passives];
    updatedPassives[index][field] = value;
    setFormData((prev) => ({ ...prev, passives: updatedPassives }));
  };

  const removePassiveBlock = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      passives: prev.passives.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Gestão das Ações
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
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        vd: parseInt(formData.vd),
        defense: parseInt(formData.defense),
        hp: {
          total: parseInt(formData.hpTotal),
          bloodied: parseInt(formData.hpBloodied) || Math.floor(parseInt(formData.hpTotal) / 2)
        },
        elements: formData.elements.split(',').map((e) => e.trim()).filter(Boolean),
        resistances: formData.resistances.split(',').map((r) => r.trim()).filter(Boolean),
        vulnerabilities: formData.vulnerabilities.split(',').map((v) => v.trim()).filter(Boolean)
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/threats`, payload);

      setMessage({ type: 'success', text: 'Ameaça adicionada com sucesso!' });
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
      <h3>Adicionar Nova Ameaça</h3>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* --- DESCRIÇÃO --- */}
      <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <FormField 
          label="Descrição da Ameaça" 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          isTextarea 
          placeholder="Descrição narrativa da criatura, comportamento, aparência, etc." 
        />
      </div>

      {/* --- IDENTIFICAÇÃO --- */}
      <h4 style={{ color: '#0066cc', marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>Identificação</h4>
      <div className={styles.grid3}>
        <FormField label="Nome" name="name" value={formData.name} onChange={handleChange} required />
        <FormField label="VD (Valor de Desafio)" name="vd" type="number" value={formData.vd} onChange={handleChange} required />
        <FormField label="Elementos" name="elements" value={formData.elements} onChange={handleChange} placeholder="ex: Sangue, Morte" />
      </div>

      <div className={styles.grid}>
        <FormField label="Tipo" name="type" value={formData.type} onChange={handleChange} isSelect options={TYPES} required />
        <FormField label="Tamanho" name="size" value={formData.size} onChange={handleChange} isSelect options={SIZES} required />
      </div>

      {/* --- ESTATÍSTICAS DE COMBATE --- */}
      <h4 style={{ color: '#0066cc', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>Combate e Vidas</h4>
      <div className={styles.grid3}>
        <FormField label="Defesa" name="defense" type="number" value={formData.defense} onChange={handleChange} required />
        <FormField label="PV Totais" name="hpTotal" type="number" value={formData.hpTotal} onChange={handleChange} required />
        <FormField label="PV Machucado" name="hpBloodied" type="number" value={formData.hpBloodied} onChange={handleChange} placeholder="Metade por defeito" />
      </div>

      <div className={styles.grid3}>
        <FormField label="Deslocamento" name="movement" value={formData.movement} onChange={handleChange} placeholder="ex: Terrestre 12m, Voo 9m" />
        <FormField label="Resistências" name="resistances" value={formData.resistances} onChange={handleChange} placeholder="ex: Corte 10, Impacto 10" />
        <FormField label="Vulnerabilidades" name="vulnerabilities" value={formData.vulnerabilities} onChange={handleChange} placeholder="ex: Energia, Fogo" />
      </div>

      {/* --- SENTIDOS E TESTES DE RESISTÊNCIA --- */}
      <h4 style={{ color: '#0066cc', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>Sentidos e Testes de Resistência</h4>
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

      {/* --- ATRIBUTOS --- */}
      <h4 style={{ color: '#0066cc', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>Atributos</h4>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <FormField label="AGI" name="agi" type="number" value={formData.attributes.agi} onChange={handleAttributeChange} />
        <FormField label="FOR" name="for" type="number" value={formData.attributes.for} onChange={handleAttributeChange} />
        <FormField label="INT" name="int" type="number" value={formData.attributes.int} onChange={handleAttributeChange} />
        <FormField label="PRE" name="pre" type="number" value={formData.attributes.pre} onChange={handleAttributeChange} />
        <FormField label="VIG" name="vig" type="number" value={formData.attributes.vig} onChange={handleAttributeChange} />
      </div>

      {/* --- PERÍCIAS --- */}
      <h4 style={{ color: '#0066cc', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>Perícias</h4>
      {formData.skills.map((skill, index) => (
        <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <FormField label="Nome da Perícia" value={skill.name} onChange={(e) => handleSkillChange(index, 'name', e.target.value)} placeholder="ex: Atletismo" />
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Teste/Valor" value={skill.value} onChange={(e) => handleSkillChange(index, 'value', e.target.value)} placeholder="ex: 5d20+25" />
          </div>
          <button 
            type="button" 
            onClick={() => removeSkillBlock(index)}
            style={{ marginTop: '1.75rem', background: 'transparent', border: '1px solid #333', color: '#333', padding: '0.6rem 1rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            X
          </button>
        </div>
      ))}
      <button 
        type="button" 
        onClick={addSkillBlock} 
        style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed #0066cc', color: '#0066cc', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        + Adicionar Perícia
      </button>

      {/* --- ENIGMA DE MEDO --- */}
      <h4 style={{ color: '#0066cc', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>Enigma de Medo</h4>
      <FormField 
        type="checkbox" 
        name="hasEnigma" 
        label="Criatura possui Enigma de Medo?" 
        value={formData.enigmaOfFear.hasEnigma} 
        onChange={handleEnigmaToggle} 
      />
      {formData.enigmaOfFear.hasEnigma && (
        <div style={{ padding: '1.5rem', border: '2px solid #d946d9', borderRadius: '4px', background: 'rgba(217, 70, 217, 0.05)', marginTop: '1rem' }}>
          <FormField label="Descrição do Enigma" value={formData.enigmaOfFear.description} isTextarea onChange={(e) => handleNestedChange('enigmaOfFear', 'description', e.target.value)} placeholder="Narrativa de como se descobre e resolve o enigma" />
          <FormField label="Consequências Mecânicas" value={formData.enigmaOfFear.mechanics} isTextarea onChange={(e) => handleNestedChange('enigmaOfFear', 'mechanics', e.target.value)} placeholder="ex: Perde a imunidade a dano..." />
        </div>
      )}

      {/* --- HABILIDADES PASSIVAS --- */}
      <h4 style={{ color: '#0066cc', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>Habilidades Passivas</h4>
      {formData.passives.map((passive, index) => (
        <div key={index} style={{ padding: '1rem', border: '1px solid rgba(0,102,204,0.3)', marginBottom: '1rem', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
          <FormField label="Nome da Passiva" value={passive.name} onChange={(e) => handlePassiveChange(index, 'name', e.target.value)} />
          <FormField label="Descrição" value={passive.description} isTextarea onChange={(e) => handlePassiveChange(index, 'description', e.target.value)} />
          
          <button 
            type="button" 
            onClick={() => removePassiveBlock(index)}
            style={{ alignSelf: 'flex-end', marginTop: '0.5rem', background: 'transparent', border: '1px solid #333', color: '#333', padding: '0.4rem 0.8rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Remover Passiva
          </button>
        </div>
      ))}
      <button 
        type="button" 
        onClick={addPassiveBlock} 
        style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed #0066cc', color: '#0066cc', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        + Adicionar Passiva
      </button>

      {/* --- AÇÕES (ARRAY DINÂMICO) --- */}
      <h4 style={{ color: '#0066cc', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>Ações</h4>
      {formData.actions.map((action, index) => (
        <div key={index} style={{ padding: '1rem', background: 'rgba(0,102,204,0.05)', border: '1px solid rgba(0,102,204,0.3)', marginBottom: '1rem', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
          <div className={styles.grid}>
            <FormField label="Nome da Ação" value={action.name} onChange={(e) => handleActionChange(index, 'name', e.target.value)} />
            <FormField label="Tipo de Ação" value={action.actionType} isSelect options={ACTION_TYPES} onChange={(e) => handleActionChange(index, 'actionType', e.target.value)} />
          </div>
          <FormField label="Descrição da Ação" value={action.description} isTextarea onChange={(e) => handleActionChange(index, 'description', e.target.value)} placeholder="Efeito mecânico ou narrativo da ação" />
          <div className={styles.grid}>
            <FormField label="Teste (ex: 5d20+40)" value={action.test} onChange={(e) => handleActionChange(index, 'test', e.target.value)} />
            <FormField label="Dano (ex: 4d12+30 Sangue)" value={action.damage} onChange={(e) => handleActionChange(index, 'damage', e.target.value)} />
          </div>

          <button 
            type="button" 
            onClick={() => removeActionBlock(index)}
            style={{ alignSelf: 'flex-end', marginTop: '0.5rem', background: 'transparent', border: '1px solid #333', color: '#333', padding: '0.4rem 0.8rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Remover Ação
          </button>
        </div>
      ))}
      <button 
        type="button" 
        onClick={addActionBlock} 
        style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed #0066cc', color: '#0066cc', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '2rem' }}
      >
        + Adicionar Ação
      </button>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'A Guardar...' : 'Adicionar Ameaça'}
      </button>
    </form>
  );
}