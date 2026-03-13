'use client';

import { useState } from 'react';
import axios from 'axios';
import FormField from '../manage/FormField';
import styles from './EditModal.module.css';

const ABILITY_CATEGORIES = ['Poderes de Ocultista', 'Poderes de Especialista', 'Poderes de Combatente', 'Poderes Paranormais', 'Poder de Origem'];

export default function EditModal({ item, type, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: item.name || item.title || '',
    description: item.description || item.content || '',
    origin: item.origin || '',
    requirements: item.requirements || '',
    category: item.category || '',
    trainedSkills: item.trainedSkills?.join(', ') || '',
    circle: item.circle || '',
    elements: item.elements?.join(', ') || '',
    duration: item.duration || '',
    section: item.section || '',
    subsection: item.subsection || '',
    pageReference: item.pageReference || '',
    tags: item.tags?.join(', ') || '',
    book: item.book || '',
    source: item.source || '',
    // Weapon fields
    proficiency: item.proficiency || '',
    type: item.type || '',
    grip: item.grip || '',
    damage: item.damage || '',
    critical: item.critical || '',
    range: item.range || '',
    damageType: item.damageType || '',
    paranormal: item.paranormal || false,
    space: item.space?.toString() || '1',
    notes: item.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

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

  const getEndpoint = () => {
    const endpoints = {
      ability: '/abilities',
      ritual: '/rituals',
      rule: '/rules',
      item: '/items',
      weapon: '/weapons'
    };
    return endpoints[type] || '/abilities';
  };

  const buildPayload = () => {
    const payload = {
      name: formData.name,
      description: formData.description,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    };

    if (formData.requirements) payload.requirements = formData.requirements;
    if (formData.category) payload.category = formData.category;
    if (formData.book) payload.book = formData.book;
    if (formData.source) payload.source = formData.source;

    if (type === 'ability' && formData.category === 'Poder de Origem') {
      if (formData.origin) payload.origin = formData.origin;
      payload.associatedPower = formData.name;
      payload.trainedSkills = formData.trainedSkills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    if (type === 'ritual') {
      if (formData.circle) payload.circle = parseInt(formData.circle);
      if (formData.elements) {
        payload.elements = formData.elements
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.length > 0);
      }
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
      if (formData.paranormal !== undefined) payload.paranormal = formData.paranormal;
      if (formData.space) payload.space = parseFloat(formData.space);
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = buildPayload();
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}${getEndpoint()}/${item._id}`,
        payload
      );

      setMessage({ type: 'success', text: 'Atualizado com sucesso!' });
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Erro: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Editar {type === 'ability' ? 'Poder' : type === 'ritual' ? 'Ritual' : type === 'item' ? 'Item' : type === 'rule' ? 'Regra' : type === 'weapon' ? 'Arma' : 'Item'}</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <div className={styles.grid}>
            <FormField
              label="Nome"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {(type === 'ability' || type === 'item' || type === 'weapon') && (
              <FormField
                label="Categoria"
                name="category"
                value={formData.category}
                onChange={handleChange}
                isSelect
                options={type === 'ability' ? ABILITY_CATEGORIES : ['0', '1', '2', '3', '4']}
                cacheKey={type === 'ability' ? 'ability_category' : 'item_category'}
              />
            )}
          </div>

          <FormField
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleChange}
            isTextarea
          />

          {type === 'item' && (
            <>
              <FormField
                label="Paranormal?"
                name="paranormal"
                type="checkbox"
                value={formData.paranormal}
                onChange={handleChange}
              />
              <FormField
                label="Espaço"
                name="space"
                value={formData.space}
                onChange={handleChange}
                placeholder="ex: 1, 2, 0.5"
              />
            </>
          )}

          {(type === 'ability' || type === 'item') && formData.requirements && (
            <FormField
              label="Requisitos"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              isTextarea
            />
          )}

          {type === 'ability' && formData.category === 'Poder de Origem' && (
            <>
              <FormField
                label="Nome da Origem"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
              />
              <FormField
                label="Perícias treinadas"
                name="trainedSkills"
                value={formData.trainedSkills}
                onChange={handleChange}
                placeholder="Separadas por vírgula"
              />
            </>
          )}

          {type === 'ritual' && (
            <>
              <div className={styles.grid}>
                <FormField
                  label="Círculo"
                  name="circle"
                  value={formData.circle}
                  onChange={handleChange}
                  isSelect
                  options={['1', '2', '3', '4']}
                  cacheKey="ritual_circle"
                />
                <FormField
                  label="Duração"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>
              <FormField
                label="Elementos"
                name="elements"
                value={formData.elements}
                onChange={handleChange}
                placeholder="Separados por vírgula"
              />
            </>
          )}

          {type === 'rule' && (
            <>
              <div className={styles.grid}>
                <FormField
                  label="Seção"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                />
                <FormField
                  label="Subseção"
                  name="subsection"
                  value={formData.subsection}
                  onChange={handleChange}
                />
              </div>
              <FormField
                label="Referência de Página"
                name="pageReference"
                value={formData.pageReference}
                onChange={handleChange}
              />
            </>
          )}

          {type === 'weapon' && (
            <>
              <div className={styles.grid}>
                <FormField
                  label="Proficiência"
                  name="proficiency"
                  value={formData.proficiency}
                  onChange={handleChange}
                  isSelect
                  options={['Simples', 'Tática', 'Pesada']}
                />
                <FormField
                  label="Tipo"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  isSelect
                  options={['Corpo a Corpo', 'Arremesso', 'Disparo', 'Fogo']}
                />
              </div>
              <div className={styles.grid}>
                <FormField
                  label="Empunhadura"
                  name="grip"
                  value={formData.grip}
                  onChange={handleChange}
                  isSelect
                  options={['Leve', 'Uma Mão', 'Duas Mãos']}
                />
                <FormField
                  label="Dano"
                  name="damage"
                  value={formData.damage}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.grid}>
                <FormField
                  label="Crítico"
                  name="critical"
                  value={formData.critical}
                  onChange={handleChange}
                />
                <FormField
                  label="Alcance"
                  name="range"
                  value={formData.range}
                  onChange={handleChange}
                  isSelect
                  options={['Nenhum', 'Curto', 'Médio', 'Longo', 'Extremo']}
                />
              </div>
              <div className={styles.grid}>
                <FormField
                  label="Tipo de Dano"
                  name="damageType"
                  value={formData.damageType}
                  onChange={handleChange}
                  isSelect
                  options={['Corte', 'Impacto', 'Perfuração', 'Balístico', 'Fogo']}
                />
                <FormField
                  label="Espaço"
                  name="space"
                  value={formData.space}
                  onChange={handleChange}
                />
              </div>
              <FormField
                label="Notas"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                isTextarea
              />
            </>
          )}

          <div className={styles.grid}>
            <FormField
              label="Livro/Fonte"
              name={type === 'rule' ? 'source' : 'book'}
              value={type === 'rule' ? formData.source : formData.book}
              onChange={handleChange}
            />
          </div>

          <FormField
            label="Tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Separadas por vírgula"
          />

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
