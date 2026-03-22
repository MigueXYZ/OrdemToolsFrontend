'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import FormField from '../../manage/FormField';
import AeroSelect from '../../components/AeroSelect';
import ThemeToggle from '../../components/ThemeToggle';
import styles from './page.module.css';

const TABS = [
  { id: 'basics', label: 'Identificação & Atributos' },
  { id: 'skills', label: 'Perícias' },
  { id: 'combat', label: 'Combate & Inventário' },
  { id: 'powers', label: 'Poderes & Rituais' },
  { id: 'lore', label: 'Background' }
];

const DEFAULT_SKILLS = [
  { name: 'Acrobacia', baseAttribute: 'agi', trainingDegree: 0, otherBonus: 0 },
  { name: 'Adestramento', baseAttribute: 'pre', trainingDegree: 0, otherBonus: 0 },
  { name: 'Artes', baseAttribute: 'pre', trainingDegree: 0, otherBonus: 0 },
  { name: 'Atletismo', baseAttribute: 'for', trainingDegree: 0, otherBonus: 0 },
  { name: 'Atualidades', baseAttribute: 'int', trainingDegree: 0, otherBonus: 0 },
  { name: 'Ciências', baseAttribute: 'int', trainingDegree: 0, otherBonus: 0 },
  { name: 'Crime', baseAttribute: 'agi', trainingDegree: 0, otherBonus: 0 },
  { name: 'Diplomacia', baseAttribute: 'pre', trainingDegree: 0, otherBonus: 0 },
  { name: 'Enganação', baseAttribute: 'pre', trainingDegree: 0, otherBonus: 0 },
  { name: 'Fortitude', baseAttribute: 'vig', trainingDegree: 0, otherBonus: 0 },
  { name: 'Furtividade', baseAttribute: 'agi', trainingDegree: 0, otherBonus: 0 },
  { name: 'Iniciativa', baseAttribute: 'agi', trainingDegree: 0, otherBonus: 0 },
  { name: 'Intimidação', baseAttribute: 'pre', trainingDegree: 0, otherBonus: 0 },
  { name: 'Intuição', baseAttribute: 'pre', trainingDegree: 0, otherBonus: 0 },
  { name: 'Investigação', baseAttribute: 'int', trainingDegree: 0, otherBonus: 0 },
  { name: 'Luta', baseAttribute: 'for', trainingDegree: 0, otherBonus: 0 },
  { name: 'Medicina', baseAttribute: 'int', trainingDegree: 0, otherBonus: 0 },
  { name: 'Ocultismo', baseAttribute: 'int', trainingDegree: 0, otherBonus: 0 },
  { name: 'Percepção', baseAttribute: 'pre', trainingDegree: 0, otherBonus: 0 },
  { name: 'Pilotagem', baseAttribute: 'agi', trainingDegree: 0, otherBonus: 0 },
  { name: 'Pontaria', baseAttribute: 'agi', trainingDegree: 0, otherBonus: 0 },
  { name: 'Profissão', baseAttribute: 'int', trainingDegree: 0, otherBonus: 0 },
  { name: 'Reflexos', baseAttribute: 'agi', trainingDegree: 0, otherBonus: 0 },
  { name: 'Religião', baseAttribute: 'pre', trainingDegree: 0, otherBonus: 0 },
  { name: 'Sobrevivência', baseAttribute: 'int', trainingDegree: 0, otherBonus: 0 },
  { name: 'Tática', baseAttribute: 'int', trainingDegree: 0, otherBonus: 0 },
  { name: 'Tecnologia', baseAttribute: 'int', trainingDegree: 0, otherBonus: 0 },
  { name: 'Vontade', baseAttribute: 'pre', trainingDegree: 0, otherBonus: 0 }
];

export default function NewCharacterPage() {
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('basics');

  // Listas vindas da Base de Dados
  const [classesList, setClassesList] = useState([]);
  const [tracksList, setTracksList] = useState([]);
  const [weaponsList, setWeaponsList] = useState([]);
  const [itemsList, setItemsList] = useState([]);

  // Estado Central da Ficha
  const [character, setCharacter] = useState({
    name: '',
    playerName: '',
    nex: 5,
    level: 1,
    useLevel: false,
    classId: '',
    trackId: '',
    origin: '',
    patente: 'Recruta',
    prestigio: 0,
    attributes: { agi: 1, for: 1, int: 1, pre: 1, vig: 1 },
    stats: {
      hp: { overrideMax: '' },
      ep: { overrideMax: '' },
      san: { overrideMax: '' }
    },
    skills: DEFAULT_SKILLS, // Inicia logo com todas as perícias preenchidas
    combat: { defenseEquipment: 0, defenseOther: 0, protections: '', resistances: '', movement: '9m' },
    attacks: [],
    inventory: { items: [], creditLimit: '', maxWeightOverride: '' },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [clsRes, trkRes, wpnRes, itmRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/classes`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tracks`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/weapons?limit=1000`), // Adicionado
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/items?limit=1000`)    // Adicionado
        ]);
        setClassesList(clsRes.data.data || []);
        setTracksList(trkRes.data.data || []);
        setWeaponsList(wpnRes.data.data || []);
        setItemsList(itmRes.data.data || []);
      } catch (error) {
        console.error('Erro ao carregar opções:', error);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setCharacter(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // Se mudámos a classe, temos de apagar a trilha selecionada anteriormente
      if (name === 'classId') {
        updated.trackId = '';
      }

      return updated;
    });
  };

  const handleAttributeChange = (attr, value) => {
    setCharacter(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [attr]: parseInt(value) || 0 }
    }));
  };

  const handleStatOverride = (stat, value) => {
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: { ...prev.stats[stat], overrideMax: value }
      }
    }));
  };

  const handleSkillChange = (index, field, value) => {
    setCharacter(prev => {
      const newSkills = [...prev.skills];
      newSkills[index] = { ...newSkills[index], [field]: value };
      return { ...prev, skills: newSkills };
    });
  };

  // Adiciona uma perícia extra personalizada no fim da lista
  const handleAddCustomSkill = () => {
    setCharacter(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        { name: '', baseAttribute: 'int', trainingDegree: 0, otherBonus: 0, isCustom: true }
      ]
    }));
  };

  // Remove uma perícia extra
  const handleRemoveCustomSkill = (indexToRemove) => {
    setCharacter(prev => ({
      ...prev,
      skills: prev.skills.filter((_, index) => index !== indexToRemove)
    }));
  };

  // --- COMBATE E INVENTÁRIO ---
  const handleCombatChange = (field, value) => {
    setCharacter(prev => ({
      ...prev,
      combat: { ...prev.combat, [field]: value }
    }));
  };

  const handleInventoryChange = (field, value) => {
    setCharacter(prev => ({
      ...prev,
      inventory: { ...prev.inventory, [field]: value }
    }));
  };

  // Ataques
  const handleAddAttack = () => {
    setCharacter(prev => ({
      ...prev,
      attacks: [...prev.attacks, { weapon: '', customName: '', attackBonus: 0, damageOverride: '', criticalOverride: '' }]
    }));
  };

  const handleRemoveAttack = (index) => {
    setCharacter(prev => ({
      ...prev,
      attacks: prev.attacks.filter((_, i) => i !== index)
    }));
  };

// Ataques (Agora com Auto-Fill da Base de Dados)
  const handleAttackChange = (index, field, value) => {
    setCharacter(prev => {
      const newAttacks = [...prev.attacks];
      let updatedAttack = { ...newAttacks[index], [field]: value };

      // Se o utilizador escolheu uma Arma da Base de Dados
      if (field === 'weapon') {
        if (value) {
          // Procura a arma escolhida na nossa lista
          const selectedWeapon = weaponsList.find(w => w._id === value);
          if (selectedWeapon) {
            updatedAttack.damageOverride = selectedWeapon.damage || '';
            updatedAttack.criticalOverride = selectedWeapon.critical || '';
            updatedAttack.customName = ''; // Limpa o nome personalizado
          }
        } else {
          // Se voltou para "Arma Personalizada", limpa os campos
          updatedAttack.damageOverride = '';
          updatedAttack.criticalOverride = '';
        }
      }

      newAttacks[index] = updatedAttack;
      return { ...prev, attacks: newAttacks };
    });
  };

  // Itens
  const handleAddItem = () => {
    setCharacter(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        items: [...prev.inventory.items, { item: '', customName: '', quantity: 1, spaceOverride: 1, categoryOverride: '0' }]
      }
    }));
  };

  const handleRemoveItem = (index) => {
    setCharacter(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        items: prev.inventory.items.filter((_, i) => i !== index)
      }
    }));
  };

  // Itens (Agora com Auto-Fill de Espaço e Categoria)
  const handleItemChange = (index, field, value) => {
    setCharacter(prev => {
      const newItems = [...prev.inventory.items];
      let updatedItem = { ...newItems[index], [field]: value };

      // Se o utilizador escolheu um Item (ou Arma) da Base de Dados
      if (field === 'item') {
        if (value) {
          // Procura na lista de Itens OU na lista de Armas
          const selectedEntity = itemsList.find(i => i._id === value) || weaponsList.find(w => w._id === value);
          
          if (selectedEntity) {
            updatedItem.spaceOverride = selectedEntity.space !== undefined ? selectedEntity.space : 1;
            updatedItem.categoryOverride = selectedEntity.category || '0';
            updatedItem.customName = ''; // Limpa o nome personalizado
          }
        } else {
          // Se voltou para "Item Personalizado", faz reset
          updatedItem.spaceOverride = 1;
          updatedItem.categoryOverride = '0';
        }
      }

      newItems[index] = updatedItem;
      return { ...prev, inventory: { ...prev.inventory, items: newItems } };
    });
  };

  if (loading || !user) return null;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button onClick={() => router.back()} className={styles.backBtn}>
            &larr; Voltar
          </button>
          <ThemeToggle />
        </div>
        <h1 className={styles.title}>Nova Ficha de Agente</h1>
      </header>

      <div className={styles.container}>
        {/* Navegação de Separadores */}
        <nav className={styles.tabNav}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Área de Conteúdo */}
        <div className={styles.contentArea}>
          {activeTab === 'basics' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Dados Pessoais</h2>
              <div className={styles.grid2}>
                <FormField label="Nome do Agente" name="name" value={character.name} onChange={handleChange} required />
                <FormField label="Nome do Jogador" name="playerName" value={character.playerName} onChange={handleChange} />
              </div>

              <div className={styles.grid3}>
                <FormField label="Origem" name="origin" value={character.origin} onChange={handleChange} placeholder="Ex: Académico" />

                <AeroSelect
                  label="Classe"
                  name="classId"
                  options={classesList.map(c => ({ label: c.name, value: c._id }))}
                  value={character.classId}
                  onChange={handleChange}
                  placeholder="-- Selecionar --"
                />

                {/* RENDERIZAÇÃO CONDICIONAL DA TRILHA */}
                {(() => {
                  // CORREÇÃO: Verificar t.class._id (se estiver populado) ou t.class (se for apenas string)
                  const availableTracks = tracksList.filter(t => {
                    const trackClassId = t.class?._id || t.class;
                    return trackClassId === character.classId;
                  });

                  if (character.classId && availableTracks.length > 0) {
                    return (
                      <AeroSelect
                        label="Trilha (Subclasse)"
                        name="trackId"
                        options={availableTracks.map(t => ({ label: t.name, value: t._id }))}
                        value={character.trackId}
                        onChange={handleChange}
                        placeholder="-- Selecionar --"
                      />
                    );
                  }

                  return <div></div>;
                })()}
              </div>

              <div className={styles.grid4}>
                <FormField label="NEX (%)" name="nex" type="number" value={character.nex} onChange={handleChange} />
                <div className={styles.checkboxWrapper}>
                  <label className={styles.checkLabel}>
                    <input type="checkbox" name="useLevel" checked={character.useLevel} onChange={handleChange} />
                    Usar Sistema de Nível
                  </label>
                </div>
                {character.useLevel && (
                  <FormField label="Nível" name="level" type="number" value={character.level} onChange={handleChange} />
                )}
                <AeroSelect
                  label="Patente"
                  name="patente"
                  options={['Recruta', 'Operador', 'Agente Especial', 'Oficial de Operações', 'Agente de Elite']}
                  value={character.patente}
                  onChange={handleChange}
                />
              </div>

              <h2 className={styles.sectionTitle}>Atributos Base</h2>
              <div className={styles.attributesGrid}>
                {['agi', 'for', 'int', 'pre', 'vig'].map(attr => (
                  <div key={attr} className={styles.attrBox}>
                    <label>{attr.toUpperCase()}</label>
                    <input
                      type="number"
                      value={character.attributes[attr]}
                      onChange={(e) => handleAttributeChange(attr, e.target.value)}
                      min="0"
                      max="5"
                      className={styles.attrInput}
                    />
                  </div>
                ))}
              </div>

              <h2 className={styles.sectionTitle}>Status (Sobrescrita Manual)</h2>
              <p className={styles.helperText}>O sistema calcula a vida automaticamente. Preencha aqui apenas se quiser forçar um valor máximo diferente (ex: bónus de itens).</p>
              <div className={styles.grid3}>
                <FormField label="PV Máximo Manual" type="number" value={character.stats.hp.overrideMax} onChange={(e) => handleStatOverride('hp', e.target.value)} placeholder="Deixar vazio para auto" />
                <FormField label="PE Máximo Manual" type="number" value={character.stats.ep.overrideMax} onChange={(e) => handleStatOverride('ep', e.target.value)} placeholder="Deixar vazio para auto" />
                <FormField label="SAN Máximo Manual" type="number" value={character.stats.san.overrideMax} onChange={(e) => handleStatOverride('san', e.target.value)} placeholder="Deixar vazio para auto" />
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Perícias do Agente</h2>
              <p className={styles.helperText}>
                O valor de Atributo define o número de dados (d20) rolados. O grau de treino e outros bónus somam-se ao resultado.
              </p>

              <div className={styles.skillsTable}>
                <div className={styles.skillsHeaderRow}>
                  <div className={styles.colName}>Perícia</div>
                  <div className={styles.colAttr}>Atributo (Dados)</div>
                  <div className={styles.colTrain}>Grau de Treino</div>
                  <div className={styles.colBonus}>Outros Bónus</div>
                  <div className={styles.colTotal}>Total do Teste</div>
                </div>

                {character.skills.map((skill, index) => {
                  const diceCount = character.attributes[skill.baseAttribute] || 0;
                  const totalBonus = parseInt(skill.trainingDegree) + parseInt(skill.otherBonus || 0);

                  return (
                    <div key={index} className={styles.skillRow}>
                      {/* 1. Nome da Perícia (Fixo ou Editável) */}
                      <div className={styles.colName}>
                        {skill.isCustom ? (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomSkill(index)}
                              className={styles.removeSkillBtn}
                              title="Remover Perícia Extra"
                            >
                              X
                            </button>
                            <input
                              type="text"
                              className={styles.skillInput}
                              style={{ textAlign: 'left', fontWeight: 'bold' }}
                              value={skill.name}
                              onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                              placeholder="Ex: Profissão (Médico)"
                            />
                          </div>
                        ) : (
                          <strong>{skill.name}</strong>
                        )}
                      </div>

                      {/* 2. Seleção de Atributo */}
                      <div className={styles.colAttr}>
                        <select
                          className={styles.skillSelect}
                          value={skill.baseAttribute}
                          onChange={(e) => handleSkillChange(index, 'baseAttribute', e.target.value)}
                        >
                          <option value="agi">AGI ({character.attributes.agi})</option>
                          <option value="for">FOR ({character.attributes.for})</option>
                          <option value="int">INT ({character.attributes.int})</option>
                          <option value="pre">PRE ({character.attributes.pre})</option>
                          <option value="vig">VIG ({character.attributes.vig})</option>
                        </select>
                      </div>

                      {/* 3. Grau de Treino */}
                      <div className={styles.colTrain}>
                        <select
                          className={styles.skillSelect}
                          value={skill.trainingDegree}
                          onChange={(e) => handleSkillChange(index, 'trainingDegree', parseInt(e.target.value))}
                        >
                          <option value={0}>Destreinado (+0)</option>
                          <option value={5}>Treinado (+5)</option>
                          <option value={10}>Veterano (+10)</option>
                          <option value={15}>Expert (+15)</option>
                        </select>
                      </div>

                      {/* 4. Outros Bónus */}
                      <div className={styles.colBonus}>
                        <input
                          type="number"
                          className={styles.skillInput}
                          value={skill.otherBonus}
                          onChange={(e) => handleSkillChange(index, 'otherBonus', parseInt(e.target.value) || 0)}
                        />
                      </div>

                      {/* 5. Total */}
                      <div className={styles.colTotal}>
                        <span className={styles.totalBadge}>
                          {diceCount}d20 + {totalBonus}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* BOTÃO ADICIONAR EXTRA */}
                <button type="button" onClick={handleAddCustomSkill} className={styles.addSkillBtn}>
                  + Adicionar Perícia Extra
                </button>
              </div>
            </div>
          )}
{activeTab === 'combat' && (
            <div className={styles.tabContent}>
              
              {/* --- DEFESA E STATUS DE COMBATE --- */}
              <h2 className={styles.sectionTitle}>Status de Combate</h2>
              <div className={styles.defenseBox}>
                <div className={styles.defenseTotal}>
                  <span>Defesa Total</span>
                  <strong>
                    {10 + (character.attributes.agi || 0) + (parseInt(character.combat.defenseEquipment) || 0) + (parseInt(character.combat.defenseOther) || 0)}
                  </strong>
                </div>
                <div className={styles.defenseMath}>
                  = 10 + <span>AGI ({character.attributes.agi || 0})</span> + 
                  <input type="number" value={character.combat.defenseEquipment} onChange={(e) => handleCombatChange('defenseEquipment', e.target.value)} placeholder="Equip" title="Bónus de Equipamento" /> + 
                  <input type="number" value={character.combat.defenseOther} onChange={(e) => handleCombatChange('defenseOther', e.target.value)} placeholder="Outros" title="Outros Bónus" />
                </div>
              </div>

              <div className={styles.grid3} style={{ marginTop: '1.5rem' }}>
                <FormField label="Deslocamento" value={character.combat.movement} onChange={(e) => handleCombatChange('movement', e.target.value)} placeholder="ex: 9m" />
                <FormField label="Proteções" value={character.combat.protections} onChange={(e) => handleCombatChange('protections', e.target.value)} placeholder="ex: Vestimenta leve" />
                <FormField label="Resistências a Dano" value={character.combat.resistances} onChange={(e) => handleCombatChange('resistances', e.target.value)} placeholder="ex: Corte 5, Fogo 10" />
              </div>

              {/* --- ATAQUES --- */}
{/* --- ATAQUES --- */}
              <h2 className={styles.sectionTitle} style={{ marginTop: '3rem' }}>Ataques</h2>
              <div className={styles.listContainer}>
                {character.attacks.map((atk, index) => (
                  <div key={index} className={styles.rowCard}>
                    <button type="button" onClick={() => handleRemoveAttack(index)} className={styles.removeSkillBtn} title="Remover Ataque">X</button>
                    
                    <div style={{ flex: 2 }}>
                      <label className={styles.smallLabel}>Arma (Base de Dados) ou Nome</label>
                      {/* SUBSTITUÍDO PELO AEROSELECT */}
                      <AeroSelect 
                        name={`attack-weapon-${index}`}
                        options={[
                          { label: '-- Arma Personalizada --', value: '' },
                          ...weaponsList.map(w => ({ label: `${w.name} (${w.damage})`, value: w._id }))
                        ]}
                        value={atk.weapon} 
                        onChange={(e) => handleAttackChange(index, 'weapon', e.target.value)}
                      />
                      
                      {!atk.weapon && (
                        <input 
                          type="text" 
                          className={styles.skillInput} 
                          style={{ marginTop: '0.5rem', textAlign: 'left' }}
                          placeholder="Nome do Ataque..." 
                          value={atk.customName} 
                          onChange={(e) => handleAttackChange(index, 'customName', e.target.value)} 
                        />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <label className={styles.smallLabel}>Teste (+ Bónus)</label>
                      <input type="number" className={styles.skillInput} value={atk.attackBonus} onChange={(e) => handleAttackChange(index, 'attackBonus', e.target.value)} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label className={styles.smallLabel}>Dano</label>
                      <input type="text" className={styles.skillInput} placeholder="ex: 1d8+2" value={atk.damageOverride} onChange={(e) => handleAttackChange(index, 'damageOverride', e.target.value)} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label className={styles.smallLabel}>Crítico</label>
                      <input type="text" className={styles.skillInput} placeholder="19/x2" value={atk.criticalOverride} onChange={(e) => handleAttackChange(index, 'criticalOverride', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddAttack} className={styles.addSkillBtn}>+ Adicionar Ataque</button>
              </div>

              {/* --- INVENTÁRIO --- */}
              <h2 className={styles.sectionTitle} style={{ marginTop: '3rem' }}>Inventário</h2>
              
              <div className={styles.inventoryHeader}>
                <div className={styles.grid2}>
                  <FormField label="Limite de Crédito" value={character.inventory.creditLimit} onChange={(e) => handleInventoryChange('creditLimit', e.target.value)} placeholder="ex: Baixo, Médio" />
                  
                  <div className={styles.weightBox}>
                    <div className={styles.weightLabel}>Espaço Utilizado</div>
                    <div className={styles.weightValue}>
                      {/* Soma o espaço dos itens (qnt * espaço) */}
                      {character.inventory.items.reduce((total, item) => total + ((parseFloat(item.spaceOverride) || 0) * (parseInt(item.quantity) || 1)), 0)} 
                      {' / '} 
                      {/* Carga Máxima: Força * 5 (min 2) OU o override */}
                      {character.inventory.maxWeightOverride ? character.inventory.maxWeightOverride : Math.max((character.attributes.for || 0) * 5, 2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.listContainer}>
                {character.inventory.items.map((item, index) => (
                  <div key={index} className={styles.rowCard}>
                    <button type="button" onClick={() => handleRemoveItem(index)} className={styles.removeSkillBtn} title="Remover Item">X</button>
                    
                    <div style={{ flex: 3 }}>
                      <label className={styles.smallLabel}>Item (Base de Dados) ou Nome</label>
                      {/* SUBSTITUÍDO PELO AEROSELECT */}
                      <AeroSelect 
                        name={`inventory-item-${index}`}
                        options={[
                          { label: '-- Item Personalizado --', value: '' },
                          ...weaponsList.map(w => ({ label: `[Arma] ${w.name}`, value: w._id })),
                          ...itemsList.map(i => ({ label: `[Item] ${i.name}`, value: i._id }))
                        ]}
                        value={item.item} 
                        onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                      />

                      {!item.item && (
                        <input 
                          type="text" 
                          className={styles.skillInput} 
                          style={{ marginTop: '0.5rem', textAlign: 'left' }}
                          placeholder="Nome do Item..." 
                          value={item.customName} 
                          onChange={(e) => handleItemChange(index, 'customName', e.target.value)} 
                        />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <label className={styles.smallLabel}>Qnt.</label>
                      <input type="number" className={styles.skillInput} value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label className={styles.smallLabel}>Espaço (Un.)</label>
                      <input type="number" className={styles.skillInput} value={item.spaceOverride} onChange={(e) => handleItemChange(index, 'spaceOverride', e.target.value)} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label className={styles.smallLabel}>Categoria</label>
                      <input type="text" className={styles.skillInput} placeholder="0, I, II..." value={item.categoryOverride} onChange={(e) => handleItemChange(index, 'categoryOverride', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddItem} className={styles.addSkillBtn}>+ Adicionar Item ao Inventário</button>
              </div>

            </div>
          )}
          {activeTab === 'powers' && <div className={styles.tabContent}>Em construção: Habilidades e Rituais...</div>}
          {activeTab === 'lore' && <div className={styles.tabContent}>Em construção: História e Notas...</div>}
        </div>

        <div className={styles.footer}>
          <button className={styles.saveBtn}>Guardar Ficha</button>
        </div>
      </div>
    </div>
  );
}