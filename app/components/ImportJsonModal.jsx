'use client';

import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AeroSelect from './AeroSelect';
import styles from './ImportJsonModal.module.css';

// Templates de exemplo para cada categoria
const JSON_TEMPLATES = {
  abilities: `[\n  {\n    "name": "Poder Exemplo",\n    "description": "Texto do poder.",\n    "category": "Poderes Paranormais",\n    "tags": ["sangue", "combate"]\n  }\n]`,
  rituals: `[\n  {\n    "name": "Ritual Exemplo",\n    "description": "Efeitos do ritual.",\n    "circle": 1,\n    "elements": ["energia"],\n    "execution": "padrão",\n    "range": "curto",\n    "target": "1 ser",\n    "duration": "instantânea",\n    "tags": ["dano"]\n  }\n]`,
  weapons: `[\n  {\n    "name": "Arma Exemplo",\n    "category": "1",\n    "proficiency": "Tática",\n    "type": "Fogo",\n    "grip": "Duas Mãos",\n    "damage": "2d10",\n    "critical": "19/x3",\n    "damageType": "Balístico",\n    "space": 2\n  }\n]`,
  threats: `[\n  {\n    "name": "Zumbi de Sangue",\n    "vd": 20,\n    "description": "Criatura de sangue.",\n    "type": "Criatura",\n    "size": "Médio",\n    "elements": ["Sangue"],\n    "defense": 15,\n    "hp": { "total": 40, "bloodied": 20 },\n    "attributes": { "agi": 1, "for": 3, "int": 0, "pre": 1, "vig": 3 }\n  }\n]`
};

const CATEGORY_OPTIONS = [
  { label: 'Poderes', value: 'abilities' },
  { label: 'Rituais', value: 'rituals' },
  { label: 'Armas', value: 'weapons' },
  { label: 'Ameaças', value: 'threats' },
  { label: 'Itens', value: 'items' },
  { label: 'Regras', value: 'rules' },
  { label: 'Classes', value: 'classes' },
  { label: 'Trilhas', value: 'tracks' }
];

export default function ImportJsonModal({ onClose, onSuccess }) {
  const { user, hasPermission } = useContext(AuthContext);
  const [endpoint, setEndpoint] = useState('rituals');
  const [jsonInput, setJsonInput] = useState(JSON_TEMPLATES['rituals']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Segurança extra no frontend
  if (!user || !hasPermission('admin')) {
    return null;
  }

  const handleEndpointChange = (e) => {
    const newVal = e.target.value;
    setEndpoint(newVal);
    // Atualiza o placeholder com o template correto
    setJsonInput(JSON_TEMPLATES[newVal] || `[\n  {\n    "name": "Novo Registo"\n  }\n]`);
    setMessage(null);
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(JSON_TEMPLATES[endpoint] || '');
    setMessage({ type: 'success', text: 'Template copiado para a área de transferência.' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Validar se o JSON está bem formatado
      let parsedData;
      try {
        parsedData = JSON.parse(jsonInput);
      } catch (err) {
        throw new Error('Formato JSON inválido. Verifique vírgulas e aspas.');
      }

      // 2. Garantir que tratamos sempre como um array de objetos
      const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];

      if (dataArray.length === 0) {
        throw new Error('O JSON fornecido está vazio.');
      }

      // 3. Enviar cada objeto para a base de dados sequencialmente
      let successCount = 0;
      let failCount = 0;

      for (const item of dataArray) {
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`,
            item,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          successCount++;
        } catch (postError) {
          console.error(`Erro ao importar item:`, postError);
          failCount++;
        }
      }

      if (failCount === 0) {
        setMessage({ type: 'success', text: `${successCount} registos importados com sucesso!` });
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: `Importação concluída com erros: ${successCount} salvos, ${failCount} falhados. Verifique a consola.` 
        });
      }

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Importador de Dados JSON</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContent}>
          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <div className={styles.controlsRow}>
            <AeroSelect
              label="Destino dos Dados"
              name="endpoint"
              options={CATEGORY_OPTIONS}
              value={endpoint}
              onChange={handleEndpointChange}
              required
            />
            
            <button 
              type="button" 
              className={styles.copyButton} 
              onClick={copyTemplate}
            >
              Copiar Exemplo
            </button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Código JSON (Aceita um objeto ou um Array de objetos)</label>
            <textarea
              className={styles.jsonTextarea}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              spellCheck="false"
              required
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className={styles.saveButton}>
              {loading ? 'A injetar dados...' : 'Executar Importação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}