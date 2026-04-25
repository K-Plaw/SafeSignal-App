import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Shield, ArrowLeft, Mail, ShieldCheck, User as UserIcon, Home, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { createUserProfile } from '../services/userService';
import { toast } from 'sonner';

export default function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      await createUserProfile(user.uid, {
        fullname: formData.fullname,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
      });

      toast.success('Account created successfully!');
      navigate('/dashboard'); 
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 md:py-24 gradient-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full glass rounded-[2rem] md:rounded-[3rem] p-8 md:p-16"
      >
        <div className="flex flex-col items-center mb-10 md:mb-12">
          <div className="bg-indigo-600 p-4 rounded-3xl mb-6 shadow-xl shadow-indigo-100 flex items-center justify-center">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 font-display">Create Account</h1>
          <p className="text-slate-500 text-center leading-relaxed font-bold uppercase tracking-widest text-[10px]">
             Trusted Security for your community
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                <input 
                  required name="fullname" type="text" placeholder="John Doe" 
                  value={formData.fullname} onChange={handleChange}
                  className="w-full bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400/50 font-black text-sm">@</span>
                <input 
                  required name="username" type="text" placeholder="johndoe" 
                  value={formData.username} onChange={handleChange}
                  className="w-full bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                <input 
                  required name="email" type="email" placeholder="john@example.com" 
                  value={formData.email} onChange={handleChange}
                  className="w-full bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                <input 
                  required name="password" type="password" placeholder="••••••••" 
                  value={formData.password} onChange={handleChange}
                  className="w-full bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                <input 
                  name="phone" type="tel" placeholder="+1 (555) 000-0000" 
                  value={formData.phone} onChange={handleChange}
                  className="w-full bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Address</label>
              <div className="relative">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                <input 
                  name="address" type="text" placeholder="123 Main St" 
                  value={formData.address} onChange={handleChange}
                  className="w-full bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                <input 
                  name="city" type="text" placeholder="London" 
                  value={formData.city} onChange={handleChange}
                  className="w-full bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">State / Province</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                <input 
                  name="state" type="text" placeholder="Greater London" 
                  value={formData.state} onChange={handleChange}
                  className="w-full bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full mt-4 shadow-lg shadow-indigo-100" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          
          <div className="flex flex-col items-center gap-4 mt-8">
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              Already have an account? <button type="button" onClick={() => navigate('/login')} className="text-indigo-600 hover:underline">Sign In</button>
            </p>

            <Button variant="ghost" className="text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]" onClick={() => navigate('/')}>
              <ArrowLeft className="w-3 h-3 mr-2" />
              Return to Public Site
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
