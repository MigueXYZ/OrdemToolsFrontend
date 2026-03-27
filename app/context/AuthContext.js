'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

// Duração da sessão: 2 horas em milissegundos
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Usamos useCallback para poder chamar o logout dentro dos useEffects com segurança
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('shownName');
    localStorage.removeItem('permissions');
    localStorage.removeItem('tokenExpiration'); // Remover a marca de tempo
    setUser(null);
  }, []);

  // 1. Restaurar sessão ao carregar a página e verificar validade
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const shownName = localStorage.getItem('shownName');
    const permissions = localStorage.getItem('permissions');
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (token && username && expiration) {
      const now = Date.now();
      
      // Se a data atual for maior que a data de expiração, recusa a sessão
      if (now > parseInt(expiration, 10)) {
        logout();
      } else {
        // Se ainda for válida, carrega os dados
        setUser({ 
          token, 
          username, 
          shownName: shownName || username,
          permissions: permissions ? JSON.parse(permissions) : ['user']
        });
      }
    } else if (token && !expiration) {
      // Medida de segurança: se existir um token antigo sem marca de tempo, apaga-o
      logout();
    }
    
    setLoading(false);
  }, [logout]);

  // 2. Patrulha de segundo plano: verifica a expiração enquanto a aba está aberta
  useEffect(() => {
    const interval = setInterval(() => {
      const expiration = localStorage.getItem('tokenExpiration');
      
      if (expiration && Date.now() > parseInt(expiration, 10)) {
        logout();
        window.location.reload(); // Força a atualização da página para ativar as proteções de rota e enviar para o login
      }
    }, 60000); // Corre a cada 60 segundos (1 minuto)

    return () => clearInterval(interval); // Limpa o processo se o componente for desmontado
  }, [logout]);

  const login = (userData) => {
    const { token, username, shownName, permissions } = userData;

    // Calcular o momento exato em que este token vai expirar
    const expirationTime = Date.now() + SESSION_DURATION_MS;

    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('shownName', shownName);
    localStorage.setItem('permissions', JSON.stringify(permissions));
    localStorage.setItem('tokenExpiration', expirationTime.toString()); // Guardar o limite de tempo

    setUser({ token, username, shownName, permissions });
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      
      const newUser = { ...prevUser, ...updatedData };
      
      if (updatedData.shownName) {
        localStorage.setItem('shownName', updatedData.shownName);
      }
      
      return newUser;
    });
  };

  const hasPermission = (perm) => {
    return user?.permissions?.includes(perm);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}