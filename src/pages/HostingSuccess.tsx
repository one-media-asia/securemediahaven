import { ArrowRight, CheckCircle2, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const HostingSuccess = () => {
  useEffect(() => {
    sessionStorage.setItem('tingi-hosting-paid', 'true');
  }, []);

  return (
    <main className="hosting-success-page">
      <header className="hosting-success-header">
        <Link className="hosting-home-link" to="/">Back to home</Link>
        <div className="hosting-success-brand"><span>T</span>Tingi Hosting</div>
      </header>

      <section className="hosting-success-hero">
        <div className="hosting-success-badge">
          <CheckCircle2 size={16} /> Payment received
        </div>
        <h1>Your hosting is on the way.</h1>
        <p>
          Thanks for choosing Tingi Hosting. Your order has been received and our team will
          confirm your setup details by email.
        </p>

        <div className="hosting-success-actions">
          <Link className="button button-dark" to="/">
            Back to home <ArrowRight size={16} />
          </Link>
          <a className="button button-light" href="mailto:support@tingi.host">
            Email support <Mail size={16} />
          </a>
        </div>
      </section>

      <section className="hosting-success-grid">
        <article className="hosting-success-card">
          <div className="hosting-success-icon success-green">
            <ShieldCheck size={20} />
          </div>
          <h2>Secure setup</h2>
          <p>We’ll confirm your plan, billing details, and any onboarding steps needed for launch.</p>
        </article>

        <article className="hosting-success-card">
          <div className="hosting-success-icon success-gold">
            <Sparkles size={20} />
          </div>
          <h2>Launch support</h2>
          <p>Need help with your domain, migration, or privacy-focused setup? We can walk through it.</p>
        </article>

        <article className="hosting-success-card">
          <div className="hosting-success-icon success-coral">
            <ArrowRight size={20} />
          </div>
          <h2>Next steps</h2>
          <p>Keep an eye on your inbox for activation instructions and secure access information.</p>
        </article>
      </section>

      <section className="hosting-success-note">
        <p className="eyebrow">Important</p>
        <h2>Keep your keys private.</h2>
        <p>
          Never share passwords, private keys, recovery phrases, or API secrets in chat or email.
          If you need onboarding help, we will guide you through secure, official steps only.
        </p>
      </section>
    </main>
  );
};

export default HostingSuccess;
