'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getCachedOptions, combineOptions, addToCache } from '../lib/dropdownCache';
import styles from './FormField.module.css';

export default function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  isTextarea = false,
  isSelect = false,
  options = [],
  cacheKey = null
}) {
  const [combinedOptions, setCombinedOptions] = useState(options);

  useEffect(() => {
    if (isSelect && cacheKey && options?.length > 0) {
      const cached = getCachedOptions(cacheKey);
      const combined = combineOptions(options, cached);
      setCombinedOptions(combined);
    } else if (isSelect) {
      setCombinedOptions(options);
    }
  }, [options, isSelect, cacheKey]);

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    if (cacheKey && selectedValue) {
      addToCache(cacheKey, selectedValue);
    }
    onChange(e);
  };

  if (isSelect) {
    return (
      <div className={styles.fieldGroup}>
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleSelectChange}
          className={styles.select}
          required={required}
        >
          <option value="">-- Select {label.toLowerCase()} --</option>
          {combinedOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (isTextarea) {
    return (
      <div className={styles.fieldGroup}>
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={styles.textarea}
          required={required}
          rows={4}
        />
      </div>
    );
  }

  // handle checkbox differently to bind checked property
  if (type === 'checkbox') {
    // add paranormal-specific class when applicable
    const extraClass = name === 'paranormal' ? styles.paranormalCheckbox : '';
    const labelClass = name === 'paranormal' ? `${styles.label} ${styles.paranormalLabel}` : styles.label;
    return (
      <div className={styles.fieldGroup}>
        <label htmlFor={name} className={labelClass}>
          <input
            id={name}
            type="checkbox"
            name={name}
            checked={!!value}
            onChange={(e) => onChange({ target: { name, value: e.target.checked } })}
            className={`${styles.checkbox} ${extraClass}`}
          />
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      </div>
    );
  }

  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.input}
        required={required}
      />
    </div>
  );
}
