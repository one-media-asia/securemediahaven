import { AlertTriangle, ArrowLeft, Check, FileImage, Link2, LockKeyhole, ScanSearch, ShieldCheck, Upload, X } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { Link } from 'react-router-dom';

type Finding = { label: string; detail: string; severity: 'high' | 'medium' | 'low' };
type ScanResult = { verdict: 'high' | 'medium' | 'low'; summary: string; findings: Finding[]; urls: string[] };

const urlPattern = /https?:\/\/[^\s]+|(?:www\.)?[^\s]+\.(?:com|net|org|co|io|ly|info|biz)(?:\/[^\s]*)?/gi;
const analyzeSms = (sender: string, message: string): ScanResult => {
  const findings: Finding[] = [];
  const text = `${sender} ${message}`.toLowerCase();
  const urls = message.match(urlPattern) ?? [];
  if (/urgent|immediately|within \d+ hours?|final notice|act now|suspend|locked|expires?/.test(text)) findings.push({ label: 'Urgency or threat', detail: 'Pressure and consequences are common tactics used to make people act before checking.', severity: 'high' });
  if (/password|passcode|one[- ]time|otp|verification code|security code|pin/.test(text)) findings.push({ label: 'Requests a secret code', detail: 'Never share a password, PIN, or one-time code from an unexpected message.', severity: 'high' });
  if (/\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd)\b/.test(text)) findings.push({ label: 'Shortened link', detail: 'A shortened URL hides its destination. Verify through an official app or website instead.', severity: 'high' });
  if (/click|tap|verify|confirm|claim|track|open|sign in|login|log in/.test(text) && urls.length > 0) findings.push({ label: 'Link asks for action', detail: 'Unexpected links to sign in, verify, claim, or track something deserve extra scrutiny.', severity: 'medium' });
  if (/gift card|prize|winner|refund|delivery fee|customs|crypto|wire transfer|payment failed/.test(text)) findings.push({ label: 'Common scam theme', detail: 'Prize, delivery, refund, payment, and investment stories are frequently used in SMS scams.', severity: 'medium' });
  if (sender && !/verified|official|support|bank|delivery/i.test(sender)) findings.push({ label: 'Sender needs verification', detail: 'The sender name alone is not proof of identity. Check the official contact channel.', severity: 'low' });
  const score = findings.reduce((total, finding) => total + (finding.severity === 'high' ? 3 : finding.severity === 'medium' ? 2 : 1), 0);
  const verdict = score >= 5 ? 'high' : score >= 2 ? 'medium' : 'low';
  return { verdict, summary: verdict === 'high' ? 'This message has several strong scam indicators.' : verdict === 'medium' ? 'This message has warning signs that need verification.' : 'No obvious pattern was detected, but this is not proof that the message is safe.', findings, urls };
};

const SmsPhish = () => {
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScreenshot = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setScreenshot(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const scan = () => setResult(analyzeSms(sender, message));
  const clear = () => { setSender(''); setMessage(''); setScreenshot(null); setFileName(''); setResult(null); };

  return (
    <main className="sms-phish-page">
      <header className="sms-phish-header">
        <Link className="sms-phish-back" to="/"><ArrowLeft size={16} /> appfolk</Link>
        <div className="sms-phish-logo"><span><ScanSearch size={16} /></span> SMS Phish</div>
        <span className="sms-phish-mode"><LockKeyhole size={13} /> Private scan</span>
      </header>

      <section className="sms-analyzer-hero">
        <div>
          <p className="eyebrow">SMS scam analyzer</p>
          <h1>Is this text<br /><em>trying to trick you?</em></h1>
          <p className="sms-phish-intro">Paste a suspicious message or upload a screenshot. The scan runs in your browser and returns clear warning signs you can act on.</p>
          <div className="sms-phish-badges"><span><ShieldCheck size={14} /> No signup</span><span><LockKeyhole size={14} /> Local analysis</span></div>
        </div>
        <div className="sms-analyzer-note"><AlertTriangle size={25} /><strong>Never reply or tap first.</strong><span>Check the message here, then verify through a trusted official channel.</span></div>
      </section>

      <section className="sms-analyzer-workspace" aria-labelledby="sms-analyzer-title">
        <div className="sms-phish-section-heading"><div><p className="eyebrow">Private workspace</p><h2 id="sms-analyzer-title">Check a message<br /><em>before you trust it.</em></h2></div><p>We do not send messages, contact phone numbers, or open links from your scan.</p></div>
        <div className="sms-analyzer-grid">
          <div className="sms-analyzer-form">
            <label>Sender or number <input value={sender} onChange={(event) => setSender(event.target.value)} placeholder="e.g. +1 555 014 0198" /></label>
            <label>Paste the SMS text <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Paste the suspicious message here..." rows={8} /></label>
            <div className="sms-analyzer-upload"><Upload size={18} /><div><strong>Upload a screenshot</strong><span>Preview only. Paste the text above for analysis.</span></div><label className="sms-analyzer-upload-button">Choose image<input type="file" accept="image/*" onChange={handleScreenshot} /></label></div>
            {fileName && <div className="sms-analyzer-file"><FileImage size={15} /> {fileName}<button type="button" aria-label="Remove screenshot" onClick={() => { setScreenshot(null); setFileName(''); }}><X size={14} /></button></div>}
            <div className="sms-analyzer-actions"><button className="sms-analyzer-scan" type="button" onClick={scan} disabled={!message.trim()}>Analyze SMS <ScanSearch size={16} /></button><button className="sms-analyzer-clear" type="button" onClick={clear}>Clear</button></div>
          </div>
          <div className="sms-analyzer-preview">{screenshot ? <img src={screenshot} alt="Uploaded SMS screenshot preview" /> : <div><FileImage size={30} /><strong>Your screenshot preview</strong><span>Images stay in this browser. Nothing is uploaded.</span></div>}</div>
        </div>
      </section>

      {result && <section className={`sms-analyzer-result ${result.verdict}`} aria-live="polite"><div className="sms-analyzer-result-top"><div><p className="eyebrow">Scan result</p><h2>{result.verdict === 'high' ? 'High risk' : result.verdict === 'medium' ? 'Review carefully' : 'No clear pattern found'}</h2><p>{result.summary}</p></div><div className="sms-analyzer-score"><span>Risk level</span><strong>{result.verdict.toUpperCase()}</strong></div></div>{result.findings.length > 0 ? <div className="sms-analyzer-findings">{result.findings.map((finding) => <article key={finding.label}><AlertTriangle size={17} /><div><strong>{finding.label}</strong><span>{finding.detail}</span></div></article>)}</div> : <div className="sms-analyzer-clean"><Check size={18} /> No matching scam patterns were found. Stay cautious with unexpected messages.</div>}{result.urls.length > 0 && <div className="sms-analyzer-urls"><Link2 size={16} /><span>Detected URL text: {result.urls.join(', ')}</span></div>}<div className="sms-analyzer-next"><strong>What to do next:</strong> Do not use the message link. Open the organization&apos;s known app or type its official website yourself. Report the text through your carrier or organization&apos;s approved channel.</div></section>}

      <section className="sms-phish-principles"><div className="sms-phish-principle-mark"><ShieldCheck size={26} /></div><div><p className="eyebrow">Privacy promise</p><h2>Useful answers.<br /><em>Less exposure.</em></h2><p>This tool is designed for quick defensive checks. It does not need your phone number, account, or a live connection to the sender.</p></div></section>
      <footer className="sms-phish-footer"><span>SMS Phish by appfolk</span><Link to="/">Back to appfolk <ArrowLeft size={14} /></Link></footer>
    </main>
  );
};

export default SmsPhish;
