'use client';

import { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import styles from './page.module.css';

const getSkillAttr = (name) => {
    const map = { Acrobacia: 'agi', Adestramento: 'pre', Artes: 'pre', Atletismo: 'for', Atualidades: 'int', Ciências: 'int', Crime: 'agi', Diplomacia: 'pre', Enganação: 'pre', Fortitude: 'vig', Furtividade: 'agi', Iniciativa: 'agi', Intimidação: 'pre', Intuição: 'pre', Investigação: 'int', Luta: 'for', Medicina: 'int', Ocultismo: 'int', Percepção: 'pre', Pilotagem: 'agi', Pontaria: 'agi', Profissão: 'int', Reflexos: 'agi', Religião: 'pre', Sobrevivência: 'int', Tática: 'int', Tecnologia: 'int', Vontade: 'pre' };
    return map[name] || 'int'; // 'int' como fallback seguro para perícias customizadas
};

export default function CharacterSheetPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useContext(AuthContext);

    const [character, setCharacter] = useState(null);
    const [activeTab, setActiveTab] = useState('combate');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        const fetchCharacter = async () => {
            try {
                console.log(`A pedir dados do personagem com ID: ${params.id}...`);

                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/characters/${params.id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });

                console.log("Resposta recebida da API:", res.data); // Vai mostrar no F12 o que a base de dados enviou

                // Verifica se a API mandou dentro de { data: ... } ou enviou o objeto diretamente
                const charData = res.data.data || res.data;

                if (!charData || !charData._id) {
                    throw new Error("A API respondeu, mas os dados da ficha vieram vazios ou num formato estranho.");
                }

                // REDE DE SEGURANÇA: Garante que os objetos principais existem para o ecrã não estoirar
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
                alert('Erro ao carregar a ficha. Verifica a consola (F12).');
                router.push('/characters'); // Volta para trás se falhar
            }
        };

        if (user && params.id) fetchCharacter();
    }, [user, loading, params.id, router]);

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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/characters/${character._id}`, character, {
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

    if (loading || !character) return <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>A sincronizar com os Arquivos da Ordem...</div>;

    return (
        <div className={styles.wrapper}>
            {/* BARRA SUPERIOR */}
            <header className={styles.headerBar}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={() => router.push('/characters')} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>&larr; Voltar</button>
                    <h2 style={{ margin: 0, fontFamily: 'var(--font-titles)', color: 'var(--text-accent)' }}>C.R.I.S. TERMINAL</h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={handleSave} disabled={isSaving} style={{ background: 'var(--text-accent)', color: '#000', border: 'none', padding: '0.5rem 1.5rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
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
                            {/* Mostra o nome da classe preenchida pela BD */}
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
                    <div className={styles.skillsHeader}>
                        <span style={{ flex: 2 }}>Perícia</span>
                        <span style={{ flex: 1, textAlign: 'center' }}>Dados</span>
                        <span style={{ flex: 1, textAlign: 'center' }}>Treino</span>
                        <span style={{ flex: 1, textAlign: 'center' }}>Outros</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {character.skills.map((skill, index) => (
                            <div key={index} className={styles.skillLine}>
                                <span className={styles.skillName}>{skill.name}</span>
                                <span className={styles.skillAttr}>
                                    ({(skill.baseAttribute || getSkillAttr(skill.name)).toUpperCase()})
                                </span>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <input
                                        type="number"
                                        className={styles.skillInputSmall}
                                        value={skill.trainingDegree}
                                        onChange={(e) => {
                                            const newSkills = [...character.skills];
                                            newSkills[index].trainingDegree = Number(e.target.value);
                                            handleChange('skills', newSkills);
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
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
                        ))}
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
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
                            Selecionaste a aba: <strong style={{ color: 'var(--text-accent)', textTransform: 'uppercase' }}>{activeTab}</strong>
                            <br /><br />
                            Nesta área, vamos injetar os painéis de armas, invocar os modais de pesquisa e os cartões de itens, reciclando a mesma lógica inteligente da página de criação!
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}