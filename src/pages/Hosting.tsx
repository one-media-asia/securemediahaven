import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, LayoutGrid, Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { hostingPlans } from '@/lib/hostingPlans';

type Category = 'All' | 'Launch' | 'Growth' | 'Business';
const categories: Category[] = ['All', 'Launch', 'Growth', 'Business'];

const Hosting = () => {
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [leadState, setLeadState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const visiblePlans = useMemo(() => hostingPlans.filter((plan) => {
    const matchesCategory = category === 'All' || plan.badge === category;
    const matchesQuery = !query || `${plan.name} ${plan.tagline} ${plan.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query]);
  const purchasePlan = (stripeUrl?: string) => {
    if (stripeUrl) { window.location.assign(stripeUrl); return; }
    window.alert('Please connect your Stripe product URL in your environment variables.');
  };
  const submitLead = async (event: FormEvent) => {
    event.preventDefault(); setLeadState('sending');
    try {
      const response = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (!response.ok) throw new Error('Unable to subscribe');
      setLeadState('success'); setEmail('');
    } catch { setLeadState('error'); }
  };
  return (
    <main className="storefront storefront-dark">
      <div className="announcement announcement-dark"><Sparkles size={13} /> Privacy-focused hosting for onion sites and tutorials <ArrowRight size={13} /></div>
      <header className="store-header store-header-dark">
        <div className="hosting-brand-group"><Link className="hosting-home-link" to="/">Back to home</Link><a className="brand" href="#top"><span className="brand-mark">T</span>Tingi Hosting</a></div>
        <nav className={menuOpen ? 'main-nav open' : 'main-nav'}>
          <a href="#plans" onClick={() => setMenuOpen(false)}>Plans</a>
          <a href="#buying-guide" onClick={() => setMenuOpen(false)}>Buying guide</a>
          <a href="#why" onClick={() => setMenuOpen(false)}>Why hosting</a>
          <a href="#support" onClick={() => setMenuOpen(false)}>Get updates</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Focus search" onClick={() => document.getElementById('search')?.focus()}><Search size={18} /></button>
          <button className="bag-button" onClick={() => purchasePlan(hostingPlans[0].stripeUrl)}><ShoppingBag size={17} /><span>Buy now</span></button>
          <button className="menu-button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Infrastructure for privacy-focused projects</p>
          <h1>Hosting for onion sites,<br /><em>guides, and tutorials.</em></h1>
          <p className="hero-text">Tingi helps you plan, launch, and maintain privacy-focused websites, lawful .onion services, and security tutorials with reliable infrastructure, backups, and practical guidance.</p>
          <div className="hero-actions">{hostingPlans[0].stripeUrl ? <a className="button button-dark" href={hostingPlans[0].stripeUrl}>Start Launch Hosting — $29/mo <ArrowRight size={16} /></a> : <a className="button button-dark" href="#plans">Choose Launch Hosting — $29/mo <ArrowRight size={16} /></a>}<a className="text-link" href="#plans">Compare plans <ArrowRight size={15} /></a></div>
          <div className="hero-note"><span className="avatar-stack"><i>J</i><i>M</i><i>A</i></span><span>Trusted by founders, agencies, and growth teams</span></div>
        </div>
        <div className="hero-art"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-window"><div className="window-top"><span /><span /><span /></div><div className="window-lines"><b /><b /><b /><b /></div><div className="window-chip">99.9% UPTIME</div></div><div className="art-sticker sticker-one">FAST<br /><strong>HOSTING</strong></div><div className="art-sticker sticker-two">✦</div></div>
      </section>
      <section className="value-strip value-strip-dark"><div><strong>99.9% uptime</strong><span>Performance-first hosting for businesses that cannot afford downtime.</span></div><div><strong>Stealth migration</strong><span>Move your site with minimal interruption and direct human support throughout.</span></div><div><strong>Private support</strong><span>Monitoring, security, and tutorials without the usual noise.</span></div></section>
      <section className="collection" id="plans">
        <div className="section-heading"><div><p className="eyebrow">Hosting plans</p><h2>Pick a plan<br /><em>that fits your pace.</em></h2></div><p>Every plan includes regular backups, monitoring, and a clean path for onion services, educational guides, and growing privacy projects.</p></div>
        <div className="shop-toolbar"><div className="filters">{categories.map((item) => <button className={category === item ? 'filter active' : 'filter'} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-field"><Search size={16} /><input id="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search plans" /><ChevronDown size={15} /></label></div>
        <div className="product-grid">{visiblePlans.map((plan) => <article className="product-card" key={plan.name}><div className={`product-visual ${plan.color}`}><span className="product-symbol">{plan.name === 'Business Hosting' ? '◈' : plan.name === 'Studio Hosting' ? '✦' : '⌁'}</span>{plan.featured && <span className="featured-tag">Most popular</span>}<div className="visual-grid" /></div><div className="product-info"><div><p className="product-category">{plan.badge}</p><h3>{plan.name}</h3></div><span className="price">{plan.price}<small>{plan.period}</small></span></div><p className="product-description">{plan.description}</p><div className="product-footer"><span className="product-detail"><Check size={14} /> {plan.tagline}</span><button className="add-button" aria-label={`Buy ${plan.name}`} onClick={() => purchasePlan(plan.stripeUrl)}><ShoppingBag size={16} /></button></div></article>)}</div>
      </section>
      <section className="buying-guide" id="buying-guide"><div className="section-heading"><div><p className="eyebrow">How to buy</p><h2>Choose a plan,<br /><em>keep your keys private.</em></h2></div><p>Use the secure checkout link for your plan. Tingi will never ask for a wallet private key, seed phrase, password, or secret token.</p></div><div className="guide-grid"><article className="guide-step"><span>01</span><h3>Choose a plan</h3><p>Open Plans, compare the features, and select the hosting tier that fits your site or lawful onion service.</p></article><article className="guide-step"><span>02</span><h3>Open checkout</h3><p>Select Choose plan or Buy now. You will be sent to the configured payment provider to complete your purchase.</p></article><article className="guide-step"><span>03</span><h3>Confirm access</h3><p>Keep your order confirmation and follow the onboarding instructions. Only share public wallet addresses when a supported payment method requires one.</p></article></div><div className="key-warning"><strong>Security rule:</strong> never paste a private key, seed phrase, recovery phrase, password, or API secret into a checkout form or support chat. If a payment needs a key, use only the provider's official signing prompt and verify the domain first.</div></section>
      <section className="story" id="why"><div className="story-mark"><LayoutGrid size={27} /></div><div><p className="eyebrow">Why brands choose Tingi</p><h2>Simple hosting,<br /><em>serious performance.</em></h2><p>We combine resilient infrastructure, live monitoring, and practical tutorials so your public site or lawful onion service stays stable, protected, and easier to manage.</p><div className="promise-list"><span><Check size={15} /> Managed hosting with daily backups</span><span><Check size={15} /> Free SSL, CDN, and security hardening</span><span><Check size={15} /> Direct support for launches and upgrades</span></div></div></section>
      <section className="newsletter" id="support"><p className="eyebrow">A helpful first step</p><h2>Get the next hosting update.</h2><p>One short email with launch offers, onion-site setup guidance, and practical security tutorials. No clutter.</p><form className="email-form" onSubmit={submitLead}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-label="Email address" required /><button className="button button-dark" disabled={leadState === 'sending'}>{leadState === 'sending' ? 'Joining...' : 'Join free'} <ArrowRight size={16} /></button></form>{leadState === 'success' && <p className="form-message">You’re on the list. Watch your inbox for launch updates.</p>}{leadState === 'error' && <p className="form-message">We couldn’t sign you up right now. Please try again.</p>}</section>
      <footer><div className="hosting-footer-brand"><Link className="hosting-home-link" to="/">Back to home</Link><a className="brand" href="#top"><span className="brand-mark">T</span>Tingi Hosting</a></div><span>Privacy-focused infrastructure for sites, onion services, and tutorials.</span><div><a href="#plans">Plans</a><a href="#buying-guide">Buying guide</a><a href="#why">Why us</a><a href="#support">Updates</a></div></footer>
    </main>
  );
};

export default Hosting;
