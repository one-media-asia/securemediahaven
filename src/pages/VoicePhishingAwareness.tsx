import { AlertTriangle, Check, Ear, Eye, LockKeyhole, Phone, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const VoicePhishingAwareness = () => {
  const [hasAccess] = useState(() => sessionStorage.getItem('all-access-paid') === 'true');
  const checkoutUrl = '/api/all-access-checkout';
  const openExternalTool = () => {
    if (!hasAccess) {
      if (checkoutUrl) window.location.assign(checkoutUrl);
      return;
    }
    window.open('https://www.adaptivesecurity.com/voice-phishing', '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="voice-phish-page">
      <header className="voice-phish-header">
        <Link className="voice-phish-back" to="/"><span>A</span> appfolk</Link>
        <div className="voice-phish-logo"><ShieldCheck size={17} /> Voice Reality Check</div>
        <span className="voice-phish-private"><LockKeyhole size={13} /> Safe demo</span>
      </header>

      <section className="voice-phish-hero">
        <div>
          <p className="eyebrow">Voice phishing awareness</p>
          <h1>It sounds familiar.<br /><em>Verify anyway.</em></h1>
          <p>Practice the pause that protects you when a caller sounds like someone you know, claims authority, or creates pressure to act.</p>
          <div className="voice-phish-note"><Check size={15} /> Fictional scenarios only. No calls or recordings.</div>
        </div>
        <div className="voice-phish-art"><Phone size={36} /><div className="voice-phish-rings" /><span>TRUST IS NOT<br />A VOICEPRINT</span></div>
      </section>

      <section className="voice-phish-cards"><div className="voice-phish-heading"><div><p className="eyebrow">The verification pause</p><h2>When a voice<br /><em>asks for too much.</em></h2></div><p>AI-generated voices can sound convincing. The safest response is to slow down and use a separate channel.</p></div><div className="voice-phish-grid"><article><Ear size={21} /><strong>Listen for pressure</strong><p>Urgency, secrecy, and unusual requests are warning signs, even when the voice feels familiar.</p></article><article><Phone size={21} /><strong>End and call back</strong><p>Use a known number from your contacts or official records. Do not use a number supplied during the call.</p></article><article><ShieldAlert size={21} /><strong>Confirm the action</strong><p>Verify payment, access, or sensitive-data requests with another person and your normal process.</p></article></div></section>

      <section className="voice-phish-scenario"><div><p className="eyebrow">Fictional call scenario</p><h2>“I need you to<br /><em>keep this quiet.”</em></h2><p>A caller claims to be a colleague and asks you to bypass the normal approval process. The voice sounds right. The request does not.</p></div><div className="voice-phish-call-card"><div><Phone size={17} /><span>Unknown caller</span><small>00:18</small></div><blockquote>“Please do this now and don't mention it to the team. I'll explain later.”</blockquote><div className="voice-phish-call-actions"><button type="button"><Phone size={15} /> End the call</button><button type="button"><Check size={15} /> Verify separately</button></div></div></section>

      <section className="voice-phish-external"><div><p className="eyebrow">Member resource</p><h2>Explore the original<br /><em>voice phishing experience.</em></h2><p>Adaptive Security hosts an external voice-phishing simulation. It may request voice or personal information, so review its privacy terms before continuing.</p></div><button type="button" onClick={openExternalTool} className="voice-phish-external-link">{hasAccess ? 'Open Adaptive Security' : checkoutUrl ? 'Unlock with All Access' : 'Checkout unavailable'} <Eye size={16} /></button></section>

      <footer className="voice-phish-footer"><span>Voice Reality Check by appfolk</span><Link to="/">Back to appfolk</Link></footer>
    </main>
  );
};

export default VoicePhishingAwareness;
