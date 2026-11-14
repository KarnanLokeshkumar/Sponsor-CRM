import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Login from './pages/Login';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';

const STORAGE_KEYS = {
  token: 'sponsor-crm-token',
  user: 'sponsor-crm-user',
  expires: 'sponsor-crm-expires',
  theme: 'sponsor-crm-theme',
};

const getStoredValue = (key) =>
  sessionStorage.getItem(key) || localStorage.getItem(key);

const clearAuthStorage = () => {
  ['token', 'user', 'expires'].forEach((key) => {
    sessionStorage.removeItem(STORAGE_KEYS[key]);
    localStorage.removeItem(STORAGE_KEYS[key]);
  });
};

const getToken = () => getStoredValue(STORAGE_KEYS.token);
const getExpiry = () => getStoredValue(STORAGE_KEYS.expires);

const isSessionValid = () => {
  const token = getToken();

  if (!token || typeof token !== 'string' || token.trim() === '') {
    return false;
  }

  const expires = getExpiry();

  if (!expires) {
    return true;
  }

  const expiryDate = new Date(expires);

  if (Number.isNaN(expiryDate.getTime())) {
    clearAuthStorage();
    return false;
  }

  if (expiryDate <= new Date()) {
    clearAuthStorage();
    return false;
  }

  return true;
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(isSessionValid);
  const [theme, setTheme] = useState(
    () => localStorage.getItem(STORAGE_KEYS.theme) || 'light'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (!event.key) {
        return;
      }

      const authKeys = [
        STORAGE_KEYS.token,
        STORAGE_KEYS.user,
        STORAGE_KEYS.expires,
      ];

      if (authKeys.includes(event.key)) {
        setAuthenticated(isSessionValid());
      }
    };

    const handleAuthChange = () => {
      setAuthenticated(isSessionValid());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('sponsor-crm-auth-cleared', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sponsor-crm-auth-cleared', handleAuthChange);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const login = () => {
    setAuthenticated(isSessionValid());
  };

  const logout = () => {
    clearAuthStorage();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <Login
        onLogin={login}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <Routes>
      <Route
        element={
          <AppLayout
            onLogout={logout}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/:module" element={<ModulePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}