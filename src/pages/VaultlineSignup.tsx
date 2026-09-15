import { ArrowLeft, Check, LockKeyhole, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { isCognitoConfigured, signUpWithCognito } from '@/lib/cognito';

type Plan = 'Starter' | 'Business' | 'Scale';

const plans: { key: Plan; name: string; price: string; description: string }[] = [
  { key: 'Starter', name: 'Starter', price: '$12', description: 'For solo teams and everyday file sharing.' },
  { key: 'Business', name: 'Business', price: '$24', description: 'For growing teams needing secure collaboration.' },
  { key: 'Scale', name: 'Scale', price: '$49', description: 'For advanced controls and higher storage limits.' },
];

const VaultlineSignup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', plan: 'Starter' as Plan });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitted(false);
    setError('');

    try {
      if (isCognitoConfigured()) {
        await signUpWithCognito(form);
        setSubmitted(true);
        return;
      }

      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Unable to create your account.');
      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="vaultline-signup-page">
      <header className="vaultline-signup-header">
        <Link className="vaultline-brand" to="/vaultline">
          <span>V</span> Vaultline
        </Link>
        <Link className="vaultline-signup-login" to="/vaultline">
          <ArrowLeft size={15} /> Back to workspace
        </Link>
      </header>

      <section className="vaultline-signup-shell">
        <div className="vaultline-signup-copy">
          <p className="vaultline-kicker">Private file storage</p>
          <h1>Create your secure workspace.</h1>
          <p className="vaultline-signup-intro">
            Keep documents, client files, and shared assets protected in one place with encrypted access and simple team collaboration.
          </p>

          <div className="vaultline-signup-points">
            <div>
              <ShieldCheck size={18} />
              <div>
                <strong>End-to-end protected</strong>
                <span>Encrypted transfers and controlled access.</span>
              </div>
            </div>
            <div>
              <UploadCloud size={18} />
              <div>
                <strong>Simple file sharing</strong>
                <span>Upload, share, and organize everything in one space.</span>
              </div>
            </div>
            <div>
              <LockKeyhole size={18} />
              <div>
                <strong>Team-ready security</strong>
                <span>Built for trusted work with permission-aware storage.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="vaultline-signup-card">
          <div className="vaultline-signup-card-top">
            <div className="vaultline-signup-badge"><Sparkles size={14} /> New account</div>
            <h2>Start free</h2>
          </div>

          <form onSubmit={onSubmit} className="vaultline-signup-form">
            <label>
              <span>Full name</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Alex Morgan"
                required
              />
            </label>

            <label>
              <span>Work email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="alex@company.com"
                required
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </label>

            <div className="vaultline-plan-picker">
              <span>Choose a plan</span>
              <div className="vaultline-plan-grid">
                {plans.map((plan) => (
                  <button
                    key={plan.key}
                    type="button"
                    className={form.plan === plan.key ? 'vaultline-plan active' : 'vaultline-plan'}
                    onClick={() => setForm((current) => ({ ...current, plan: plan.key }))}
                  >
                    <strong>{plan.name}</strong>
                    <em>{plan.price}<small>/mo</small></em>
                    <small>{plan.description}</small>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="vaultline-signup-submit" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </button>

            <p className="vaultline-signup-terms">
              By continuing, you agree to the terms and privacy policy.
            </p>

            {submitted && (
              <div className="vaultline-signup-success">
                <Check size={16} /> Account created. Check your email to verify it.
              </div>
            )}
            {error && <div className="vaultline-signup-error" role="alert">{error}</div>}
          </form>
        </div>
      </section>
    </main>
  );
};

export default VaultlineSignup;
