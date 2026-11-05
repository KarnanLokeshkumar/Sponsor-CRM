import { useState } from "react";
import { api } from "../services/api";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Handshake,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
} from "lucide-react";
import "../styles/Login.css";

export default function Login({ onLogin, theme, onToggleTheme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Enter your email address and password.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result = await api.login({
        email: email.trim(),
        password,
      });

      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("sponsor-crm-token", result.token);
      storage.setItem("sponsor-crm-user", result.email);
      storage.setItem("sponsor-crm-expires", result.expiresAt);

      onLogin();
    } catch (err) {
      setError(
        err.message || "Unable to sign in. Please check your details."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={`reference-login ${theme === "dark" ? "login-dark" : "login-light"}`}>
      <div className="reference-login-background" />

      <header className="reference-brand">
        <span className="reference-brand-icon">
          <Handshake size={25} />
        </span>
        <b>SPONSOR CRM</b>
      </header>

      <section className="reference-hero">
        <div className="reference-hero-copy">
          <span className="reference-eyebrow">
            A SPONSORSHIP CRM MADE POWERFUL
          </span>

          <h1>
            Build relationships.
            <br />
            <span>Create impact.</span>
          </h1>

          <p>
            A smarter workspace to discover opportunities,
            <br className="desktop-break" />
            nurture sponsors and build meaningful partnerships.
          </p>
        </div>
      </section>

      <section className="reference-login-panel">
        <button
          className="reference-theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle colour theme"
        >
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        <div className="reference-login-card">
          <span className="reference-form-kicker">WELCOME BACK</span>

          <h2>Sign in to your workspace</h2>

          <p className="reference-form-subtitle">
            Enter your details to access your Sponsor CRM.
          </p>

          <form onSubmit={submit} noValidate>
            <label className="reference-field">
              <Mail size={20} />

              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                aria-label="Email address"
                required
              />
            </label>

            <label className="reference-field">
              <LockKeyhole size={20} />

              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                aria-label="Password"
                required
              />

              <button
                type="button"
                className="reference-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </label>

            {error && (
              <p className="reference-error" role="alert">
                {error}
              </p>
            )}

            <div className="reference-form-options">
              <label className="reference-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="reference-forgot"
                onClick={() => setError("Please contact your administrator to reset your password.")}
              >
                Forgot password?
              </button>
            </div>

            <button
              className="reference-sign-in"
              type="submit"
              disabled={busy}
            >
              <span>{busy ? "Signing in..." : "Sign In"}</span>
              {!busy && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="reference-login-legal">
            <ShieldCheck size={14} />
            Access to this workspace is restricted to authorised users only.
          </p>
        </div>
      </section>
    </main>
  );
}