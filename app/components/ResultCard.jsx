'use client';

import { useState } from 'react';
import styles from './ResultCard.module.css';
import EditModal from './EditModal';

export default function ResultCard({ item, type, onUpdate }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const typeConfig = {
    ability: { color: '#C64D00', label: 'Poder', icon: '⚡' },
    ritual: { color: '#9933FF', label: 'Ritual', icon: '✨' },
    rule: { color: '#0076C0', label: 'Regra', icon: '📖' },
    item: { color: '#3D9970', label: 'Item', icon: '🧭' },
    class: { color: '#B24C0B', label: 'Classe', icon: '⚔️' },
    track: { color: '#2E5C7D', label: 'Trilha', icon: '🛤️' },
    weapon: { color: '#704214', label: 'Arma', icon: '🗡️' },
    threat: { color: '#8b0000', label: 'Ameaça', icon: '💀' }
  };

  const config = typeConfig[type] || typeConfig.ability;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.typeTag} style={{ backgroundColor: config.color }}>
          <span>{config.icon}</span>
          {config.label}
        </div>
        <div className={styles.titleRow}>
          <div className={styles.titleInfo}>
            {item.origin && <div className={styles.origin}>{item.origin}</div>}
            <h3 className={styles.title}>{item.name || item.title}</h3>
          </div>
        </div>
      </div>

      <div className={styles.cardContent}>
        <p className={styles.description}>
          {item.description || item.content}
        </p>

        {item.requirements && (
          <div className={styles.requirementsBox}>
            <strong>Requisitos:</strong> {item.requirements}
          </div>
        )}

        <div className={styles.metaContainer}>
          {item.category && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Categoria:</span>
              <span className={styles.metaValue}>{item.category}</span>
            </div>
          )}
          {item.section && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Seção:</span>
              <span className={styles.metaValue}>{item.section}</span>
            </div>
          )}
          {item.category === 'Poder de Origem' && item.origin && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Origem:</span>
              <span className={styles.metaValue}>{item.origin}</span>
            </div>
          )}
          {item.category === 'Poder de Origem' && item.trainedSkills && item.trainedSkills.length > 0 && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Perícias:</span>
              <span className={styles.metaValue}>{item.trainedSkills.join(', ')}</span>
            </div>
          )}
          {item.circle && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Círculo:</span>
              <span className={styles.metaValue}>{item.circle}</span>
            </div>
          )}
          {item.elements && item.elements.length > 0 && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Elementos:</span>
              <span className={styles.metaValue}>{item.elements.join(', ')}</span>
            </div>
          )}
          {item.class && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Classe:</span>
              <span className={styles.metaValue}>{item.class?.name || item.class}</span>
            </div>
          )}
          {item.proficiency && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Proficiência:</span>
              <span className={styles.metaValue}>{item.proficiency}</span>
            </div>
          )}
          {item.type && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Tipo:</span>
              <span className={styles.metaValue}>{item.type}</span>
            </div>
          )}
          {item.grip && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Empunhadura:</span>
              <span className={styles.metaValue}>{item.grip}</span>
            </div>
          )}
          {item.damage && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Dano:</span>
              <span className={styles.metaValue}>{item.damage}</span>
            </div>
          )}
          {item.critical && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Crítico:</span>
              <span className={styles.metaValue}>{item.critical}</span>
            </div>
          )}
          {item.damageType && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Tipo de Dano:</span>
              <span className={styles.metaValue}>{item.damageType}</span>
            </div>
          )}
          {item.range && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Alcance:</span>
              <span className={styles.metaValue}>{item.range}</span>
            </div>
          )}
          {(type === 'item' || type === 'weapon') && item.space && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Espaço:</span>
              <span className={styles.metaValue}>{item.space}</span>
            </div>
          )}
          {type === 'item' && item.paranormal && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Paranormal:</span>
              <span className={styles.metaValue}>Sim</span>
            </div>
          )}
        </div>

        {item.abilities && item.abilities.length > 0 && (
          <div className={styles.abilitiesContainer}>
            <span className={styles.metaLabel}>Poderes Incluídos:</span>
            <div className={styles.abilitiesInCard}>
              {item.abilities.map((ability) => (
                <span key={ability._id} className={styles.abilityTag}>
                  {ability.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={styles.footer}>
          {item.tags && item.tags.length > 0 && (
            <div className={styles.tagsContainer}>
              {item.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}

          {(item.source || item.book) && (
            <div className={styles.source}>
              {item.book ? `📗 ${item.book}` : `📕 ${item.source}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}