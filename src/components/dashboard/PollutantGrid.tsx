'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { PollutantDetail } from '@/types/airQuality';

export default function PollutantGrid() {
  const { airQuality, isLoading } = useApp();

  if (isLoading || !airQuality) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-44 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const list: PollutantDetail[] = [
    airQuality.pollutants.pm25,
    airQuality.pollutants.pm10,
    airQuality.pollutants.ozone,
    airQuality.pollutants.nitrogenDioxide,
    airQuality.pollutants.carbonMonoxide,
    airQuality.pollutants.sulphurDioxide,
  ];

  const getSeverityBadge = (severity: PollutantDetail['severity']) => {
    switch (severity) {
      case 'good':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Within Safe Limits</span>;
      case 'moderate':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Moderate Alert</span>;
      case 'unhealthy-sensitive':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">Elevated</span>;
      default:
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Unhealthy Spike</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Key Atmospheric Pollutants
          </h3>
          <p className="text-xs text-slate-500">
            Real-time concentration readings compared against World Health Organization (WHO) reference thresholds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((item) => {
          const ratio = Math.min(100, Math.round((item.value / (item.safeLimit * 2)) * 100));
          return (
            <div
              key={item.code}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-900/10 dark:border-slate-800 shadow-sm card-hover-effect flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                      {item.code}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-[130px]">
                      {item.name}
                    </span>
                  </div>
                  {getSeverityBadge(item.severity)}
                </div>

                {/* Big Value Display */}
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {item.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                  <span className="text-[11px] text-slate-400 ml-auto">
                    WHO Target: ≤{item.safeLimit} {item.unit}
                  </span>
                </div>

                {/* Visual Ratio Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.severity === 'good'
                        ? 'bg-emerald-500'
                        : item.severity === 'moderate'
                        ? 'bg-amber-500'
                        : item.severity === 'unhealthy-sensitive'
                        ? 'bg-orange-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(5, ratio)}%` }}
                  />
                </div>
              </div>

              {/* Description & Source Details */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 space-y-1">
                <p className="line-clamp-2 leading-relaxed">{item.description}</p>
                <div className="text-[10px] text-slate-400">
                  <strong className="text-slate-500 font-semibold">Origin:</strong> {item.source}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
