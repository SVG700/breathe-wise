'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import AirQualityVisualizer from './AirQualityVisualizer';
import { Sparkles, ArrowRight, Wind, ShieldCheck, HeartPulse } from 'lucide-react';

export default function HeroSection() {
  const { setIsPranaModalOpen } = useApp();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative Environmental Blur Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-200/30 dark:bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-teal-200/20 dark:bg-teal-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Core Messaging & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Sanskrit-Inspired Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 border border-emerald-300/60 dark:border-emerald-700/50 text-emerald-900 dark:text-emerald-300 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Intelligent Air Quality Companion Powered by Prana</span>
              <span className="font-bold bg-emerald-200 dark:bg-emerald-900 px-1.5 py-0.2 rounded text-[11px]">
                प्राण
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Breathe Better. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 dark:from-emerald-400 dark:to-teal-300">
                Live Better.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              Understand the air around you. Make smarter daily choices. Protect the people who matter.
            </p>

            {/* Key Value Proposition Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Sensor Data</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-600" />
                <span>Demographic Health Precautions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-emerald-600" />
                <span>Zero Hallucinated Metrics</span>
              </div>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 text-white font-bold text-sm shadow-xl shadow-emerald-950/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>Explore Air Quality</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setIsPranaModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Meet Prana</span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-medium">
                  प्राण
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Interactive Visualizer */}
          <div className="lg:col-span-5 flex justify-center">
            <AirQualityVisualizer />
          </div>
        </div>
      </div>
    </section>
  );
}
