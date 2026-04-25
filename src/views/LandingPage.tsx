import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Shield, Zap, ShieldCheck, ArrowRight, Eye, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const handleReportAction = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans gradient-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-6 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass px-4 md:px-6 py-2 md:py-3 rounded-2xl md:rounded-full">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Shield className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900">SafeSignal</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {!user ? (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-slate-600" onClick={() => navigate('/login')}>
                  Sign in
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/signup')} className="md:size-md">
                  Get Started
                </Button>
              </>
            ) : (
              <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')} className="md:size-md">
                Dashboard
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6 md:mb-8 inline-flex items-center gap-2 glass-indigo px-4 py-2 rounded-full text-indigo-700 text-xs md:text-sm font-bold tracking-wide transition-all hover:scale-105"
          >
            <Zap className="w-3 h-3 md:w-4 md:h-4 fill-indigo-700" />
            <span>SECURE. VERIFIED. RELIABLE.</span>
          </motion.div>
          
          <motion.h1 
            {...fadeIn}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 md:mb-8 leading-[1.1] font-display"
          >
            Safety starts with a <span className="text-indigo-600">signal.</span>
          </motion.h1>
          
          <motion.p 
            {...fadeIn}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Report incidents with high credibility. Community-driven confirmation ensures that every signal is taken seriously.
          </motion.p>
          
          <motion.div 
            {...fadeIn}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button size="lg" className="w-full sm:w-auto group shadow-indigo-200/50 shadow-lg" onClick={handleReportAction}>
              Report an Incident
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            {!user && (
              <Button size="lg" variant="secondary" className="w-full sm:w-auto glass border-slate-200" onClick={() => navigate('/signup')}>
                Create Secure Account
              </Button>
            )}
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-indigo-200 rounded-full blur-[120px] opacity-20 -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-[140px] opacity-30 -z-10" />
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-24 px-6 bg-slate-50/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 md:mb-20 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 font-display">How SafeSignal Works</h2>
            <p className="text-slate-500 font-medium">Fast, secure, and intuitive when every second counts.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          >
            {[
              {
                icon: AlertCircle,
                title: "Select Type",
                desc: "Choose from harassment, robbery, or other incident types."
              },
              {
                icon: Eye,
                title: "Add Context",
                desc: "Quickly describe the situation and add media evidence."
              },
              {
                icon: ShieldCheck,
                title: "Stay Secure",
                desc: "Submit privately. Your identity is automatically protected by verified encryption."
              }
            ].map((step, i) => (
              <motion.div key={i} variants={fadeIn} className="relative p-8 rounded-3xl glass border-slate-100/50 hover:border-indigo-300 transition-all hover:-translate-y-1 group">
                <div className="bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6 group-hover:scale-110 transition-transform">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{step.desc}</p>
                <div className="absolute -top-4 -right-4 font-black text-7xl text-indigo-500/5 select-none -z-10 group-hover:text-indigo-500/10 transition-colors">
                  0{i + 1}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 md:py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-[2rem] md:rounded-[3.5rem] bg-indigo-950 p-10 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 font-display">Your privacy is our priority.</h2>
            <p className="text-indigo-200 text-base md:text-lg mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              We use military-grade encryption for all media. Anonymous reports are stripped of personal identifiers before they reach any human eyes.
            </p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 opacity-70">
              <div className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest leading-none"><ShieldCheck className="w-4 h-4 text-indigo-400" /> 256-bit AES</div>
              <div className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest leading-none"><Eye className="w-4 h-4 text-indigo-400" /> No Trace Logs</div>
              <div className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest leading-none"><Shield className="w-4 h-4 text-indigo-400" /> Community Driven</div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/30 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 bg-white/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight">SafeSignal</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm font-bold text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors uppercase tracking-widest text-[10px]">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors uppercase tracking-widest text-[10px]">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 transition-colors uppercase tracking-widest text-[10px]">Contact Support</a>
          </div>
          <div className="text-xs font-medium text-slate-400">
            © 2026 SafeSignal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
