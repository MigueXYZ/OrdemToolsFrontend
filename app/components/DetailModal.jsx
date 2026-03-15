'use client';

import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext'; // Ajusta o caminho se necessário
import EditModal from './EditModal';
import styles from './DetailModal.module.css';

export default function DetailModal({ item, type, onClose, onUpdate }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useContext(AuthContext); // Acedemos ao utilizador logado

  if (!item) return null;

  const typeConfig = {
    ability: { color: '#C64D00', label: 'Poder', icon: '⚡', endpoint: '/abilities' },
    ritual: { color: '#9933FF', label: 'Ritual', icon: '✨', endpoint: '/rituals' },
    rule: { color: '#0076C0', label: 'Regra', icon: '📖', endpoint: '/rules' },
    item: { color: '#3D9970', label: 'Item', icon: '🧭', endpoint: '/items' },
    class: { color: '#B24C0B', label: 'Classe', icon: '⚔️', endpoint: '/classes' },
    track: { color: '#2E5C7D', label: 'Trilha', icon: '🛤️', endpoint: '/tracks' },
    weapon: { color: '#704214', label: 'Arma', icon: '🗡️', endpoint: '/weapons' },
    threat: { color: '#8b0000', label: 'Ameaça', icon: '💀', endpoint: '/threats' }
  };

  const config = typeConfig[type] || typeConfig.ability;

  const handleDelete = async () => {
    if (!window.confirm(`Tens a certeza que queres eliminar "${item.name || item.title}"? Esta ação é permanente.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}${config.endpoint}/${item._id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
      
      alert('Eliminado com sucesso.');
      onUpdate?.(); // Recarrega a lista
      onClose();   // Fecha o modal
    } catch (error) {
      console.error('Erro ao eliminar:', error);
      alert('Erro ao eliminar o registo. Verifica as permissões.');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderField = (label, value, isArray = false) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
      <div className={styles.field}>
        <strong className={styles.fieldLabel}>{label}</strong>
        <div className={styles.fieldValue}>{isArray ? value.join(', ') : value}</div>
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
              {user && (
                <>
                  <button 
                    className={styles.editButton}
                    onClick={() => setShowEditModal(true)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    title="Eliminar"
                  >
                    {isDeleting ? '...' : '🗑️'}
                  </button>
                </>
              )}
            <button className={styles.closeButton} onClick={onClose}>×</button>
          </div>
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>{item.name || item.title}</h2>

          {renderField('Descrição', item.description || item.content)}

          {type === 'ability' && (
            <div className={styles.grid2}>
              {renderField('Categoria', item.category)}
              {renderField('Origem', item.origin)}
              {renderField('Requisitos', item.requirements)}
              {renderField('Perícias', item.trainedSkills, true)}
            </div>
          )}

          {type === 'ritual' && (
            <div className={styles.grid2}>
              {renderField('Círculo', item.circle)}
              {renderField('Duração', item.duration)}
              {renderField('Elementos', item.elements, true)}
            </div>
          )}

          {type === 'rule' && (
            <div className={styles.grid2}>
              {renderField('Seção', item.section)}
              {renderField('Subseção', item.subsection)}
              {renderField('Página', item.pageReference)}
            </div>
          )}

          {type === 'item' && (
            <div className={styles.grid2}>
              {renderField('Categoria', item.category)}
              {renderField('Paranormal', item.paranormal ? 'Sim' : 'Não')}
            </div>
          )}

          {type === 'class' && (
            <>
              {(item.hp?.initial || item.ep?.initial || item.san?.initial) && (
                <div className={styles.threatSection}>
                  <h3 className={styles.sectionTitle} style={{ color: config.color }}>Características Iniciais</h3>
                  <div className={styles.grid3}>
                    {item.hp?.initial && <div className={styles.attrBox}><span>PV</span>{item.hp.initial}</div>}
                    {item.ep?.initial && <div className={styles.attrBox}><span>PE</span>{item.ep.initial}</div>}
                    {item.san?.initial && <div className={styles.attrBox}><span>SAN</span>{item.san.initial}</div>}
                  </div>
                </div>
              )}
            </>
          )}

          {type === 'track' && (
            <>
              <div className={styles.grid2}>
                {renderField('Classe', item.class?.name)}
              </div>
              {item.abilities && item.abilities.length > 0 && (
                <div className={styles.field}>
                  <strong className={styles.fieldLabel}>Poderes da Trilha</strong>
                  <div className={styles.fieldValue}>
                    <ul className={styles.abilitiesList}>
                      {item.abilities.map((ability) => (
                        <li key={ability._id}>{ability.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

          {type === 'weapon' && (
            <div className={styles.grid2}>
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
            </div>
          )}

          {type === 'threat' && (
            <>
              <div className={styles.threatSection}>
                <div className={styles.grid3}>
                  {renderField('VD', item.vd)}
                  {renderField('Tipo', item.type)}
                  {renderField('Tamanho', item.size)}
                </div>
                {renderField('Elementos', item.elements, true)}
                {renderField('Deslocamento', item.movement)}
              </div>

              <div className={styles.threatSection}>
                <h3 className={styles.sectionTitle} style={{ color: config.color }}>Estatísticas</h3>
                <div className={styles.grid2}>
                  {renderField('Defesa', item.defense)}
                  {renderField('PV', `${item.hp?.total || 0} (${item.hp?.bloodied || 0} machucado)`)}
                </div>
                
                {item.senses && (item.senses.perception || item.senses.initiative) && (
                  <div className={styles.inlineInfo}>
                    <strong>Sentidos:</strong> {[
                      item.senses.perception ? `Percepção ${item.senses.perception}` : null,
                      item.senses.initiative ? `Iniciativa ${item.senses.initiative}` : null,
                      item.senses.notes ? `(${item.senses.notes})` : null
                    ].filter(Boolean).join(' | ')}
                  </div>
                )}
                
                {item.savingThrows && (item.savingThrows.fortitude || item.savingThrows.reflexes || item.savingThrows.will) && (
                  <div className={styles.inlineInfo}>
                    <strong>Testes de Resistência:</strong> {[
                      item.savingThrows.fortitude ? `Fortitude ${item.savingThrows.fortitude}` : null,
                      item.savingThrows.reflexes ? `Reflexos ${item.savingThrows.reflexes}` : null,
                      item.savingThrows.will ? `Vontade ${item.savingThrows.will}` : null
                    ].filter(Boolean).join(' | ')}
                  </div>
                )}

                <div className={styles.grid2}>
                  {renderField('Resistências', item.resistances, true)}
                  {renderField('Vulnerabilidades', item.vulnerabilities, true)}
                </div>
              </div>

              {item.attributes && (
                <div className={styles.attributesGrid}>
                  <div className={styles.attrBox}><span>AGI</span> {item.attributes.agi}</div>
                  <div className={styles.attrBox}><span>FOR</span> {item.attributes.for}</div>
                  <div className={styles.attrBox}><span>INT</span> {item.attributes.int}</div>
                  <div className={styles.attrBox}><span>PRE</span> {item.attributes.pre}</div>
                  <div className={styles.attrBox}><span>VIG</span> {item.attributes.vig}</div>
                </div>
              )}

              {item.skills && item.skills.length > 0 && (
                <div className={styles.inlineInfo}>
                  <strong>Perícias:</strong> {item.skills.map(s => `${s.name} ${s.value}`).join(' | ')}
                </div>
              )}

              {item.enigmaOfFear?.hasEnigma && (
                <div className={styles.enigmaBox}>
                  <h4>Enigma de Medo</h4>
                  {item.enigmaOfFear.description && <p>{item.enigmaOfFear.description}</p>}
                  {item.enigmaOfFear.mechanics && <p className={styles.mechanicInfo}><strong>Efeito:</strong> {item.enigmaOfFear.mechanics}</p>}
                </div>
              )}

              {item.passives && item.passives.length > 0 && (
                <div className={styles.threatSection}>
                  <h3 className={styles.sectionTitle} style={{ color: config.color }}>Habilidades Passivas</h3>
                  {item.passives.map((passive, index) => (
                    <div key={index} className={styles.actionBlock}>
                      <strong>{passive.name}</strong>
                      <p>{passive.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {item.actions && item.actions.length > 0 && (
                <div className={styles.threatSection}>
                  <h3 className={styles.sectionTitle} style={{ color: config.color }}>Ações</h3>
                  {item.actions.map((action, index) => (
                    <div key={index} className={styles.actionBlock}>
                      <strong>{action.actionType} - {action.name}</strong>
                      <p>{action.description}</p>
                      <div className={styles.actionStats}>
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

          <div className={styles.metaData}>
            {renderField('Tags', item.tags, true)}
            {renderField('Livro', item.book || item.source)}
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditModal 
          item={item} 
          type={type} 
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onUpdate?.();
            onClose?.();
          }}
        />
      )}
    </div>
  );
}