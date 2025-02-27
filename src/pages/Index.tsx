
import { useState, useEffect, useRef } from 'react';
import { Shield, Lock, Server, ChevronRight, Users, Network, CloudCog, Key, Smartphone, Facebook, Linkedin, Copyright } from 'lucide-react';

const Index = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      document.documentElement.style.setProperty('--x', `${x}px`);
      document.documentElement.style.setProperty('--y', `${y}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const services = [
    {
      icon: Shield,
      title: "Network Security",
      description: "Advanced protection for your digital infrastructure",
    },
    {
      icon: Lock,
      title: "Data Protection",
      description: "Secure your sensitive information with military-grade encryption",
    },
    {
      icon: Server,
      title: "Cloud Security",
      description: "Comprehensive cloud infrastructure protection",
    },
    {
      icon: Users,
      title: "Security Training",
      description: "Empower your team with cybersecurity best practices",
    },
    {
      icon: Network,
      title: "Threat Detection",
      description: "24/7 monitoring and rapid incident response",
    },
    {
      icon: CloudCog,
      title: "Security Automation",
      description: "Streamline security operations with AI-powered tools",
    },
    {
      icon: Smartphone,
      title: "Mobile Applications",
      description: "Secure mobile app development with robust security features",
    },
    {
      icon: Key,
      title: "Secure Website Design",
      description: "Build websites with security-first architecture and best practices",
    },
    {
      icon: Server,
      title: "Secure Web Hosting",
      description: "Protected hosting environment with advanced security measures",
    },
  ];

  const stats = [
    { value: "99.9%", label: "Uptime Guarantee" },
    { value: "24/7", label: "Monitoring" },
    { value: "500+", label: "Clients Protected" },
  ];

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <div className="spotlight fixed inset-0 -z-10" />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center">
            <div className="relative w-16 h-16 mr-4">
              <Shield className="w-16 h-16 text-primary absolute" />
              <Lock className="w-8 h-8 text-accent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <span className="text-2xl font-bold tracking-tight">One Media Asia</span>
          </div>
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-accent text-accent-foreground font-medium text-sm">
            Trusted by Leading Asian Enterprises
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Securing Asia's Digital Future
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Comprehensive cybersecurity solutions tailored for modern enterprises. Protect your assets with industry-leading security measures.
          </p>
          <button 
            onClick={scrollToContact}
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all hover:bg-primary/90"
          >
            Get Started
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-4 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-foreground mb-4">
              Comprehensive Security Solutions
            </h2>
            <p className="text-secondary-foreground/70 max-w-2xl mx-auto">
              Protect your business with our advanced cybersecurity services
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="card-hover p-6 rounded-xl bg-card backdrop-blur-sm border border-white/10"
              >
                <service.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  {service.title}
                </h3>
                <p className="text-card-foreground/70">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Information Section */}
      <section ref={contactRef} className="py-24 px-4 bg-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-foreground mb-4">
              Get In Touch
            </h2>
            <p className="text-secondary-foreground/70 mb-8 max-w-2xl mx-auto">
              Contact us today for a personalized security assessment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Company Info */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-secondary-foreground">Company Information</h3>
              <div className="space-y-4 text-secondary-foreground/80">
                <p>One Media Asia Co, Ltd</p>
                <p>35/3 Moo 3 , Hang Dong </p>
                <p>Chiang Mai, Thailand</p>
                <p>Phone: +62 8135 3833 289</p>
                <p>Email: contact@onemedia.asia</p>
              </div>
              
              {/* Social Media Links */}
              <div className="pt-4">
                <h4 className="text-xl font-medium text-secondary-foreground mb-4">Connect With Us</h4>
                <div className="flex space-x-4">
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-card rounded-full hover:bg-primary/20 transition-colors"
                  >
                    <Facebook className="h-6 w-6 text-primary" />
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-card rounded-full hover:bg-primary/20 transition-colors"
                  >
                    <Linkedin className="h-6 w-6 text-primary" />
                  </a>
                  <a 
                    href="https://wa.me/6561234567" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-card rounded-full hover:bg-primary/20 transition-colors"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="h-6 w-6 text-primary"
                    >
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
                      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"></path>
                      <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"></path>
                      <path d="M9.5 15.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5Z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Business Hours */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-secondary-foreground">Business Hours</h3>
              <div className="space-y-3 text-secondary-foreground/80">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>Closed</span>
                </div>
              </div>
              
              <div className="pt-6">
                <h4 className="text-xl font-medium text-secondary-foreground mb-4">Our Locations</h4>
                <div className="space-y-3 text-secondary-foreground/80">
                  <p className="font-medium">Thailand (HQ)</p>
  
                  <p>Thailand</p>
                  <p>Indonesia</p>
                  
                </div>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-16 pt-8 border-t border-white/10 text-center text-secondary-foreground/60">
            <div className="flex items-center justify-center">
              <Copyright className="h-4 w-4 mr-2" />
              <p>{new Date().getFullYear()} One Media Asia Co Ltd. All rights reserved.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
