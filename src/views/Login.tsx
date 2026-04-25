import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Shield, ShieldCheck, ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Successfully logged in');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Authentication failed');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully logged in');
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 md:py-24 gradient-bg">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 flex flex-col items-center"
      >
        <div className="bg-indigo-600 p-4 rounded-3xl mb-8 shadow-xl shadow-indigo-100 flex items-center justify-center">
          <Shield className="text-white w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-2 text-center font-display">Welcome Back</h1>
        <p className="text-slate-500 text-center mb-10 leading-relaxed font-bold uppercase tracking-widest text-[10px]">
          Secure Access to SafeSignal
        </p>

        <form onSubmit={handleEmailLogin} className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
              <input 
                required type="email" placeholder="john@example.com" 
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
              <input 
                required type="password" placeholder="••••••••" 
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full shadow-lg shadow-indigo-100 mt-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white/50 px-2 text-slate-400 font-black tracking-widest">Or continue with</span></div>
          </div>

          <Button type="button" variant="outline" size="md" className="w-full flex items-center justify-center gap-2 glass border-slate-200" onClick={handleGoogleLogin}>
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Sign in with Google
          </Button>
          
          <div className="flex flex-col items-center gap-4 mt-8">
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              Don't have an account? <button type="button" onClick={() => navigate('/signup')} className="text-indigo-600 hover:underline">Sign Up</button>
            </p>

            <Button type="button" variant="ghost" className="text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]" onClick={() => navigate('/')}>
              <ArrowLeft className="w-3 h-3 mr-2" />
              Return to Public Site
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
