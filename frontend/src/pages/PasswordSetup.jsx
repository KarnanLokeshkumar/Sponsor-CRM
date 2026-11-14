import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Handshake,
  LockKeyhole,
  Moon,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { api } from "../services/api";
import "../styles/Login.css";

export default function PasswordSetup({ theme, onToggleTheme }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event) {
    event.preventDefault();

    if (!token) {
      setError("This setup link is missing its token. Ask your administrator for a new invite.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await api.setupPassword({ token, password });
      setComplete(true);
    } catch (requestError) {
      setError(requestError?.message || "Unable to set your password. Request a new setup link.");
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
          <span className="reference-eyebrow">YOUR SPONSORSHIP WORKSPACE</span>
          <h1>
            Build relationships.
            <br />
            <span>Create impact.</span>
          </h1>
          <p>Set up your password to securely access your Sponsor CRM account.</p>
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
          {complete ? (
            <>
              <span className="reference-form-kicker">SETUP COMPLETE</span>
              <h2>Your password is ready</h2>
              <p className="reference-form-subtitle">
                You can now sign in to your Sponsor CRM workspace.
              </p>
              <button
                className="reference-sign-in"
                type="button"
                onClick={() => navigate("/", { replace: true })}
              >
                <span>Go to sign in</span>
                <ArrowRight size={20} />
              </button>
            </>
          ) : (
            <>
              <span className="reference-form-kicker">ACCOUNT SETUP</span>
              <h2>Create your password</h2>
              <p className="reference-form-subtitle">
                Choose a password with at least 8 characters.
              </p>

              {!token && (
                <p className="reference-error" role="alert">
                  This setup link is missing its token. Ask your administrator for a new invite.
                </p>
              )}

              <form onSubmit={submit} noValidate>
                <label className={`reference-field ${password && password.length < 8 ? "invalid" : ""}`}>
                  <LockKeyhole size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="New password"
                    aria-label="New password"
                    aria-invalid={Boolean(password && password.length < 8)}
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

                <label className={`reference-field ${confirmation && password !== confirmation ? "invalid" : ""}`}>
                  <LockKeyhole size={20} />
                  <input
                    type={showConfirmation ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(event) => {
                      setConfirmation(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Confirm password"
                    aria-label="Confirm password"
                    aria-invalid={Boolean(confirmation && password !== confirmation)}
                    required
                  />
                  <button
                    type="button"
                    className="reference-password-toggle"
                    onClick={() => setShowConfirmation((current) => !current)}
                    aria-label={showConfirmation ? "Hide confirmation" : "Show confirmation"}
                  >
                    {showConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </label>

                {error && (
                  <p className="reference-error" role="alert">
                    {error}
                  </p>
                )}

                <button
                  className="reference-sign-in"
                  type="submit"
                  disabled={busy || !token || !password || !confirmation}
                >
                  <span>{busy ? "Setting password..." : "Set password"}</span>
                  {!busy && <ArrowRight size={20} />}
                </button>
              </form>

              <p className="reference-login-legal">
                <ShieldCheck size={14} />
                Your setup link can only be used once.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
