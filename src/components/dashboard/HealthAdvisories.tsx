'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Shield, HeartPulse, Baby, Bike, Home } from 'lucide-react';

export default function HealthAdvisories() {
  const { airQuality, isLoading } = useApp();

  if (isLoading || !airQuality) return null;

  const aqi = airQuality.summary.usAqi;
  const pm25 = airQuality.pollutants.pm25.value;

  const advisories = [
    {
      icon: HeartPulse,
      title: 'Respiratory & Cardiac Sensitive Groups',
      target: 'Individuals with asthma, COPD, bronchitis, or cardiovascular history',
      guidance: aqi <= 50 
        ? 'Air poses no concern. Continue routine outdoor therapy, walking, and sports.'
        : aqi <= 100
        ? 'Generally safe. Keep quick-relief inhalers accessible during extended outdoor excursions.'
        : 'Limit outdoor exposure. Move physical activities indoors. Ensure HEPA filtration in bedrooms.',
      urgency: aqi > 100 ? 'high' : 'normal'
    },
    {
      icon: Baby,
      title: 'Children & School Commuters',
      target: 'Developing lungs under 14 years of age',
      guidance: aqi <= 100
        ? 'Safe for school outdoor play and sports practice.'
        : 'Avoid strenuous outdoor school games. Keep classroom windows closed during heavy traffic hours. Consider child-sized N95 masks for open-vehicle commutes.',
      urgency: aqi > 100 ? 'high' : 'normal'
    },
    {
      icon: Bike,
      title: 'Athletes & Outdoor Workers',
      target: 'High-ventilation runners, cyclists, delivery partners, and construction personnel',
      guidance: aqi <= 50
        ? 'Optimal conditions for high-intensity cardio and outdoor labor.'
        : aqi <= 100
        ? 'Schedule long runs or heavy outdoor tasks between 11:00 AM and 3:00 PM when particulate inversion has dispersed.'
        : 'High-ventilation breathing pulls PM2.5 deep into the bloodstream. Wear certified N95 respirators or transition to indoor training.',
      urgency: aqi > 100 ? 'high' : 'normal'
    },
    {
      icon: Home,
      title: 'Indoor Living & Family Spaces',
      target: 'Home air quality, cooking emissions, and overnight rest',
      guidance: aqi <= 70
        ? 'Open windows for 20-30 minutes midday for natural cross-ventilation.'
        : 'Keep doors and windows sealed. Operate kitchen chimney exhaust while cooking. Run true-HEPA air purification in bedrooms.',
      urgency: aqi > 100 ? 'high' : 'normal'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Personalized Demographic Health Advisories
          </h3>
          <p className="text-xs text-slate-500">
            Scientifically calibrated recommendations according to current PM2.5 concentration ({pm25} µg/m³).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {advisories.map((adv, idx) => {
          const Icon = adv.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                adv.urgency === 'high'
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                  : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    adv.urgency === 'high'
                      ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                      : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {adv.title}
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    {adv.target}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                    {adv.guidance}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
