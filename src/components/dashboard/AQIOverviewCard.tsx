'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Wind, 
  Home, 
  Sparkles, 
  AlertTriangle,
  Clock,
  Radio
} from 'lucide-react';

export default function AQIOverviewCard() {
  const { location, airQuality, isLoading, setIsPranaModalOpen } = useApp();

  if (isLoading || !airQuality) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-slate-800 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const { summary, pollutants, lastUpdated, sourceAttribution } = airQuality;
  const formattedTime = new Date(lastUpdated).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/20 to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-slate-800 shadow-md">
      {/* Decorative subtle ambient ring */}
      <div 
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: summary.color }}
      />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" /> Live Air Quality Station
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {location.name}
            {location.admin1 ? <span className="text-slate-500 font-normal text-lg">, {location.admin1}</span> : null}
            {location.country ? <span className="text-slate-400 font-normal text-base"> ({location.country})</span> : null}
          </h2>
        </div>

        <div className="flex flex-col sm:items-end text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Updated: {formattedTime}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">Source: {sourceAttribution}</span>
        </div>
      </div>

      {/* Main AQI Value & Headline Section */}
      <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* Big Circular Metric Badge */}
          <div 
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex flex-col items-center justify-center text-white shadow-xl flex-shrink-0 transition-transform hover:scale-105"
            style={{ backgroundColor: summary.color }}
          >
            <span className="text-xs font-semibold tracking-wider opacity-90">US AQI</span>
            <span className="text-4xl sm:text-5xl font-black tracking-tight">{summary.usAqi}</span>
            <span className="text-[11px] font-medium opacity-90">EU: {summary.europeanAqi}</span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${summary.color}18`, color: summary.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: summary.color }} />
              {summary.severityLevel}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {summary.headline}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              {summary.healthRecommendation}
            </p>
          </div>
        </div>

        {/* Quick Prana Consult CTA */}
        <div className="flex-shrink-0">
          <button
            onClick={() => setIsPranaModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/20 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Consult Prana for Action Plan</span>
            <span className="text-xs bg-emerald-950/80 px-1.5 py-0.5 rounded font-normal text-emerald-200">प्राण</span>
          </button>
        </div>
      </div>

      {/* 4 Practical Safety Checkpoints */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
        {/* Outdoor Cardio */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
          <div className={`p-2 rounded-xl ${summary.outdoorSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {summary.outdoorSafe ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Outdoor Jogging</div>
            <div className={`font-semibold ${summary.outdoorSafe ? 'text-emerald-700' : 'text-rose-600'}`}>
              {summary.outdoorSafe ? 'Safe & Optimal' : 'Caution / Avoid'}
            </div>
          </div>
        </div>

        {/* Mask Protection */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
          <div className={`p-2 rounded-xl ${summary.maskRecommended ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">N95 Mask Needed</div>
            <div className={`font-semibold ${summary.maskRecommended ? 'text-amber-700' : 'text-slate-500'}`}>
              {summary.maskRecommended ? 'Recommended Outdoors' : 'Not Necessary'}
            </div>
          </div>
        </div>

        {/* Window Ventilation */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
          <div className={`p-2 rounded-xl ${summary.ventilationSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
            <Home className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Open Windows</div>
            <div className={`font-semibold ${summary.ventilationSafe ? 'text-emerald-700' : 'text-rose-600'}`}>
              {summary.ventilationSafe ? 'Good for Fresh Air' : 'Keep Windows Closed'}
            </div>
          </div>
        </div>

        {/* HEPA Filtration */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
          <div className={`p-2 rounded-xl ${summary.purifierRecommended ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">HEPA Purifier</div>
            <div className={`font-semibold ${summary.purifierRecommended ? 'text-emerald-700' : 'text-slate-500'}`}>
              {summary.purifierRecommended ? 'Run on Auto/High' : 'Standby / Optional'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
