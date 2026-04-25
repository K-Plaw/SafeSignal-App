import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Filter, MapPin, Navigation, Info } from 'lucide-react';
import TopNav from '../components/TopNav';
import SafetyCarousel from '../components/SafetyCarousel';
import ReportCard from '../components/ReportCard';
import ReportDetailsModal from '../components/ReportDetailsModal';
import { subscribeToReports } from '../services/reportService';
import { Report } from '../types';
import { Button } from '../components/ui/Button';
import { auth } from '../lib/firebase';
import { getUserProfile } from '../services/userService';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState('All');
  const [userLocation, setUserLocation] = useState<string>('');

  useEffect(() => {
    const unsub = subscribeToReports((allReports) => {
      setReports(allReports);
      
      // Proximity Alert Logic
      if (allReports.length > 0 && userLocation) {
        const latest = allReports[0];
        const isHigh = ['Armed Robbery', 'Assault', 'Rape'].includes(latest.type);
        const street = latest.streetAddress || '';
        const isNear = street.toLowerCase().includes(userLocation.toLowerCase()) || 
                       userLocation.toLowerCase().includes(street.toLowerCase());
        
        if (isHigh && isNear) {
          toast.error(`${latest.type} reported near you on ${latest.streetAddress}!`, {
            duration: 10000,
            icon: '🚨'
          });
        }
      }
    });

    if (auth.currentUser) {
      getUserProfile(auth.currentUser.uid).then(p => {
        if (p?.address) setUserLocation(p.address);
      });
    }
    return unsub;
  }, [userLocation]);

  // Filter logic (simplistic street-level matching if address is set)
  const filteredReports = reports.filter(r => {
    // Basic filter out for flagged reports in the main view unless user specifically looks for them?
    // Actually, per instructions, we just mark them. 
    // But let's filter by the category the user selected.
    
    if (filter === 'High Priority') return ['Armed Robbery', 'Assault', 'Rape'].includes(r.type);
    if (filter === 'Near Me' && userLocation) {
        const street = r.streetAddress || '';
        return street.toLowerCase().includes(userLocation.toLowerCase()) || 
               userLocation.toLowerCase().includes(street.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 gradient-bg pb-32">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-32 space-y-12">
        {/* Community Warning Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 px-6 py-3 rounded-2xl flex items-center gap-3"
        >
          <Info className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
            SafeSignal is a <span className="underline">Community-Driven</span> platform. All reports are unverified and submitted by users. Always verify with official local law enforcement.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <SafetyCarousel />
        </motion.div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/30 backdrop-blur-md p-4 rounded-3xl border border-white/40">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
            {['All', 'Near Me', 'High Priority'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === f 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                    : 'bg-white/50 text-slate-500 hover:bg-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          
          <Button 
            onClick={() => navigate('/report')}
            className="shadow-xl shadow-indigo-100 group px-8"
          >
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
            Report Incident
          </Button>
        </div>

        {/* Quick Location Status */}
        {userLocation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-indigo-600/60 font-black text-[10px] uppercase tracking-widest px-4"
          >
            <Navigation className="w-3 h-3" />
            Monitoring signals near: {userLocation}
          </motion.div>
        )}

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report) => (
              <ReportCard 
                key={report.id} 
                report={report} 
                onClick={() => setSelectedReport(report)} 
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredReports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="bg-slate-100 p-6 rounded-full">
              <Info className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-400">No signals found matching your filter</h3>
            <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium">Be the first to report an incident and help your community stay safe.</p>
          </div>
        )}
      </main>

      {/* Floating Notification Indicator (Mock Notification System) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/10 animate-bounce">
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
        <span className="text-xs font-black uppercase tracking-widest">Real-time monitoring active</span>
      </div>

      <AnimatePresence>
        {selectedReport && (
          <ReportDetailsModal 
            report={selectedReport} 
            onClose={() => setSelectedReport(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
