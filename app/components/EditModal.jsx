'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import FormField from '../manage/FormField';
import AeroSelect from './AeroSelect';
import styles from './EditModal.module.css';

const ABILITY_CATEGORIES = ['Poderes de Ocultista', 'Poderes de Especialista', 'Poderes de Combatente', 'Poderes Paranormais', 'Poder de Origem'];
const THREAT_TYPES = ['Criatura', 'Humano', 'Animal'];
const SIZES = ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal'];
const ACTION_TYPES = ['Padrão', 'Movimento', 'Livre', 'Reação', 'Completa'];

export default function EditModal({ item, type, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: item.name || item.title || '',
    description: item.description || item.content || '',
    origin: item.origin || '',
    requirements: item.requirements || '',
    category: item.category || '',
    trainedSkills: item.trainedSkills?.join(', ') || item.trainedSkills || '',
    proficiencies: item.proficiencies || '',
    circle: item.circle || '',
    elements: item.elements?.join(', ') || '',
    duration: item.duration || '',
    section: item.section || '',
    subsection: item.subsection || '',
    pageReference: item.pageReference || '',
    tags: item.tags?.join(', ') || '',
    book: item.book || '',
    source: item.source || '',
    proficiency: item.proficiency || '',
    type: item.type || '',
    grip: item.grip || '',
    damage: item.damage || '',
    critical: item.critical || '',
    range: item.range || '',
    damageType: item.damageType || '',
    paranormal: item.paranormal === true ? 'true' : 'false',
    space: item.space?.toString() || '1',
    notes: item.notes || '',
    class: item.class?._id || item.class || '',
    abilities: item.abilities?.map(a => a._id || a) || [],
    
    // --- CAMPOS DE CLASSE ---
    hpInitial: item.hp?.initial || '',
    hpPerLevel: item.hp?.perLevel || '',
    epInitial: item.ep?.initial || '',
    epPerLevel: item.ep?.perLevel || '',
    sanInitial: item.san?.initial || '',
    sanPerLevel: item.san?.perLevel || '',

    // --- CAMPOS DE AMEAÇA ---
    vd: item.vd || '',
    size: item.size || '',
    defense: item.defense || '',
    hpTotal: item.hp?.total || '', // Cuidado para não conflitar com a classe; como o backend separa, está seguro
    hpBloodied: item.hp?.bloodied || '',
    movement: item.movement || '',
    resistances: item.resistances?.join(', ') || '',
    vulnerabilities: item.vulnerabilities?.join(', ') || '',
    attributes: { 
      agi: item.attributes?.agi ?? 0, 
      for: item.attributes?.for ?? 0, 
      int: item.attributes?.int ?? 0, 
      pre: item.attributes?.pre ?? 0, 
      vig: item.attributes?.vig ?? 0 
    },
    senses: { 
      perception: item.senses?.perception || '', 
      initiative: item.senses?.initiative || '', 
      notes: item.senses?.notes || '' 
    },
    savingThrows: { 
      fortitude: item.savingThrows?.fortitude || '', 
      reflexes: item.savingThrows?.reflexes || '', 
      will: item.savingThrows?.will || '' 
    },
    skills: item.skills || [],
    passives: item.passives || [],
    actions: item.actions || [],
    enigmaOfFear: { 
      hasEnigma: item.enigmaOfFear?.hasEnigma || false, 
      description: item.enigmaOfFear?.description || '', 
      mechanics: item.enigmaOfFear?.mechanics || '' 
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [classes, setClasses] = useState([]);
  const [allAbilities, setAllAbilities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (type === 'track') {
      const fetchTrackData = async () => {
        try {
          const [classesRes, abilitiesRes] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/classes?limit=1000`),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/abilities?limit=1000`)
          ]);
          setClasses(classesRes.data.data || []);
          setAllAbilities(abilitiesRes.data.data || []);
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        }
      };
      fetchTrackData();
    }
  }, [type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'category' && value !== 'Poder de Origem') {
        updated.origin = '';
        updated.trainedSkills = '';
      }
      return updated;
    });
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

  const handleEnigmaToggle = (e) => {
    const isChecked = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      enigmaOfFear: { ...prev.enigmaOfFear, hasEnigma: isChecked }
    }));
  };

  const addBlock = (field, defaultValue) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], defaultValue] }));
  };

  const updateBlock = (field, index, subfield, value) => {
    const updated = [...formData[field]];
    updated[index][subfield] = value;
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const removeBlock = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleAbilityChange = (abilityId) => {
    setFormData((prev) => {
      const abilities = prev.abilities.includes(abilityId)
        ? prev.abilities.filter(id => id !== abilityId)
        : prev.abilities.length < 4 ? [...prev.abilities, abilityId] : prev.abilities;
      return { ...prev, abilities };
    });
  };

  const getEndpoint = () => {
    const endpoints = {
      ability: '/abilities', ritual: '/rituals', rule: '/rules', item: '/items',
      weapon: '/weapons', class: '/classes', track: '/tracks', threat: '/threats'
    };
    return endpoints[type] || '/abilities';
  };

  const buildPayload = () => {
    const payload = {
      name: formData.name,
      description: formData.description,
      tags: formData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0)
    };

    if (formData.requirements) payload.requirements = formData.requirements;
    if (formData.category) payload.category = formData.category;
    if (formData.book) payload.book = formData.book;
    if (formData.source) payload.source = formData.source;

    if (type === 'ability' && formData.category === 'Poder de Origem') {
      if (formData.origin) payload.origin = formData.origin;
      payload.associatedPower = formData.name;
      payload.trainedSkills = formData.trainedSkills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    }
    if (type === 'ritual') {
      if (formData.circle) payload.circle = parseInt(formData.circle);
      if (formData.elements) payload.elements = formData.elements.split(',').map((e) => e.trim().toLowerCase()).filter((e) => e.length > 0);
      if (formData.duration) payload.duration = formData.duration;
    }
    if (type === 'rule') {
      if (formData.section) payload.section = formData.section;
      if (formData.subsection) payload.subsection = formData.subsection;
      if (formData.pageReference) payload.pageReference = formData.pageReference;
    }
    if (type === 'weapon') {
      if (formData.category) payload.category = formData.category;
      if (formData.proficiency) payload.proficiency = formData.proficiency;
      if (formData.type) payload.type = formData.type;
      if (formData.grip) payload.grip = formData.grip;
      if (formData.damage) payload.damage = formData.damage;
      if (formData.critical) payload.critical = formData.critical;
      if (formData.range) payload.range = formData.range;
      if (formData.damageType) payload.damageType = formData.damageType;
      if (formData.space) payload.space = parseInt(formData.space);
      if (formData.notes) payload.notes = formData.notes;
    }
    if (type === 'item') {
      if (formData.category) payload.category = formData.category;
      payload.paranormal = formData.paranormal === 'true';
      if (formData.space) payload.space = parseFloat(formData.space);
    }
    if (type === 'class') {
      payload.hp = { initial: formData.hpInitial, perLevel: formData.hpPerLevel };
      payload.ep = { initial: formData.epInitial, perLevel: formData.epPerLevel };
      payload.san = { initial: formData.sanInitial, perLevel: formData.sanPerLevel };
      payload.trainedSkills = formData.trainedSkills;
      payload.proficiencies = formData.proficiencies;
    }
    if (type === 'track') {
      if (formData.class) payload.class = formData.class;
      payload.abilities = formData.abilities;
    }
    if (type === 'threat') {
      payload.vd = parseInt(formData.vd) || 0;
      payload.type = formData.type;
      payload.size = formData.size;
      payload.elements = formData.elements.split(',').map(e => e.trim()).filter(Boolean);
      payload.movement = formData.movement;
      payload.defense = parseInt(formData.defense) || 0;
      payload.hp = {
        total: parseInt(formData.hpTotal) || 0,
        bloodied: parseInt(formData.hpBloodied) || Math.floor((parseInt(formData.hpTotal) || 0) / 2)
      };
      payload.resistances = formData.resistances.split(',').map(r => r.trim()).filter(Boolean);
      payload.vulnerabilities = formData.vulnerabilities.split(',').map(v => v.trim()).filter(Boolean);
      payload.attributes = formData.attributes;
      payload.senses = formData.senses;
      payload.savingThrows = formData.savingThrows;
      payload.skills = formData.skills;
      payload.passives = formData.passives;
      payload.actions = formData.actions;
      payload.enigmaOfFear = formData.enigmaOfFear;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === 'track' && formData.abilities.length !== 4) {
      setMessage({ type: 'error', text: 'Selecione exatamente 4 poderes da trilha.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const payload = buildPayload();
      const token = localStorage.getItem('token'); 

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}${getEndpoint()}/${item._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: 'Atualização concluída com sucesso!' });
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Falha na Modificação: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const modalTitle = type === 'ability' ? 'Poder' : type === 'ritual' ? 'Ritual' : type === 'item' ? 'Item' : type === 'class' ? 'Classe' : type === 'rule' ? 'Regra' : type === 'weapon' ? 'Arma' : type === 'track' ? 'Trilha' : type === 'threat' ? 'Ameaça' : 'Registo';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>Editar {modalTitle}</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContent}>
          {message && <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>}

          <div className={styles.grid}>
            <FormField label="Nome" name="name" value={formData.name} onChange={handleChange} required />
            
            {(type === 'ability' || type === 'item' || type === 'weapon') && (
              <AeroSelect
                label="Categoria"
                name="category"
                value={formData.category}
                onChange={(e) => handleChange({ target: { name: 'category', value: e.target.value } })}
                options={type === 'ability' ? ABILITY_CATEGORIES : ['0', '1', '2', '3', '4']}
              />
            )}
            
            {type === 'track' && (
              <AeroSelect
                label="Classe Base"
                options={classes.map(cls => ({ label: cls.name, value: cls._id }))}
                value={formData.class}
                onChange={(e) => handleChange({ target: { name: 'class', value: e.target.value } })}
              />
            )}

            {type === 'threat' && (
              <FormField label="VD (Valor de Desafio)" name="vd" type="number" value={formData.vd} onChange={handleChange} required />
            )}
          </div>

          <FormField label="Descrição" name="description" value={formData.description} onChange={handleChange} isTextarea />

          {/* ... IF ITEM ... */}
          {type === 'item' && (
            <div className={styles.grid}>
              <AeroSelect label="Paranormal?" options={[{ label: 'Sim', value: 'true' }, { label: 'Não', value: 'false' }]} value={formData.paranormal} onChange={(e) => handleChange({ target: { name: 'paranormal', value: e.target.value } })} />
              <FormField label="Espaço" name="space" value={formData.space} onChange={handleChange} />
            </div>
          )}

          {(type === 'ability' || type === 'item') && formData.requirements && (
            <FormField label="Requisitos" name="requirements" value={formData.requirements} onChange={handleChange} isTextarea />
          )}

          {/* ... IF ORIGEM ... */}
          {type === 'ability' && formData.category === 'Poder de Origem' && (
            <div className={styles.grid}>
              <FormField label="Nome da Origem" name="origin" value={formData.origin} onChange={handleChange} />
              <FormField label="Perícias treinadas" name="trainedSkills" value={formData.trainedSkills} onChange={handleChange} placeholder="Separadas por vírgula" />
            </div>
          )}

          {/* ... IF RITUAL ... */}
          {type === 'ritual' && (
            <>
              <div className={styles.grid}>
                <AeroSelect label="Círculo" options={['1', '2', '3', '4']} value={formData.circle} onChange={(e) => handleChange({ target: { name: 'circle', value: e.target.value } })} />
                <FormField label="Duração" name="duration" value={formData.duration} onChange={handleChange} />
              </div>
              <FormField label="Elementos" name="elements" value={formData.elements} onChange={handleChange} placeholder="Separados por vírgula" />
            </>
          )}

          {/* ... IF RULE ... */}
          {type === 'rule' && (
            <>
              <div className={styles.grid}>
                <FormField label="Seção" name="section" value={formData.section} onChange={handleChange} />
                <FormField label="Subseção" name="subsection" value={formData.subsection} onChange={handleChange} />
              </div>
              <FormField label="Referência de Página" name="pageReference" value={formData.pageReference} onChange={handleChange} />
            </>
          )}

          {/* ... IF WEAPON ... */}
          {type === 'weapon' && (
            <>
              <div className={styles.grid}>
                <AeroSelect label="Proficiência" options={['Simples', 'Tática', 'Pesada']} value={formData.proficiency} onChange={(e) => handleChange({ target: { name: 'proficiency', value: e.target.value } })} />
                <AeroSelect label="Tipo" options={['Corpo a Corpo', 'Arremesso', 'Disparo', 'Fogo']} value={formData.type} onChange={(e) => handleChange({ target: { name: 'type', value: e.target.value } })} />
              </div>
              <div className={styles.grid}>
                <AeroSelect label="Empunhadura" options={['Leve', 'Uma Mão', 'Duas Mãos']} value={formData.grip} onChange={(e) => handleChange({ target: { name: 'grip', value: e.target.value } })} />
                <FormField label="Dano" name="damage" value={formData.damage} onChange={handleChange} />
              </div>
              <div className={styles.grid3}>
                <FormField label="Crítico" name="critical" value={formData.critical} onChange={handleChange} />
                <AeroSelect label="Alcance" options={['Nenhum', 'Curto', 'Médio', 'Longo', 'Extremo']} value={formData.range} onChange={(e) => handleChange({ target: { name: 'range', value: e.target.value } })} />
                <FormField label="Espaço" name="space" value={formData.space} onChange={handleChange} />
              </div>
              <div className={styles.grid}>
                <AeroSelect label="Tipo de Dano" options={['Corte', 'Impacto', 'Perfuração', 'Balístico', 'Fogo']} value={formData.damageType} onChange={(e) => handleChange({ target: { name: 'damageType', value: e.target.value } })} />
              </div>
              <FormField label="Notas" name="notes" value={formData.notes} onChange={handleChange} isTextarea />
            </>
          )}

          {/* --- IF CLASS --- */}
          {type === 'class' && (
            <>
              <h4 className={styles.sectionTitle}>Características Iniciais</h4>
              
              <div className={styles.grid3}>
                <div className={styles.dynamicBlock} style={{ padding: '1rem' }}>
                  <h5 style={{ marginTop: 0, color: '#004a99' }}>Pontos de Vida</h5>
                  <FormField label="Inicial" name="hpInitial" value={formData.hpInitial} onChange={handleChange} placeholder="ex: 20+Vigor" />
                  <FormField label="+ Por NEX" name="hpPerLevel" value={formData.hpPerLevel} onChange={handleChange} />
                </div>
                <div className={styles.dynamicBlock} style={{ padding: '1rem' }}>
                  <h5 style={{ marginTop: 0, color: '#004a99' }}>Pontos de Esforço</h5>
                  <FormField label="Inicial" name="epInitial" value={formData.epInitial} onChange={handleChange} placeholder="ex: 2+Pre" />
                  <FormField label="+ Por NEX" name="epPerLevel" value={formData.epPerLevel} onChange={handleChange} />
                </div>
                <div className={styles.dynamicBlock} style={{ padding: '1rem' }}>
                  <h5 style={{ marginTop: 0, color: '#004a99' }}>Sanidade</h5>
                  <FormField label="Inicial" name="sanInitial" value={formData.sanInitial} onChange={handleChange} placeholder="ex: 12" />
                  <FormField label="+ Por NEX" name="sanPerLevel" value={formData.sanPerLevel} onChange={handleChange} />
                </div>
              </div>

              <h4 className={styles.sectionTitle}>Treino</h4>
              <div className={styles.grid}>
                <FormField label="Perícias Treinadas" name="trainedSkills" value={formData.trainedSkills} onChange={handleChange} isTextarea />
                <FormField label="Proficiências" name="proficiencies" value={formData.proficiencies} onChange={handleChange} isTextarea />
              </div>
            </>
          )}

          {/* ... IF TRACK ... */}
          {type === 'track' && (
            <div className={styles.abilitiesSection}>
              <label className={styles.fieldLabel}>Poderes da Trilha ({formData.abilities.length}/4 selecionados)</label>
              <input
                type="text"
                placeholder="🔍 Filtrar poderes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.aeroSearch}
              />
              <div className={styles.abilitiesContainer}>
                <div className={styles.abilitiesList}>
                  {allAbilities
                    .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((ability) => (
                      <div
                        key={ability._id}
                        className={`${styles.abilityCard} ${formData.abilities.includes(ability._id) ? styles.selected : ''}`}
                        onClick={() => handleAbilityChange(ability._id)}
                      >
                        <span className={styles.abilityName}>{ability.name}</span>
                        {formData.abilities.includes(ability._id) && <span className={styles.checkIcon}>✓</span>}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* --- IF THREAT --- */}
          {type === 'threat' && (
            <>
              <div className={styles.grid3}>
                <AeroSelect label="Tipo" options={THREAT_TYPES} value={formData.type} onChange={(e) => handleChange({target: {name: 'type', value: e.target.value}})} />
                <AeroSelect label="Tamanho" options={SIZES} value={formData.size} onChange={(e) => handleChange({target: {name: 'size', value: e.target.value}})} />
                <FormField label="Elementos" name="elements" value={formData.elements} onChange={handleChange} placeholder="Sangue, Morte..." />
              </div>

              <h4 className={styles.sectionTitle}>Combate e Atributos</h4>
              <div className={styles.grid5}>
                {['agi', 'for', 'int', 'pre', 'vig'].map(attr => (
                  <FormField key={attr} label={attr.toUpperCase()} name={attr} type="number" value={formData.attributes[attr]} onChange={handleAttributeChange} />
                ))}
              </div>

              <div className={styles.grid3}>
                <FormField label="Defesa" name="defense" type="number" value={formData.defense} onChange={handleChange} required />
                <FormField label="PV Totais" name="hpTotal" type="number" value={formData.hpTotal} onChange={handleChange} required />
                <FormField label="PV Machucado" name="hpBloodied" type="number" value={formData.hpBloodied} onChange={handleChange} />
              </div>

              <div className={styles.grid3}>
                <FormField label="Deslocamento" name="movement" value={formData.movement} onChange={handleChange} />
                <FormField label="Resistências" name="resistances" value={formData.resistances} onChange={handleChange} />
                <FormField label="Vulnerabilidades" name="vulnerabilities" value={formData.vulnerabilities} onChange={handleChange} />
              </div>

              <h4 className={styles.sectionTitle}>Sentidos e Testes</h4>
              <div className={styles.grid3}>
                <FormField label="Percepção" value={formData.senses.perception} onChange={(e) => handleNestedChange('senses', 'perception', e.target.value)} />
                <FormField label="Iniciativa" value={formData.senses.initiative} onChange={(e) => handleNestedChange('senses', 'initiative', e.target.value)} />
                <FormField label="Notas (Sentidos)" value={formData.senses.notes} onChange={(e) => handleNestedChange('senses', 'notes', e.target.value)} />
              </div>
              <div className={styles.grid3}>
                <FormField label="Fortitude" value={formData.savingThrows.fortitude} onChange={(e) => handleNestedChange('savingThrows', 'fortitude', e.target.value)} />
                <FormField label="Reflexos" value={formData.savingThrows.reflexes} onChange={(e) => handleNestedChange('savingThrows', 'reflexes', e.target.value)} />
                <FormField label="Vontade" value={formData.savingThrows.will} onChange={(e) => handleNestedChange('savingThrows', 'will', e.target.value)} />
              </div>

              <h4 className={styles.sectionTitle}>Perícias</h4>
              {formData.skills.map((skill, i) => (
                <div key={i} className={styles.dynamicBlock}>
                  <button type="button" className={styles.removeBtn} onClick={() => removeBlock('skills', i)}>X</button>
                  <div className={styles.grid}>
                    <FormField label="Perícia" value={skill.name} onChange={(e) => updateBlock('skills', i, 'name', e.target.value)} />
                    <FormField label="Teste" value={skill.value} onChange={(e) => updateBlock('skills', i, 'value', e.target.value)} />
                  </div>
                </div>
              ))}
              <button type="button" className={styles.addBtn} onClick={() => addBlock('skills', {name: '', value: ''})}>+ Adicionar Perícia</button>

              <h4 className={styles.sectionTitle}>Enigma de Medo</h4>
              <div className={styles.checkboxWrapper}>
                <label className={styles.paranormalToggle}>
                  <FormField type="checkbox" name="hasEnigma" checked={formData.enigmaOfFear.hasEnigma} onChange={handleEnigmaToggle} isParanormal />
                  <span className={styles.paranormalText}>Possui Enigma de Medo?</span>
                </label>
              </div>
              {formData.enigmaOfFear.hasEnigma && (
                <div className={styles.enigmaBox}>
                  <FormField label="Resolução" value={formData.enigmaOfFear.description} isTextarea onChange={(e) => handleNestedChange('enigmaOfFear', 'description', e.target.value)} />
                  <div style={{ marginTop: '1rem' }}>
                    <FormField label="Mecânica Pós-Enigma" value={formData.enigmaOfFear.mechanics} isTextarea onChange={(e) => handleNestedChange('enigmaOfFear', 'mechanics', e.target.value)} />
                  </div>
                </div>
              )}

              <h4 className={styles.sectionTitle}>Ações</h4>
              {formData.actions.map((action, i) => (
                <div key={i} className={styles.dynamicBlock}>
                  <button type="button" className={styles.removeBtn} onClick={() => removeBlock('actions', i)}>X</button>
                  <div className={styles.grid}>
                    <FormField label="Nome" value={action.name} onChange={(e) => updateBlock('actions', i, 'name', e.target.value)} />
                    <AeroSelect label="Tipo" options={ACTION_TYPES} value={action.actionType} onChange={(e) => updateBlock('actions', i, 'actionType', e.target.value)} />
                  </div>
                  <FormField label="Descrição/Efeito" value={action.description} isTextarea onChange={(e) => updateBlock('actions', i, 'description', e.target.value)} />
                  <div className={styles.grid} style={{ marginTop: '1rem' }}>
                    <FormField label="Teste" value={action.test} onChange={(e) => updateBlock('actions', i, 'test', e.target.value)} />
                    <FormField label="Dano" value={action.damage} onChange={(e) => updateBlock('actions', i, 'damage', e.target.value)} />
                  </div>
                </div>
              ))}
              <button type="button" className={styles.addBtn} onClick={() => addBlock('actions', {actionType: 'Padrão', name: '', description: ''})}>+ Adicionar Ação</button>

              <h4 className={styles.sectionTitle}>Habilidades Passivas</h4>
              {formData.passives.map((passive, i) => (
                <div key={i} className={styles.dynamicBlock}>
                  <button type="button" className={styles.removeBtn} onClick={() => removeBlock('passives', i)}>X</button>
                  <FormField label="Nome" value={passive.name} onChange={(e) => updateBlock('passives', i, 'name', e.target.value)} />
                  <div style={{ marginTop: '1rem' }}>
                    <FormField label="Descrição" value={passive.description} isTextarea onChange={(e) => updateBlock('passives', i, 'description', e.target.value)} />
                  </div>
                </div>
              ))}
              <button type="button" className={styles.addBtn} onClick={() => addBlock('passives', {name: '', description: ''})}>+ Adicionar Passiva</button>
            </>
          )}

          <h4 className={styles.sectionTitle}>Metadados</h4>
          <div className={styles.grid}>
            <FormField label="Livro/Fonte" name={type === 'rule' ? 'source' : 'book'} value={type === 'rule' ? formData.source : formData.book} onChange={handleChange} />
            <FormField label="Tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="Separadas por vírgula" />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'A Gravar...' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}