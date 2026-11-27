'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Home, 
  Wind, 
  Flame, 
  Flower2, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  Info
} from 'lucide-react';

export default function IndoorAdvisorView() {
  const { airQuality, location, setIsPranaModalOpen } = useApp();

  // User indoor environment parameters
  const [homeType, setHomeType] = useState<'apartment' | 'independent' | 'compact'>('apartment');
  const [windowFacing, setWindowFacing] = useState<'busy-street' | 'quiet-courtyard' | 'park-facing'>('busy-street');
  const [kitchenSetup, setKitchenSetup] = useState<'chimney-vented' | 'exhaust-fan' | 'unvented'>('exhaust-fan');
  const [hasHepa, setHasHepa] = useState<boolean>(true);
  const [usesIncense, setUsesIncense] = useState<boolean>(false);
  const [hasPets, setHasPets] = useState<boolean>(false);

  const outdoorAqi = airQuality?.summary.usAqi ?? 75;

  // Calculate estimated indoor risk level
  const calculateIndoorRisk = () => {
    let riskScore = 20; // baseline

    // Outdoor infiltration
    if (outdoorAqi > 150) riskScore += 35;
    else if (outdoorAqi > 80) riskScore += 20;

    if (windowFacing === 'busy-street') riskScore += 15;
    if (kitchenSetup === 'unvented') riskScore += 25;
    else if (kitchenSetup === 'exhaust-fan') riskScore += 10;

    if (usesIncense) riskScore += 20;
    if (hasPets) riskScore += 5;

    // Filtration mitigation
    if (hasHepa) riskScore -= 30;

    riskScore = Math.max(10, Math.min(95, riskScore));

    if (riskScore <= 30) return { label: 'Optimal / Clean Safe Zone', score: riskScore, color: '#10B981', badge: 'Low Risk' };
    if (riskScore <= 60) return { label: 'Moderate Indoor Burden', score: riskScore, color: '#F59E0B', badge: 'Moderate Risk' };
    return { label: 'High Indoor Particulate Accumulation', score: riskScore, color: '#EF4444', badge: 'High Risk' };
  };

  const risk = calculateIndoorRisk();

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            <Home className="w-3.5 h-3.5" /> Indoor Micro-Environment Diagnostic
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Indoor Air Quality (IAQ) Advisor
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
            People spend up to 90% of their time indoors where pollutants can concentrate at 2 to 5 times outdoor levels. Configure your home setup below to receive personalized mitigation protocols.
          </p>
        </div>

        {/* Real-time Outdoor Cross-reference */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: airQuality?.summary.color || '#10B981' }} />
            <span className="text-slate-700 dark:text-slate-300">
              Current ambient outdoor baseline in <strong>{location.name}</strong>: <strong>AQI {outdoorAqi}</strong>
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">
            {outdoorAqi > 100 ? '⚠️ Outdoor air will degrade indoor spaces if unmanaged' : '✅ Moderate infiltration risk'}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Configuration & Diagnostic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight pb-2 border-b border-slate-100 dark:border-slate-800">
            1. Describe Your Indoor Environment
          </h3>

          {/* Residence Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Dwelling Layout
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'apartment', label: 'Mid/High-Rise Apartment' },
                { id: 'independent', label: 'Independent House' },
                { id: 'compact', label: 'Compact / Studio Room' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setHomeType(item.id as any)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    homeType === item.id
                      ? 'bg-emerald-800 text-white border-emerald-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exterior Exposure / Windows */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Exterior Window Exposure
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'busy-street', label: 'Facing Main Traffic Road' },
                { id: 'quiet-courtyard', label: 'Interior Courtyard / Alley' },
                { id: 'park-facing', label: 'Facing Park or Trees' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWindowFacing(item.id as any)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    windowFacing === item.id
                      ? 'bg-emerald-800 text-white border-emerald-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kitchen Ventilation */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Cooking & Kitchen Ventilation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'chimney-vented', label: 'Direct Duct Chimney' },
                { id: 'exhaust-fan', label: 'Window Exhaust Fan' },
                { id: 'unvented', label: 'No Exhaust / Open Kitchen' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setKitchenSetup(item.id as any)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    kitchenSetup === item.id
                      ? 'bg-emerald-800 text-white border-emerald-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* HEPA Purifier */}
            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasHepa}
                onChange={(e) => setHasHepa(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">HEPA Purifier Active</span>
            </label>

            {/* Incense / Dhoop */}
            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={usesIncense}
                onChange={(e) => setUsesIncense(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Incense / Candles Used</span>
            </label>

            {/* Pets */}
            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPets}
                onChange={(e) => setHasPets(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Indoor Pets Present</span>
            </label>
          </div>
        </div>

        {/* Right Column: Calculated Diagnostic & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Risk Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Indoor Risk Estimation
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Calculated Risk</span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: `${risk.color}20`, color: risk.color }}
                >
                  {risk.badge}
                </span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {risk.label}
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${risk.score}%`, backgroundColor: risk.color }}
                />
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1">
                * Preventative environmental heuristic based on self-reported dwelling parameters, not a clinical or laboratory particulate sensor measurement.
              </p>
            </div>

            {/* Quick Action Plan */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                <Wind className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100 font-bold block">
                    Ventilation Timing Strategy
                  </strong>
                  <span className="text-slate-600 dark:text-slate-400">
                    {outdoorAqi <= 70
                      ? 'Safe for 25-minute cross-ventilation between 12:00 PM and 3:00 PM.'
                      : 'Keep street-facing windows sealed. Ambient outdoor PM2.5 will rapidly infiltrate.'}
                  </span>
                </div>
              </div>

              {kitchenSetup === 'unvented' && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40">
                  <Flame className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold block">
                      Kitchen Emission Spike Alert
                    </strong>
                    <span className="text-slate-600 dark:text-slate-400">
                      Unvented cooking can cause indoor PM2.5 to exceed 300 µg/m³. Install a window exhaust or cover pans during searing/frying.
                    </span>
                  </div>
                </div>
              )}

              {usesIncense && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold block">
                      Incense / Smoke Particle Load
                    </strong>
                    <span className="text-slate-600 dark:text-slate-400">
                      A single incense stick emits concentrated polycyclic aromatic hydrocarbons (PAHs) comparable to several cigarettes. Prefer smokeless LED diffusers.
                    </span>
                  </div>
                </div>
              )}

              {!hasHepa && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold block">
                      Add a True HEPA Purifier
                    </strong>
                    <span className="text-slate-600 dark:text-slate-400">
                      Mechanical H13 HEPA purifiers remove 99.97% of airborne particles down to 0.3 microns, the gold standard for bedrooms.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Science Spotlight: Indoor Plants vs Mechanical HEPA Filtration */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-800 text-emerald-300">
            <Flower2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">
              Science Reality Check: Indoor Plants vs. Particulate Air Pollution
            </h3>
            <p className="text-xs text-emerald-300 font-medium">
              Transparent, evidence-based environmental guidance from Prana (प्राण)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-emerald-100">
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 space-y-2">
            <strong className="text-emerald-300 font-bold block text-sm">
              🌿 What Indoor Houseplants Actually Do:
            </strong>
            <p>
              Houseplants (such as Snake Plants, Peace Lilies, and Spider Plants) offer positive psychological benefits, regulate humidity, and can absorb trace amounts of volatile organic compounds (VOCs like benzene) in small, sealed chambers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 space-y-2">
            <strong className="text-amber-300 font-bold block text-sm">
              🚫 What Houseplants CANNOT Do:
            </strong>
            <p>
              <strong>Plants do NOT meaningfully capture PM2.5, PM10, diesel exhaust, or dust.</strong> Peer-reviewed studies show you would need between 10 to 100 plants per square meter to match the filtration rate of a single modest mechanical HEPA filter.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200 gap-3 border-t border-emerald-800/60">
          <span>Keep houseplants for well-being, but rely on mechanical H13 HEPA filtration for real lung defense.</span>
          <button
            onClick={() => setIsPranaModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Ask Prana More
          </button>
        </div>
      </div>
    </div>
  );
}
