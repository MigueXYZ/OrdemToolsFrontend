// app/login/page.jsx
'use client';

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/navigation'; // No Next.js usamos o next/navigation
import api from '../lib/api';

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
      router.push('/'); // Redireciona para a home
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao iniciar sessão.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Iniciar Sessão</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Nome de Utilizador</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label>Palavra-passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        {erro && <div style={{ color: 'red', fontWeight: 'bold' }}>{erro}</div>}
        
        <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>Entrar</button>
      </form>
    </div>
  );
}