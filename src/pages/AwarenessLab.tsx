import { ArrowLeft, Check, Eye, LockKeyhole, Play, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const AwarenessLab = () => {
  const [campaignName, setCampaignName] = useState('Quarterly security check');
  const [participants, setParticipants] = useState('Alex, Jordan, Sam');
  const [subject, setSubject] = useState('A quick security habit to practice');
  const [message, setMessage] = useState('Hi {{name}},\n\nThis is a harmless security-awareness exercise. Review the example, pause before acting, and verify unexpected requests through a trusted channel.\n\nNothing is being requested from you.');
  const [launched, setLaunched] = useState(false);
  const [completed, setCompleted] = useState(0);
  const participantList = participants.split(',').map((name) => name.trim()).filter(Boolean);

  return (
    <main className="awareness-lab-page">
      <header className="awareness-lab-header"><Link className="awareness-lab-back" to="/"><ArrowLeft size={16} /> appfolk</Link><div className="awareness-lab-logo"><span><ShieldCheck size={16} /></span> Awareness Lab</div><span className="awareness-lab-private"><LockKeyhole size={13} /> Local only</span></header>
      <section className="awareness-lab-hero"><div><p className="eyebrow">Authorized training workspace</p><h1>Practice safely.<br /><em>Learn clearly.</em></h1><p>Build a harmless awareness exercise for people who have opted in. This workspace never sends messages, collects passwords, or contacts participants.</p><div className="awareness-lab-badges"><span><Check size={14} /> Dummy data only</span><span><Check size={14} /> No delivery</span></div></div><div className="awareness-lab-hero-card"><Users size={22} /><strong>Consent first</strong><span>Use only participants who agreed to take part in training.</span></div></section>
      <section className="awareness-lab-workspace"><div className="awareness-lab-heading"><div><p className="eyebrow">Campaign builder</p><h2>Set up a safe<br /><em>practice run.</em></h2></div><p>All activity stays in this browser session.</p></div><div className="awareness-lab-grid"><div className="awareness-lab-form"><label>Campaign name<input value={campaignName} onChange={(event) => setCampaignName(event.target.value)} /></label><label>Opted-in participants<textarea value={participants} onChange={(event) => setParticipants(event.target.value)} rows={4} /></label><small>Enter fictional names only. Separate names with commas.</small><label>Email subject<input value={subject} onChange={(event) => setSubject(event.target.value)} /></label><label>Training message<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={7} /></label><small>Use {'{{name}}'} for a participant name. Never request passwords, codes, payments, or sensitive data.</small><button className="awareness-lab-launch" onClick={() => setLaunched(true)}><Play size={16} /> Preview training email</button></div><div className="awareness-lab-preview"><div className="awareness-lab-preview-top"><span>EMAIL PREVIEW</span><Eye size={16} /></div><p className="eyebrow">{campaignName || 'Untitled campaign'}</p><div className="awareness-lab-email-preview"><strong>{subject || 'No subject'}</strong><small>From: appfolk Security</small><p>{message.replaceAll('{{name}}', participantList[0] || 'participant')}</p></div><div className="awareness-lab-preview-footer"><span>{participantList.length} participant{participantList.length === 1 ? '' : 's'}</span><span>Preview only</span></div></div></div></section>
      {launched && <section className="awareness-lab-results"><div><p className="eyebrow">Local results</p><h2>{campaignName || 'Training exercise'}</h2><p>Preview is ready. Nothing has been sent.</p></div><div className="awareness-lab-result-grid"><div><strong>{participantList.length}</strong><span>opted-in learners</span></div><div><strong>{completed}</strong><span>completed locally</span></div><button onClick={() => setCompleted(participantList.length)}><Check size={16} /> Mark demo complete</button></div></section>}
      <section className="awareness-lab-rules"><ShieldCheck size={24} /><div><p className="eyebrow">Safety rules</p><h2>Teach the habit,<br /><em>not the secret.</em></h2><p>Never ask for passwords, one-time codes, payment details, or sensitive personal information. Use dummy content and provide a clear way to stop the exercise.</p></div></section>
      <footer className="awareness-lab-footer"><span>Awareness Lab by appfolk</span><Link to="/">Back to appfolk</Link></footer>
    </main>
  );
};

export default AwarenessLab;
