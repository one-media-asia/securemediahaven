import { useState, useEffect } from 'react';
import { Shield, Lock, Server, ChevronRight, Users, Network, CloudCog, Key } from 'lucide-react';

const Index = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-accent text-accent-foreground font-medium text-sm">
            Trusted by Leading Asian Enterprises
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Securing Asia's Digital Future
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Comprehensive cybersecurity solutions tailored for modern enterprises. Protect your assets with industry-leading security measures.
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all hover:bg-primary/90">
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

      {/* Contact Section */}
      <section className="py-24 px-4 bg-secondary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-secondary-foreground mb-4">
            Ready to Secure Your Business?
          </h2>
          <p className="text-secondary-foreground/70 mb-8">
            Contact us today for a personalized security assessment
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all hover:bg-primary/90">
            Contact Us
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Index;
