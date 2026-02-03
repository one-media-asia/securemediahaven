import jsPDF from 'jspdf';

export const generateBrochure = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Helper function to add centered text
  const addCenteredText = (text: string, y: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
  };

  // Helper function to add section header
  const addSectionHeader = (text: string, y: number) => {
    doc.setFillColor(59, 130, 246); // Primary blue
    doc.rect(margin, y - 6, pageWidth - margin * 2, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin + 5, y);
    doc.setTextColor(0, 0, 0);
    return y + 15;
  };

  // Header
  doc.setFillColor(15, 23, 42); // Dark background
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  addCenteredText('ONE MEDIA ASIA', 25, 24);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  addCenteredText('Security First, Always', 35, 12);
  
  doc.setTextColor(0, 0, 0);
  yPos = 60;

  // Special Offer Banner
  doc.setFillColor(239, 68, 68); // Red
  doc.rect(margin, yPos, pageWidth - margin * 2, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  addCenteredText('🔥 99% OFF ALL WEBSITE PACKAGES - LIMITED TIME OFFER 🔥', yPos + 10, 14);
  doc.setTextColor(0, 0, 0);
  yPos += 25;

  // Certifications Section
  yPos = addSectionHeader('OUR CERTIFICATIONS & EXPERTISE', yPos);
  
  const certifications = [
    { title: 'Cisco Ethical Hacking', badge: 'Certified', desc: 'Advanced penetration testing and vulnerability assessment' },
    { title: 'Threat Management', badge: 'Certified', desc: 'Proactive threat detection and incident response' },
    { title: 'Cyber Crime Forensics', badge: 'Expert Analyst', desc: 'Digital forensic investigation and evidence analysis' },
    { title: 'AI Security', badge: 'Expert', desc: 'AI-powered threat detection and security automation' },
    { title: 'Law Enforcement OSINT', badge: 'Experienced', desc: 'Open-source intelligence and network investigation' },
    { title: 'Multi-Platform Networking', badge: 'Expert', desc: 'Mac, Linux, Windows - Desktop & Server environments' },
  ];

  doc.setFontSize(10);
  certifications.forEach((cert) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`• ${cert.title}`, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`  [${cert.badge}] - ${cert.desc}`, margin + 35, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 7;
  });

  yPos += 10;

  // Website Packages Section
  yPos = addSectionHeader('WEBSITE PACKAGES (99% OFF)', yPos);

  const packages = [
    { name: 'Starter', original: '$999', price: '$10', deposit: '$1', features: ['5-page website', 'Mobile responsive', 'Basic SEO', 'Contact form', '1 month support'] },
    { name: 'Professional', original: '$2,499', price: '$25', deposit: '$3', features: ['10-page website', 'Advanced SEO', 'E-commerce ready', 'CMS integration', '3 months support'] },
    { name: 'Enterprise', original: '$4,999', price: '$50', deposit: '$5', features: ['Unlimited pages', 'Custom features', 'Priority support', 'Advanced security', '12 months support'] },
  ];

  doc.setFontSize(10);
  packages.forEach((pkg) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${pkg.name} Package`, margin, yPos);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Was: ${pkg.original}`, margin + 50, yPos);
    doc.setTextColor(0, 0, 0);
    
    doc.setTextColor(34, 197, 94); // Green
    doc.setFont('helvetica', 'bold');
    doc.text(`NOW: ${pkg.price}`, margin + 80, yPos);
    doc.setTextColor(0, 0, 0);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`(or ${pkg.deposit} deposit to start)`, margin + 110, yPos);
    yPos += 5;

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Features: ${pkg.features.join(' • ')}`, margin + 5, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 10;
  });

  yPos += 5;

  // Included Services Section
  yPos = addSectionHeader('INCLUDED WITH ALL PACKAGES', yPos);

  const services = [
    '✓ Free Security Assessment - Full vulnerability scan & risk assessment report',
    '✓ 1 Year Free AWS Hosting - Scalable infrastructure with 99.9% uptime guarantee',
    '✓ Ransomware Protection Suite - Real-time threat detection & malware removal',
    '✓ Security Tools Download - Antivirus, firewall, encryption utilities',
    '✓ Installment Plans Available - Start with just 10% deposit',
  ];

  doc.setFontSize(10);
  services.forEach((service) => {
    doc.text(service, margin, yPos);
    yPos += 7;
  });

  yPos += 10;

  // Contact Information
  yPos = addSectionHeader('CONTACT US', yPos);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const contactInfo = [
    'One Media Asia Co, Ltd',
    '35/3 Moo 3, Hang Dong, Chiang Mai, Thailand',
    'Phone: +62 8135 3833 289',
    'Email: contact@onemedia.asia',
    '',
    'Additional Location: Indonesia',
    'Business Hours: Mon-Fri 10AM-10PM, Sat 10AM-4PM',
  ];

  contactInfo.forEach((line) => {
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 280, pageWidth, 17, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  addCenteredText(`© ${new Date().getFullYear()} One Media Asia Co Ltd. All rights reserved.`, 290, 9);

  // Download the PDF
  doc.save('OneMediaAsia-Services-Brochure.pdf');
};
