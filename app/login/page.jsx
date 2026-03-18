'use client';

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import styles from './login.module.css';
import Link from 'next/link';

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
      login(response.data); 
      router.push('/');
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao iniciar sessão.');
    }
  };

  // Função para voltar
  const handleBack = () => router.push('/');

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.glassCard}>
        {/* BOTÃO VOLTAR */}
        <button onClick={handleBack} className={styles.backButton}>
          ← Voltar
        </button>

        <h2 className={styles.title}>Iniciar Sessão</h2>
        
        {/* ... resto do formulário igual ... */}
        {erro && (
          <div className={styles.error} role="alert">
            <span className={styles.errorIcon}>⚠️</span> {erro}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Utilizador</label>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="Ex: admin"
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
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className={styles.button}>
            Aceder ao Arquivo
          </button>
        </form>
        <div className={styles.footer}>
          <Link href="./register" className={styles.link}>
            Ainda não tem acesso? Criar Credenciais
          </Link>
        </div>
      </div>
    </div>
  );
}