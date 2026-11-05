import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Login from './pages/Login';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';

const TOKEN_KEY = 'sponsor-crm-token';
const USER_KEY = 'sponsor-crm-user';
const EXPIRES_KEY = 'sponsor-crm-expires';
const THEME_KEY = 'sponsor-crm-theme';

const getStoredValue = (key) =>
  sessionStorage.getItem(key) || localStorage.getItem(key);

const getToken = () => getStoredValue(TOKEN_KEY);

const isSessionValid = () => {
  const token = getToken();

  if (!token) {
    return false;
  }

  const expires = getStoredValue(EXPIRES_KEY);

  // If the backend provides an expiry value, validate it.
  // If no expiry is provided, allow the token and let the API validate it.
  if (expires) {
    const expiryDate = new Date(expires);

    if (Number.isNaN(expiryDate.getTime())) {
      return false;
    }

    if (expiryDate <= new Date()) {
      return false;
    }
  }

  return true;
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(isSessionValid);

  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_KEY) || 'light'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const login = () => {
    setAuthenticated(isSessionValid());
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);

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