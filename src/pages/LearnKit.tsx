import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, CreditCard, FileText, Lock, Search, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paymentUrl } from '@/lib/payment';

type Resource = {
  title: string;
  type: string;
  topic: string;
  duration: string;
  description: string;
  accent: string;
  preview: boolean;
  intro: string;
  lessons: string[];
};

const topics = ['All', 'Build', 'Design', 'Business', 'Personal growth'];

const resources: Resource[] = [
  { title: 'Build your first useful website', type: 'Guide', topic: 'Build', duration: '24 min', description: 'A practical path from blank page to a simple site people can actually use.', accent: 'learn-coral', preview: true, intro: 'A website does not need to be huge to be useful. Start with one person, one problem, and one clear next step.', lessons: ['Choose one person to help', 'Write the smallest useful promise', 'Build a page that earns the next click'] },
  { title: 'The calm launch checklist', type: 'Template', topic: 'Business', duration: '12 min', description: 'A repeatable checklist for shipping a project without dropping the important details.', accent: 'learn-yellow', preview: true, intro: 'A good launch is a sequence of small decisions made visible before they become urgent.', lessons: ['Define the launch moment', 'Check the experience from the outside', 'Tell the right people clearly'] },
  { title: 'Design with a point of view', type: 'Course', topic: 'Design', duration: '4 lessons', description: 'Learn how to make stronger visual decisions with less decoration and more intent.', accent: 'learn-mint', preview: false, intro: 'A four-part course for turning taste into decisions your audience can feel.', lessons: ['Find the feeling', 'Build a visual vocabulary', 'Edit toward clarity', 'Make the system repeatable'] },
  { title: 'A better weekly review', type: 'Guide', topic: 'Personal growth', duration: '15 min', description: 'Turn scattered thoughts into a gentle, useful plan for the week ahead.', accent: 'learn-blue', preview: false, intro: 'A short weekly reset for noticing what mattered, what moved, and what needs care next.', lessons: ['Look back without judgment', 'Name the open loops', 'Choose three meaningful moves'] },
  { title: 'Content that earns attention', type: 'Course', topic: 'Business', duration: '6 lessons', description: 'A compact framework for writing clear content that helps people decide.', accent: 'learn-purple', preview: false, intro: 'Stop writing to fill space. Write to help one specific person understand what to do next.', lessons: ['Start with the reader', 'Make the problem concrete', 'Give the idea a shape', 'Use proof with restraint', 'Write the next step', 'Edit for signal'] },
  { title: 'The tiny project planner', type: 'Template', topic: 'Build', duration: '8 min', description: 'Keep small projects moving with one page for scope, tasks, and next steps.', accent: 'learn-green', preview: false, intro: 'A one-page planning ritual for projects that deserve momentum without a mountain of process.', lessons: ['Set the finish line', 'List only the real tasks', 'Schedule the first visible win'] },
];

const LearnKit = () => {
  const [topic, setTopic] = useState('All');
  const [query, setQuery] = useState('');
  const [membershipOpen, setMembershipOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const visibleResources = useMemo(() => resources.filter((resource) => {
    const matchesTopic = topic === 'All' || resource.topic === topic;
    const matchesQuery = !query || `${resource.title} ${resource.topic} ${resource.type}`.toLowerCase().includes(query.toLowerCase());
    return matchesTopic && matchesQuery;
  }), [topic, query]);
  const checkoutUrl = paymentUrl;
  const openMembership = () => setMembershipOpen(true);
  const openResource = (resource: Resource) => resource.preview ? setSelectedResource(resource) : openMembership();

  return (
    <main className="learnkit-page">
      <header className="learnkit-header">
        <Link className="learnkit-back" to="/"><ArrowLeft size={16} /> appfolk</Link>
        <div className="learnkit-logo"><span className="learnkit-logo-mark"><BookOpen size={16} /></span> LearnKit</div>
        <button className="learnkit-account" onClick={openMembership}>Member access <ArrowRight size={15} /></button>
      </header>

      <section className="learnkit-hero">
        <div>
          <p className="eyebrow">A practical learning repository</p>
          <h1>Keep learning.<br /><em>Keep moving.</em></h1>
          <p className="learnkit-intro">Useful lessons, guides, and templates for building a more capable and considered life.</p>
          <div className="learnkit-stats"><span><strong>24</strong> resources</span><span><strong>4</strong> learning paths</span><span><strong>∞</strong> curiosity</span></div>
        </div>
        <div className="learnkit-feature"><div className="learnkit-feature-icon"><Sparkles size={23} /></div><p className="learnkit-kicker">Start here</p><h2>Build your first useful website</h2><p>Everything you need to go from idea to a clear, confident first launch.</p><button className="learnkit-feature-button" onClick={() => openMembership()}>Begin path <ArrowRight size={16} /></button></div>
      </section>

      <section className="learnkit-library" id="library">
        <div className="learnkit-section-head"><div><p className="eyebrow">The library</p><h2>Find your next<br /><em>good idea.</em></h2></div><label className="learnkit-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources" aria-label="Search resources" /></label></div>
        <div className="learnkit-topics">{topics.map((item) => <button key={item} className={topic === item ? 'learnkit-topic active' : 'learnkit-topic'} onClick={() => setTopic(item)}>{item}</button>)}</div>
        <div className="learnkit-resource-grid">{visibleResources.map((resource) => <article className="learnkit-resource" key={resource.title}><div className={`learnkit-resource-art ${resource.accent}`}><FileText size={26} />{!resource.preview && <span className="learnkit-lock-tag"><Lock size={11} /> Member</span>}<span>{resource.type}</span></div><div className="learnkit-resource-body"><div className="learnkit-resource-meta"><span>{resource.topic}</span><span><Clock3 size={13} /> {resource.duration}</span></div><h3>{resource.title}</h3><p>{resource.description}</p><button className="learnkit-read" onClick={() => openResource(resource)}>{resource.preview ? 'Preview resource' : 'Unlock resource'} <ArrowRight size={14} /></button></div></article>)}</div>
        {visibleResources.length === 0 && <div className="learnkit-empty">No resources match that search yet.</div>}
      </section>

      <section className="learnkit-embedded">
        <div className="learnkit-embedded-heading"><div><p className="eyebrow">Live repository</p><h2>LearnKit, <em>inside.</em></h2></div><div className="learnkit-embedded-note"><p>Browse the live LearnKit repository without leaving this page.</p><a href="https://learn.onemedia.asia" target="_blank" rel="noreferrer">Open LearnKit directly <ArrowRight size={14} /></a></div></div>
        <div className="learnkit-embedded-frame"><iframe src="https://learn.onemedia.asia" title="LearnKit live repository" loading="lazy" /></div>
      </section>

      <section className="learnkit-membership"><div><p className="eyebrow">LearnKit access</p><h2>Give your curiosity<br /><em>a place to land.</em></h2><p>Unlock the full repository, learning paths, templates, and new resources with one All Access purchase.</p></div><button className="learnkit-membership-button" onClick={openMembership}><CreditCard size={16} /> Get access for $12 one time</button></section>

      <section className="learnkit-principles"><div className="learnkit-principles-mark"><Check size={27} /></div><div><p className="eyebrow">How LearnKit works</p><h2>Small lessons.<br /><em>Real progress.</em></h2><p>LearnKit is built for momentum, not guilt. Pick one useful thing, give it your attention, and leave with something you can use.</p></div></section>
      <footer className="learnkit-footer"><span>LearnKit by appfolk</span><Link to="/">Back to appfolk <ArrowRight size={14} /></Link></footer>
      {selectedResource && <div className="learnkit-modal-backdrop" role="presentation" onClick={() => setSelectedResource(null)}><section className="learnkit-modal learnkit-resource-modal" role="dialog" aria-modal="true" aria-labelledby="resource-title" onClick={(event) => event.stopPropagation()}><button className="learnkit-modal-close" aria-label="Close resource" onClick={() => setSelectedResource(null)}><X size={18} /></button><p className="eyebrow">{selectedResource.type} / {selectedResource.topic}</p><h2 id="resource-title">{selectedResource.title}</h2><p>{selectedResource.intro}</p><div className="learnkit-lesson-list">{selectedResource.lessons.map((lesson, index) => <div key={lesson}><span>{String(index + 1).padStart(2, '0')}</span>{lesson}<Check size={15} /></div>)}</div><button className="learnkit-checkout" onClick={() => setSelectedResource(null)}>Mark preview complete <Check size={16} /></button><small>Preview content is free. Get All Access to unlock every lesson, template, and learning path for one payment.</small></section></div>}
      {membershipOpen && <div className="learnkit-modal-backdrop" role="presentation" onClick={() => setMembershipOpen(false)}><section className="learnkit-modal" role="dialog" aria-modal="true" aria-labelledby="membership-title" onClick={(event) => event.stopPropagation()}><button className="learnkit-modal-close" aria-label="Close membership dialog" onClick={() => setMembershipOpen(false)}><X size={18} /></button><div className="learnkit-modal-icon"><CreditCard size={20} /></div><p className="eyebrow">Full access</p><h2 id="membership-title">Learn at your own pace.</h2><p>Get All Access for one payment of $12 and unlock the complete repository.</p>{checkoutUrl ? <a className="learnkit-checkout" href={checkoutUrl}>Continue to secure checkout <ArrowRight size={16} /></a> : <p className="learnkit-checkout-missing">Checkout is not configured yet.</p>}<small>Payment is handled securely by Stripe. Account authentication should be connected before production launch.</small></section></div>}
    </main>
  );
};

export default LearnKit;
