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

  const [classesList, setClassesList] = useState([]);
  const [tracksList, setTracksList] = useState([]);
  const [weaponsList, setWeaponsList] = useState([]);
  const [itemsList, setItemsList] = useState([]);

  const [showItemModal, setShowItemModal] = useState(false);
  const [modalTab, setModalTab] = useState('weapons');
  const [modalSearch, setModalSearch] = useState('');

  const [showPowerModal, setShowPowerModal] = useState(false);
  const [powerModalTab, setPowerModalTab] = useState('abilities');
  const [powerModalSearch, setPowerModalSearch] = useState('');
  const [abilitiesList, setAbilitiesList] = useState([]);
  const [ritualsList, setRitualsList] = useState([]);
  const [originsList, setOriginsList] = useState([]);

  const [isSaving, setIsSaving] = useState(false);

  const [character, setCharacter] = useState({
    name: '', playerName: '', nex: 5, level: 1, useLevel: false,
    classId: '', trackId: '', origin: '', patente: 'Recruta', prestigio: 0,
    attributes: { agi: 1, for: 1, int: 1, pre: 1, vig: 1 },
    stats: { hp: { overrideMax: '' }, ep: { overrideMax: '' }, san: { overrideMax: '' } },
    skills: DEFAULT_SKILLS,
    combat: { defenseEquipment: 0, defenseOther: 0, protections: '', resistances: '', movement: '9m' },
    attacks: [],
    inventory: { items: [], creditLimit: 'Baixo', maxWeightOverride: '', categoryLimits: { I: 1, II: 0, III: 0, IV: 0 } },
    abilities: [],
    rituals: [],
    lore: { appearance: '', backstory: '', personality: '', notes: '' }
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [clsRes, trkRes, wpnRes, itmRes, ablRes, ritRes, orgRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/classes`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tracks`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/weapons?limit=1000`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/items?limit=1000`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/abilities?limit=1000`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/rituals?limit=1000`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/origins?limit=1000`) // NOVO
        ]);
        setClassesList(clsRes.data.data || []);
        setTracksList(trkRes.data.data || []);
        setWeaponsList(wpnRes.data.data || []);
        setItemsList(itmRes.data.data || []);
        setAbilitiesList(ablRes.data.data || []);
        setOriginsList(orgRes.data.data || []);
        setRitualsList(ritRes.data.data || []);
      } catch (error) {
        console.error('Erro ao carregar opções:', error);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCharacter(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'classId') updated.trackId = '';
      return updated;
    });
  };

  const handleAttributeChange = (attr, value) => {
    setCharacter(prev => ({ ...prev, attributes: { ...prev.attributes, [attr]: parseInt(value) || 0 } }));
  };

  const handleStatOverride = (stat, value) => {
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, [stat]: { ...prev.stats[stat], overrideMax: value } } }));
  };

  const handleSkillChange = (index, field, value) => {
    setCharacter(prev => {
      const newSkills = [...prev.skills];
      newSkills[index] = { ...newSkills[index], [field]: value };
      return { ...prev, skills: newSkills };
    });
  };

  const handleAddCustomSkill = () => {
    setCharacter(prev => ({ ...prev, skills: [...prev.skills, { name: '', baseAttribute: 'int', trainingDegree: 0, otherBonus: 0, isCustom: true }] }));
  };

  const handleRemoveCustomSkill = (indexToRemove) => {
    setCharacter(prev => ({ ...prev, skills: prev.skills.filter((_, index) => index !== indexToRemove) }));
  };

  const handleCombatChange = (field, value) => {
    setCharacter(prev => ({ ...prev, combat: { ...prev.combat, [field]: value } }));
  };

  const handleInventoryChange = (field, value) => {
    setCharacter(prev => ({ ...prev, inventory: { ...prev.inventory, [field]: value } }));
  };

  const handleCategoryLimitChange = (cat, value) => {
    setCharacter(prev => ({
      ...prev,
      inventory: { ...prev.inventory, categoryLimits: { ...prev.inventory.categoryLimits, [cat]: parseInt(value) || 0 } }
    }));
  };

  const handleAddItem = () => {
    setCharacter(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        items: [...prev.inventory.items, { item: '', customName: '', quantity: 1, spaceOverride: 1, categoryOverride: '0', description: '' }]
      }
    }));
  };

  const handleItemChange = (index, field, value) => {
    setCharacter(prev => {
      const newItems = [...prev.inventory.items];
      let updatedItem = { ...newItems[index] };

      if (field === 'quantity') {
        updatedItem[field] = Math.max(1, parseInt(value) || 1);
      } else {
        updatedItem[field] = value;
      }

      if (field === 'item') {
        if (value) {
          const selectedEntity = itemsList.find(i => i._id === value) || weaponsList.find(w => w._id === value);
          if (selectedEntity) {
            updatedItem.spaceOverride = selectedEntity.space !== undefined ? selectedEntity.space : 1;
            updatedItem.categoryOverride = selectedEntity.category || '0';
            updatedItem.customName = '';
            updatedItem.description = selectedEntity.description || '';
          }
        } else {
          updatedItem.spaceOverride = 1;
          updatedItem.categoryOverride = '0';
          updatedItem.description = '';
        }
      }

      newItems[index] = updatedItem;
      return { ...prev, inventory: { ...prev.inventory, items: newItems } };
    });
  };

  const handleAddItemFromModal = (entity, type) => {
    setCharacter(prev => {
      const newItem = {
        item: entity._id,
        customName: entity.name,
        quantity: 1,
        spaceOverride: entity.space !== undefined ? entity.space : 1,
        categoryOverride: entity.category || '0',
        description: entity.description || '',
        type: type
      };

      const newInventory = [...prev.inventory.items, newItem];
      let newAttacks = [...prev.attacks];

      if (type === 'weapon') {
        const weaponData = JSON.stringify(entity).toLowerCase();
        const isMelee = weaponData.includes('corpo a corpo') || weaponData.includes('corpo-a-corpo');

        const relevantSkillName = isMelee ? 'Luta' : 'Pontaria';

        let calculatedDamage = entity.damage || '';
        if (isMelee && (prev.attributes.for > 0)) {
          calculatedDamage += `+${prev.attributes.for}`;
        }

        newAttacks.push({
          weapon: entity._id,
          customName: entity.name,
          attackBonus: relevantSkillName,
          damageOverride: calculatedDamage,
          criticalOverride: entity.critical || ''
        });
      }

      return { ...prev, inventory: { ...prev.inventory, items: newInventory }, attacks: newAttacks };
    });
  };

  const handleAttackChange = (index, field, value) => {
    setCharacter(prev => {
      const newAttacks = [...prev.attacks];
      let updatedAttack = { ...newAttacks[index], [field]: value };

      if (field === 'weapon') {
        if (value) {
          const selectedWeapon = weaponsList.find(w => w._id === value);
          if (selectedWeapon) {
            const weaponData = JSON.stringify(selectedWeapon).toLowerCase();
            const isMelee = weaponData.includes('corpo a corpo') || weaponData.includes('corpo-a-corpo');

            const relevantSkillName = isMelee ? 'Luta' : 'Pontaria';

            let calculatedDamage = selectedWeapon.damage || '';
            if (isMelee && (prev.attributes.for > 0)) {
              calculatedDamage += `+${prev.attributes.for}`;
            }

            updatedAttack.damageOverride = calculatedDamage;
            updatedAttack.criticalOverride = selectedWeapon.critical || '';
            updatedAttack.attackBonus = relevantSkillName;
            updatedAttack.customName = '';
          }
        } else {
          updatedAttack.damageOverride = '';
          updatedAttack.criticalOverride = '';
          updatedAttack.attackBonus = '';
        }
      }

      newAttacks[index] = updatedAttack;
      return { ...prev, attacks: newAttacks };
    });
  };

  const handleAddAttack = () => {
    setCharacter(prev => ({
      ...prev,
      attacks: [...prev.attacks, { weapon: '', customName: '', attackBonus: '', damageOverride: '', criticalOverride: '' }]
    }));
  };

  const handleRemoveItem = (index) => {
    setCharacter(prev => ({ ...prev, inventory: { ...prev.inventory, items: prev.inventory.items.filter((_, i) => i !== index) } }));
  };

  const handleRemoveAttack = (index) => {
    setCharacter(prev => ({ ...prev, attacks: prev.attacks.filter((_, i) => i !== index) }));
  };

  const getRitualColor = (element) => {
    const el = element?.toLowerCase() || '';
    if (el.includes('sangue')) return '#cc0000';
    if (el.includes('morte')) return '#1a1a1a';
    if (el.includes('energia')) return '#9933ff';
    if (el.includes('conhecimento')) return '#cc9900';
    if (el.includes('medo')) return '#ffffff';
    return 'var(--border-color)';
  };

  const handleAddPowerFromModal = (entity, type) => {
    setCharacter(prev => {
      if (type === 'ability') {
        const newAbility = {
          ability: entity._id,
          customName: entity.name,
          customNotes: entity.description || ''
        };
        return { ...prev, abilities: [...prev.abilities, newAbility] };
      }
      else if (type === 'ritual') {
        const newRitual = {
          ritual: entity._id,
          customName: entity.name,
          customNotes: entity.description || '',
          dcOverride: '',
          _element: entity.elements?.[0] || 'Outro',
          _circle: entity.circle || 1,
          _execution: entity.execution || 'Padrão',
          _range: entity.range || 'Curto',
          _target: entity.target || '1 Ser',
          _duration: entity.duration || 'Instantânea'
        };
        return { ...prev, rituals: [...prev.rituals, newRitual] };
      }
      return prev;
    });
  };

  const handleRemoveAbility = (index) => {
    setCharacter(prev => ({ ...prev, abilities: prev.abilities.filter((_, i) => i !== index) }));
  };

  const handleRemoveRitual = (index) => {
    setCharacter(prev => ({ ...prev, rituals: prev.rituals.filter((_, i) => i !== index) }));
  };

  const handleAbilityChange = (index, value) => {
    setCharacter(prev => {
      const newAbilities = [...prev.abilities];
      newAbilities[index].customNotes = value;
      return { ...prev, abilities: newAbilities };
    });
  };

  const handleRitualChange = (index, field, value) => {
    setCharacter(prev => {
      const newRituals = [...prev.rituals];
      newRituals[index][field] = value;
      return { ...prev, rituals: newRituals };
    });
  };

  const handleLoreChange = (field, value) => {
    setCharacter(prev => ({
      ...prev,
      lore: { ...(prev.lore || {}), [field]: value }
    }));
  };

  const handleOriginChange = (originId) => {
    setCharacter(prev => {
      const updated = { ...prev, origin: originId };

      // Procura a origem completa na lista para extrair o poder
      const selectedOrigin = originsList.find(o => o._id === originId);

      if (selectedOrigin && selectedOrigin.powerName) {
        // Verifica se o personagem já tem este poder para não duplicar
        const alreadyHasPower = prev.abilities.some(a => a.customName === selectedOrigin.powerName);

        if (!alreadyHasPower) {
          updated.abilities = [
            ...prev.abilities,
            {
              ability: null, // Não tem ID na coleção de habilidades gerais, vem da origem
              customName: `[Origem] ${selectedOrigin.powerName}`,
              customNotes: selectedOrigin.powerDescription
            }
          ];
        }
      }
      return updated;
    });
  };

  const handleSaveCharacter = async () => {
    if (!character.name) {
      alert("O teu agente precisa de um nome antes de ser submetido aos arquivos!");
      return;
    }

    const payload = JSON.parse(JSON.stringify(character));

    if (payload.classId) payload.class = payload.classId;
    delete payload.classId;

    if (payload.trackId) payload.track = payload.trackId;
    delete payload.trackId;

    if (payload.lore) {
      payload.lore.history = payload.lore.backstory || '';
      delete payload.lore.backstory;
    }

    if (payload.inventory.maxWeightOverride === '') {
      payload.inventory.maxWeightOverride = null;
    }

    ['hp', 'ep', 'san'].forEach(stat => {
      if (payload.stats[stat].overrideMax === '') {
        payload.stats[stat].overrideMax = null;
      } else {
        payload.stats[stat].overrideMax = Number(payload.stats[stat].overrideMax);
      }
    });

    if (payload.rituals) {
      payload.rituals = payload.rituals.map(r => ({
        ...r,
        dcOverride: r.dcOverride ? Number(r.dcOverride.toString().replace(/\D/g, '')) || null : null
      }));
    }

    setIsSaving(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/characters`, payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Agente registado com sucesso na Base de Dados!');
      router.push('/characters');
    } catch (error) {
      console.error('Erro ao guardar ficha:', error.response?.data || error.message);
      alert('Ocorreu um erro ao guardar a ficha. Verifica a consola.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) return null;

  const filteredWeapons = weaponsList.filter(w => w.name.toLowerCase().includes(modalSearch.toLowerCase()));
  const filteredItems = itemsList.filter(i => i.name.toLowerCase().includes(modalSearch.toLowerCase()));
  const filteredAbilities = abilitiesList.filter(a => a.name.toLowerCase().includes(powerModalSearch.toLowerCase()));
  const filteredRituals = ritualsList.filter(r => r.name.toLowerCase().includes(powerModalSearch.toLowerCase()));

  const getCategoryCount = (cat) => character.inventory.items.filter(i => i.categoryOverride === cat).length;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button onClick={() => router.back()} className={styles.backBtn}>&larr; Voltar</button>
          <ThemeToggle />
        </div>
        <h1 className={styles.title}>Nova Ficha de Agente</h1>
      </header>

      <div className={styles.container}>
        <nav className={styles.tabNav}>
          {TABS.map(tab => (
            <button key={tab.id} className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.contentArea}>

          {/* TAB BASICS */}
          {activeTab === 'basics' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Dados Pessoais</h2>
              <div className={styles.grid2}>
                <FormField label="Nome do Agente" name="name" value={character.name} onChange={handleChange} required />
                <FormField label="Nome do Jogador" name="playerName" value={character.playerName} onChange={handleChange} />
              </div>
              <div className={styles.grid3}>
                <AeroSelect
                  label="Origem"
                  name="origin"
                  options={originsList.map(o => ({ label: o.name, value: o._id }))}
                  value={character.origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  placeholder="-- Selecionar Origem --"
                />
                <AeroSelect label="Classe" name="classId" options={classesList.map(c => ({ label: c.name, value: c._id }))} value={character.classId} onChange={handleChange} placeholder="-- Selecionar --" />
                {(() => {
                  const availableTracks = tracksList.filter(t => (t.class?._id || t.class) === character.classId);
                  if (character.classId && availableTracks.length > 0) {
                    return <AeroSelect label="Trilha (Subclasse)" name="trackId" options={availableTracks.map(t => ({ label: t.name, value: t._id }))} value={character.trackId} onChange={handleChange} placeholder="-- Selecionar --" />;
                  }
                  return <div></div>;
                })()}
              </div>
              <div className={styles.grid4}>
                <FormField label="NEX (%)" name="nex" type="number" value={character.nex} onChange={handleChange} />
                <div className={styles.checkboxWrapper}>
                  <label className={styles.checkLabel}><input type="checkbox" name="useLevel" checked={character.useLevel} onChange={handleChange} />Usar Sistema de Nível</label>
                </div>
                {character.useLevel && <FormField label="Nível" name="level" type="number" value={character.level} onChange={handleChange} />}
                <AeroSelect label="Patente" name="patente" options={['Recruta', 'Operador', 'Agente Especial', 'Oficial de Operações', 'Agente de Elite']} value={character.patente} onChange={handleChange} />
              </div>

              <h2 className={styles.sectionTitle}>Atributos Base</h2>
              <div className={styles.attributesGrid}>
                {['agi', 'for', 'int', 'pre', 'vig'].map(attr => (
                  <div key={attr} className={styles.attrBox}>
                    <label>{attr.toUpperCase()}</label>
                    <input type="number" value={character.attributes[attr]} onChange={(e) => handleAttributeChange(attr, e.target.value)} min="0" max="5" className={styles.attrInput} />
                  </div>
                ))}
              </div>

              <h2 className={styles.sectionTitle}>Status (Sobrescrita Manual)</h2>
              <div className={styles.grid3}>
                <FormField label="PV Máximo" type="number" value={character.stats.hp.overrideMax} onChange={(e) => handleStatOverride('hp', e.target.value)} placeholder="Deixar vazio para auto" />
                <FormField label="PE Máximo" type="number" value={character.stats.ep.overrideMax} onChange={(e) => handleStatOverride('ep', e.target.value)} placeholder="Deixar vazio para auto" />
                <FormField label="SAN Máximo" type="number" value={character.stats.san.overrideMax} onChange={(e) => handleStatOverride('san', e.target.value)} placeholder="Deixar vazio para auto" />
              </div>
            </div>
          )}

          {/* TAB SKILLS */}
          {activeTab === 'skills' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Perícias do Agente</h2>
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
                      <div className={styles.colName}>
                        {skill.isCustom ? (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button type="button" onClick={() => handleRemoveCustomSkill(index)} className={styles.removeSkillBtn}>X</button>
                            <input type="text" className={styles.skillInput} style={{ textAlign: 'left', fontWeight: 'bold' }} value={skill.name} onChange={(e) => handleSkillChange(index, 'name', e.target.value)} placeholder="Ex: Profissão (Médico)" />
                          </div>
                        ) : (<strong>{skill.name}</strong>)}
                      </div>
                      <div className={styles.colAttr}>
                        <select className={styles.skillSelect} value={skill.baseAttribute} onChange={(e) => handleSkillChange(index, 'baseAttribute', e.target.value)}>
                          <option value="agi">AGI ({character.attributes.agi})</option>
                          <option value="for">FOR ({character.attributes.for})</option>
                          <option value="int">INT ({character.attributes.int})</option>
                          <option value="pre">PRE ({character.attributes.pre})</option>
                          <option value="vig">VIG ({character.attributes.vig})</option>
                        </select>
                      </div>
                      <div className={styles.colTrain}>
                        <select className={styles.skillSelect} value={skill.trainingDegree} onChange={(e) => handleSkillChange(index, 'trainingDegree', parseInt(e.target.value))}>
                          <option value={0}>Destreinado (+0)</option>
                          <option value={5}>Treinado (+5)</option>
                          <option value={10}>Veterano (+10)</option>
                          <option value={15}>Expert (+15)</option>
                        </select>
                      </div>
                      <div className={styles.colBonus}>
                        <input type="number" className={styles.skillInput} value={skill.otherBonus} onChange={(e) => handleSkillChange(index, 'otherBonus', parseInt(e.target.value) || 0)} />
                      </div>
                      <div className={styles.colTotal}>
                        <span className={styles.totalBadge}>{diceCount}d20 + {totalBonus}</span>
                      </div>
                    </div>
                  );
                })}
                <button type="button" onClick={handleAddCustomSkill} className={styles.addSkillBtn}>+ Adicionar Perícia Extra</button>
              </div>
            </div>
          )}

          {/* TAB COMBATE E INVENTÁRIO */}
          {activeTab === 'combat' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Inventário e Carga</h2>

              <div className={styles.inventoryDashboard}>
                <div className={styles.invStatsRow}>
                  <div className={styles.invBox}>
                    <span className={styles.invLabel}>Pontos de Prestígio</span>
                    <input type="number" className={styles.invInputBig} value={character.prestigio} onChange={handleChange} name="prestigio" />
                  </div>
                  <div className={styles.invBox} style={{ flex: 2 }}>
                    <span className={styles.invLabel}>Patente</span>
                    <div style={{ width: '100%', minWidth: '200px' }}>
                      <AeroSelect
                        name="patente"
                        options={[
                          { label: 'Recruta', value: 'Recruta' },
                          { label: 'Operador', value: 'Operador' },
                          { label: 'Agente Especial', value: 'Agente Especial' },
                          { label: 'Oficial de Operações', value: 'Oficial de Operações' },
                          { label: 'Agente de Elite', value: 'Agente de Elite' }
                        ]}
                        value={character.patente}
                        onChange={handleChange}
                        placeholder="Patente"
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.invStatsRow}>
                  <div className={styles.invBoxContainer}>
                    <span className={styles.invLabel}>Limite de Itens</span>
                    <div className={styles.invCategoryRow}>
                      <input type="number" title="Categoria I" value={character.inventory.categoryLimits.I} onChange={(e) => handleCategoryLimitChange('I', e.target.value)} />
                      <input type="number" title="Categoria II" value={character.inventory.categoryLimits.II} onChange={(e) => handleCategoryLimitChange('II', e.target.value)} />
                      <input type="number" title="Categoria III" value={character.inventory.categoryLimits.III} onChange={(e) => handleCategoryLimitChange('III', e.target.value)} />
                      <input type="number" title="Categoria IV" value={character.inventory.categoryLimits.IV} onChange={(e) => handleCategoryLimitChange('IV', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className={styles.invStatsRow}>
                  <div className={styles.invBoxContainer}>
                    <span className={styles.invLabel}>No Inventário</span>
                    <div className={styles.invCategoryRow} style={{ opacity: 0.7 }}>
                      <div className={styles.invStaticBox}>{getCategoryCount('1') || getCategoryCount('I')}</div>
                      <div className={styles.invStaticBox}>{getCategoryCount('2') || getCategoryCount('II')}</div>
                      <div className={styles.invStaticBox}>{getCategoryCount('3') || getCategoryCount('III')}</div>
                      <div className={styles.invStaticBox}>{getCategoryCount('4') || getCategoryCount('IV')}</div>
                    </div>
                  </div>
                </div>

                <div className={styles.invStatsRow}>
                  <div className={styles.invBox}>
                    <span className={styles.invLabel}>Limite de Crédito</span>
                    <div style={{ width: '150px' }}>
                      <AeroSelect
                        name="creditLimit"
                        options={[
                          { label: 'Nenhum', value: 'Nenhum' },
                          { label: 'Baixo', value: 'Baixo' },
                          { label: 'Médio', value: 'Médio' },
                          { label: 'Alto', value: 'Alto' },
                          { label: 'Ilimitado', value: 'Ilimitado' }
                        ]}
                        value={character.inventory.creditLimit}
                        onChange={(e) => handleInventoryChange('creditLimit', e.target.value)}
                        placeholder="Crédito"
                      />
                    </div>
                  </div>
                  <div className={styles.invBoxContainer}>
                    <span className={styles.invLabel}>Carga Máx.</span>
                    <div className={styles.invCategoryRow}>
                      <div className={styles.invStaticBox} title="Espaço Utilizado">
                        {character.inventory.items.reduce((acc, item) => acc + ((parseFloat(item.spaceOverride) || 0) * (parseInt(item.quantity) || 1)), 0)}
                      </div>

                      <input
                        type="number"
                        className={styles.invStaticInput}
                        style={{ borderLeft: '1px solid var(--border-color)' }}
                        placeholder={Math.max((character.attributes.for || 0) * 5, 2)}
                        value={character.inventory.maxWeightOverride}
                        onChange={(e) => handleInventoryChange('maxWeightOverride', e.target.value)}
                        title="Sobrescrever Carga Máxima"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0 2rem 0' }}>
                <button type="button" onClick={() => setShowItemModal(true)} className={styles.openModalBtn}>
                  + Adicionar Item / Arma
                </button>
              </div>

              <div className={styles.itemsGrid}>
                {character.inventory.items.length === 0 && <p className={styles.emptyText}>O inventário está vazio.</p>}
                {character.inventory.items.map((item, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemCardHeader}>
                      <span className={styles.itemName}>{item.customName || 'Item Desconhecido'}</span>
                      <button onClick={() => handleRemoveItem(index)} className={styles.removeSkillBtn}>X</button>
                    </div>

                    <div className={styles.itemCardEditRow}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Cat:
                        <div style={{ marginTop: '0.2rem' }}>
                          <AeroSelect
                            options={[
                              { label: '0', value: '0' },
                              { label: 'I', value: '1' },
                              { label: 'II', value: '2' },
                              { label: 'III', value: '3' },
                              { label: 'IV', value: '4' }
                            ]}
                            value={item.categoryOverride?.toString() || '0'}
                            onChange={(e) => handleItemChange(index, 'categoryOverride', e.target.value)}
                          />
                        </div>
                      </div>

                      <label style={{ flex: 1 }}>Espaço:
                        <input type="number" value={item.spaceOverride} onChange={(e) => handleItemChange(index, 'spaceOverride', e.target.value)} />
                      </label>

                      <label style={{ flex: 1 }}>Qnt:
                        <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                      </label>
                    </div>

                    <textarea
                      className={styles.itemCardDesc}
                      placeholder="Descrição / Efeitos especiais..."
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <h2 className={styles.sectionTitle} style={{ marginTop: '3rem' }}>Defesa e Combate</h2>
              <div className={styles.defenseBox}>
                <div className={styles.defenseTotal}>
                  <span>Defesa Total: </span>
                  <strong>
                    {10 + Number(character.attributes.agi || 0) + Number(character.combat.defenseEquipment || 0) + Number(character.combat.defenseOther || 0)}
                  </strong>
                </div>
                <div className={styles.defenseMath}>
                  = 10 + <span>AGI ({character.attributes.agi || 0})</span> +
                  <input type="number" value={character.combat.defenseEquipment} onChange={(e) => handleCombatChange('defenseEquipment', e.target.value)} placeholder="Equip" /> +
                  <input type="number" value={character.combat.defenseOther} onChange={(e) => handleCombatChange('defenseOther', e.target.value)} placeholder="Outros" />
                </div>
              </div>

              <h2 className={styles.sectionTitle} style={{ marginTop: '3rem' }}>Ataques</h2>
              <div className={styles.attacksGrid}>
                {character.attacks.length === 0 && <p className={styles.emptyText}>Nenhum ataque registado.</p>}
                {character.attacks.map((atk, index) => (
                  <div key={index} className={styles.attackCard}>
                    <div className={styles.attackCardHeader}>
                      <input type="text" className={styles.attackNameInput} value={atk.customName} onChange={(e) => handleAttackChange(index, 'customName', e.target.value)} placeholder="Nome do Ataque" />
                      <button onClick={() => handleRemoveAttack(index)} className={styles.removeSkillBtn}>X</button>
                    </div>
                    <div className={styles.attackStatsRow}>
                      <div className={styles.attackStat}>
                        <label>Teste</label>
                        <input
                          type="text"
                          value={atk.attackBonus}
                          onChange={(e) => handleAttackChange(index, 'attackBonus', e.target.value)}
                          placeholder="Ex: Luta"
                        />
                      </div>
                      <div className={styles.attackStat}>
                        <label>Dano</label>
                        <input type="text" value={atk.damageOverride} onChange={(e) => handleAttackChange(index, 'damageOverride', e.target.value)} placeholder="1d8" />
                      </div>
                      <div className={styles.attackStat}>
                        <label>Crítico</label>
                        <input type="text" value={atk.criticalOverride} onChange={(e) => handleAttackChange(index, 'criticalOverride', e.target.value)} placeholder="19" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB PODERES E RITUAIS */}
          {activeTab === 'powers' && (
            <div className={styles.tabContent}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0' }}>
                <button type="button" onClick={() => setShowPowerModal(true)} className={styles.openModalBtn}>
                  + Procurar Poder / Ritual
                </button>
              </div>

              <h2 className={styles.sectionTitle}>Rituais Conhecidos</h2>
              <div className={styles.attacksGrid}>
                {character.rituals.length === 0 && <p className={styles.emptyText}>Nenhum ritual aprendido.</p>}
                {character.rituals.map((rit, index) => (
                  <div key={index} className={styles.itemCard} style={{ borderTop: `4px solid ${getRitualColor(rit._element)}` }}>
                    <div className={styles.itemCardHeader}>
                      <span className={styles.itemName} style={{ fontSize: '1.2rem' }}>{rit.customName}</span>
                      <button onClick={() => handleRemoveRitual(index)} className={styles.removeSkillBtn}>X</button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', alignItems: 'center' }}>
                      <span style={{ background: getRitualColor(rit._element), color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {rit._element} {rit._circle}
                      </span>
                      <div className={styles.attackStat} style={{ flex: 'none', width: '80px', marginLeft: 'auto' }}>
                        <input type="text" value={rit.dcOverride} onChange={(e) => handleRitualChange(index, 'dcOverride', e.target.value)} placeholder="Ex: DT 20" title="DT do Ritual" />
                      </div>
                    </div>

                    <div className={styles.itemCardDetails} style={{ flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                      <span><strong>Execução:</strong> {rit._execution} | <strong>Alcance:</strong> {rit._range}</span>
                      <span><strong>Alvo:</strong> {rit._target} | <strong>Duração:</strong> {rit._duration}</span>
                    </div>

                    <textarea
                      className={styles.itemCardDesc}
                      placeholder="Descrição e Formas do Ritual (Verdadeiro, Discente)..."
                      value={rit.customNotes}
                      onChange={(e) => handleRitualChange(index, 'customNotes', e.target.value)}
                      style={{ minHeight: '120px' }}
                    />
                  </div>
                ))}
              </div>

              <h2 className={styles.sectionTitle} style={{ marginTop: '3rem' }}>Poderes e Habilidades</h2>
              <div className={styles.attacksGrid}>
                {character.abilities.length === 0 && <p className={styles.emptyText}>Nenhum poder registado.</p>}
                {character.abilities.map((abl, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemCardHeader}>
                      <span className={styles.itemName}>{abl.customName}</span>
                      <button onClick={() => handleRemoveAbility(index)} className={styles.removeSkillBtn}>X</button>
                    </div>
                    <textarea
                      className={styles.itemCardDesc}
                      placeholder="Descrição e notas mecânicas..."
                      value={abl.customNotes}
                      onChange={(e) => handleAbilityChange(index, e.target.value)}
                      style={{ minHeight: '100px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB BACKGROUND (LORE) */}
          {activeTab === 'lore' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Perfil e História</h2>

              <div className={styles.grid2}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className={styles.smallLabel}>Aparência Física</label>
                  <textarea
                    className={styles.itemCardDesc}
                    style={{ minHeight: '150px' }}
                    value={character.lore?.appearance}
                    onChange={(e) => handleLoreChange('appearance', e.target.value)}
                    placeholder="Descreve o teu agente. Altura, porte, cicatrizes, estilo de roupa preferido..."
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className={styles.smallLabel}>Personalidade</label>
                  <textarea
                    className={styles.itemCardDesc}
                    style={{ minHeight: '150px' }}
                    value={character.lore?.personality}
                    onChange={(e) => handleLoreChange('personality', e.target.value)}
                    placeholder="Traços marcantes, medos, manias, a forma como reage ao paranormal..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                <label className={styles.smallLabel}>História (Background)</label>
                <textarea
                  className={styles.itemCardDesc}
                  style={{ minHeight: '200px' }}
                  value={character.lore?.backstory}
                  onChange={(e) => handleLoreChange('backstory', e.target.value)}
                  placeholder="O que levou o teu agente a juntar-se à Ordem? Quem era ele antes de descobrir a verdade?"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                <label className={styles.smallLabel}>Anotações Gerais da Campanha</label>
                <textarea
                  className={styles.itemCardDesc}
                  style={{ minHeight: '150px' }}
                  value={character.lore?.notes}
                  onChange={(e) => handleLoreChange('notes', e.target.value)}
                  placeholder="Aponta aqui pistas, nomes de NPCs, e teorias durante as sessões..."
                />
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.saveBtn}
            onClick={handleSaveCharacter}
            disabled={isSaving}
          >
            {isSaving ? 'A Sincronizar Arquivos...' : 'Guardar Ficha'}
          </button>
        </div>
      </div>

      {/* =========================================
          MODAL DE ADICIONAR ITENS E ARMAS
          ========================================= */}
      {showItemModal && (
        <div className={styles.modalOverlay} onClick={() => setShowItemModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Adicionar ao Inventário</h2>
              <button onClick={() => setShowItemModal(false)} className={styles.modalCloseBtn}>X</button>
            </div>

            <div className={styles.modalTabs}>
              <button className={modalTab === 'weapons' ? styles.modalTabActive : ''} onClick={() => setModalTab('weapons')}>Armas</button>
              <button className={modalTab === 'items' ? styles.modalTabActive : ''} onClick={() => setModalTab('items')}>Itens Gerais</button>
            </div>

            <div className={styles.modalSearchArea}>
              <input
                type="text"
                placeholder="Pesquisar arquivo..."
                value={modalSearch}
                onChange={e => setModalSearch(e.target.value)}
                className={styles.modalSearchInput}
              />
            </div>

            <div className={styles.modalList}>
              {modalTab === 'weapons' && filteredWeapons.map(w => (
                <div key={w._id} className={styles.modalListItem}>
                  <div className={styles.modalItemInfo}>
                    <h4>{w.name}</h4>
                    <div className={styles.modalStats}>
                      <div><span>Dano:</span> {w.damage}</div>
                      <div><span>Crítico:</span> {w.critical}</div>
                      <div><span>Cat:</span> {w.category}</div>
                      <div><span>Espaço:</span> {w.space}</div>
                    </div>
                  </div>
                  <button onClick={() => handleAddItemFromModal(w, 'weapon')} className={styles.modalAddBtn}>+</button>
                </div>
              ))}

              {modalTab === 'items' && filteredItems.map(i => (
                <div key={i._id} className={styles.modalListItem}>
                  <div className={styles.modalItemInfo}>
                    <h4>{i.name}</h4>
                    <div className={styles.modalStats}>
                      <div><span>Cat:</span> {i.category}</div>
                      <div><span>Espaço:</span> {i.space}</div>
                    </div>
                  </div>
                  <button onClick={() => handleAddItemFromModal(i, 'item')} className={styles.modalAddBtn}>+</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL DE ADICIONAR PODERES E RITUAIS
          ========================================= */}
      {showPowerModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPowerModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Arquivo Paranormal</h2>
              <button onClick={() => setShowPowerModal(false)} className={styles.modalCloseBtn}>X</button>
            </div>

            <div className={styles.modalTabs}>
              <button className={powerModalTab === 'abilities' ? styles.modalTabActive : ''} onClick={() => setPowerModalTab('abilities')}>Poderes</button>
              <button className={powerModalTab === 'rituals' ? styles.modalTabActive : ''} onClick={() => setPowerModalTab('rituals')}>Rituais</button>
            </div>

            <div className={styles.modalSearchArea}>
              <input
                type="text"
                placeholder="Pesquisar arquivo..."
                value={powerModalSearch}
                onChange={e => setPowerModalSearch(e.target.value)}
                className={styles.modalSearchInput}
              />
            </div>

            <div className={styles.modalList}>
              {powerModalTab === 'abilities' && filteredAbilities.map(a => (
                <div key={a._id} className={styles.modalListItem}>
                  <div className={styles.modalItemInfo}>
                    <h4>{a.name}</h4>
                    <p>{a.category}</p>
                  </div>
                  <button onClick={() => handleAddPowerFromModal(a, 'ability')} className={styles.modalAddBtn}>+</button>
                </div>
              ))}

              {powerModalTab === 'rituals' && filteredRituals.map(r => (
                <div key={r._id} className={styles.modalListItem} style={{ borderLeft: `4px solid ${getRitualColor(r.elements?.[0])}` }}>
                  <div className={styles.modalItemInfo}>
                    <h4>{r.name}</h4>
                    <p>{r.elements?.join(', ')} | Círculo: {r.circle}</p>
                  </div>
                  <button onClick={() => handleAddPowerFromModal(r, 'ritual')} className={styles.modalAddBtn}>+</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}