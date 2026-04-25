import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send, 
  ShieldCheck, 
  User as UserIcon,
  Shield,
  AtSign,
  ThumbsUp,
  ThumbsDown,
  Flag,
  AlertTriangle
} from 'lucide-react';
import { Report, Reply } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { auth } from '../lib/firebase';
import { addReply, subscribeToReplies, voteReport, flagReportMisuse, flagReplyMisuse } from '../services/reportService';
import { toast } from 'sonner';

interface Props {
  report: Report;
  onClose: () => void;
}

export default function ReportDetailsModal({ report, onClose }: Props) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    return subscribeToReplies(report.id, setReplies);
  }, [report.id]);

  const handleVote = async (type: 'confirm' | 'inaccurate') => {
    try {
      await voteReport(report.id, type);
      toast.success(type === 'confirm' ? 'Incident confirmed' : 'Marked as inaccurate');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleFlagReport = async () => {
    const reason = window.prompt('Reason for flagging this report as misuse:');
    if (!reason) return;
    try {
      await flagReportMisuse(report.id, reason);
      toast.success('Report flagged for misuse');
    } catch (err) {
      toast.error('Flagging failed');
    }
  };

  const handleFlagReply = async (replyId: string) => {
    const reason = window.prompt('Reason for flagging this reply as misuse:');
    if (!reason) return;
    try {
      await flagReplyMisuse(report.id, replyId, reason);
      toast.success('Reply flagged for misuse');
    } catch (err) {
      toast.error('Flagging failed');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    setLoading(true);
    try {
      await addReply(report.id, {
        content: newReply.trim(),
        username: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Unknown',
        isAnonymous: false, // Default to public for replies in this simple version
      });
      setNewReply('');
    } catch (err) {
      toast.error('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const handleTag = (username: string) => {
    setNewReply(prev => `${prev}@${username} `);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative glass-dark text-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg font-display tracking-tight leading-none uppercase">{report.type}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase border border-amber-400/30 px-1.5 py-0.5 rounded italic">Community Submitted (Unverified)</span>
                <p className="text-[10px] text-white/50 font-black tracking-widest uppercase">{report.streetAddress}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {/* Main Content */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                  {report.isAnonymous ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold">{report.isAnonymous ? 'Anonymous' : (report.username || 'Verified User')}</p>
                  <p className="text-[10px] text-white/40">{report.createdAt ? `${formatDistanceToNow(report.createdAt.toDate())} ago` : 'just now'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleVote('confirm')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    report.confirmations?.includes(auth.currentUser?.uid || '') 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" /> Confirm ({report.confirmations?.length || 0})
                </button>
                <button 
                  onClick={() => handleVote('inaccurate')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    report.inaccurateVotes?.includes(auth.currentUser?.uid || '') 
                      ? 'bg-red-600 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" /> Not Accurate
                </button>
                <button 
                  onClick={handleFlagReport}
                  className="p-2 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-xl transition-all"
                  title="Report Misuse"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {report.status === 'Flagged for misuse' && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold uppercase tracking-widest">Warning: This report has been flagged for misuse by multiple community members.</p>
              </div>
            )}

            <p className="text-white/80 leading-relaxed font-medium">{report.description}</p>
            
            {report.mediaUrl && (
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                {report.mediaType === 'video' ? (
                  <video src={report.mediaUrl} controls className="w-full" />
                ) : (
                  <img src={report.mediaUrl} alt="Evidence" className="w-full object-cover max-h-[300px]" />
                )}
              </div>
            )}
          </div>

          {/* Threaded Replies */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-indigo-400" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Discussion Thread ({replies.length})</h4>
            </div>

            <div className="space-y-4">
              {replies.map((reply) => (
                <motion.div 
                  key={reply.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-3 ${reply.isHidden ? 'opacity-40 grayscale' : ''}`}
                >
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/40 shrink-0">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="glass bg-white/5 p-3 rounded-2xl flex-1 border-white/5 relative group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-indigo-300">
                        @{reply.username}
                      </span>
                      <span className="text-[10px] text-white/30">{reply.createdAt ? `${formatDistanceToNow(reply.createdAt.toDate())} ago` : 'just now'}</span>
                    </div>
                    
                    {reply.isHidden ? (
                      <p className="text-xs italic text-white/30">This message has been hidden due to community misuse reports.</p>
                    ) : (
                      <p className="text-sm text-white/70 font-medium">
                        {reply.content.split(' ').map((word, i) => (
                          word.startsWith('@') ? (
                            <span key={i} className="text-indigo-400 font-bold">{word} </span>
                          ) : (
                            <span key={i}>{word} </span>
                          )
                        ))}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-4">
                      <button 
                        onClick={() => handleTag(reply.username)}
                        className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white/60 transition-colors"
                      >
                        Reply
                      </button>
                      <button 
                        onClick={() => handleFlagReply(reply.id)}
                        className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Report Misuse
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Reply Input */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input 
              type="text"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Add to the discussion..."
              className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white/20 transition-all placeholder:text-white/20 font-medium"
            />
            <button 
              disabled={loading || !newReply.trim()}
              className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
