'use client';

import { useState } from 'react';
import EditModal from './EditModal';
import styles from './DetailModal.module.css';

export default function DetailModal({ item, type, onClose, onUpdate }) {
  const [showEditModal, setShowEditModal] = useState(false);

  if (!item) return null;

  const typeConfig = {
    ability: { color: '#C64D00', label: 'Poder', icon: '⚡' },
    ritual: { color: '#9933FF', label: 'Ritual', icon: '✨' },
    rule: { color: '#0076C0', label: 'Regra', icon: '📖' },
    item: { color: '#3D9970', label: 'Item', icon: '🧭' },
    class: { color: '#B24C0B', label: 'Classe', icon: '⚔️' },
    track: { color: '#2E5C7D', label: 'Trilha', icon: '🛤️' },
    weapon: { color: '#704214', label: 'Arma', icon: '🗡️' },
    threat: { color: '#8b0000', label: 'Ameaça', icon: '💀' } // <- Nova linha
  };

  const config = typeConfig[type] || typeConfig.ability;

  const renderField = (label, value, isArray = false) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    return (
      <div className={styles.field}>
        <strong className={styles.fieldLabel}>{label}:</strong>
        <span className={styles.fieldValue}>
          {isArray ? value.join(', ') : value}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.typeTag} style={{ backgroundColor: config.color }}>
            <span>{config.icon}</span>
            {config.label}
          </div>
          <div className={styles.headerActions}>
            <button 
              className={styles.editButton}
              onClick={() => setShowEditModal(true)}
              title="Editar"
            >
              ✏️
            </button>
            <button className={styles.closeButton} onClick={onClose}>×</button>
          </div>
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>{item.name || item.title}</h2>

          {renderField('Descrição', item.description || item.content)}

          {type === 'ability' && (
            <>
              {renderField('Categoria', item.category)}
              {renderField('Origem', item.origin)}
              {renderField('Requisitos', item.requirements)}
              {renderField('Perícias treinadas', item.trainedSkills, true)}
            </>
          )}

          {type === 'ritual' && (
            <>
              {renderField('Círculo', item.circle)}
              {renderField('Elementos', item.elements, true)}
              {renderField('Duração', item.duration)}
            </>
          )}

          {type === 'rule' && (
            <>
              {renderField('Seção', item.section)}
              {renderField('Subseção', item.subsection)}
              {renderField('Referência de página', item.pageReference)}
            </>
          )}

          {type === 'item' && (
            <>
              {renderField('Categoria', item.category)}
              {renderField('Paranormal', item.paranormal ? 'Sim' : 'Não')}
            </>
          )}

          {type === 'class' && (
            <>
              {renderField('Descrição', item.description)}
            </>
          )}

          {type === 'track' && (
            <>
              {renderField('Classe', item.class?.name)}
              {renderField('Descrição', item.description)}
              {item.abilities && item.abilities.length > 0 && (
                <div className={styles.field}>
                  <strong className={styles.fieldLabel}>Poderes:</strong>
                  <ul className={styles.abilitiesList}>
                    {item.abilities.map((ability) => (
                      <li key={ability._id}>{ability.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {type === 'weapon' && (
            <>
              {renderField('Categoria', item.category)}
              {renderField('Proficiência', item.proficiency)}
              {renderField('Tipo', item.type)}
              {renderField('Empunhadura', item.grip)}
              {renderField('Dano', item.damage)}
              {renderField('Crítico', item.critical)}
              {item.range && item.range !== 'Nenhum' && renderField('Alcance', item.range)}
              {renderField('Tipo de Dano', item.damageType)}
              {renderField('Espaço', item.space?.toString())}
              {renderField('Notas', item.notes)}
            </>
          )}

          {type === 'threat' && (
            <>
              {/* Informações Básicas */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                {renderField('VD', item.vd)}
                {renderField('Tipo', item.type)}
                {renderField('Tamanho', item.size)}
                {renderField('Elementos', item.elements, true)}
                {renderField('Deslocamento', item.movement)}
              </div>

              {/* Combate e Sobrevivência */}
              <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.1rem', color: config.color, marginBottom: '0.5rem' }}>Estatísticas</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {renderField('Defesa', item.defense)}
                  {renderField('PV', `${item.hp?.total || 0} (${item.hp?.bloodied || 0} machucado)`)}
                </div>
                
                {item.senses && (item.senses.perception || item.senses.initiative) && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Sentidos: </strong>
                    {[
                      item.senses.perception ? `Percepção ${item.senses.perception}` : null,
                      item.senses.initiative ? `Iniciativa ${item.senses.initiative}` : null,
                      item.senses.notes ? `(${item.senses.notes})` : null
                    ].filter(Boolean).join(' | ')}
                  </div>
                )}
                
                {item.savingThrows && (item.savingThrows.fortitude || item.savingThrows.reflexes || item.savingThrows.will) && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Testes de Resistência: </strong>
                    {[
                      item.savingThrows.fortitude ? `Fortitude ${item.savingThrows.fortitude}` : null,
                      item.savingThrows.reflexes ? `Reflexos ${item.savingThrows.reflexes}` : null,
                      item.savingThrows.will ? `Vontade ${item.savingThrows.will}` : null
                    ].filter(Boolean).join(' | ')}
                  </div>
                )}

                {renderField('Resistências a Dano', item.resistances, true)}
                {renderField('Vulnerabilidades', item.vulnerabilities, true)}
              </div>

              {/* Atributos */}
              {item.attributes && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '1rem 0', padding: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                  <div><strong>AGI</strong> {item.attributes.agi}</div>
                  <div><strong>FOR</strong> {item.attributes.for}</div>
                  <div><strong>INT</strong> {item.attributes.int}</div>
                  <div><strong>PRE</strong> {item.attributes.pre}</div>
                  <div><strong>VIG</strong> {item.attributes.vig}</div>
                </div>
              )}

              {/* Perícias */}
              {item.skills && item.skills.length > 0 && (
                <div className={styles.field}>
                  <strong className={styles.fieldLabel}>Perícias:</strong>
                  <span>{item.skills.map(s => `${s.name} ${s.value}`).join(' | ')}</span>
                </div>
              )}

              {/* Enigma de Medo */}
              {item.enigmaOfFear?.hasEnigma && (
                <div style={{ margin: '1.5rem 0', padding: '1rem', border: '2px solid #8b008b', borderRadius: '8px', background: 'rgba(139, 0, 139, 0.05)' }}>
                  <h3 style={{ color: '#8b008b', marginTop: 0, marginBottom: '0.5rem' }}>Enigma de Medo</h3>
                  {item.enigmaOfFear.description && <p style={{ margin: '0 0 0.5rem 0' }}>{item.enigmaOfFear.description}</p>}
                  {item.enigmaOfFear.mechanics && <p style={{ margin: 0 }}><strong>Efeito:</strong> {item.enigmaOfFear.mechanics}</p>}
                </div>
              )}

              {/* Passivas */}
              {item.passives && item.passives.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: config.color, borderBottom: '1px solid currentColor', marginBottom: '0.5rem' }}>Habilidades Passivas</h3>
                  {item.passives.map((passive, index) => (
                    <div key={index} style={{ marginBottom: '1rem' }}>
                      <strong style={{ display: 'block' }}>{passive.name}</strong>
                      <p style={{ margin: '0.25rem 0 0 0' }}>{passive.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Ações */}
              {item.actions && item.actions.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: config.color, borderBottom: '1px solid currentColor', marginBottom: '0.5rem' }}>Ações</h3>
                  {item.actions.map((action, index) => (
                    <div key={index} style={{ marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '3px solid rgba(0,0,0,0.1)' }}>
                      <strong style={{ display: 'block', textTransform: 'uppercase' }}>
                        {action.actionType} - {action.name}
                      </strong>
                      <p style={{ margin: '0.25rem 0' }}>{action.description}</p>
                      <div style={{ fontSize: '0.9em', color: '#555' }}>
                        {[
                          action.test ? `Teste: ${action.test}` : null,
                          action.damage ? `Dano: ${action.damage}` : null
                        ].filter(Boolean).join(' | ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {renderField('Tags', item.tags, true)}
          {renderField('Livro', item.book || item.source)}
        </div>
      </div>

      {showEditModal && (
        <EditModal 
          item={item} 
          type={type} 
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onClose?.();
          }}
        />
      )}
    </div>
  );
}