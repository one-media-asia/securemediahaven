import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Server, Cloud, Bug, Download, Gift, CheckCircle, ArrowLeft, Percent, Calendar, ShieldCheck, CreditCard, Award, Users, Monitor, Terminal, Network, FileDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateBrochure } from '@/lib/generateBrochure';

const Services = () => {
  const offers = [
    {
      icon: CheckCircle,
      title: "Free Security Assessment",
      description: "Comprehensive security audit for all clients",
      features: [
        "Full vulnerability scan",
        "Network security analysis",
        "Risk assessment report",
        "Personalized recommendations",
        "No obligation consultation"
      ],
      highlight: "FREE",
      highlightColor: "bg-green-500"
    },
    {
      icon: Cloud,
      title: "1 Year Free AWS Hosting",
      description: "Enterprise-grade cloud hosting on Amazon Web Services",
      features: [
        "Scalable infrastructure",
        "99.9% uptime guarantee",
        "SSL certificates included",
        "Daily backups",
        "24/7 monitoring"
      ],
      highlight: "1 YEAR FREE",
      highlightColor: "bg-primary"
    },
    {
      icon: Bug,
      title: "Ransomware Protection Suite",
      description: "Advanced tools to detect and mitigate cyber threats",
      features: [
        "Real-time threat detection",
        "Ransomware prevention",
        "Malware removal tools",
        "Security updates",
        "Incident response support"
      ],
      highlight: "INCLUDED",
      highlightColor: "bg-accent"
    }
  ];

  const websitePackages = [
    {
      name: "Starter",
      priceDisplay: "$59.99",
      hostingIncluded: false,
      features: ["5-page website", "Mobile responsive", "Basic SEO", "Contact form", "1 month support"]
    },
    {
      name: "Professional",
      priceDisplay: "$99.99",
      hostingIncluded: true,
      features: ["10-page website", "Advanced SEO", "E-commerce ready", "CMS integration", "3 months support"]
    },
    {
      name: "Enterprise",
      priceDisplay: "Contact Us",
      hostingIncluded: true,
      features: ["Unlimited pages", "Custom features", "Priority support", "Advanced security", "12 months support"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-primary mr-2" />
              <span className="font-bold">One Media Asia</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-bold text-lg animate-pulse">
            <Percent className="h-5 w-5" />
            99% OFF - LIMITED TIME OFFER
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Security First, Always
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Protect your business with our comprehensive security solutions. 
            Get started with our exclusive offers today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Free Assessment</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
              <Calendar className="h-5 w-5 text-primary" />
              <span>1 Year Free Hosting</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
              <Gift className="h-5 w-5 text-primary" />
              <span>99% Off Website Packages</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>10% Deposit to Start</span>
            </div>
          </div>
          
          {/* Download Brochure Button */}
          <div className="mt-8">
            <Button 
              onClick={generateBrochure}
              size="lg" 
              variant="outline"
              className="gap-2"
            >
              <FileDown className="h-5 w-5" />
              Download Brochure (PDF)
            </Button>
            <Button
              onClick={generateBrochure}
              size="lg"
              variant="ghost"
              className="gap-2 ml-3"
            >
              <FileDown className="h-5 w-5" />
              Download Assessment Form (PDF)
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-4 bg-card">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-bold mb-6">What Our Clients Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-background rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">“One Media Asia secured our infrastructure quickly and clearly — highly recommended.”</p>
              <div className="font-medium">— Jane D., CTO</div>
            </div>
            <div className="p-6 bg-background rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">“Our ad spend was optimized after their advertising cost analysis. ROI improved within weeks.”</p>
              <div className="font-medium">— Mark T., Marketing Lead</div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications & Expertise Section */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Certifications & Expertise</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Industry-recognized certifications and real-world experience in cybersecurity and IT infrastructure.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Cisco Ethical Hacking */}
            <Card className="border-primary/20 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Cisco Ethical Hacking</CardTitle>
                    <Badge variant="secondary" className="mt-1">Certified</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Advanced penetration testing and vulnerability assessment expertise.
                </p>
              </CardContent>
            </Card>

            {/* Threat Management */}
            <Card className="border-primary/20 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bug className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Threat Management</CardTitle>
                    <Badge variant="secondary" className="mt-1">Certified</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Proactive threat detection, analysis, and incident response capabilities.
                </p>
              </CardContent>
            </Card>

            {/* Cyber Crime Forensics */}
            <Card className="border-primary/20 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Cyber Crime Forensics</CardTitle>
                    <Badge variant="secondary" className="mt-1">Expert Analyst</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Digital forensic investigation and evidence analysis for cybercrime cases.
                </p>
              </CardContent>
            </Card>

            {/* AI Security Expert */}
            <Card className="border-primary/20 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Monitor className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Security</CardTitle>
                    <Badge variant="secondary" className="mt-1">Expert</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Leveraging artificial intelligence for advanced threat detection and security automation.
                </p>
              </CardContent>
            </Card>

            {/* Law Enforcement OSINT */}
            <Card className="border-primary/20 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Law Enforcement OSINT</CardTitle>
                    <Badge variant="secondary" className="mt-1">Experienced</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Collaboration with law enforcement on open-source intelligence and network investigation projects.
                </p>
              </CardContent>
            </Card>

            {/* Networking Expertise */}
            <Card className="border-primary/20 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Network className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Multi-Platform Networking</CardTitle>
                    <Badge variant="secondary" className="mt-1">Expert</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Expert in Mac, Linux, and Windows networking for both desktop and server environments.
                </p>
              </CardContent>
            </Card>

            {/* Social Media Marketing & Advertising Analysis */}
            <Card className="border-primary/20 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Social Media Marketing</CardTitle>
                    <Badge variant="secondary" className="mt-1">Marketing + Analysis</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Strategy, campaign setup, and advertising cost analysis to maximize ROI across social platforms.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Icons */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Platforms We Support</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="px-4 py-2 text-base">
                <Terminal className="h-4 w-4 mr-2" />
                macOS
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-base">
                <Terminal className="h-4 w-4 mr-2" />
                Linux
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-base">
                <Monitor className="h-4 w-4 mr-2" />
                Windows
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-base">
                <Server className="h-4 w-4 mr-2" />
                Servers
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Offers */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Security Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {offers.map((offer, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow bg-background">
                <div className={`absolute top-4 right-4 ${offer.highlightColor} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                  {offer.highlight}
                </div>
                <CardHeader>
                  <offer.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-2xl text-foreground">{offer.title}</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">{offer.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {offer.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-foreground">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/#contact">
                    <Button className="w-full mt-6">Book Now</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Website Packages - 99% Off */}
      <section className="py-16 px-4 bg-secondary">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-6 py-3 rounded-full bg-destructive text-destructive-foreground font-bold text-2xl">
              🔥 99% OFF ALL WEBSITE PACKAGES 🔥
            </div>
            <h2 className="text-3xl font-bold text-secondary-foreground mb-4">
              Security-First Website Development
            </h2>
            <p className="text-secondary-foreground/70 max-w-2xl mx-auto">
              Every website we build comes with enterprise-grade security measures built-in from day one.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {websitePackages.map((pkg, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-4 py-1 text-sm font-bold">
                  99% OFF
                </div>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-primary">{pkg.priceDisplay}</div>
                    <span className="text-muted-foreground text-sm">or 10% deposit to start</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm">Installment Plan Available</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Or 10% deposit to start</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mb-3 text-sm text-muted-foreground">
                    {pkg.hostingIncluded ? (
                      <span>Includes free hosting & domain for 1 year</span>
                    ) : (
                      <span>Hosting & domain not included</span>
                    )}
                  </div>
                  <Link to="/#contact">
                    <Button className="w-full" variant={index === 1 ? "default" : "outline"}>
                      Book Now{pkg.priceDisplay && ` — ${pkg.priceDisplay}`}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Ready to Secure Your Business?</h2>
          <p className="text-muted-foreground mb-8">
            Contact us today for your free security assessment and take advantage of our limited-time offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/#contact">
              <Button size="lg" className="w-full sm:w-auto">
                Get Free Assessment
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} One Media Asia Co Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Services;
