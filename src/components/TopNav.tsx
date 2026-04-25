import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { auth } from '../lib/firebase';
import { getUserProfile } from '../services/userService';
import { Profile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function TopNav() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      getUserProfile(auth.currentUser.uid).then(setProfile);
    }
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto glass rounded-full px-6 py-3 flex items-center justify-between border-white/20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Shield className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:block">SafeSignal</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 bg-white/50 border border-white/30 rounded-full pl-2 pr-4 py-1.5 hover:bg-white transition-all shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <UserIcon className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-700 max-w-[100px] truncate">
                {profile?.username || auth.currentUser?.email?.split('@')[0]}
              </span>
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-48 glass rounded-2xl p-2 shadow-xl border-white/30"
                >
                  <button 
                    onClick={() => { setShowMenu(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/50 text-slate-600 font-medium text-sm transition-colors"
                  >
                    <UserIcon className="w-4 h-4" /> Edit Profile
                  </button>
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 text-red-500 font-medium text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
