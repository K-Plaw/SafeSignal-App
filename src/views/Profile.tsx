import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, User, MapPin, Mail, Bell, Shield, Save } from 'lucide-react';
import { auth } from '../lib/firebase';
import { getUserProfile, updateProfile } from '../services/userService';
import { Profile as ProfileType } from '../types';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<ProfileType>>({
    username: '',
    fullname: '',
    address: '',
    notificationPreferences: {
      proximityAlerts: true,
      highPriorityOnly: true
    }
  });

  useEffect(() => {
    if (auth.currentUser) {
      getUserProfile(auth.currentUser.uid).then(p => {
        if (p) setProfile(p);
        setLoading(false);
      });
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setSaving(true);
    try {
      await updateProfile(auth.currentUser.uid, profile);
      toast.success('Profile updated successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 gradient-bg flex flex-col items-center p-4 pt-12 md:pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-8 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Dashboard
        </button>

        <div className="glass rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 border-white/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User className="w-48 h-48" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 font-display uppercase tracking-tight">Profile Settings</h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{auth.currentUser?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400/50 font-black text-sm">@</span>
                    <input 
                      required
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="w-full bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Location (Street Name)</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                    <input 
                      type="text"
                      placeholder="e.g. Oxford Street"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="w-full bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 font-black tracking-widest ml-1 uppercase leading-relaxed">Required for proximity-based notifications</p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notification Preferences</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'proximityAlerts', label: 'Proximity Alerts', desc: 'Notify me of incidents on my street or nearby.' },
                    { key: 'highPriorityOnly', label: 'Priority Filter', desc: 'Only notify for armed robbery or serious assault.' }
                  ].map((pref) => (
                    <label key={pref.key} className="flex items-center justify-between group cursor-pointer bg-slate-50/50 p-4 rounded-2xl hover:bg-white transition-all">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{pref.label}</p>
                        <p className="text-xs text-slate-400">{pref.desc}</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={profile.notificationPreferences?.[pref.key as keyof typeof profile.notificationPreferences]}
                        onChange={(e) => setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences!,
                            [pref.key]: e.target.checked
                          }
                        })}
                        className="w-6 h-6 rounded-lg border-2 border-indigo-200 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                disabled={saving}
                className="w-full shadow-xl shadow-indigo-100 py-4"
              >
                {saving ? 'Updating Profile...' : 'Save Settings'}
                {!saving && <Save className="ml-2 w-5 h-5" />}
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
