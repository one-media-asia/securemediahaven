import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ExternalLink, LayoutGrid, Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paymentUrl } from '@/lib/payment';

type Category = 'All' | 'Productivity' | 'Security' | 'Tools' | 'WordPress plugins' | 'Linux distros' | 'Cyber learning' | 'Cyber labs' | 'Practice sites' | 'Creative tools';
type Product = {
  name: string;
  category: Category;
  price: string;
  period: string;
  description: string;
  color: string;
  detail: string;
  stripeUrl?: string;
  appUrl?: string;
  featured?: boolean;
};

const products: Product[] = [
  { name: 'Flowboard', category: 'Productivity' as Category, price: '$12', period: '/ month', description: 'A focused command center for projects, notes, and next steps.', color: 'coral', detail: 'Included with All Access', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, featured: true },
  { name: 'Self Help', category: 'Productivity' as Category, price: '$12', period: '/ month', description: 'A calm coaching space for reflection, routines, and personal growth.', color: 'coral', detail: 'Included with All Access', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: '/self-help' },
  { name: 'Positive', category: 'Productivity' as Category, price: '$12', period: '/ month', description: 'A brighter daily space for encouragement, gratitude, and good habits.', color: 'yellow', detail: 'Included with All Access', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: 'https://positive.onemedia.asia' },
  { name: 'Vaultline', category: 'Security' as Category, price: '$12', period: '/ month', description: 'Private file storage and password sharing for small teams.', color: 'blue', detail: 'Included with All Access', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: '/vaultline' },
  { name: 'LearnKit', category: 'Productivity' as Category, price: '$12', period: '/ month', description: 'A practical repository of lessons, guides, templates, and notes for building useful skills.', color: 'lime', detail: 'Included with All Access', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: '/learnkit' },
  { name: 'Signal Studio', category: 'Creative tools' as Category, price: '$12', period: '/ month', description: 'Turn rough ideas into polished social content in minutes.', color: 'yellow', detail: 'Included with All Access', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL },
  { name: 'Patchwork', category: 'Creative tools' as Category, price: '$12', period: '/ month', description: 'A visual workspace for shaping your best ideas together.', color: 'purple', detail: 'Included with All Access', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL },
  { name: 'Nightwatch', category: 'Security' as Category, price: '$12', period: '/ month', description: 'Quiet, continuous monitoring for the things you ship.', color: 'green', detail: 'Included with All Access', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL },
  { name: 'VulnScan', category: 'Tools' as Category, price: '$12', period: '/ month', description: 'Scan any website for common vulnerabilities. See how a hacker would exploit them and exactly how to fix each issue.', color: 'coral', detail: 'Security scanner / Educational', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: '/vuln-scan' },
  { name: 'SMS Phish', category: 'Tools' as Category, price: '$12', period: '/ month', description: 'A controlled SMS phishing-awareness simulator for authorized training and defensive testing.', color: 'coral', detail: 'Authorized use / Awareness training', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: '/sms-phish' },
  { name: 'Reality Check', category: 'Tools' as Category, price: '$12', period: '/ month', description: 'A fictional deepfake-awareness simulator for practicing source checks and verification pauses.', color: 'yellow', detail: 'Fictional samples / Safe training', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: '/deepfake' },
  { name: 'Voice Reality Check', category: 'Tools' as Category, price: '$12', period: '/ month', description: 'A fictional voice-phishing awareness simulator for practicing call-back and verification habits.', color: 'blue', detail: 'Fictional calls / Safe training', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: '/voice-phishing' },
  { name: 'Awareness Lab', category: 'Tools' as Category, price: '$12', period: '/ month', description: 'Build local, consent-based security awareness exercises with dummy participants and safe previews.', color: 'lime', detail: 'Local only / No delivery', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: '/awareness-lab' },
  { name: 'MalwareGuard', category: 'Tools' as Category, price: '$12', period: '/ month', description: 'Scan URLs for malware, phishing, and threats with privacy-first heuristic analysis. Detects suspicious patterns, typosquatting, and malicious redirects.', color: 'green', detail: 'URL Scanner / Threat Detection', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL },
  { name: 'SecureForms', category: 'WordPress plugins' as Category, price: '$12', period: '/ month', description: 'Harden WordPress forms with spam protection, safer uploads, and useful audit events.', color: 'coral', detail: 'Free installation / Updates included', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL },
  { name: 'SiteShield WP', category: 'WordPress plugins' as Category, price: '$12', period: '/ month', description: 'A practical WordPress security toolkit for backups, headers, and admin hygiene.', color: 'blue', detail: 'WordPress / Security checks', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL },
  { name: 'Ubuntu Desktop Kit', category: 'Linux distros' as Category, price: '$12', period: '/ month', description: 'A beginner-friendly Linux setup guide with install notes, tools, and troubleshooting.', color: 'yellow', detail: 'Setup guide / Download links', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: 'https://ubuntu.com/download/desktop' },
  { name: 'Kali Lab Edition', category: 'Linux distros' as Category, price: '$12', period: '/ month', description: 'A responsible Kali Linux lab blueprint for learning security tools safely.', color: 'purple', detail: 'Lab blueprint / Safe defaults', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: 'https://www.kali.org/get-kali/' },
  { name: 'Cybersecurity Field Notes', category: 'Cyber learning' as Category, price: '$12', period: '/ month', description: 'Plain-language tutorials covering networking, Linux, web security, and defensive thinking.', color: 'lime', detail: 'Tutorials / New lessons', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL },
  { name: 'CompTIA Study Paths', category: 'Cyber learning' as Category, price: '$12', period: '/ month', description: 'Study planning, revision notes, and practice structure for CompTIA learners.', color: 'green', detail: 'Free study setup / Updates included', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL },
  { name: 'Build a Cyber Lab', category: 'Cyber labs' as Category, price: '$12', period: '/ month', description: 'Step-by-step lab designs for isolated VMs, logging, vulnerable apps, and safe experiments.', color: 'blue', detail: 'Lab recipes / Network diagrams', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL },
  { name: 'OWASP Practice Pack', category: 'Practice sites' as Category, price: '$12', period: '/ month', description: 'Guided practice around intentionally vulnerable applications and web security concepts.', color: 'coral', detail: 'Safe targets / Guided labs', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: 'https://owasp.org/www-project-juice-shop/' },
  { name: 'Web Security Academy', category: 'Practice sites' as Category, price: '$12', period: '/ month', description: 'A learning path for practicing web vulnerabilities with responsible, authorized targets.', color: 'yellow', detail: 'Practice path / External labs', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: 'https://portswigger.net/web-security' },
];

const categories: Category[] = ['All', 'Productivity', 'Security', 'Tools', 'WordPress plugins', 'Linux distros', 'Cyber learning', 'Cyber labs', 'Practice sites', 'Creative tools'];

const Index = () => {
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailConsent, setEmailConsent] = useState(false);
  const [leadState, setLeadState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category;
    const matchesQuery = !query || `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query]);

  const addToCart = () => setCart((count) => count + 1);
  const purchaseProduct = (stripeUrl?: string) => {
    if (stripeUrl) {
      window.location.assign(paymentUrl);
      return;
    }
    addToCart();
  };

  const submitLead = async (event: FormEvent) => {
    event.preventDefault();
    setLeadState('sending');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent: emailConsent }),
      });

      if (!response.ok) throw new Error('Unable to subscribe');
      setLeadState('success');
      setEmail('');
    } catch {
      setLeadState('error');
    }
  };

  return <main className="storefront">
    <div className="announcement"><Sparkles size={13} /> Apps, labs, plugins, and cyber learning <ArrowRight size={13} /></div>
    <header className="store-header">
      <a className="brand" href="#top"><span className="brand-mark">A</span>appfolk</a>
      <nav className={menuOpen ? 'main-nav open' : 'main-nav'}><a href="#shop" onClick={() => setMenuOpen(false)}>Explore apps</a><Link to="/hosting" onClick={() => setMenuOpen(false)}>Hosting</Link><a href="#why" onClick={() => setMenuOpen(false)}>Our approach</a><a href="#support" onClick={() => setMenuOpen(false)}>Stay in the loop</a><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></nav>
      <div className="header-actions"><button className="icon-button" aria-label="Focus search" onClick={() => document.getElementById('search')?.focus()}><Search size={18} /></button><button className="bag-button" onClick={addToCart}><ShoppingBag size={17} /><span>Cart ({cart})</span></button><button className="menu-button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    </header>

    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow">A practical security membership</p><h1>Protect what<br /><em>you’re building.</em></h1><p className="hero-text">Get the tools, learning paths, and private workspace to ship with more confidence, without hiring a security team.</p><div className="hero-actions"><a className="button button-dark" href={paymentUrl}>Get All Access — $12 one time <ArrowRight size={16} /></a><a className="text-link" href="#shop">See what’s included <ArrowRight size={15} /></a></div><div className="hero-note"><span className="avatar-stack"><i>J</i><i>M</i><i>A</i></span><span>Built for freelancers and small teams</span></div></div><div className="hero-art"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-window"><div className="window-top"><span /><span /><span /></div><div className="window-lines"><b /><b /><b /><b /></div><div className="window-chip">PROTECT. LEARN. SHIP.</div></div><div className="art-sticker sticker-one">SHIP<br /><strong>SAFELY</strong></div><div className="art-sticker sticker-two">✦</div></div></section>
    <section className="value-strip"><div><strong>One membership</strong><span>Vaultline, LearnKit, and the tools that keep your work moving.</span></div><div><strong>Cancel anytime</strong><span>Start with one useful workflow. Keep only what earns its place.</span></div><div><strong>Made for small teams</strong><span>Practical protection without enterprise pricing or jargon.</span></div></section>
    <section className="collection" id="shop"><div className="section-heading"><div><p className="eyebrow">The app shelf</p><h2>Tools with<br /><em>good energy.</em></h2></div><p>One-time clarity, useful features, and pricing you can understand before you click buy.</p></div><div className="shop-toolbar"><div className="filters">{categories.map((item) => <button className={category === item ? 'filter active' : 'filter'} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-field"><Search size={16} /><input id="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps" /><ChevronDown size={15} /></label></div><div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.name}><div className={`product-visual ${product.color}`}><span className="product-symbol">{product.category === 'Security' ? '◈' : product.category === 'Creative tools' ? '✦' : '⌁'}</span>{product.featured && <span className="featured-tag">Most loved</span>}<div className="visual-grid" /></div><div className="product-info"><div><p className="product-category">{product.category}</p><h3>{product.name}</h3></div><span className="price">{product.price}<small>{product.period}</small></span></div><p className="product-description">{product.description}</p><div className="product-footer"><span className="product-detail"><Check size={14} /> {product.detail}</span><div className="product-actions">{product.appUrl && (product.appUrl.startsWith('/') ? <Link className="app-link" to={product.appUrl} aria-label={`Open ${product.name}`}><ExternalLink size={15} /></Link> : <a className="app-link" href={product.appUrl} target="_blank" rel="noreferrer" aria-label={`Open ${product.name}`}><ExternalLink size={15} /></a>)}<button className="add-button" aria-label={`Buy ${product.name}`} onClick={() => purchaseProduct(product.stripeUrl)}><ShoppingBag size={16} /></button></div></div></article>)}</div>{visibleProducts.length === 0 && <div className="empty-state">No apps match that search. Try a different phrase.</div>}</section>
    <section className="story" id="why"><div className="story-mark"><LayoutGrid size={27} /></div><div><p className="eyebrow">About appfolk</p><h2>Useful is a <em>feature.</em></h2><p>appfolk makes practical tools for freelancers, creators, and small teams who want to build with more confidence. We bring security checks, focused workspaces, and plain-language learning into one calm place.</p><p>Our approach is simple: make the next step clear, respect the people using the tools, and keep responsible practice at the center.</p><div className="promise-list"><span><Check size={15} /> Clear, responsible learning paths</span><span><Check size={15} /> Private tools with understandable controls</span><span><Check size={15} /> Authorized practice targets and honest guidance</span></div></div></section>
    <section className="newsletter" id="support"><p className="eyebrow">A useful first step</p><h2>Get the next practical move.</h2><p>One short email with security checks, useful tools, and new member drops. No inbox clutter.</p><form className="email-form" onSubmit={submitLead}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-label="Email address" required /><label className="email-consent"><input type="checkbox" checked={emailConsent} onChange={(event) => setEmailConsent(event.target.checked)} required /> I agree to receive appfolk updates and can unsubscribe anytime.</label><button className="button button-dark" disabled={leadState === 'sending'}>{leadState === 'sending' ? 'Joining...' : 'Join free' } <ArrowRight size={16} /></button></form>{leadState === 'success' && <p className="form-message">You’re on the list. Check your inbox soon.</p>}{leadState === 'error' && <p className="form-message">Couldn’t join right now. Please try again.</p>}</section>
    <footer><a className="brand" href="#top"><span className="brand-mark">A</span>appfolk</a><span>Small tools for a more considered day.</span><div><a href="#shop">Explore</a><a href="#why">About</a><a href="#support">Updates</a><Link to="/contact">Contact</Link></div></footer>
  </main>;
};

export default Index;