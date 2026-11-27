import React from 'react';
import PranaChatView from '@/components/prana/PranaChatView';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Prana (प्राण) — AI Air Quality Assistant | Breathe Wise',
  description: 'Conversational environmental companion providing personalized, scientifically grounded air quality recommendations.',
};

export default function AssistantPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      {/* Page Title & Philosophy */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Prana (प्राण) Intelligence System</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Meet Prana — Your Environmental Companion
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Powered by verified atmospheric metrics and generative environmental reasoning. Prana answers questions about outdoor exercise, protecting family health, room ventilation, and low-emission daily choices.
        </p>
      </div>

      {/* Main Chat Container */}
      <div className="h-[75vh] min-h-[520px] max-h-[780px]">
        <PranaChatView />
      </div>

      {/* Scientific & Clinical Ethics Note */}
      <div className="text-[11px] text-slate-400 p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-4">
        <span>
          <strong>Ethical AI Guardrail:</strong> Prana provides preventative environmental guidance based on meteorological models. Prana is not a clinical medical diagnostician. For persistent respiratory discomfort, consult a certified physician.
        </span>
      </div>
    </div>
  );
}
