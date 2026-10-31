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
  Sparkles,
  Sun,
} from "lucide-react";

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
    <main
      className={`login-page login-page-premium ${
        theme === "dark" ? "login-dark" : "login-light"
      }`}
    >
      {/* LEFT HERO SECTION */}
      <section className="login-visual login-visual-premium">
        <div className="login-visual-glow" />

        <div className="login-brand login-brand-premium">
          <span className="brand-mark">
            <Handshake size={22} />
          </span>
          <b>SPONSOR CRM</b>
        </div>

       
        <div className="visual-content visual-content-premium">
          <span className="eyebrow">
            <Sparkles size={14} />
            PARTNERSHIPS, MADE POWERFUL
          </span>

          <h1>
            Build relationships.
            <br />
            <em>Create impact.</em>
          </h1>

          <p>
            A smarter workspace to discover opportunities, nurture sponsors
            and build meaningful partnerships.
          </p>
        </div>

        <div className="visual-stats visual-stats-premium">
          <div>
            <b>01</b>
            <span>Connect</span>
            <small>Find the right opportunities.</small>
          </div>

          <i />

          <div>
            <b>02</b>
            <span>Collaborate</span>
            <small>Work together seamlessly.</small>
          </div>

          <i />

          <div>
            <b>03</b>
            <span>Grow</span>
            <small>Create long-term value.</small>
          </div>
        </div>

        <div className="visual-footer visual-footer-premium">
          <span>© {new Date().getFullYear()} Sponsor CRM</span>

          <span>
            <ShieldCheck size={15} />
            Secure | Reliable | Built for Partnerships
          </span>
        </div>
      </section>

      {/* RIGHT LOGIN SECTION */}
      <section className="login-panel login-panel-premium">
        <button
          className="theme-toggle login-theme-toggle login-theme-toggle-premium"
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle colour theme"
        >
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </button>

        <div className="login-form-wrap login-form-wrap-premium">
          <div className="mobile-login-brand">
            <span className="brand-mark">
              <Handshake size={21} />
            </span>
            <b>SPONSOR CRM</b>
          </div>

          <span className="form-kicker">WELCOME BACK</span>

          <h2>Sign in to your workspace</h2>

          <p className="form-subtitle">
            Enter your details to access your Sponsor CRM.
          </p>

          <form onSubmit={submit} noValidate>
            <label className="field-label" htmlFor="login-email">
              Email address
            </label>

            <div className="input-wrap input-wrap-premium">
              <Mail size={19} />

              <input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <label
              className="field-label password-label"
              htmlFor="login-password"
            >
              Password
            </label>

            <div className="input-wrap input-wrap-premium">
              <LockKeyhole size={19} />

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />

              <button
                type="button"
                className="password-visibility"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <label className="remember-option">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <button
              className="sign-in-button sign-in-button-premium"
              type="submit"
              disabled={busy}
            >
              {busy ? "Signing in..." : "Sign in"}
              {!busy && <ArrowRight size={19} />}
            </button>
          </form>

          <p className="login-legal login-legal-premium">
            <ShieldCheck size={14} />
            Access to this workspace is restricted to authorised users only.
          </p>
        </div>
      </section>
    </main>
  );
}