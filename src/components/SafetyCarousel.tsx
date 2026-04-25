import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, BookOpen, AlertCircle, Zap } from 'lucide-react';

const TIPS = [
  {
    icon: ShieldAlert,
    title: "Stay Aware",
    description: "Keep your eyes up and phone down when walking in unfamiliar areas.",
    color: "bg-indigo-600"
  },
  {
    icon: BookOpen,
    title: "Verify the Signal",
    description: "Always report verified incidents. False signals can delay emergency response.",
    color: "bg-emerald-600"
  },
  {
    icon: AlertCircle,
    title: "Safe Exit",
    description: "Identify at least two exits whenever you enter a new building or public space.",
    color: "bg-amber-600"
  },
  {
    icon: Zap,
    title: "Quick Response",
    description: "Report incidents immediately. Speed is critical for community safety.",
    color: "bg-blue-600"
  }
];

export default function SafetyCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[220px] md:h-[260px] w-full overflow-hidden rounded-[2.5rem] glass border-white/40 shadow-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 p-8 md:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-10"
        >
          <div className={`${TIPS[index].color} w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl shadow-indigo-100`}>
            {React.createElement(TIPS[index].icon, { className: "w-10 h-10 md:w-12 md:h-12 text-white" })}
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 font-display uppercase tracking-tight">
              {TIPS[index].title}
            </h3>
            <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-xl">
              {TIPS[index].description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {TIPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`}
          />
        ))}
      </div>
    </div>
  );
}
