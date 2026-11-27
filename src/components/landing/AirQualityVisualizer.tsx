'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, Wind, ShieldCheck, Activity, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AirQualityVisualizer() {
  const { location, airQuality, setIsPranaModalOpen } = useApp();

  const aqi = airQuality?.summary.usAqi ?? 65;
  const aqiColor = airQuality?.summary.color ?? '#10B981';
  const severity = airQuality?.summary.severityLevel ?? 'Moderate';
  const pm25 = airQuality?.pollutants.pm25.value ?? 22.4;
  const pm10 = airQuality?.pollutants.pm10.value ?? 45.1;
  const o3 = airQuality?.pollutants.ozone.value ?? 38.0;

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Decorative ambient aura */}
      <div 
        className="absolute -inset-4 rounded-3xl blur-2xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: aqiColor }}
      />

      <div className="relative bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-emerald-900/10 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Top Header Card */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: aqiColor }} />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Live Sensor: {location.name}
              </span>
              <span className="text-[10px] text-slate-400 block">Open-Meteo Atmospheric Feed</span>
            </div>
          </div>

          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: `${aqiColor}20`, color: aqiColor }}
          >
            {severity}
          </span>
        </div>

        {/* Center AQI Circle Gauge */}
        <div className="flex items-center justify-center py-2">
          <div className="relative flex items-center justify-center">
            {/* Pulsing Outer Rings */}
            <div 
              className="w-44 h-44 rounded-full border-2 border-dashed animate-spin opacity-30"
              style={{ borderColor: aqiColor, animationDuration: '25s' }}
            />
            <div 
              className="absolute w-36 h-36 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all"
              style={{ backgroundColor: aqiColor }}
            >
              <span className="text-[11px] font-semibold tracking-wider opacity-90 uppercase">US AQI</span>
              <span className="text-5xl font-black tracking-tight">{aqi}</span>
              <span className="text-[10px] font-medium opacity-80 mt-0.5">PM2.5: {pm25} µg/m³</span>
            </div>
          </div>
        </div>

        {/* Atmospheric Metrics Pill Trio */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-semibold">PM2.5</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">{pm25}</span>
            <span className="text-[10px] text-slate-400"> µg/m³</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-semibold">PM10</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">{pm10}</span>
            <span className="text-[10px] text-slate-400"> µg/m³</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-semibold">OZONE</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">{o3}</span>
            <span className="text-[10px] text-slate-400"> µg/m³</span>
          </div>
        </div>

        {/* Prana AI Quick Advice Callout */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60 border border-emerald-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
              प्राण
            </div>
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Prana advises: {aqi <= 70 ? 'Natural ventilation is safe.' : 'Keep windows closed; run HEPA filtration.'}
            </span>
          </div>
          <button
            onClick={() => setIsPranaModalOpen(true)}
            className="text-emerald-800 dark:text-emerald-300 font-bold hover:underline whitespace-nowrap flex items-center gap-0.5 cursor-pointer"
          >
            Ask <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
