import { useState } from 'react';
import { api } from '../services/api';
import { ArrowRight, Eye, EyeOff, Handshake, LockKeyhole, Mail, ShieldCheck, Sparkles, Sun, Moon } from 'lucide-react';

export default function Login({ onLogin, theme, onToggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return setError('Enter your email and password.');
    setBusy(true); setError('');
    try { const result = await api.login({ email: email.trim(), password }); sessionStorage.setItem('sponsor-crm-token', result.token); sessionStorage.setItem('sponsor-crm-user', result.email); sessionStorage.setItem('sponsor-crm-expires', result.expiresAt); onLogin(); }
    catch (err) { setError(err.message || 'Unable to sign in.'); }
    finally { setBusy(false); }
  }

  return <div className="login-page">
    <section className="login-visual">
      <div className="login-brand"><div className="brand-mark"><Handshake size={22}/></div><b>SPONSOR CRM</b></div>
      <div className="visual-content">
        <span className="eyebrow"><Sparkles size={14}/> PARTNERSHIPS, MADE POWERFUL</span>
        <h1>Build relationships.<br/><em>Create impact.</em></h1>
        <p>One connected workspace to discover opportunities, nurture sponsors and deliver meaningful partnerships.</p>
        <div className="visual-stats"><div><b>01</b><span>Connect</span></div><i/><div><b>02</b><span>Collaborate</span></div><i/><div><b>03</b><span>Grow</span></div></div>
      </div>
      <div className="visual-footer"><span>© Sponsor CRM</span><span><ShieldCheck size={14}/> Partnership workspace</span></div>
    </section>
    <section className="login-panel">
      <button className="theme-toggle login-theme-toggle" onClick={onToggleTheme} aria-label="Toggle light and dark theme" title="Toggle theme">{theme === 'light' ? <Moon size={16}/> : <Sun size={16}/>}<span>{theme === 'light' ? 'Dark' : 'Light'}</span></button>
      <div className="login-form-wrap">
        <div className="mobile-login-brand"><div className="brand-mark"><Handshake size={20}/></div><b>SPONSOR CRM</b></div>
        <span className="form-kicker">WELCOME BACK</span>
        <h2>Sign in to your workspace</h2>
        <p className="form-subtitle">Enter your details to access your Sponsor CRM.</p>
        <form onSubmit={submit}>
          <label className="field-label">Email address</label>
          <div className="input-wrap"><Mail size={17}/><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"/></div>
          <label className="field-label password-label">Password</label>
          <div className="input-wrap"><LockKeyhole size={17}/><input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"/><button type="button" onClick={() => setShow(v => !v)} aria-label="Toggle password visibility">{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
          {error && <p className="form-error">{error}</p>}
          <div className="form-options"><label><input type="checkbox" defaultChecked/> Remember me</label><span>Forgot password?</span></div>
          <button className="sign-in-button" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={17}/></button>
        </form>
        <p className="login-legal">Access to this workspace is restricted to authorised users.</p>
      </div>
    </section>
  </div>;
}
