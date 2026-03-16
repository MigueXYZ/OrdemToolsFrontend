// app/context/AuthContext.js
'use client';

import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sessão ao carregar a página
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const shownName = localStorage.getItem('shownName');
    const permissions = localStorage.getItem('permissions');
    
    if (token && username) {
      setUser({ 
        token, 
        username, 
        shownName: shownName || username,
        // Convertemos a string do localStorage de volta para Array
        permissions: permissions ? JSON.parse(permissions) : ['user']
      });
    }
    setLoading(false);
  }, []);

  // Login atualizado para receber o objeto completo da API
  const login = (userData) => {
    const { token, username, shownName, permissions } = userData;

    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('shownName', shownName);
    // localStorage só guarda strings, por isso usamos JSON.stringify
    localStorage.setItem('permissions', JSON.stringify(permissions));

    setUser({ token, username, shownName, permissions });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('shownName');
    localStorage.removeItem('permissions');
    setUser(null);
  };

  // Função utilitária para verificar permissões rapidamente no UI
  const hasPermission = (perm) => {
    return user?.permissions?.includes(perm);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};