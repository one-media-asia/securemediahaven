
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Kicks = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Kicks
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Welcome to the Kicks page
          </p>
          
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">
              This page is under construction. Check back soon for updates!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Kicks;
