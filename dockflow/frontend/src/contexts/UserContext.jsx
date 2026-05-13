import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsers } from '../services/api';

const UserContext = createContext();
const DEFAULT_USERS = [
  { id: 1, name: '田中 管理者', role: 'admin' },
  { id: 2, name: '山田 納入業者', role: 'vendor' }
];

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getUsers();
      const apiUsers = Array.isArray(response.data) ? response.data : [];
      setUsers(apiUsers.length > 0 ? apiUsers : DEFAULT_USERS);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers(DEFAULT_USERS);
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    localStorage.setItem('selectedUser', JSON.stringify(user));
  };

  const clearUser = () => {
    setSelectedUser(null);
    localStorage.removeItem('selectedUser');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('selectedUser');
    if (savedUser) {
      setSelectedUser(JSON.parse(savedUser));
    }
  }, []);

  const value = {
    selectedUser,
    users,
    selectUser,
    clearUser,
    loadUsers
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
