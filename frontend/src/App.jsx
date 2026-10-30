import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(sessionStorage.getItem('sponsor-crm-token')) && new Date(sessionStorage.getItem('sponsor-crm-expires') || 0) > new Date());
  const [theme, setTheme] = useState(() => localStorage.getItem('sponsor-crm-theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('sponsor-crm-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(current => current === 'light' ? 'dark' : 'light');
  const login = () => setAuthenticated(true);
  const logout = () => { sessionStorage.removeItem('sponsor-crm-token'); sessionStorage.removeItem('sponsor-crm-user'); sessionStorage.removeItem('sponsor-crm-expires'); setAuthenticated(false); };

  if (!authenticated) return <Login onLogin={login} theme={theme} onToggleTheme={toggleTheme} />;

  return (
    <Routes>
      <Route element={<AppLayout onLogout={logout} theme={theme} onToggleTheme={toggleTheme} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/:module" element={<ModulePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
