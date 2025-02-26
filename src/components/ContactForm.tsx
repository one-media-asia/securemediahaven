
import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    toast({
      title: "Message sent successfully!",
      description: "We'll get back to you soon.",
    });
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-secondary-foreground mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          className="w-full px-4 py-2 rounded-lg border border-white/10 bg-card text-card-foreground"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-secondary-foreground mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
          className="w-full px-4 py-2 rounded-lg border border-white/10 bg-card text-card-foreground"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-secondary-foreground mb-1">
          Message
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          required
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-white/10 bg-card text-card-foreground"
        />
      </div>
      <button
        type="submit"
        className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all hover:bg-primary/90"
      >
        Send Message
        <Send className="ml-2 h-4 w-4" />
      </button>
    </form>
  );
};

export default ContactForm;
