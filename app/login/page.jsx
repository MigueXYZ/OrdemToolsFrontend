'use client';

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import styles from './login.module.css'; // Importa o novo CSS

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data.token, response.data.username);
      router.push('/');
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao iniciar sessão.');
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.glassCard}>
        <h2 className={styles.title}>Iniciar Sessão</h2>
        
        {erro && <div className={styles.error} role="alert">{erro}</div>}
        
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nome de Utilizador</label>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Palavra-passe</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className={styles.button}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}