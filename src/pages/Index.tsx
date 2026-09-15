import { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ExternalLink, LayoutGrid, Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';

type Category = 'All' | 'Productivity' | 'Security' | 'Tools' | 'Creative tools';
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
  { name: 'Scanner', category: 'Tools' as Category, price: '$12', period: '/ month', description: 'A clear first look at risks, gaps, and opportunities to protect your work.', color: 'blue', detail: 'Included with All Access', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: 'https://scanner.onemedia.asia' },
  { name: 'LearnKit', category: 'Productivity' as Category, price: '$12', period: '/ month', description: 'A practical repository of lessons, guides, templates, and notes for building useful skills.', color: 'lime', detail: 'Included with All Access', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL, appUrl: '/learnkit' },
  { name: 'Signal Studio', category: 'Creative tools' as Category, price: '$12', period: '/ month', description: 'Turn rough ideas into polished social content in minutes.', color: 'yellow', detail: 'Included with All Access', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL },
  { name: 'Patchwork', category: 'Creative tools' as Category, price: '$12', period: '/ month', description: 'A visual workspace for shaping your best ideas together.', color: 'purple', detail: 'Included with All Access', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL },
  { name: 'Nightwatch', category: 'Security' as Category, price: '$12', period: '/ month', description: 'Quiet, continuous monitoring for the things you ship.', color: 'green', detail: 'Included with All Access', stripeUrl: import.meta.env.VITE_STRIPE_ALL_ACCESS_URL || import.meta.env.VITE_STRIPE_LEARNKIT_URL },
];

const categories: Category[] = ['All', 'Productivity', 'Security', 'Tools', 'Creative tools'];

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
    <div className="announcement"><Sparkles size={13} /> Independent apps for ambitious people <ArrowRight size={13} /></div>
    <header className="store-header">
      <a className="brand" href="#top"><span className="brand-mark">A</span>appfolk</a>
      <nav className={menuOpen ? 'main-nav open' : 'main-nav'}><a href="#shop" onClick={() => setMenuOpen(false)}>Explore apps</a><a href="#why" onClick={() => setMenuOpen(false)}>Our approach</a><a href="#support" onClick={() => setMenuOpen(false)}>Stay in the loop</a></nav>
      <div className="header-actions"><button className="icon-button" aria-label="Focus search" onClick={() => document.getElementById('search')?.focus()}><Search size={18} /></button><button className="bag-button" onClick={addToCart}><ShoppingBag size={17} /><span>Cart ({cart})</span></button><button className="menu-button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    </header>

    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow">The independent app shelf</p><h1>Small apps.<br /><em>Big momentum.</em></h1><p className="hero-text">Thoughtful software for getting clear, making things, and doing your best work without the bloat.</p><a className="button button-dark" href="#shop">Find your next app <ArrowRight size={16} /></a><div className="hero-note"><span className="avatar-stack"><i>J</i><i>M</i><i>A</i></span><span>Loved by 8,000+ curious makers</span></div></div><div className="hero-art"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-window"><div className="window-top"><span /><span /><span /></div><div className="window-lines"><b /><b /><b /><b /></div><div className="window-chip">MAKE ROOM FOR GOOD WORK</div></div><div className="art-sticker sticker-one">LESS<br /><strong>NOISE</strong></div><div className="art-sticker sticker-two">✦</div></div></section>
    <section className="collection" id="shop"><div className="section-heading"><div><p className="eyebrow">The app shelf</p><h2>Tools with<br /><em>good energy.</em></h2></div><p>One-time clarity, useful features, and pricing you can understand before you click buy.</p></div><div className="shop-toolbar"><div className="filters">{categories.map((item) => <button className={category === item ? 'filter active' : 'filter'} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-field"><Search size={16} /><input id="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps" /><ChevronDown size={15} /></label></div><div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.name}><div className={`product-visual ${product.color}`}><span className="product-symbol">{product.category === 'Security' ? '◈' : product.category === 'Creative tools' ? '✦' : '⌁'}</span>{product.featured && <span className="featured-tag">Most loved</span>}<div className="visual-grid" /></div><div className="product-info"><div><p className="product-category">{product.category}</p><h3>{product.name}</h3></div><span className="price">{product.price}<small>{product.period}</small></span></div><p className="product-description">{product.description}</p><div className="product-footer"><span className="product-detail"><Check size={14} /> {product.detail}</span><div className="product-actions">{product.appUrl && (product.appUrl.startsWith('/') ? <Link className="app-link" to={product.appUrl} aria-label={`Open ${product.name}`}><ExternalLink size={15} /></Link> : <a className="app-link" href={product.appUrl} target="_blank" rel="noreferrer" aria-label={`Open ${product.name}`}><ExternalLink size={15} /></a>)}<button className="add-button" aria-label={`Buy ${product.name}`} onClick={() => purchaseProduct(product.stripeUrl)}><ShoppingBag size={16} /></button></div></div></article>)}</div>{visibleProducts.length === 0 && <div className="empty-state">No apps match that search. Try a different phrase.</div>}</section>
  <section className="collection" id="shop"><div className="section-heading"><div><p className="eyebrow">The app shelf</p><h2>Tools with<br /><em>good energy.</em></h2></div><p>One-time clarity, useful features, and pricing you can understand before you click buy.</p></div><div className="shop-toolbar"><div className="filters">{categories.map((item) => <button className={category === item ? 'filter active' : 'filter'} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-field"><Search size={16} /><input id="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps" /><ChevronDown size={15} /></label></div><div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.name}><div className={`product-visual ${product.color}`}><span className="product-symbol">{product.category === 'Security' ? '◈' : product.category === 'Creative tools' ? '✦' : product.category === 'Tools' ? '+' : '⌁'}</span>{product.featured && <span className="featured-tag">Most loved</span>}<div className="visual-grid" /></div><div className="product-info"><div><p className="product-category">{product.category}</p><h3>{product.name}</h3></div><span className="price">{product.price}<small>{product.period}</small></span></div><p className="product-description">{product.description}</p><div className="product-footer"><span className="product-detail"><Check size={14} /> {product.detail}</span><div className="product-actions">{product.appUrl && (product.appUrl.startsWith('/') ? <Link className="app-link internal-app-link" to={product.appUrl} aria-label={`Open ${product.name}`}>Open app <ExternalLink size={15} /></Link> : <a className="app-link" href={product.appUrl} target="_blank" rel="noreferrer" aria-label={`Open ${product.name}`}><ExternalLink size={15} /></a>)}<button className="add-button" aria-label={`Buy ${product.name}`} onClick={() => purchaseProduct(product.stripeUrl)}><ShoppingBag size={16} /></button></div></div></article>)}</div>{visibleProducts.length === 0 && <div className="empty-state">No apps match that search. Try a different phrase.</div>}</section>

    <section className="story" id="why"><div className="story-mark"><LayoutGrid size={27} /></div><div><p className="eyebrow">The appfolk filter</p><h2>Useful is a <em>feature.</em></h2><p>We look for software that earns its place on your screen: focused, considered, and made by people who care about the details.</p><div className="promise-list"><span><Check size={15} /> No dark patterns or surprise fees</span><span><Check size={15} /> Apps that respect your attention</span><span><Check size={15} /> Human support when it matters</span></div></div></section>
    <section className="newsletter" id="support"><p className="eyebrow">A note from the shelf</p><h2>Good apps, occasionally.</h2><p>New finds and useful ideas, delivered without the inbox clutter.</p><div className="email-form"><input type="email" placeholder="you@example.com" aria-label="Email address" /><button className="button button-dark">Join the list <ArrowRight size={16} /></button></div></section>
    <footer><a className="brand" href="#top"><span className="brand-mark">A</span>appfolk</a><span>Small tools for a more considered day.</span><div><a href="#shop">Explore</a><a href="#why">About</a><a href="#support">Updates</a></div></footer>
  </main>;
};

export default Index;