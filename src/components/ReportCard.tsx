import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, MessageCircle, ShieldCheck, User as UserIcon, ShieldAlert } from 'lucide-react';
import { Report } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  report: Report;
  onClick: () => void;
  key?: React.Key;
}

export default function ReportCard({ report, onClick }: Props) {
  const isHighPriority = ['Armed Robbery', 'Assault', 'Rape'].includes(report.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`group cursor-pointer rounded-3xl p-5 md:p-6 transition-all ${
        isHighPriority 
          ? 'bg-red-50/50 border border-red-100 hover:border-red-300' 
          : 'glass border-slate-100/50 hover:border-indigo-300'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${isHighPriority ? 'bg-red-600' : 'bg-indigo-600'} p-2.5 rounded-2xl shadow-lg transition-transform group-hover:scale-110`}>
            {isHighPriority ? <ShieldAlert className="w-5 h-5 text-white" /> : <MapPin className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 font-display tracking-tight leading-none uppercase md:text-lg">
              {report.type}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 grayscale opacity-50">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Unverified</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{report.streetAddress}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            <Clock className="w-3 h-3" />
            {report.createdAt ? `${formatDistanceToNow(report.createdAt.toDate())} ago` : 'just now'}
          </div>
          <div className={`mt-2 text-[10px] font-black uppercase tracking-widest ${report.status === 'Flagged for misuse' ? 'text-red-500' : 'text-indigo-400'}`}>
            {report.status}
          </div>
        </div>
      </div>

      <p className="text-slate-600 text-sm font-medium line-clamp-2 leading-relaxed mb-6">
        {report.description}
      </p>

      <div className="mb-6 flex items-center gap-4">
        {report.confirmations?.length > 0 && (
          <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {report.confirmations.length} Confirmations
          </div>
        )}
        {report.misuseFlags?.length > 0 && (
          <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-black uppercase tracking-widest">
            Flagged {report.misuseFlags.length}x
          </div>
        )}
      </div>

      {report.mediaUrl && (
        <div className="mb-6 rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
          {report.mediaType === 'image' ? (
            <img src={report.mediaUrl} alt="Evidence" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white font-black text-xs uppercase tracking-widest">
              Video Evidence
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            {report.isAnonymous ? <ShieldCheck className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {report.isAnonymous ? 'Anonymous' : (report.username || 'Verified')}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all">
          <MessageCircle className="w-3.5 h-3.5" />
          {report.replyCount || 0} REPLIES
        </div>
      </div>
    </motion.div>
  );
}
