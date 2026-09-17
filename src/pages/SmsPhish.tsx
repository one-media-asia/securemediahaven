import { ArrowLeft, Check, ShieldAlert, Smartphone, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const redFlags = [
  { id: 'urgency', label: 'Urgent pressure', detail: 'The message threatens account loss to rush a decision.' },
  { id: 'link', label: 'Unexpected link', detail: 'The shortened link hides the real destination.' },
  { id: 'sender', label: 'Unknown sender', detail: 'The sender is not a verified service contact.' },
];

const SmsPhish = () => {
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const toggleFlag = (id: string) => setSelectedFlags((flags) => flags.includes(id) ? flags.filter((flag) => flag !== id) : [...flags, id]);
  const score = selectedFlags.filter((flag) => redFlags.some((item) => item.id === flag)).length;

  return (
    <main className="sms-phish-page">
      <header className="sms-phish-header">
        <Link className="sms-phish-back" to="/"><ArrowLeft size={16} /> appfolk</Link>
        <div className="sms-phish-logo"><span><ShieldAlert size={16} /></span> SMS Phish</div>
        <span className="sms-phish-mode">Training mode</span>
      </header>

      <section className="sms-phish-hero">
        <div>
          <p className="eyebrow">Security awareness simulator</p>
          <h1>Pause.<br /><em>Spot the signs.</em></h1>
          <p className="sms-phish-intro">Review a simulated text message and identify the signals that make it suspicious. This demo never sends a message or opens a live link.</p>
          <div className="sms-phish-badges"><span><Check size={14} /> Safe sandbox</span><span><Check size={14} /> No real SMS</span></div>
        </div>
        <div className="sms-phish-phone" aria-label="Simulated SMS conversation">
          <div className="sms-phish-phone-top"><Smartphone size={15} /><span>Messages</span><small>9:41</small></div>
          <div className="sms-phish-contact"><span>+1 (555) 014-0198</span><small>Unknown sender</small></div>
          <div className="sms-phish-message"><p>ACCOUNT ALERT: Your access will be suspended today. Verify now to keep your account active: <strong>bit.ly/3x4mple</strong></p><small>9:38 AM</small></div>
          <div className="sms-phish-phone-note">Simulated message</div>
        </div>
      </section>

      <section className="sms-phish-check" aria-labelledby="sms-check-title">
        <div className="sms-phish-section-heading"><div><p className="eyebrow">Scenario 01 / 03</p><h2 id="sms-check-title">What makes this<br /><em>message suspicious?</em></h2></div><p>Select every signal you notice, then check your answer.</p></div>
        <div className="sms-phish-flag-grid">{redFlags.map((flag) => <button className={selectedFlags.includes(flag.id) ? 'sms-phish-flag selected' : 'sms-phish-flag'} key={flag.id} onClick={() => toggleFlag(flag.id)}><span className="sms-phish-flag-mark">{selectedFlags.includes(flag.id) ? <Check size={16} /> : <span />}</span><strong>{flag.label}</strong><small>{flag.detail}</small></button>)}</div>
        <button className="sms-phish-submit" onClick={() => setChecked(true)}>Check my answer <ShieldAlert size={16} /></button>
        {checked && <div className={score === redFlags.length ? 'sms-phish-feedback correct' : 'sms-phish-feedback'}><div>{score === redFlags.length ? <Check size={22} /> : <X size={22} />}</div><p><strong>{score === redFlags.length ? 'Good catch.' : 'Keep looking.'}</strong> {score === redFlags.length ? 'Urgency, the unknown sender, and the shortened link are all warning signs. Report the message and verify through an official channel.' : `You found ${score} of ${redFlags.length} warning signs. Look for pressure, unexpected links, and sender details before trusting a message.`}</p></div>}
      </section>

      <section className="sms-phish-principles"><div className="sms-phish-principle-mark"><ShieldAlert size={26} /></div><div><p className="eyebrow">The habit to keep</p><h2>Stop. Verify.<br /><em>Then act.</em></h2><p>Never use the link in an unexpected text. Open the official app or type the known website yourself, and report suspicious messages through your organization&apos;s approved channel.</p></div></section>
      <footer className="sms-phish-footer"><span>SMS Phish by appfolk</span><Link to="/">Back to appfolk <ArrowLeft size={14} /></Link></footer>
    </main>
  );
};

export default SmsPhish;