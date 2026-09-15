import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, Heart, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

type Exercise = { title: string; type: string; topic: string; duration: string; description: string; accent: string };
const topics = ['All', 'Reflection', 'Routines', 'Confidence', 'Rest', 'Stress', 'Relationships', 'Focus', 'Motivation'];
const exercises: Exercise[] = [
  { title: 'A gentler morning', type: 'Practice', topic: 'Routines', duration: '8 min', description: 'Start the day with less urgency and one clear intention.', accent: 'selfhelp-coral' },
  { title: 'Name what you need', type: 'Journal', topic: 'Reflection', duration: '10 min', description: 'A simple prompt for getting honest about what would help right now.', accent: 'selfhelp-yellow' },
  { title: 'The confidence reset', type: 'Guide', topic: 'Confidence', duration: '12 min', description: 'Move from self-doubt to one small action you can take today.', accent: 'selfhelp-mint' },
  { title: 'An evening release', type: 'Practice', topic: 'Rest', duration: '7 min', description: 'Close the day by putting down what does not need to follow you.', accent: 'selfhelp-blue' },
  { title: 'Make space for progress', type: 'Journal', topic: 'Reflection', duration: '15 min', description: 'Notice what is working and choose what deserves more room.', accent: 'selfhelp-purple' },
  { title: 'A routine that fits', type: 'Guide', topic: 'Routines', duration: '18 min', description: 'Design a small routine around your actual life, not an ideal one.', accent: 'selfhelp-green' },
  { title: 'The pressure pause', type: 'Practice', topic: 'Stress', duration: '6 min', description: 'Create enough space between pressure and reaction to choose your next move.', accent: 'selfhelp-blue' },
  { title: 'Say it more clearly', type: 'Guide', topic: 'Relationships', duration: '14 min', description: 'Prepare for a difficult conversation with honesty, care, and a clear request.', accent: 'selfhelp-coral' },
  { title: 'The single-task reset', type: 'Practice', topic: 'Focus', duration: '9 min', description: 'Return to one meaningful task when your attention is scattered.', accent: 'selfhelp-yellow' },
  { title: 'Start before you feel ready', type: 'Journal', topic: 'Motivation', duration: '11 min', description: 'Turn a vague intention into one small action you can complete today.', accent: 'selfhelp-mint' },
];

const SelfHelp = () => {
  const [topic, setTopic] = useState('All');
  const [query, setQuery] = useState('');
  const visibleExercises = useMemo(() => exercises.filter((exercise) => {
    const matchesTopic = topic === 'All' || exercise.topic === topic;
    const matchesQuery = !query || `${exercise.title} ${exercise.topic} ${exercise.type}`.toLowerCase().includes(query.toLowerCase());
    return matchesTopic && matchesQuery;
  }), [topic, query]);

  return <main className="selfhelp-page">
    <header className="selfhelp-header"><Link className="selfhelp-back" to="/"><ArrowLeft size={16} /> appfolk</Link><div className="selfhelp-logo"><span><Heart size={16} /></span> Self Help</div><button className="selfhelp-account">My space <ArrowRight size={15} /></button></header>
    <section className="selfhelp-hero"><div><p className="eyebrow">A kinder place to begin</p><h1>Make room<br /><em>for yourself.</em></h1><p className="selfhelp-intro">Small prompts, grounded practices, and quiet support for becoming more at home in your own life.</p><p className="selfhelp-includes"><strong>Included exercises:</strong> reflection journals, daily routines, confidence guides, rest practices, stress pauses, relationship prompts, focus resets, and motivation starters.</p><div className="selfhelp-stats"><span><strong>18</strong> practices</span><span><strong>4</strong> focus areas</span><span><strong>1</strong> next step</span></div></div><div className="selfhelp-feature"><div className="selfhelp-feature-icon"><Sparkles size={23} /></div><p className="selfhelp-kicker">Start here</p><h2>What do you need today?</h2><p>A short check-in to help you meet this moment with a little more clarity.</p></div></section>
    <section className="selfhelp-library"><div className="selfhelp-section-head"><div><p className="eyebrow">The toolkit</p><h2>Something useful<br /><em>for today.</em></h2></div><label className="selfhelp-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search practices" aria-label="Search practices" /></label></div><div className="selfhelp-topics">{topics.map((item) => <button key={item} className={topic === item ? 'selfhelp-topic active' : 'selfhelp-topic'} onClick={() => setTopic(item)}>{item}</button>)}</div><div className="selfhelp-grid">{visibleExercises.map((exercise) => <article className="selfhelp-card" key={exercise.title}><div className={`selfhelp-card-art ${exercise.accent}`}><Heart size={25} /><span>{exercise.type}</span></div><div className="selfhelp-card-body"><div className="selfhelp-meta"><span>{exercise.topic}</span><span><Clock3 size={13} /> {exercise.duration}</span></div><h3>{exercise.title}</h3><p>{exercise.description}</p></div></article>)}</div>{visibleExercises.length === 0 && <div className="selfhelp-empty">No practices match that search yet.</div>}</section>
    <section className="selfhelp-embedded"><div className="selfhelp-embedded-heading"><div><p className="eyebrow">Live coaching space</p><h2>Self Help, <em>inside.</em></h2></div><p>Use the live Self Help experience without leaving this page.</p></div><div className="selfhelp-embedded-frame"><iframe src="https://coach.onemedia.asia" title="Self Help live coaching space" loading="lazy" /></div></section>
    <section className="selfhelp-principles"><div className="selfhelp-principles-mark"><Check size={27} /></div><div><p className="eyebrow">The Self Help approach</p><h2>Small steps.<br /><em>More self-trust.</em></h2><p>You do not need to fix everything today. Self Help gives you a calm place to notice what is true, choose what matters, and take the next kind step.</p></div></section>
    <footer className="selfhelp-footer"><span>Self Help by appfolk</span><Link to="/">Back to appfolk <ArrowRight size={14} /></Link></footer>
  </main>;
};

export default SelfHelp;
