'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';
import styles from './page.module.css';

export default function RegisterPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [shownName, setShownName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações locais
    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        username,
        shownName,
        password
      });

      setSuccess(true);
      
      // Aguarda 2 segundos e redireciona para o login
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Ocorreu um erro ao registar o agente.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <ThemeToggle />
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Novo Registo</h1>
          <p className={styles.subtitle}>Insira as suas credenciais para aceder à base de dados da Ordem.</p>
        </div>

        {success ? (
          <div className={styles.successBox}>
            <h3>Registo Concluído</h3>
            <p>A redirecionar para o terminal de acesso...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.field}>
              <label className={styles.label}>Nome de Utilizador</label>
              <input
                type="text"
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: agente_silva"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nome de Exibição (Opcional)</label>
              <input
                type="text"
                className={styles.input}
                value={shownName}
                onChange={(e) => setShownName(e.target.value)}
                placeholder="Ex: Artur Silva"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Palavra-passe</label>
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Confirmar Palavra-passe</label>
              <input
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'A processar...' : 'Criar Credenciais'}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <Link href="/login" className={styles.link}>
            Já tem acesso? Iniciar Sessão
          </Link>
        </div>
      </div>
    </div>
  );
}