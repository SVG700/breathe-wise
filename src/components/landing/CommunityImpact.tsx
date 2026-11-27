'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Users, Sparkles, ArrowRight } from 'lucide-react';

export default function CommunityImpact() {
  const { setIsPranaModalOpen } = useApp();

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Quote / Philosophy Banner */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-xs font-semibold text-emerald-200">
              <Users className="w-3.5 h-3.5" />
              <span>For Individuals, Families & Urban Communities</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
              &quot;Clean air is not a luxury. It is the fundamental prerequisite of every healthy breath.&quot;
            </h2>

            <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed font-normal">
              Whether you are an expectant parent preparing a nursery, a working professional commuting across traffic corridors, or a senior citizen enjoying an evening stroll, Breathe Wise and Prana (प्राण) give you the scientific clarity to protect what matters most.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-emerald-950 font-bold text-sm shadow-md hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Check Your Local Air Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setIsPranaModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-sm border border-emerald-600/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Talk with Prana (प्राण)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
