import { ArrowRight, Check, ExternalLink, LockKeyhole } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const apps = [
  { name: 'LearnKit', description: 'Guides, templates, and practical learning paths.', href: '/learnkit', internal: true },
  { name: 'Self Help', description: 'Guided practices for reflection and growth.', href: '/self-help', internal: true },
  { name: 'Vaultline', description: 'Private file storage for your important work.', href: '/vaultline', internal: true },
  { name: 'Positive', description: 'Daily prompts, gratitude, and better habits.', href: 'https://positive.onemedia.asia', internal: false },
];

const Success = () => {
  useEffect(() => {
    sessionStorage.setItem('vaultline-paid', 'true');
    sessionStorage.setItem('all-access-paid', 'true');
  }, []);

  return <main className="success-page">
    <header className="success-header"><Link className="success-brand" to="/"><span>A</span> appfolk</Link><span className="success-secure"><LockKeyhole size={14} /> Secure membership</span></header>
    <section className="success-hero"><div className="success-check"><Check size={30} /></div><p className="eyebrow">Welcome to All Access</p><h1>You’re in.<br /><em>Go make something.</em></h1><p>Thanks for joining appfolk. Your one-time $12 purchase includes access to the full app shelf.</p></section>
    <section className="success-apps"><div className="success-section-heading"><div><p className="eyebrow">Your app shelf</p><h2>Start anywhere.</h2></div><p>Choose an app and begin with one useful next step.</p></div><div className="success-app-grid">{apps.map((app) => app.internal ? <Link className="success-app" to={app.href} key={app.name}><div><strong>{app.name}</strong><span>{app.description}</span></div><ArrowRight size={17} /></Link> : <a className="success-app" href={app.href} target="_blank" rel="noreferrer" key={app.name}><div><strong>{app.name}</strong><span>{app.description}</span></div><ExternalLink size={16} /></a>)}</div></section>
    <section className="success-note"><p className="eyebrow">A quick note</p><h2>One membership.<br /><em>Every app.</em></h2><p>Keep this page bookmarked. Account sign-in and automatic membership verification will be connected before production launch.</p><Link className="success-home" to="/">Back to appfolk <ArrowRight size={15} /></Link></section>
    <footer className="success-footer">appfolk All Access <span>$12 one time</span></footer>
  </main>;
  };

export default Success;
