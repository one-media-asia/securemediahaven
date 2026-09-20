
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Hosting from "./pages/Hosting";
import Kicks from "./pages/Kicks";
import Services from "./pages/Services";
import LearnKit from "./pages/LearnKit";
import SmsPhish from "./pages/SmsPhish";
import DeepfakeAwareness from "./pages/DeepfakeAwareness";
import VoicePhishingAwareness from "./pages/VoicePhishingAwareness";
import AwarenessLab from "./pages/AwarenessLab";
import SelfHelp from "./pages/SelfHelp";
import VulnScanner from "./pages/VulnScanner";
import Vaultline from "./pages/Vaultline";
import VaultlineSignup from "./pages/VaultlineSignup";
import Success from "./pages/Success";
import HostingSuccess from "./pages/HostingSuccess";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import { startClickTracking } from "./lib/clickTracking";

const queryClient = new QueryClient();
const isHostingSubdomain = typeof window !== "undefined" && window.location.hostname.startsWith("hosting.");

const App = () => {
  useEffect(() => startClickTracking(), []);

  return <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isHostingSubdomain ? <Hosting /> : <Index />} />
            <Route path="/hosting" element={<Hosting />} />
            <Route path="/kicks" element={<Kicks />} />
            <Route path="/services" element={<Services />} />
            <Route path="/learnkit" element={<LearnKit />} />
            <Route path="/sms-phish" element={<SmsPhish />} />
            <Route path="/deepfake" element={<DeepfakeAwareness />} />
            <Route path="/voice-phishing" element={<VoicePhishingAwareness />} />
            <Route path="/awareness-lab" element={<AwarenessLab />} />
            <Route path="/self-help" element={<SelfHelp />} />
            <Route path="/vuln-scan" element={<VulnScanner />} />
            <Route path="/vaultline" element={<Vaultline />} />
            <Route path="/vaultline/signup" element={<VaultlineSignup />} />
            <Route path="/success" element={<Success />} />
            <Route path="/hosting/success" element={<HostingSuccess />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>;
};

export default App;
