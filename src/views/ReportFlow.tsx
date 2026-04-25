import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Shield, ArrowLeft, ArrowRight, Camera, Video, Ghost, Send, CheckCircle2, MapPin, X, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createReport, uploadMedia } from '../services/reportService';
import { toast } from 'sonner';

type Step = 1 | 2 | 3 | 4 | 5;

const INCIDENT_TYPES = [
  { id: 'Armed Robbery', label: 'Armed Robbery', icon: '🔫' },
  { id: 'Assault', label: 'Assault', icon: '👊' },
  { id: 'Rape', label: 'Rape', icon: '⚠️' },
  { id: 'Harassment', label: 'Harassment', icon: '🗣️' },
  { id: 'Theft', label: 'Theft', icon: '💰' },
  { id: 'Other', label: 'Other', icon: '❓' },
] as const;

export default function ReportFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: '' as any,
    description: '',
    streetAddress: '', // New field
    isAnonymous: true,
    location: null as null | { lat: number, lng: number },
  });

  const nextStep = () => {
    if (step === 2 && !formData.streetAddress) {
      toast.error('Street address is required');
      return;
    }
    setStep(s => Math.min(s + 1, 5) as Step);
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1) as Step);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Get location if possible
      let location = null;
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        }).catch(() => null);
        
        if (pos) {
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        }
      }

      const id = await createReport({ ...formData, location });
      setReportId(id || 'N/A');
      setSubmitted(true);
      toast.success('Report submitted successfully');
    } catch (error) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center gradient-bg">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] max-w-md w-full"
        >
          <div className="bg-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-200">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 font-display text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600">Signal Sent</h2>
          <p className="text-slate-600 mb-8 leading-relaxed font-medium">
            Your report has been securely transmitted. Our team will review the incident immediately.
          </p>
          <div className="bg-indigo-50/50 p-4 rounded-2xl mb-8 border border-indigo-100/50">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-1">Reference ID</span>
            <code className="text-indigo-600 font-mono font-bold text-lg">{reportId}</code>
          </div>
          <div className="flex flex-col gap-3">
            <Button size="lg" className="shadow-lg shadow-indigo-100" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            <Button variant="ghost" className="text-slate-400 font-bold text-xs uppercase tracking-widest" onClick={() => navigate('/dashboard')}>Track Status</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans gradient-bg overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto glass rounded-2xl md:rounded-full px-4 py-2 flex items-center justify-between border-slate-100/50">
          <Button variant="ghost" size="sm" onClick={() => (step === 1 ? navigate('/') : prevStep())} className="text-slate-400">
            <ArrowLeft className="w-4 h-4 mr-2" /> 
            Back
          </Button>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`} 
              />
            ))}
          </div>
          <div className="w-10 flex justify-end">
            <div className="text-[10px] font-black text-indigo-600/50 uppercase tracking-tighter">{step}/5</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pt-24 pb-12 px-4 md:pt-32">
        <div className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 min-h-[500px] flex flex-col justify-between border-white/40">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="flex-1"
              >
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">Step 01</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 font-display">What happened?</h2>
                  <p className="text-slate-500 font-medium">Select the category that best fits the incident.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {INCIDENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setFormData({ ...formData, type: type.id });
                        nextStep();
                      }}
                      className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 hover:border-indigo-600 group bg-white shadow-sm ${
                        formData.type === type.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50'
                      }`}
                    >
                      <span className="text-4xl group-hover:scale-110 transition-transform drop-shadow-sm">{type.icon}</span>
                      <span className="font-bold text-slate-700 text-sm md:text-base">{type.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="flex-1"
              >
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">Step 02</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 font-display">Location & Details</h2>
                  <p className="text-slate-500 font-medium">Be as specific as possible while ensuring privacy.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Street Name</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Oxford Street" 
                        value={formData.streetAddress}
                        onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                        className="w-full bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What exactly happened? (Avoid house numbers for privacy)"
                      className="w-full h-32 p-6 rounded-[2rem] bg-indigo-50/30 border-2 border-indigo-100/50 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all text-sm leading-relaxed placeholder:text-slate-300 font-medium"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="flex-1"
              >
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">Step 03</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 font-display">Evidence</h2>
                  <p className="text-slate-500 font-medium">Upload photos or video if safe to do so.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <input 
                    type="file" 
                    id="media-upload" 
                    className="hidden" 
                    accept="image/*,video/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLoading(true);
                        try {
                          const url = await uploadMedia(file);
                          setFormData({ 
                            ...formData, 
                            mediaUrl: url, 
                            mediaType: file.type.startsWith('video') ? 'video' : 'image' 
                          } as any);
                          toast.success('Media uploaded');
                        } catch (err) {
                          toast.error('Upload failed');
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                  />
                  <label 
                    htmlFor="media-upload"
                    className="aspect-video rounded-[2rem] border-2 border-dashed border-indigo-200/50 flex flex-col items-center justify-center p-8 bg-indigo-50/30 hover:bg-white hover:border-indigo-400 transition-all cursor-pointer group"
                  >
                    <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 mb-4 group-hover:scale-110 transition-transform">
                      {formData.mediaUrl ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <Camera className="w-8 h-8 text-indigo-600" />
                      )}
                    </div>
                    <span className="font-bold text-slate-900">
                      {formData.mediaUrl ? 'Media Ready' : 'Upload Media'}
                    </span>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                      {formData.mediaUrl ? 'Click to replace' : 'Tap to select'}
                    </span>
                  </label>
                  
                  <div className="flex gap-4 p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20 items-start">
                    <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed font-bold">
                      ONLY TAKE PHOTOS IF IT IS SAFE. YOUR SAFETY IS THE PRIORITY.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="flex-1"
              >
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">Step 04</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 font-display">Identity</h2>
                  <p className="text-slate-500 font-medium">Verified accounts can report anonymously or publicly.</p>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={() => setFormData({ ...formData, isAnonymous: true })}
                    className={`w-full p-6 rounded-[2rem] border-2 flex items-center justify-between text-left transition-all bg-white shadow-sm hover:shadow-md ${
                      formData.isAnonymous ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50'
                    }`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
                        <ShieldCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Anonymous Report</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">High Privacy</p>
                      </div>
                    </div>
                    {formData.isAnonymous && <CheckCircle2 className="w-6 h-6 text-indigo-600" />}
                  </button>

                  <button
                    onClick={() => setFormData({ ...formData, isAnonymous: false })}
                    className={`w-full p-6 rounded-[2rem] border-2 flex items-center justify-between text-left transition-all bg-white shadow-sm hover:shadow-md ${
                      !formData.isAnonymous ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50'
                    }`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="bg-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-100">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Public Report</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Direct Assistance</p>
                      </div>
                    </div>
                    {!formData.isAnonymous && <CheckCircle2 className="w-6 h-6 text-indigo-600" />}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="flex-1"
              >
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">Step 05</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 font-display">Review</h2>
                  <p className="text-slate-500 font-medium">Verify your signal details before transmission.</p>
                </div>
                
                <div className="bg-indigo-50/30 rounded-[2rem] p-6 md:p-8 space-y-8 border border-indigo-100/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Category</label>
                      <div className="font-bold text-slate-900">{formData.type}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Location</label>
                      <div className="font-bold text-slate-900">{formData.streetAddress}</div>
                    </div>
                    <div className="col-span-2">
                       <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Visibility</label>
                      <div className="flex items-center gap-2">
                        {formData.isAnonymous ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 italic">Anonymous</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Public</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Description</label>
                    <p className="text-slate-700 text-sm md:text-base leading-relaxed font-medium">
                      {formData.description || "No description provided."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-4">
              {step > 1 && step < 5 && (
                <Button variant="outline" size="lg" className="flex-1 glass border-slate-200" onClick={prevStep}>Back</Button>
              )}
              {step < 5 ? (
                <Button size="lg" className="flex-1 group shadow-lg shadow-indigo-100" disabled={!formData.type && step === 1} onClick={nextStep}>
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="lg" className="flex-1 glass border-slate-200" onClick={prevStep} disabled={loading}>Back</Button>
                  <Button size="lg" className="flex-1 shadow-lg shadow-indigo-200" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Signal'}
                    {!loading && <Send className="ml-2 w-5 h-5" />}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center px-4">
          <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-tighter">
            In case of life-threatening emergency, always call local emergency services first.
          </p>
        </div>
      </main>
    </div>
  );
}
