'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Clock } from 'lucide-react';

export default function HourlyForecastChart() {
  const { airQuality, isLoading } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading || !airQuality) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-900/10 dark:border-slate-800 shadow-sm animate-pulse h-80 flex items-center justify-center">
        <span className="text-xs text-slate-400">Loading atmospheric projection curves...</span>
      </div>
    );
  }

  const forecast = airQuality.hourlyForecast;

  // Custom clean tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 space-y-1">
          <p className="font-bold flex items-center gap-1 text-emerald-300">
            <Clock className="w-3 h-3" /> {label}
          </p>
          <p className="text-slate-200">
            US AQI: <strong className="text-white font-extrabold">{data.usAqi}</strong>
          </p>
          <p className="text-slate-300">
            PM2.5: <strong className="text-emerald-400">{data.pm25} µg/m³</strong>
          </p>
          <p className="text-slate-300">
            PM10: <strong>{data.pm10} µg/m³</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            24-Hour Air Quality Forecast & Trend
          </h3>
          <p className="text-xs text-slate-500">
            Projected diurnal atmospheric trajectory from Copernicus Atmosphere Monitoring Service (CAMS).
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> US AQI Trajectory
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="w-3 h-0.5 bg-amber-500 inline-block" /> Moderate Baseline (100)
          </span>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiColorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 11, fill: '#64748B' }} 
              interval={2}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748B' }} 
              domain={[0, 'dataMax + 20']}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={50} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Good (50)', fill: '#10B981', fontSize: 10 }} />
            <ReferenceLine y={100} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Moderate (100)', fill: '#F59E0B', fontSize: 10 }} />
            <ReferenceLine y={150} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Unhealthy (150)', fill: '#EF4444', fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="usAqi"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#aqiColorGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
