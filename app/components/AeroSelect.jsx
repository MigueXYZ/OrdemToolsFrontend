'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './AeroSelect.module.css';

export default function AeroSelect({ label, options, value, onChange, placeholder, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Encontrar o label da opção selecionada para mostrar no botão
  const selectedOption = options.find(opt => 
    (typeof opt === 'object' ? opt.value : opt) === value
  );
  
  const displayValue = selectedOption 
    ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
    : placeholder || '-- Selecionar categoria --';

  // Fechar o menu se clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    const newValue = typeof option === 'object' ? option.value : option;
    onChange({ target: { name: 'category', value: newValue } });
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {label && (
        <label className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      {/* O "Botão" do Select - Efeito Vidro */}
      <div 
        className={`${styles.selectTrigger} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsOpen(!isOpen)}
      >
        <span className={`${styles.value} ${!selectedOption ? styles.placeholder : ''}`}>
          {displayValue}
        </span>
        
        {/* Chevron Aero Customizado (SVG Inline) */}
        <svg className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="#004a99" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* A Lista de Opções - Efeito Vidro Glassmorphism */}
      {isOpen && (
        <ul className={`${styles.optionsList} ${styles.fadeIn}`}>
          {options.map((option, index) => {
            const optValue = typeof option === 'object' ? option.value : option;
            const optLabel = typeof option === 'object' ? option.label : option;
            
            return (
              <li 
                key={index} 
                className={`${styles.optionItem} ${value === optValue ? styles.selected : ''}`}
                onClick={() => handleSelect(option)}
              >
                {optLabel}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}