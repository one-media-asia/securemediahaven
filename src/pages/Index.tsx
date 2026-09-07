import { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ExternalLink, LayoutGrid, Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react';

type Category = 'All' | 'Hosting' | 'Domains' | 'Learning apps';
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
  { name: 'Launch hosting', category: 'Hosting' as Category, price: '$8', period: '/ month', description: 'Fast, managed hosting for your first serious website.', color: 'coral', detail: '100 GB SSD / Free SSL', stripeUrl: import.meta.env.VITE_STRIPE_LAUNCH_HOSTING_URL },
  { name: 'Studio hosting', category: 'Hosting' as Category, price: '$18', period: '/ month', description: 'More room for busy sites, stores, and growing teams.', color: 'blue', detail: '500 GB SSD / Daily backups', featured: true, stripeUrl: import.meta.env.VITE_STRIPE_STUDIO_HOSTING_URL },
  { name: 'Your .studio domain', category: 'Domains' as Category, price: '$24', period: '/ year', description: 'A memorable home for your work, portfolio, or next idea.', color: 'lime', detail: 'Private registration included', stripeUrl: import.meta.env.VITE_STRIPE_STUDIO_DOMAIN_URL },
  { name: 'LearnKit', category: 'Learning apps' as Category, price: '$12', period: '/ month', description: 'Short, focused courses that help you build useful skills.', color: 'yellow', detail: 'New lessons every week', stripeUrl: import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: 'https://learn.onemedia.asia' },
  { name: 'Focus school', category: 'Learning apps' as Category, price: '$79', period: '/ year', description: 'A full library for learning code, design, and business.', color: 'purple', detail: 'All courses / Lifetime notes', stripeUrl: import.meta.env.VITE_STRIPE_FOCUS_SCHOOL_URL },
  { name: 'Domain + hosting', category: 'Domains' as Category, price: '$29', period: '/ month', description: 'Everything you need to launch, bundled in one calm place.', color: 'green', detail: 'Domain included / SSL ready', stripeUrl: import.meta.env.VITE_STRIPE_DOMAIN_HOSTING_URL },
];

const categories: Category[] = ['All', 'Hosting', 'Domains', 'Learning apps'];

const Index = () => {
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category;
    const matchesQuery = !query || `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query]);

  const addToCart = () => setCart((count) => count + 1);
  const purchaseProduct = (stripeUrl?: string) => {
    if (stripeUrl) {
      window.location.assign(stripeUrl);
      return;
    }
    addToCart();
  };

  return <main className="storefront">
    <div className="announcement"><Sparkles size={13} /> Build something worth visiting <ArrowRight size={13} /></div>
    <header className="store-header">
      <a className="brand" href="#top"><span className="brand-mark">m</span>morrow</a>
      <nav className={menuOpen ? 'main-nav open' : 'main-nav'}><a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a><a href="#why" onClick={() => setMenuOpen(false)}>Why us</a><a href="#support" onClick={() => setMenuOpen(false)}>Support</a></nav>
      <div className="header-actions"><button className="icon-button" aria-label="Focus search" onClick={() => document.getElementById('search')?.focus()}><Search size={18} /></button><button className="bag-button" onClick={addToCart}><ShoppingBag size={17} /><span>Bag ({cart})</span></button><button className="menu-button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    </header>

    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow">Your corner of the internet</p><h1>Start small.<br /><em>Make it matter.</em></h1><p className="hero-text">Hosting, domains, and learning tools for people building their next thing.</p><a className="button button-dark" href="#shop">Browse the shop <ArrowRight size={16} /></a><div className="hero-note"><span className="avatar-stack"><i>J</i><i>M</i><i>A</i></span><span>Trusted by 12,000+ builders</span></div></div><div className="hero-art"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-window"><div className="window-top"><span /><span /><span /></div><div className="window-lines"><b /><b /><b /><b /></div><div className="window-chip">MAKE SPACE</div></div><div className="art-sticker sticker-one">HOST<br /><strong>YOUR IDEA</strong></div><div className="art-sticker sticker-two">✦</div></div></section>

    <section className="collection" id="shop"><div className="section-heading"><div><p className="eyebrow">The shop</p><h2>Everything to<br /><em>get going.</em></h2></div><p>Clear pricing, useful tools, and a human on the other end when you need one.</p></div><div className="shop-toolbar"><div className="filters">{categories.map((item) => <button className={category === item ? 'filter active' : 'filter'} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-field"><Search size={16} /><input id="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the shop" /><ChevronDown size={15} /></label></div><div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.name}><div className={`product-visual ${product.color}`}><span className="product-symbol">{product.category === 'Hosting' ? '⌁' : product.category === 'Domains' ? '.com' : 'Aa'}</span>{product.featured && <span className="featured-tag">Popular</span>}<div className="visual-grid" /></div><div className="product-info"><div><p className="product-category">{product.category}</p><h3>{product.name}</h3></div><span className="price">{product.price}<small>{product.period}</small></span></div><p className="product-description">{product.description}</p><div className="product-footer"><span className="product-detail"><Check size={14} /> {product.detail}</span><div className="product-actions">{product.appUrl && <a className="app-link" href={product.appUrl} target="_blank" rel="noreferrer" aria-label={`Open ${product.name}`}><ExternalLink size={15} /></a>}<button className="add-button" aria-label={`Buy ${product.name}`} onClick={() => purchaseProduct(product.stripeUrl)}><ShoppingBag size={16} /></button></div></div></article>)}</div>{visibleProducts.length === 0 && <div className="empty-state">No products match that search. Try a different phrase.</div>}</section>

    <section className="story" id="why"><div className="story-mark"><LayoutGrid size={27} /></div><div><p className="eyebrow">The Morrow promise</p><h2>Useful is a <em>feature.</em></h2><p>We make the essentials feel less complicated. No surprise fees, confusing dashboards, or endless upsells. Just reliable services that respect your time.</p><div className="promise-list"><span><Check size={15} /> Simple pricing, shown upfront</span><span><Check size={15} /> Setup help from real people</span><span><Check size={15} /> Cancel or change whenever you need</span></div></div></section>
    <section className="newsletter" id="support"><p className="eyebrow">A note from the shop</p><h2>More signal. Less noise.</h2><p>New products, useful guides, and no inbox clutter.</p><div className="email-form"><input type="email" placeholder="you@example.com" aria-label="Email address" /><button className="button button-dark">Sign me up <ArrowRight size={16} /></button></div></section>
    <footer><a className="brand" href="#top"><span className="brand-mark">m</span>morrow</a><span>Tools for building a more considered web.</span><div><a href="#shop">Shop</a><a href="#why">About</a><a href="#support">Contact</a></div></footer>
  </main>;
};

export default Index;