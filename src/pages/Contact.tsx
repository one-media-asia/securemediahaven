import { ArrowLeft, ArrowUpRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const contactEmail = 'contact!@onenedia.asia';

const Contact = () => (
  <main className="contact-page">
    <header className="contact-header">
      <Link className="contact-brand" to="/"><span>A</span> appfolk</Link>
      <Link className="contact-back" to="/"><ArrowLeft size={15} /> Back to appfolk</Link>
    </header>
    <section className="contact-hero">
      <div>
        <p className="contact-kicker">Contact</p>
        <h1>Let’s make<br /><em>something useful.</em></h1>
        <p className="contact-intro">Questions about a tool, your membership, or a security workflow? Send us a note and we’ll get back to you.</p>
      </div>
      <a className="contact-card" href={`mailto:${contactEmail}`}>
        <span className="contact-icon"><Mail size={22} /></span>
        <span className="contact-card-label">Email us</span>
        <strong>{contactEmail}</strong>
        <ArrowUpRight className="contact-arrow" size={20} />
      </a>
    </section>
    <footer className="contact-footer"><span>appfolk</span><span>Small tools for a more considered day.</span></footer>
  </main>
);

export default Contact;