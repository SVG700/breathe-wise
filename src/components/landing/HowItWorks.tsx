import React from 'react';
import { Compass, Users, Sparkles, Award } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: Compass,
    title: 'Monitor Live Ambient Air',
    desc: 'Enter your city or use browser geolocation to pull verified real-time AQI, PM2.5, and gaseous pollutant concentrations.'
  },
  {
    step: '02',
    icon: Users,
    title: 'Select Your Demographic Persona',
    desc: 'Calibrate guidance for your exact situation—whether safeguarding developing lungs, senior health, or athletic endurance.'
  },
  {
    step: '03',
    icon: Sparkles,
    title: 'Consult Prana (प्राण)',
    desc: 'Ask our dedicated environmental AI about jogging safety, window aeration, N95 masks, or low-exposure travel routes.'
  },
  {
    step: '04',
    icon: Award,
    title: 'Track Your Clean-Air Impact',
    desc: 'Log sustainable commutes, energy savings, and anti-idling habits to watch your avoided CO₂ and green streak grow.'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
            Simple 4-Step Flow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How Breathe Wise Works
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            From atmospheric satellite readings to healthy everyday living in under two minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-3xl font-black text-slate-200 dark:text-slate-800 select-none">
                    {s.step}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
