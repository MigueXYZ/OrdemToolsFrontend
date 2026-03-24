'use client';

import { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import AeroSelect from '../../components/AeroSelect';
import styles from './page.module.css';

const getSkillAttr = (name) => {
    const map = { Acrobacia: 'agi', Adestramento: 'pre', Artes: 'pre', Atletismo: 'for', Atualidades: 'int', Ciências: 'int', Crime: 'agi', Diplomacia: 'pre', Enganação: 'pre', Fortitude: 'vig', Furtividade: 'agi', Iniciativa: 'agi', Intimidação: 'pre', Intuição: 'pre', Investigação: 'int', Luta: 'for', Medicina: 'int', Ocultismo: 'int', Percepção: 'pre', Pilotagem: 'agi', Pontaria: 'agi', Profissão: 'int', Reflexos: 'agi', Religião: 'pre', Sobrevivência: 'int', Tática: 'int', Tecnologia: 'int', Vontade: 'pre' };
    return map[name] || 'int'; // 'int' como fallback seguro para perícias customizadas
};

const TRAINING_OPTIONS = [
    { label: 'Destreinado', value: 0 },
    { label: 'Treinado', value: 5 },
    { label: 'Veterano', value: 10 },
    { label: 'Expert', value: 15 }
];

export default function CharacterSheetPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useContext(AuthContext);

    const [character, setCharacter] = useState(null);
    const [originsList, setOriginsList] = useState([]);
    const [abilitiesList, setAbilitiesList] = useState([]);
    const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
    const [abilitySearchTerm, setAbilitySearchTerm] = useState('');
    const [expandedAbilityId, setExpandedAbilityId] = useState(null);
    const [ritualsList, setRitualsList] = useState([]);
    const [isRitualModalOpen, setIsRitualModalOpen] = useState(false);
    const [ritualSearchTerm, setRitualSearchTerm] = useState('');
    const [itemsList, setItemsList] = useState([]);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemSearchTerm, setItemSearchTerm] = useState('');
    const [expandedItemId, setExpandedItemId] = useState(null);
    const [weaponsList, setWeaponsList] = useState([]);
    const [isWeaponModalOpen, setIsWeaponModalOpen] = useState(false);
    const [weaponSearchTerm, setWeaponSearchTerm] = useState('');
    const [expandedWeaponId, setExpandedWeaponId] = useState(null);


    const [activeTab, setActiveTab] = useState('combate');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                console.log(`A pedir dados do personagem com ID: ${params.id}...`);

                const [charRes, originsRes, abilitiesRes, ritualsRes, itemsRes, weaponsRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/characters/${params.id}`, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    }),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/origins?limit=1000`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/abilities?limit=1000`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/rituals?limit=1000`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/items?limit=1000`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/weapons?limit=1000`)
                ]);

                const originsArray = originsRes.data.data || originsRes.data || [];
                const abilitiesArray = abilitiesRes.data.data || abilitiesRes.data || [];
                const ritualsArray = ritualsRes.data.data || ritualsRes.data || [];
                const itemsArray = itemsRes.data.data || itemsRes.data || [];
                const weaponsArray = weaponsRes.data.data || weaponsRes.data || [];

                setOriginsList(originsArray);
                setAbilitiesList(abilitiesArray);
                setRitualsList(ritualsArray);
                setItemsList(itemsArray);
                setWeaponsList(weaponsArray);

                console.log("Poderes carregados:", abilitiesArray.length);
                console.log("Rituais carregados:", ritualsArray.length);


                const charData = charRes.data.data || charRes.data;

                if (!charData || !charData._id) {
                    throw new Error("A API respondeu, mas os dados da ficha vieram vazios ou num formato estranho.");
                }

                // REDE DE SEGURANÇA
                const safeCharacter = {
                    ...charData,
                    attributes: charData.attributes || { agi: 1, for: 1, int: 1, pre: 1, vig: 1 },
                    stats: charData.stats || {
                        hp: { current: 0, overrideMax: '' },
                        ep: { current: 0, overrideMax: '' },
                        san: { current: 0, overrideMax: '' }
                    },
                    combat: charData.combat || { movement: '9m', defenseEquipment: 0, defenseOther: 0 },
                    skills: charData.skills || [],
                    attacks: charData.attacks || [],
                    inventory: charData.inventory || { items: [], creditLimit: 'Baixo', categoryLimits: { I: 1, II: 0, III: 0, IV: 0 } }
                };

                setCharacter(safeCharacter);

            } catch (error) {
                console.error('Erro detalhado ao carregar ficha:', error);
                alert('Erro ao carregar a ficha ou as listas. Verifica a consola (F12).');
                router.push('/characters');
            }
        };

        if (user && params.id) fetchData();
    }, [user, loading, params.id, router]);

    const handleOriginChange = (originId) => {
        setCharacter(prev => {
            const updated = { ...prev, origin: originId };

            const selectedOrigin = originsList.find(o => o._id === originId);

            if (selectedOrigin && selectedOrigin.powerName) {
                const alreadyHasPower = prev.abilities.some(a => a.customName === `[Origem] ${selectedOrigin.powerName}`);

                if (!alreadyHasPower) {
                    updated.abilities = [
                        ...prev.abilities,
                        {
                            ability: null,
                            customName: `[Origem] ${selectedOrigin.powerName}`,
                            customNotes: selectedOrigin.powerDescription
                        }
                    ];
                }
            }
            return updated;
        });
    };

    const handleChange = (field, value, category = null, subfield = null) => {
        setCharacter(prev => {
            const updated = { ...prev };
            if (category && subfield) {
                updated[category][field][subfield] = value;
            } else if (category) {
                updated[category][field] = value;
            } else {
                updated[field] = value;
            }
            return updated;
        });
    };

    const handleSelectAbilityFromDB = (abilityDB) => {
        // Verifica se o jogador já tem este poder para não duplicar
        const alreadyHas = character.abilities.some(a =>
            (a.ability && (a.ability._id === abilityDB._id || a.ability === abilityDB._id)) ||
            (a.customName === abilityDB.name)
        );

        if (alreadyHas) {
            alert('O agente já possui este poder registado!');
            return;
        }

        setCharacter(prev => ({
            ...prev,
            abilities: [
                ...prev.abilities,
                {
                    // Guardamos o objeto completo para renderizar imediatamente na tela
                    ability: abilityDB,
                    customName: '',
                    customNotes: ''
                }
            ]
        }));

        setIsAbilityModalOpen(false); // Fecha o modal após adicionar
        setAbilitySearchTerm(''); // Limpa a pesquisa
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // A MUDANÇA ESTÁ AQUI: axios.patch em vez de axios.put
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/characters/${character._id}`, character, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert('Progresso guardado com sucesso!');
        } catch (error) {
            console.error('Erro ao guardar:', error);
            alert('Erro ao guardar as alterações.');
        } finally {
            setIsSaving(false);
        }
    };
    // <-- ADICIONADA A FUNÇÃO DAS CORES DAS PERÍCIAS
    const getSkillTrainingClass = (degree) => {
        const d = Number(degree);
        if (d >= 15) return styles.skillExpert;
        if (d >= 10) return styles.skillVeteran;
        if (d >= 5) return styles.skillTrained;
        return styles.skillUntrained;
    };

const addAttack = () => {
        const newAttack = {
            weapon: null,
            customName: 'Novo Ataque',
            attackBonus: '+0',
            damageOverride: '1d6',
            criticalOverride: '20/x2'
        };

        setCharacter(prev => ({
            ...prev,
            attacks: [...(prev.attacks || []), newAttack]
        }));
    };

    const removeAttack = (index) => {
        const updated = character.attacks.filter((_, i) => i !== index);
        handleChange('attacks', updated);
    };

    const addAbility = () => {
        const newAbility = {
            ability: null, // Fica nulo porque é um poder manual/customizado
            customName: 'Novo Poder',
            customNotes: 'Descreve aqui os efeitos mecânicos e narrativos deste poder.'
        };

        setCharacter(prev => ({
            ...prev,
            abilities: [...(prev.abilities || []), newAbility]
        }));
    };

    const removeAbility = (index) => {
        const updated = character.abilities.filter((_, i) => i !== index);
        handleChange('abilities', updated);
    };

    // ==========================================
    // LÓGICA DE RITUAIS
    // ==========================================
    const addRitual = () => {
        const newRitual = {
            ritual: null,
            customName: 'Novo Ritual',
            customElement: 'Conhecimento',
            customCircle: '1',
            customCost: '1 PE',
            customExecution: 'Padrão',
            customRange: 'Curto',
            customDuration: 'Instantânea',
            customResistance: 'Vontade reduz à metade',
            customNotes: 'Descreve aqui os efeitos do ritual.'
        };

        setCharacter(prev => ({
            ...prev,
            rituals: [...(prev.rituals || []), newRitual]
        }));
    };

    const removeRitual = (index) => {
        const updated = character.rituals.filter((_, i) => i !== index);
        handleChange('rituals', updated);
    };

    const handleSelectRitualFromDB = (ritualDB) => {
        const alreadyHas = character.rituals.some(r =>
            (r.ritual && (r.ritual._id === ritualDB._id || r.ritual === ritualDB._id)) ||
            (r.customName === ritualDB.name)
        );

        if (alreadyHas) {
            alert('O agente já possui este ritual no seu grimório!');
            return;
        }

        setCharacter(prev => ({
            ...prev,
            rituals: [
                ...prev.rituals || [],
                { ritual: ritualDB, customName: '', customNotes: '' }
            ]
        }));

        setIsRitualModalOpen(false);
        setRitualSearchTerm('');
    };

    // Calcula a DT de Rituais (10 + Limite de PE + Presença)
    const limitPE = Math.max(1, Math.floor((character?.nex || 5) / 5));
    const ritualDT = 10 + limitPE + (character?.attributes?.pre || 0);

    // ==========================================
    // LÓGICA DE INVENTÁRIO
    // ==========================================
    // Capacidade de carga = Força * 5 (mínimo 2)
    const maxSpaces = Math.max(2, (character?.attributes?.for || 1) * 5);
    const totalSpaces = character?.inventory?.items?.reduce((acc, item) => acc + (Number(item.spaces) || 0), 0) || 0;

    const addItem = () => {
        const newItem = {
            name: 'Novo Equipamento',
            category: 'I',
            spaces: 1,
            description: ''
        };
        setCharacter(prev => ({
            ...prev,
            inventory: {
                ...prev.inventory,
                items: [...(prev.inventory?.items || []), newItem]
            }
        }));
    };

    const removeItem = (index) => {
        const updatedItems = character.inventory.items.filter((_, i) => i !== index);
        handleChange('items', updatedItems, 'inventory');
    };

    const handleSelectItemFromDB = (itemDB) => {
        const newItem = {
            item: itemDB._id, // Referência à BD
            name: itemDB.name,
            category: itemDB.category || 'I',
            spaces: itemDB.spaces || 1,
            description: itemDB.description || ''
        };

        setCharacter(prev => ({
            ...prev,
            inventory: {
                ...prev.inventory,
                items: [...(prev.inventory?.items || []), newItem]
            }
        }));

        setIsItemModalOpen(false);
        setItemSearchTerm('');
    };

const handleSelectWeaponFromDB = (weaponDB) => {
        const bonusTest = character.attributes.agi + (character.skills.find(s => s.name === 'Pontaria')?.trainingDegree || 0);

        const newAttack = {
            weapon: weaponDB._id, // Guarda a referência para a BD
            customName: weaponDB.name,
            attackBonus: `+${bonusTest}`,
            damageOverride: weaponDB.damage || '1d6',
            criticalOverride: weaponDB.critical || '20'
        };

        setCharacter(prev => ({
            ...prev,
            attacks: [...(prev.attacks || []), newAttack]
        }));

        setIsWeaponModalOpen(false);
        setWeaponSearchTerm('');
    };

    // Muda a patente e atualiza automaticamente os limites do inventário (Tabela 3.1 Oficial)
    const handlePatenteChange = (novaPatente) => {
        let newCredit = 'Baixo';
        let newLimits = { I: 2, II: 0, III: 0, IV: 0 }; // Base Recruta

        switch(novaPatente) {
            case 'Recruta':
                newCredit = 'Baixo'; newLimits = { I: 2, II: 0, III: 0, IV: 0 }; break;
            case 'Operador':
                newCredit = 'Médio'; newLimits = { I: 3, II: 1, III: 0, IV: 0 }; break;
            case 'Agente Especial':
                newCredit = 'Médio'; newLimits = { I: 3, II: 2, III: 1, IV: 0 }; break;
            case 'Oficial de Operações':
                newCredit = 'Alto'; newLimits = { I: 3, II: 3, III: 2, IV: 1 }; break;
            case 'Agente de Elite':
                newCredit = 'Ilimitado'; newLimits = { I: 3, II: 3, III: 3, IV: 2 }; break;
            case 'Herói da Ordem': // Caso uses em campanhas épicas (homebrew comum)
                newCredit = 'Ilimitado'; newLimits = { I: 4, II: 4, III: 3, IV: 2 }; break;
        }

        setCharacter(prev => ({
            ...prev,
            patente: novaPatente,
            inventory: {
                ...prev.inventory,
                creditLimit: newCredit,
                categoryLimits: newLimits
            }
        }));
    };

    const PATENTE_OPTIONS = [
    { label: 'Recruta', value: 'Recruta' },
    { label: 'Operador', value: 'Operador' },
    { label: 'Agente Especial', value: 'Agente Especial' },
    { label: 'Oficial de Operações', value: 'Oficial de Operações' },
    { label: 'Agente de Elite', value: 'Agente de Elite' },
    { label: 'Herói da Ordem', value: 'Herói da Ordem' }
];

const CREDIT_OPTIONS = [
    { label: 'Baixo', value: 'Baixo' },
    { label: 'Médio', value: 'Médio' },
    { label: 'Alto', value: 'Alto' },
    { label: 'Ilimitado', value: 'Ilimitado' }
];

    if (loading || !character) return <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>A sincronizar com os Arquivos da Ordem...</div>;

    return (
        <div className={styles.wrapper}>
            {/* BARRA SUPERIOR */}
            <header className={styles.headerBar}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={() => router.push('/characters')} className={styles.saveButton}>&larr; Voltar</button>
                    <h2 style={{ margin: 0, fontFamily: 'var(--font-titles)', color: 'var(--text-accent)' }}>C.R.I.S. TERMINAL</h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={handleSave} disabled={isSaving} className={styles.saveButton}>
                        {isSaving ? 'A GRAVAR...' : 'GUARDAR PROGRESSO'}
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            {/* GRELHA PRINCIPAL DE 3 COLUNAS */}
            <div className={styles.crisGrid}>

                {/* COLUNA 1: IDENTIFICAÇÃO, ATRIBUTOS E VIDAS */}
                <div className={styles.colLeft}>
                    <div className={styles.identityBox}>
                        <div className={styles.identityRow}>
                            <span className={styles.identityLabel}>Personagem</span>
                            <input type="text" className={styles.identityInput} value={character.name} onChange={(e) => handleChange('name', e.target.value)} />
                        </div>
                        <div className={styles.identityRow}>
                            <span className={styles.identityLabel}>Jogador</span>
                            <input type="text" className={styles.identityInput} value={character.playerName || ''} onChange={(e) => handleChange('playerName', e.target.value)} />
                        </div>
                        <div className={styles.identityRow}>
                            <span className={styles.identityLabel}>Origem</span>
                            <div style={{ flex: 1 }}>
                                <AeroSelect
                                    name="origin"
                                    options={originsList.map(o => ({ label: o.name, value: o._id }))}
                                    value={character.origin?._id || character.origin}
                                    onChange={(e) => handleOriginChange(e.target.value)}
                                    placeholder="Origem"
                                />
                            </div>
                        </div>
                        <div className={styles.identityRow}>
                            <span className={styles.identityLabel}>Classe</span>
                            <input type="text" className={styles.identityInput} value={character.class?.name || ''} readOnly style={{ color: 'var(--text-accent)' }} title="A classe não pode ser editada na folha ativa." />
                        </div>
                    </div>

                    <div className={styles.attributesStarContainer}>
                        <div className={styles.attrCenterLogo}>ATRIBUTOS</div>
                        {['agi', 'for', 'int', 'pre', 'vig'].map((attr) => (
                            <div key={attr} className={`${styles.attrCircle} ${styles[`attr${attr.charAt(0).toUpperCase() + attr.slice(1)}`]}`}>
                                <input
                                    type="number"
                                    value={character.attributes[attr]}
                                    onChange={(e) => handleChange(attr, Number(e.target.value), 'attributes')}
                                />
                                <label>{attr}</label>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', margin: '0.5rem 0' }}>
                        <div style={{ flex: 1, border: '1px solid var(--border-color)', padding: '0.5rem', textAlign: 'center', borderRadius: '4px' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>NEX</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{character.nex}%</div>
                        </div>
                        <div style={{ flex: 1, border: '1px solid var(--border-color)', padding: '0.5rem', textAlign: 'center', borderRadius: '4px' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>DESLOCAMENTO</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{character.combat.movement}</div>
                        </div>
                    </div>

                    <div className={styles.statusBars}>
                        <div className={styles.statusBarWrapper}>
                            <span className={styles.statusLabel} style={{ color: '#ff4d4d' }}>VIDA</span>
                            <div className={`${styles.statusTrack} ${styles.statusHp}`}>
                                <input type="number" className={styles.statusInput} value={character.stats.hp.current} onChange={(e) => handleChange('hp', Number(e.target.value), 'stats', 'current')} />
                                <span>/</span>
                                <input type="number" className={styles.statusInput} value={character.stats.hp.overrideMax || 0} onChange={(e) => handleChange('hp', Number(e.target.value), 'stats', 'overrideMax')} title="Máximo Manual" />
                            </div>
                        </div>

                        <div className={styles.statusBarWrapper}>
                            <span className={styles.statusLabel} style={{ color: '#a64dff' }}>SANIDADE</span>
                            <div className={`${styles.statusTrack} ${styles.statusSan}`}>
                                <input type="number" className={styles.statusInput} value={character.stats.san.current} onChange={(e) => handleChange('san', Number(e.target.value), 'stats', 'current')} />
                                <span>/</span>
                                <input type="number" className={styles.statusInput} value={character.stats.san.overrideMax || 0} onChange={(e) => handleChange('san', Number(e.target.value), 'stats', 'overrideMax')} />
                            </div>
                        </div>

                        <div className={styles.statusBarWrapper}>
                            <span className={styles.statusLabel} style={{ color: '#ffb366' }}>ESFORÇO (PE)</span>
                            <div className={`${styles.statusTrack} ${styles.statusEp}`}>
                                <input type="number" className={styles.statusInput} value={character.stats.ep.current} onChange={(e) => handleChange('ep', Number(e.target.value), 'stats', 'current')} />
                                <span>/</span>
                                <input type="number" className={styles.statusInput} value={character.stats.ep.overrideMax || 0} onChange={(e) => handleChange('ep', Number(e.target.value), 'stats', 'overrideMax')} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUNA 2: PERÍCIAS */}
                <div className={styles.colMiddle}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* CABEÇALHO ATUALIZADO */}
                        <div className={styles.skillsHeader}>
                            <span style={{ flex: 2 }}>Perícia</span>
                            <span style={{ flex: 1, textAlign: 'center' }}>Teste Final</span>
                            <span style={{ flex: 1, textAlign: 'center' }}>Treino</span>
                            <span style={{ flex: 1, textAlign: 'center' }}>Outros</span>
                        </div>

                        {character.skills.map((skill, index) => {
                            // LÓGICA DE CÁLCULO
                            const attrKey = skill.baseAttribute || getSkillAttr(skill.name);
                            const attrValue = character.attributes[attrKey] || 0;
                            const training = Number(skill.trainingDegree) || 0;
                            const bonus = Number(skill.otherBonus) || 0;
                            const totalBonus = training + bonus;

                            return (
                                <div key={index} className={styles.skillLine}>
                                    {/* NOME DA PERÍCIA COM COR DINÂMICA */}
                                    <span className={`${styles.skillName} ${getSkillTrainingClass(skill.trainingDegree)}`} style={{ flex: 2 }}>
                                        {skill.name}
                                        <small className={styles.skillAttrText}> ({attrKey.toUpperCase()})</small>
                                    </span>

                                    {/* COLUNA DO TESTE FINAL (EX: 3d20 + 5) */}
                                    <div className={styles.finalTestColumn}>
                                        <span className={styles.diceText}>{attrValue}d20</span>
                                        <span className={styles.bonusText}>{totalBonus >= 0 ? `+${totalBonus}` : totalBonus}</span>
                                    </div>

                                    {/* SELECT DE TREINO */}
                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                        <AeroSelect
                                            name={`skill-training-${index}`}
                                            options={TRAINING_OPTIONS}
                                            value={skill.trainingDegree}
                                            onChange={(e) => {
                                                const newSkills = [...character.skills];
                                                newSkills[index].trainingDegree = Number(e.target.value);
                                                handleChange('skills', newSkills);
                                            }}
                                            style={{ minWidth: '100px', fontSize: '0.7rem', height: '28px' }}
                                        />
                                    </div>

                                    {/* CAMPO OUTROS */}
                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                        <input
                                            type="number"
                                            className={styles.skillInputSmall}
                                            value={skill.otherBonus}
                                            onChange={(e) => {
                                                const newSkills = [...character.skills];
                                                newSkills[index].otherBonus = Number(e.target.value);
                                                handleChange('skills', newSkills);
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* COLUNA 3: PAINEL DIREITO (EM CONSTRUÇÃO) */}
                <div className={styles.colRight}>
                    <div className={styles.rightTabs}>
                        {['combate', 'habilidades', 'rituais', 'inventário', 'lore'].map(tab => (
                            <button
                                key={tab}
                                className={`${styles.rightTabBtn} ${activeTab === tab ? styles.rightTabBtnActive : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className={styles.rightContent}>
                        {activeTab === 'combate' && (
                            <div className={styles.tabPane}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>Ações de Agressão</h3>
                                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                                        <button
                                            className={styles.openModalBtn}
                                            style={{ width: 'auto', margin: 0, background: 'rgba(128, 128, 128, 0.1)', color: 'var(--text-primary)', border: '1px solid var(--text-accent)' }}
                                            onClick={() => setIsWeaponModalOpen(true)}
                                        >
                                            🔍 ARSENAL
                                        </button>
                                        <button className={styles.openModalBtn} style={{ width: 'auto', margin: 0 }} onClick={() => addAttack()}>
                                            + ATAQUE MANUAL
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.attacksGrid}>
                                    {character.attacks && character.attacks.length > 0 ? (
                                        character.attacks.map((attack, index) => {
                                            
                                            // Detetive de Armas (cruza com a BD se houver um ID)
                                            const dbWeapon = typeof attack.weapon === 'string' || typeof attack.weapon === 'object' 
                                                ? weaponsList.find(w => w._id === (attack.weapon?.$oid || attack.weapon)) 
                                                : attack.weapon;

                                            // Variáveis seguras baseadas no TEU backend
                                            const atkName = attack.customName || dbWeapon?.name || '';
                                            const atkTest = attack.attackBonus || '+0';
                                            const atkDmg = attack.damageOverride || dbWeapon?.damage || '';
                                            const atkCrit = attack.criticalOverride || dbWeapon?.critical || '';
                                            
                                            // Alcance e notas não estão no teu Schema de ataques, logo vêm sempre da BD
                                            const atkRange = dbWeapon?.range || 'Curto';
                                            const atkNotes = dbWeapon?.description || '';

                                            return (
                                                <div key={index} className={styles.attackCard}>
                                                    <div className={styles.attackCardHeader}>
                                                        <input
                                                            className={styles.attackNameInput}
                                                            value={atkName}
                                                            onChange={(e) => {
                                                                const updated = [...character.attacks];
                                                                updated[index].customName = e.target.value;
                                                                handleChange('attacks', updated);
                                                            }}
                                                            placeholder="Nome da Arma / Ataque"
                                                        />
                                                        <button className={styles.removeBtn} onClick={() => removeAttack(index)} title="Remover Ataque">✕</button>
                                                    </div>

                                                    <div className={styles.attackStatsRow}>
                                                        <div className={styles.attackStat}>
                                                            <label>Teste</label>
                                                            <input value={atkTest} onChange={(e) => {
                                                                const updated = [...character.attacks];
                                                                updated[index].attackBonus = e.target.value;
                                                                handleChange('attacks', updated);
                                                            }} />
                                                        </div>
                                                        <div className={styles.attackStat}>
                                                            <label>Dano</label>
                                                            <input value={atkDmg} onChange={(e) => {
                                                                const updated = [...character.attacks];
                                                                updated[index].damageOverride = e.target.value;
                                                                handleChange('attacks', updated);
                                                            }} />
                                                        </div>
                                                        <div className={styles.attackStat}>
                                                            <label>Crítico</label>
                                                            <input value={atkCrit} onChange={(e) => {
                                                                const updated = [...character.attacks];
                                                                updated[index].criticalOverride = e.target.value;
                                                                handleChange('attacks', updated);
                                                            }} />
                                                        </div>
                                                        <div className={styles.attackStat}>
                                                            <label>Alcance</label>
                                                            <input 
                                                                value={atkRange} 
                                                                readOnly 
                                                                style={{ opacity: 0.7 }} 
                                                                title="Armado automaticamente pela base de dados" 
                                                            />
                                                        </div>
                                                    </div>

                                                    <textarea
                                                        className={styles.attackNotes}
                                                        rows={2}
                                                        value={atkNotes}
                                                        readOnly
                                                        style={{ opacity: 0.7 }}
                                                        placeholder={dbWeapon ? "Notas da arma..." : "Cria a arma na base de dados para ver as notas aqui."}
                                                    />
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                                            Nenhum ataque registado. Adicione um ataque manual ou equipe uma arma.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'habilidades' && (
                            <div className={styles.tabPane}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>Poderes e Habilidades</h3>
                                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                                            <button
                                                className={styles.openModalBtn}
                                                style={{ width: 'auto', margin: 0, background: 'rgba(128, 128, 128, 0.1)', color: 'var(--text-primary)', border: '1px solid var(--text-accent)' }}
                                                onClick={() => setIsAbilityModalOpen(true)}
                                            >
                                                🔍 BUSCAR BASE DE DADOS
                                            </button>
                                            <button className={styles.openModalBtn} style={{ width: 'auto', margin: 0 }} onClick={() => addAbility()}>
                                                + CRIAR MANUAL
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.abilitiesGrid}>
                                    {character.abilities && character.abilities.length > 0 ? (
                                        character.abilities.map((ab, index) => {
                                            // A lógica tenta mostrar o nome customizado, ou o nome do poder original da BD
                                            const name = ab.customName || (ab.ability && ab.ability.name) || 'Poder Desconhecido';
                                            const desc = ab.customNotes || (ab.ability && ab.ability.description) || '';

                                            return (
                                                <div key={index} className={styles.abilityCard}>
                                                    <div className={styles.attackCardHeader}>
                                                        <input
                                                            className={styles.attackNameInput}
                                                            value={name}
                                                            onChange={(e) => {
                                                                const updated = [...character.abilities];
                                                                updated[index].customName = e.target.value;
                                                                handleChange('abilities', updated);
                                                            }}
                                                            placeholder="Nome do Poder"
                                                        />
                                                        <button className={styles.removeBtn} onClick={() => removeAbility(index)} title="Remover Habilidade">✕</button>
                                                    </div>

                                                    <textarea
                                                        className={styles.attackNotes}
                                                        rows={4}
                                                        value={desc}
                                                        onChange={(e) => {
                                                            const updated = [...character.abilities];
                                                            updated[index].customNotes = e.target.value;
                                                            handleChange('abilities', updated);
                                                        }}
                                                        placeholder="Descreve o poder ou adiciona anotações..."
                                                    />
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                                            Nenhuma habilidade registada. Adiciona um poder manualmente ou seleciona da base de dados.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'rituais' && (
                            <div className={styles.tabPane}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <h3 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>Grimório Ocultista</h3>
                                        <div className={styles.dtBadge}>
                                            DT RITUAL: {ritualDT}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                                        <button
                                            className={styles.openModalBtn}
                                            style={{ width: 'auto', margin: 0, background: 'rgba(128, 128, 128, 0.1)', color: 'var(--text-primary)', border: '1px solid var(--text-accent)' }}
                                            onClick={() => setIsRitualModalOpen(true)}
                                        >
                                            🔍 BUSCAR RITUAL
                                        </button>
                                        <button className={styles.openModalBtn} style={{ width: 'auto', margin: 0 }} onClick={() => addRitual()}>
                                            + CRIAR MANUAL
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.abilitiesGrid}>
                                    {character.rituals && character.rituals.length > 0 ? (
                                        character.rituals.map((r, index) => {
                                            const name = r.customName || (r.ritual && r.ritual.name) || 'Ritual Desconhecido';
                                            const element = r.customElement || (r.ritual && r.ritual.elements?.join(', ')) || 'Nenhum';
                                            const circle = r.customCircle || (r.ritual && r.ritual.circle) || '1';
                                            const execution = r.customExecution || (r.ritual && r.ritual.execution) || 'Padrão';
                                            const range = r.customRange || (r.ritual && r.ritual.range) || 'Curto';
                                            const duration = r.customDuration || (r.ritual && r.ritual.duration) || 'Instantânea';
                                            const resistance = r.customResistance || (r.ritual && r.ritual.resistance) || '-';
                                            const desc = r.customNotes || (r.ritual && r.ritual.description) || '';

                                            return (
                                                <div key={index} className={styles.abilityCard}>
                                                    <div className={styles.attackCardHeader}>
                                                        <input
                                                            className={styles.attackNameInput}
                                                            value={name}
                                                            onChange={(e) => {
                                                                const updated = [...character.rituals];
                                                                updated[index].customName = e.target.value;
                                                                handleChange('rituals', updated);
                                                            }}
                                                            placeholder="Nome do Ritual"
                                                        />
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                            {element.toUpperCase()} | {circle}º CÍRCULO
                                                        </span>
                                                        <button className={styles.removeBtn} onClick={() => removeRitual(index)} title="Apagar Ritual">✕</button>
                                                    </div>

                                                    <div className={styles.attackStatsRow} style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', marginBottom: '0.5rem' }}>
                                                        <div className={styles.attackStat}>
                                                            <label>Execução</label>
                                                            <input value={execution} onChange={(e) => { const upd = [...character.rituals]; upd[index].customExecution = e.target.value; handleChange('rituals', upd); }} />
                                                        </div>
                                                        <div className={styles.attackStat}>
                                                            <label>Alcance</label>
                                                            <input value={range} onChange={(e) => { const upd = [...character.rituals]; upd[index].customRange = e.target.value; handleChange('rituals', upd); }} />
                                                        </div>
                                                        <div className={styles.attackStat}>
                                                            <label>Duração</label>
                                                            <input value={duration} onChange={(e) => { const upd = [...character.rituals]; upd[index].customDuration = e.target.value; handleChange('rituals', upd); }} />
                                                        </div>
                                                        <div className={styles.attackStat}>
                                                            <label>Resistência</label>
                                                            <input value={resistance} onChange={(e) => { const upd = [...character.rituals]; upd[index].customResistance = e.target.value; handleChange('rituals', upd); }} />
                                                        </div>
                                                    </div>

                                                    <textarea
                                                        className={styles.attackNotes}
                                                        rows={3}
                                                        value={desc}
                                                        onChange={(e) => {
                                                            const updated = [...character.rituals];
                                                            updated[index].customNotes = e.target.value;
                                                            handleChange('rituals', updated);
                                                        }}
                                                        placeholder="Efeitos do ritual..."
                                                    />
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                                            O grimório está vazio. Aprende rituais pesquisando na base de dados.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'inventário' && (
                            <div className={styles.tabPane}>

                                {/* DASHBOARD: ESPAÇOS E CRÉDITOS */}
                                <div className={styles.inventoryDashboard}>
                                        <div className={styles.invStatsRow}>
                                        {/* PESO / ESPAÇOS */}
                                        <div className={styles.invBoxContainer} style={{ flex: 1 }}>
                                            <span className={styles.invLabel}>Espaços (FOR×5)</span>
                                            <div className={styles.invBox}>
                                                <div
                                                    className={styles.invInputBig}
                                                    style={{ background: 'transparent', border: 'none', color: totalSpaces > maxSpaces ? '#ff4d4d' : 'var(--text-primary)' }}
                                                    title="Espaços Ocupados"
                                                >
                                                    {totalSpaces}
                                                </div>
                                                <span style={{ margin: '0 0.2rem', color: 'var(--text-secondary)' }}>/</span>
                                                <div className={styles.invInputBig} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }} title="Limite Base">
                                                    {maxSpaces}
                                                </div>
                                            </div>
                                        </div>

                                        {/* PATENTE */}
                                        <div className={styles.invBoxContainer} style={{ flex: 1 }}>
                                            <span className={styles.invLabel}>Patente</span>
                                            <div style={{ height: '42px' }}>
                                                <AeroSelect
                                                    name="patente"
                                                    options={PATENTE_OPTIONS}
                                                    value={character.patente || 'Recruta'}
                                                    onChange={(e) => handlePatenteChange(e.target.value)}
                                                    placeholder="Patente"
                                                />
                                            </div>
                                        </div>

                                        {/* LIMITE DE CRÉDITO */}
                                        <div className={styles.invBoxContainer} style={{ flex: 1 }}>
                                            <span className={styles.invLabel}>Crédito</span>
                                            <div style={{ height: '42px' }}>
                                                <AeroSelect
                                                    name="creditLimit"
                                                    options={CREDIT_OPTIONS}
                                                    value={character.inventory?.creditLimit || 'Baixo'}
                                                    onChange={(e) => handleChange('creditLimit', e.target.value, 'inventory')}
                                                    placeholder="Crédito"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* LIMITES DE CATEGORIA POR MISSÃO */}
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <span className={styles.invLabel} style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>LIMITES DE CATEGORIA POR MISSÃO</span>
                                        <div className={styles.invCategoryRow}>
                                            <div className={styles.invStaticBox} title="Categoria I">I</div>
                                            <input type="number" value={character.inventory?.categoryLimits?.I || 0} onChange={(e) => handleChange('categoryLimits', Number(e.target.value), 'inventory', 'I')} />
                                            <div className={styles.invStaticBox} title="Categoria II">II</div>
                                            <input type="number" value={character.inventory?.categoryLimits?.II || 0} onChange={(e) => handleChange('categoryLimits', Number(e.target.value), 'inventory', 'II')} />
                                            <div className={styles.invStaticBox} title="Categoria III">III</div>
                                            <input type="number" value={character.inventory?.categoryLimits?.III || 0} onChange={(e) => handleChange('categoryLimits', Number(e.target.value), 'inventory', 'III')} />
                                            <div className={styles.invStaticBox} title="Categoria IV">IV</div>
                                            <input type="number" value={character.inventory?.categoryLimits?.IV || 0} onChange={(e) => handleChange('categoryLimits', Number(e.target.value), 'inventory', 'IV')} />
                                        </div>
                                    </div>
                                </div>

                                {/* LISTA DE ITENS */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>Equipamentos</h3>
                                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                                        <button
                                            className={styles.openModalBtn}
                                            style={{ width: 'auto', margin: 0, background: 'rgba(128, 128, 128, 0.1)', color: 'var(--text-primary)', border: '1px solid var(--text-accent)' }}
                                            onClick={() => setIsItemModalOpen(true)}
                                        >
                                            🔍 BUSCAR EQUIPAMENTO
                                        </button>
                                        <button className={styles.openModalBtn} style={{ width: 'auto', margin: 0 }} onClick={addItem}>
                                            + CRIAR MANUAL
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.itemsGrid}>
                                    {character.inventory?.items?.length > 0 ? (
                                        character.inventory.items.map((item, index) => {

                                            // A NOSSA REDE DE SEGURANÇA MÁGICA
                                            // Vai procurar a edição manual primeiro. Se não existir, vai procurar aos dados vindos da BD.
                                            const itemName = item.name || (item.item && item.item.name) || '';
                                            const itemCategory = item.category || (item.item && item.item.category) || '0';
                                            // A BD usa "space" (sem S), o nosso frontend usa "spaces" (com S)
                                            const itemSpaces = item.spaces !== undefined ? item.spaces : (item.item && item.item.space) || 1;
                                            const itemDesc = item.description || (item.item && item.item.description) || '';

                                            return (
                                                <div key={index} className={styles.itemCard}>
                                                    <div className={styles.itemCardHeader}>
                                                        <input
                                                            className={styles.attackNameInput}
                                                            value={itemName} // Usar a variável segura
                                                            onChange={(e) => {
                                                                const updated = [...character.inventory.items];
                                                                updated[index].name = e.target.value;
                                                                handleChange('items', updated, 'inventory');
                                                            }}
                                                            placeholder="Nome do Item"
                                                        />
                                                        <button className={styles.removeBtn} onClick={() => removeItem(index)}>✕</button>
                                                    </div>

                                                    <div className={styles.itemCardEditRow}>
                                                        <label style={{ flex: 1 }}>Categoria
                                                            <select value={itemCategory} onChange={(e) => {
                                                                const updated = [...character.inventory.items];
                                                                updated[index].category = e.target.value;
                                                                handleChange('items', updated, 'inventory');
                                                            }}>
                                                                <option value="0">0</option>
                                                                <option value="I">I</option>
                                                                <option value="II">II</option>
                                                                <option value="III">III</option>
                                                                <option value="IV">IV</option>
                                                            </select>
                                                        </label>
                                                        <label style={{ flex: 1 }}>Espaços
                                                            <input type="number" value={itemSpaces} onChange={(e) => {
                                                                const updated = [...character.inventory.items];
                                                                updated[index].spaces = Number(e.target.value);
                                                                handleChange('items', updated, 'inventory');
                                                            }} />
                                                        </label>
                                                    </div>

                                                    <textarea
                                                        className={styles.itemCardDesc}
                                                        rows={2}
                                                        value={itemDesc} // Usar a variável segura
                                                        onChange={(e) => {
                                                            const updated = [...character.inventory.items];
                                                            updated[index].description = e.target.value;
                                                            handleChange('items', updated, 'inventory');
                                                        }}
                                                        placeholder="Detalhes do item, munições, peso extra..."
                                                    />
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>A mochila está vazia. Adicione equipamentos.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'lore' && (
                            <div className={styles.tabPane}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>Arquivos Confidenciais</h3>
                                </div>

                                <div className={styles.loreGrid}>
                                    {/* Aparência */}
                                    <div className={styles.loreSection}>
                                        <label className={styles.loreLabel}>Aparência & Traços Físicos</label>
                                        <textarea
                                            className={styles.loreTextarea}
                                            rows={3}
                                            value={character.lore?.appearance || ''}
                                            onChange={(e) => setCharacter(prev => ({
                                                ...prev,
                                                lore: { ...(prev.lore || {}), appearance: e.target.value }
                                            }))}
                                            placeholder="Descreve o estilo de roupa, cicatrizes, idade, ou detalhes visuais marcantes..."
                                        />
                                    </div>

                                    {/* História / Background */}
                                    <div className={styles.loreSection}>
                                        <label className={styles.loreLabel}>Histórico (Background)</label>
                                        <textarea
                                            className={styles.loreTextarea}
                                            rows={5}
                                            // MUDOU AQUI (history)
                                            value={character.lore?.history || ''}
                                            onChange={(e) => setCharacter(prev => ({
                                                ...prev,
                                                lore: { ...(prev.lore || {}), history: e.target.value }
                                            }))}
                                            placeholder="A história do agente. O que fazia antes da Ordem?"
                                        />
                                    </div>

                                    {/* Diário de Missão / Notas */}
                                    <div className={styles.loreSection}>
                                        <label className={styles.loreLabel}>Diário de Missão & Anotações</label>
                                        <textarea
                                            className={styles.loreTextarea}
                                            rows={8}
                                            value={character.lore?.notes || ''}
                                            onChange={(e) => setCharacter(prev => ({
                                                ...prev,
                                                lore: { ...(prev.lore || {}), notes: e.target.value }
                                            }))}
                                            placeholder="Espaço livre para anotações durante a sessão..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* =========================================
                MODAL DE PESQUISA DE PODERES
                ========================================= */}
                        {isAbilityModalOpen && (
                            <div className={styles.modalOverlay} onClick={() => setIsAbilityModalOpen(false)}>
                                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                                    <div className={styles.modalHeader}>
                                        <h2>Arquivo de Poderes</h2>
                                        <button className={styles.modalCloseBtn} onClick={() => setIsAbilityModalOpen(false)}>✕</button>
                                    </div>

                                    <div className={styles.modalSearchArea}>
                                        <input
                                            type="text"
                                            placeholder="Pesquisar por nome ou requisitos..."
                                            className={styles.modalSearchInput}
                                            value={abilitySearchTerm}
                                            onChange={e => setAbilitySearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.modalList}>
                                        {abilitiesList
                                            .filter(a => a.name.toLowerCase().includes(abilitySearchTerm.toLowerCase()) || (a.requirements && a.requirements.toLowerCase().includes(abilitySearchTerm.toLowerCase())))
                                            .map(ability => {
                                                const isExpanded = expandedAbilityId === ability._id;

                                                return (
                                                    <div key={ability._id} className={styles.modalListItem} style={{ alignItems: isExpanded ? 'flex-start' : 'center' }}>
                                                        <div className={styles.modalItemInfo} style={{ width: '100%' }}>

                                                            {/* CABEÇALHO CLICÁVEL */}
                                                            <div
                                                                className={styles.modalItemHeader}
                                                                onClick={() => setExpandedAbilityId(isExpanded ? null : ability._id)}
                                                            >
                                                                <h4>{ability.name}</h4>
                                                                <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                                                            </div>

                                                            <div className={styles.modalStats}>
                                                                <span>{ability.category || 'Sem Categoria'}</span>
                                                                {ability.requirements && <span style={{ color: 'var(--text-secondary)' }}>Req: {ability.requirements}</span>}
                                                            </div>

                                                            {/* DESCRIÇÃO EXPANSÍVEL */}
                                                            {isExpanded && (
                                                                <div className={styles.modalItemDescription}>
                                                                    {ability.description}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* BOTÃO ADICIONAR (Alinhado à direita) */}
                                                        <button
                                                            className={styles.modalAddBtn}
                                                            onClick={() => handleSelectAbilityFromDB(ability)}
                                                            title="Transferir para a Ficha"
                                                            style={{ marginTop: isExpanded ? '0' : '0' }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        }
                                        {abilitiesList.length === 0 && (
                                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>A carregar base de dados...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* =========================================
                MODAL DE PESQUISA DE RITUAIS
                ========================================= */}
                        {isRitualModalOpen && (
                            <div className={styles.modalOverlay} onClick={() => setIsRitualModalOpen(false)}>
                                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                                    <div className={styles.modalHeader}>
                                        <h2>Arquivo Ocultista</h2>
                                        <button className={styles.modalCloseBtn} onClick={() => setIsRitualModalOpen(false)}>✕</button>
                                    </div>

                                    <div className={styles.modalSearchArea}>
                                        <input
                                            type="text"
                                            placeholder="Pesquisar por nome ou elemento..."
                                            className={styles.modalSearchInput}
                                            value={ritualSearchTerm}
                                            onChange={e => setRitualSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.modalList}>
                                        {ritualsList
                                            .filter(r => r.name.toLowerCase().includes(ritualSearchTerm.toLowerCase()) || (r.elements && r.elements.join(' ').toLowerCase().includes(ritualSearchTerm.toLowerCase())))
                                            .map(ritual => (
                                                <div key={ritual._id} className={styles.modalListItem}>
                                                    <div className={styles.modalItemInfo} style={{ width: '100%' }}>

                                                        <div className={styles.modalItemHeader}>
                                                            <h4>{ritual.name}</h4>
                                                        </div>

                                                        <div className={styles.modalStats}>
                                                            <span>{ritual.elements?.join(', ') || 'Sem Elemento'}</span>
                                                            <span style={{ color: 'var(--text-secondary)' }}>{ritual.circle}º Círculo</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className={styles.modalAddBtn}
                                                        onClick={() => handleSelectRitualFromDB(ritual)}
                                                        title="Transcrever para o Grimório"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ))
                                        }
                                        {ritualsList.length === 0 && (
                                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>A decifrar documentos ocultistas...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* =========================================
                MODAL DE PESQUISA DE ITENS
                ========================================= */}
                        {isItemModalOpen && (
                            <div className={styles.modalOverlay} onClick={() => setIsItemModalOpen(false)}>
                                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                                    <div className={styles.modalHeader}>
                                        <h2>Arquivo da Ordem (Itens)</h2>
                                        <button className={styles.modalCloseBtn} onClick={() => setIsItemModalOpen(false)}>✕</button>
                                    </div>

                                    <div className={styles.modalSearchArea}>
                                        <input
                                            type="text"
                                            placeholder="Pesquisar por nome, tipo..."
                                            className={styles.modalSearchInput}
                                            value={itemSearchTerm}
                                            onChange={e => setItemSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.modalList}>
                                        {itemsList
                                            .filter(i => i.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) || (i.type && i.type.toLowerCase().includes(itemSearchTerm.toLowerCase())))
                                            .map(item => {
                                                const isExpanded = expandedItemId === item._id;

                                                return (
                                                    <div key={item._id} className={styles.modalListItem} style={{ alignItems: isExpanded ? 'flex-start' : 'center' }}>
                                                        <div className={styles.modalItemInfo} style={{ width: '100%' }}>

                                                            <div
                                                                className={styles.modalItemHeader}
                                                                onClick={() => setExpandedItemId(isExpanded ? null : item._id)}
                                                            >
                                                                <h4>{item.name}</h4>
                                                                <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                                                            </div>

                                                            <div className={styles.modalStats}>
                                                                <span>CAT: {item.category || 'I'}</span>
                                                                <span style={{ color: 'var(--text-secondary)' }}>Espaços: {item.spaces || 1}</span>
                                                                {item.damage && <span style={{ color: '#e74c3c' }}>Dano: {item.damage}</span>}
                                                            </div>

                                                            {isExpanded && (
                                                                <div className={styles.modalItemDescription}>
                                                                    {item.description || 'Sem descrição disponível.'}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <button
                                                            className={styles.modalAddBtn}
                                                            onClick={() => handleSelectItemFromDB(item)}
                                                            title="Adicionar à Mochila"
                                                            style={{ marginTop: isExpanded ? '0' : '0' }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        }
                                        {itemsList.length === 0 && (
                                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>A verificar arsenal...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* =========================================
                MODAL DE PESQUISA DE ARMAS
                ========================================= */}
                        {isWeaponModalOpen && (
                            <div className={styles.modalOverlay} onClick={() => setIsWeaponModalOpen(false)}>
                                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                                    <div className={styles.modalHeader}>
                                        <h2>Arsenal da Ordem</h2>
                                        <button className={styles.modalCloseBtn} onClick={() => setIsWeaponModalOpen(false)}>✕</button>
                                    </div>

                                    <div className={styles.modalSearchArea}>
                                        <input
                                            type="text"
                                            placeholder="Pesquisar calibre, nome..."
                                            className={styles.modalSearchInput}
                                            value={weaponSearchTerm}
                                            onChange={e => setWeaponSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.modalList}>
                                        {weaponsList
                                            .filter(w => w.name.toLowerCase().includes(weaponSearchTerm.toLowerCase()) || (w.type && w.type.toLowerCase().includes(weaponSearchTerm.toLowerCase())))
                                            .map(weapon => {
                                                const isExpanded = expandedWeaponId === weapon._id;

                                                return (
                                                    <div key={weapon._id} className={styles.modalListItem} style={{ alignItems: isExpanded ? 'flex-start' : 'center' }}>
                                                        <div className={styles.modalItemInfo} style={{ width: '100%' }}>

                                                            {/* CABEÇALHO CLICÁVEL */}
                                                            <div
                                                                className={styles.modalItemHeader}
                                                                onClick={() => setExpandedWeaponId(isExpanded ? null : weapon._id)}
                                                            >
                                                                <h4>{weapon.name}</h4>
                                                                <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                                                            </div>

                                                            {/* STATS PRINCIPAIS */}
                                                            <div className={styles.modalStats}>
                                                                <span>Dano: {weapon.damage} {weapon.damageType}</span>
                                                                <span style={{ color: 'var(--text-secondary)' }}>Crítico: {weapon.critical}</span>
                                                                <span style={{ color: 'var(--text-secondary)' }}>Cat: {weapon.category || '0'}</span>
                                                            </div>

                                                            {/* DESCRIÇÃO EXPANSÍVEL (Com os dados da tua BD!) */}
                                                            {isExpanded && (
                                                                <div className={styles.modalItemDescription}>
                                                                    {weapon.description && (
                                                                        <p style={{ margin: '0 0 0.5rem 0' }}>{weapon.description}</p>
                                                                    )}

                                                                    {weapon.notes && (
                                                                        <p style={{ margin: '0 0 0.8rem 0', fontStyle: 'italic', color: 'var(--text-accent)' }}>
                                                                            Nota: {weapon.notes}
                                                                        </p>
                                                                    )}

                                                                    {/* TAGS (Tático / Corpo a Corpo / Espaços) */}
                                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                                        <span style={{ background: 'rgba(128, 128, 128, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>{weapon.type}</span>
                                                                        <span style={{ background: 'rgba(128, 128, 128, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>{weapon.proficiency}</span>
                                                                        <span style={{ background: 'rgba(128, 128, 128, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>Espaços: {weapon.space || 1}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* BOTÃO EQUIPAR */}
                                                        <button
                                                            className={styles.modalAddBtn}
                                                            onClick={() => handleSelectWeaponFromDB(weapon)}
                                                            title="Equipar Arma"
                                                            style={{ marginTop: isExpanded ? '0' : '0' }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        }
                                        {weaponsList.length === 0 && (
                                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>A verificar armamento...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}