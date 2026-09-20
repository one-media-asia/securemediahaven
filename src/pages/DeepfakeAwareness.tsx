import { Check, CirclePlay, Eye, LockKeyhole, Pause, ShieldAlert, ShieldCheck, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentUrl } from '@/lib/payment';

type Scenario = { title: string; context: string; color: string; cue: string };

const scenarios: Scenario[] = [
  { title: 'The urgent executive', context: 'A familiar leader appears to request an unusual payment.', color: 'deepfake-coral', cue: 'Authority + urgency' },
  { title: 'The family emergency', context: 'A loved one appears to ask for immediate help.', color: 'deepfake-yellow', cue: 'Emotion + pressure' },
  { title: 'The breaking update', context: 'A realistic presenter makes a surprising claim.', color: 'deepfake-mint', cue: 'Context + source' },
];

const DeepfakeAwareness = () => {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hasAccess, setHasAccess] = useState(() => sessionStorage.getItem('all-access-paid') === 'true');
  const scenario = scenarios[selected];
  const checkoutUrl = paymentUrl;
  const openExternalTool = () => {
    if (!hasAccess) {
      if (checkoutUrl) window.location.assign(checkoutUrl);
      return;
    }
    window.open('https://free.deepfake.adaptivesecurity.com/?_gl=1*b65wmh*_gcl_au*MTU5MzcyNTM3OC4xNzg5NjUwMzkxLjIxMzQyNzI2NjMuMTc4OTY1MDgzOC4xNzg5NjUwODM3Ljc4OTM3NzgxLjE3ODk2NTA4MzguMTc4OTY1MDgzNw..', '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="deepfake-page">
      <header className="deepfake-header">
        <Link className="deepfake-back" to="/"><span>A</span> appfolk</Link>
        <div className="deepfake-logo"><ShieldCheck size={17} /> Reality Check</div>
        <span className="deepfake-private"><LockKeyhole size={13} /> Safe demo</span>
      </header>

      <section className="deepfake-hero">
        <div>
          <p className="eyebrow">Synthetic media awareness</p>
          <h1>Looks real.<br /><em>Think twice.</em></h1>
          <p>Explore a fictional deepfake scenario and practice the checks that help you slow down, verify the source, and protect yourself from social engineering.</p>
          <div className="deepfake-hero-note"><Check size={15} /> No uploads. No real people. No generated media.</div>
        </div>
        <div className="deepfake-hero-art"><div className="deepfake-orb" /><div className="deepfake-face"><span /><i /><b /></div><div className="deepfake-scan-line" /><div className="deepfake-art-label">FICTIONAL SAMPLE / TRAINING ONLY</div></div>
      </section>

      <section className="deepfake-scenarios">
        <div className="deepfake-section-heading"><div><p className="eyebrow">Choose a scenario</p><h2>What would<br /><em>you believe?</em></h2></div><p>Each example is fictional. Look for pressure, missing context, and requests that bypass normal process.</p></div>
        <div className="deepfake-scenario-grid">{scenarios.map((item, index) => <button className={selected === index ? `deepfake-scenario active ${item.color}` : `deepfake-scenario ${item.color}`} key={item.title} onClick={() => { setSelected(index); setPlaying(false); }}><span>0{index + 1}</span><strong>{item.title}</strong><small>{item.context}</small><em>{item.cue}</em></button>)}</div>
      </section>

      <section className="deepfake-lab">
        <div className="deepfake-lab-heading"><div><p className="eyebrow">Scenario 0{selected + 1}</p><h2>{scenario.title}</h2><p>{scenario.context}</p></div><span className="deepfake-fiction-badge"><Eye size={14} /> Fictional sample</span></div>
        <div className="deepfake-stage"><div className="deepfake-stage-screen"><div className="deepfake-stage-grid" /><div className="deepfake-avatar"><div className="deepfake-avatar-head"><span /><i /><b /></div><div className="deepfake-avatar-body" /></div><div className="deepfake-stage-caption">{playing ? 'SIMULATION PLAYING' : 'READY TO REVIEW'}</div><button className="deepfake-play" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause simulation' : 'Play simulation'}>{playing ? <Pause size={22} /> : <CirclePlay size={24} />}</button></div><div className="deepfake-transcript"><div><Volume2 size={16} /><span>Sample transcript</span></div><p>“I need this handled right away. Please skip the normal verification and send the details to me here.”</p><div className="deepfake-wave">{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 17) % 34)}px` }} />)}</div></div></div>
      </section>

      <section className="deepfake-checks"><div className="deepfake-section-heading"><div><p className="eyebrow">Your verification pause</p><h2>Trust is a process,<br /><em>not a feeling.</em></h2></div><p>Deepfakes work best when they create urgency. Use a second channel before you act.</p></div><div className="deepfake-check-grid"><article><ShieldAlert size={20} /><strong>Pause the request</strong><p>Urgency, secrecy, and unusual payment or access requests are reasons to slow down.</p></article><article><Volume2 size={20} /><strong>Verify elsewhere</strong><p>Call a known number or open the official app yourself. Do not use contact details in the message.</p></article><article><Eye size={20} /><strong>Check the source</strong><p>Look for the original account, context, date, and independent reporting before sharing.</p></article></div></section>

      <section className="deepfake-external"><div><p className="eyebrow">Member resource</p><h2>Explore the original<br /><em>deepfake experience.</em></h2><p>Adaptive Security hosts an interactive deepfake demonstration. It is separate from this app and may request personal or biometric media, so review its privacy terms before continuing.</p></div><button type="button" onClick={openExternalTool} className="deepfake-external-link">{hasAccess ? 'Open Adaptive Security' : checkoutUrl ? 'Unlock with All Access' : 'Checkout unavailable'} <Eye size={16} /></button></section>

      <footer className="deepfake-footer"><span>Reality Check by appfolk</span><Link to="/">Back to appfolk</Link></footer>
    </main>
  );
};

export default DeepfakeAwareness;
