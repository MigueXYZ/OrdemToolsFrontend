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

  // Estados do Modal de Itens
  const [showItemModal, setShowItemModal] = useState(false);
  const [modalTab, setModalTab] = useState('weapons'); // 'weapons' ou 'items'
  const [modalSearch, setModalSearch] = useState('');

  // Estado Central da Ficha
  const [character, setCharacter] = useState({
    name: '', playerName: '', nex: 5, level: 1, useLevel: false,
    classId: '', trackId: '', origin: '', patente: 'Recruta', prestigio: 0,
    attributes: { agi: 1, for: 1, int: 1, pre: 1, vig: 1 },
    stats: { hp: { overrideMax: '' }, ep: { overrideMax: '' }, san: { overrideMax: '' } },
    skills: DEFAULT_SKILLS,
    combat: { defenseEquipment: 0, defenseOther: 0, protections: '', resistances: '', movement: '9m' },
    attacks: [],
    inventory: {
      items: [],
      creditLimit: 'Baixo',
      maxWeightOverride: '',
      categoryLimits: { I: 1, II: 0, III: 0, IV: 0 },
      description: { type: String }
    },
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [clsRes, trkRes, wpnRes, itmRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/classes`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tracks`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/weapons?limit=1000`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/items?limit=1000`)
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

      // Garante que a quantidade nunca é inferior a 1
      if (field === 'quantity') {
        updatedItem[field] = Math.max(1, parseInt(value) || 1);
      } else {
        updatedItem[field] = value;
      }

      // Se o utilizador escolheu um Item (ou Arma) da Base de Dados
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

        // Define a string da perícia em vez do cálculo matemático
        const relevantSkillName = isMelee ? 'Luta' : 'Pontaria';

        let calculatedDamage = entity.damage || '';
        if (isMelee && (prev.attributes.for > 0)) {
          calculatedDamage += `+${prev.attributes.for}`;
        }

        newAttacks.push({
          weapon: entity._id,
          customName: entity.name,
          attackBonus: relevantSkillName, // Guarda a string "Luta" ou "Pontaria"
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

            // Define a string da perícia
            const relevantSkillName = isMelee ? 'Luta' : 'Pontaria';

            let calculatedDamage = selectedWeapon.damage || '';
            if (isMelee && (prev.attributes.for > 0)) {
              calculatedDamage += `+${prev.attributes.for}`;
            }

            updatedAttack.damageOverride = calculatedDamage;
            updatedAttack.criticalOverride = selectedWeapon.critical || '';
            updatedAttack.attackBonus = relevantSkillName; // Guarda a string
            updatedAttack.customName = '';
          }
        } else {
          updatedAttack.damageOverride = '';
          updatedAttack.criticalOverride = '';
          updatedAttack.attackBonus = ''; // Fica vazio
        }
      }

      newAttacks[index] = updatedAttack;
      return { ...prev, attacks: newAttacks };
    });
  };

  const handleAddAttack = () => {
    setCharacter(prev => ({
      ...prev,
      // attackBonus agora inicia como string em vez de 0
      attacks: [...prev.attacks, { weapon: '', customName: '', attackBonus: '', damageOverride: '', criticalOverride: '' }]
    }));
  };

  const handleRemoveItem = (index) => {
    setCharacter(prev => ({ ...prev, inventory: { ...prev.inventory, items: prev.inventory.items.filter((_, i) => i !== index) } }));
  };

  const handleRemoveAttack = (index) => {
    setCharacter(prev => ({ ...prev, attacks: prev.attacks.filter((_, i) => i !== index) }));
  };

  if (loading || !user) return null;

  const filteredWeapons = weaponsList.filter(w => w.name.toLowerCase().includes(modalSearch.toLowerCase()));
  const filteredItems = itemsList.filter(i => i.name.toLowerCase().includes(modalSearch.toLowerCase()));

  // Conta itens por categoria para o display
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
          {/* TAB BASICS (Mantém-se igual, omitido por brevidade no snippet, assume que está aqui) */}
          {activeTab === 'basics' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Dados Pessoais</h2>
              <div className={styles.grid2}>
                <FormField label="Nome do Agente" name="name" value={character.name} onChange={handleChange} required />
                <FormField label="Nome do Jogador" name="playerName" value={character.playerName} onChange={handleChange} />
              </div>
              <div className={styles.grid3}>
                <FormField label="Origem" name="origin" value={character.origin} onChange={handleChange} placeholder="Ex: Académico" />
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

          {/* TAB SKILLS (Mantém-se igual) */}
          {activeTab === 'skills' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Perícias do Agente</h2>
              <div className={styles.skillsTable}>
                {/* ... Código das perícias permanece inalterado ... */}
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

          {/* NOVO TAB COMBATE & INVENTÁRIO */}
          {activeTab === 'combat' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Inventário e Carga</h2>

              {/* PAINEL DE STATUS DE INVENTÁRIO (Estilo Cris) */}
              <div className={styles.inventoryDashboard}>
                <div className={styles.invStatsRow}>
                  <div className={styles.invBox}>
                    <span className={styles.invLabel}>Pontos de Prestígio</span>
                    <input type="number" className={styles.invInputBig} value={character.prestigio} onChange={handleChange} name="prestigio" />
                  </div>
                  <div className={styles.invBox} style={{ flex: 2 }}>
                    <span className={styles.invLabel}>Patente</span>
                    {/* SUBSTITUÍDO PELO AEROSELECT */}
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
                    {/* SUBSTITUÍDO PELO AEROSELECT */}
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

                      {/* AGORA A CARGA MÁXIMA É UM INPUT EDITÁVEL */}
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

              {/* BOTÃO ABRIR MODAL */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0 2rem 0' }}>
                <button type="button" onClick={() => setShowItemModal(true)} className={styles.openModalBtn}>
                  + Adicionar Item / Arma
                </button>
              </div>

              {/* LISTA DE ITENS DO INVENTÁRIO (AGORA COM INPUTS E DESCRIÇÃO) */}
              <div className={styles.itemsGrid}>
                {character.inventory.items.length === 0 && <p className={styles.emptyText}>O inventário está vazio.</p>}
                {character.inventory.items.map((item, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemCardHeader}>
                      <span className={styles.itemName}>{item.customName || 'Item Desconhecido'}</span>
                      <button onClick={() => handleRemoveItem(index)} className={styles.removeSkillBtn}>X</button>
                    </div>

                    <div className={styles.itemCardEditRow}>
                      {/* Categoria com AeroSelect */}
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

                      {/* Outros Inputs */}
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

              {/* --- DEFESA --- */}
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

              {/* --- ATAQUES (AGORA CARTÕES EDITÁVEIS) --- */}
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
          {activeTab === 'powers' && <div className={styles.tabContent}>Em construção: Habilidades e Rituais...</div>}
          {activeTab === 'lore' && <div className={styles.tabContent}>Em construção: História e Notas...</div>}
        </div>

        <div className={styles.footer}>
          <button className={styles.saveBtn}>Guardar Ficha</button>
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
                    <p>Dano: {w.damage} | Crítico: {w.critical} | Cat: {w.category}</p>
                  </div>
                  <button onClick={() => handleAddItemFromModal(w, 'weapon')} className={styles.modalAddBtn}>+</button>
                </div>
              ))}

              {modalTab === 'items' && filteredItems.map(i => (
                <div key={i._id} className={styles.modalListItem}>
                  <div className={styles.modalItemInfo}>
                    <h4>{i.name}</h4>
                    <p>Cat: {i.category} | Espaço: {i.space}</p>
                  </div>
                  <button onClick={() => handleAddItemFromModal(i, 'item')} className={styles.modalAddBtn}>+</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}