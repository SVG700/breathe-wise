'use client';

import React, { useState, useEffect } from 'react';
import { useApp, IMPACT_ACTIONS } from '@/context/AppContext';
import { ActionCategory } from '@/types/impact';
import { 
  BarChart3, 
  Leaf, 
  Flame, 
  Trash2, 
  Plus, 
  Award, 
  TrendingUp, 
  Info,
  Calendar,
  Sparkles,
  Zap,
  Train,
  Bike,
  Users,
  PowerOff
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function ImpactTrackerView() {
  const { impactLogs, addImpactLog, deleteImpactLog, clearImpactLogs, impactMetrics } = useApp();
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<{ date: string; fullDate: string; co2SavedKg: number }[]>([]);

  // Form state for logging a new choice
  const [selectedAction, setSelectedAction] = useState<ActionCategory>('public-transport');
  const [quantity, setQuantity] = useState<number>(15);
  const [notes, setNotes] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const daysMap: Record<string, number> = {};
    const last7Days: string[] = [];

    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toISOString().split('T')[0];
      daysMap[key] = 0;
      last7Days.push(key);
    }

    impactLogs.forEach((log) => {
      if (daysMap[log.date] !== undefined) {
        daysMap[log.date] += log.co2SavedKg;
      }
    });

    const calculated = last7Days.map((dateStr) => {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString([], { weekday: 'short' }),
        fullDate: dateStr,
        co2SavedKg: Math.round(daysMap[dateStr] * 100) / 100
      };
    });

    setChartData(calculated);
  }, [impactLogs]);

  const currentActionDef = IMPACT_ACTIONS.find(a => a.id === selectedAction) || IMPACT_ACTIONS[0];

  const handleActionChange = (cat: ActionCategory) => {
    setSelectedAction(cat);
    const def = IMPACT_ACTIONS.find(a => a.id === cat);
    if (def) setQuantity(def.defaultUnit);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    addImpactLog(selectedAction, quantity, notes.trim() || undefined);
    setNotes('');
    setShowAddModal(false);
  };

  const getActionIcon = (id: ActionCategory) => {
    switch (id) {
      case 'public-transport': return <Train className="w-4 h-4 text-emerald-600" />;
      case 'cycling-walking': return <Bike className="w-4 h-4 text-teal-600" />;
      case 'carpooling': return <Users className="w-4 h-4 text-cyan-600" />;
      case 'reduced-idling': return <PowerOff className="w-4 h-4 text-amber-600" />;
      case 'energy-saving': return <Zap className="w-4 h-4 text-blue-600" />;
      default: return <Leaf className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5" /> Collective Environmental Accountability
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Environmental Impact Tracker
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1">
              Every low-emission choice directly prevents pollutants from entering your community’s air basin. Track your personal contributions over time.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Record Sustainable Choice</span>
          </button>
        </div>

        {/* 4 Big Metrics Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Total CO2 Saved */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">CO₂ Avoided</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-100">
              {impactMetrics.totalCo2SavedKg} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <p className="text-[10px] text-slate-500">Estimated cumulative emissions prevented</p>
          </div>

          {/* Total PM2.5 Prevented */}
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">PM2.5 Prevented</span>
            <div className="text-2xl sm:text-3xl font-black text-teal-900 dark:text-teal-100">
              {impactMetrics.totalPmSavedGram} <span className="text-xs font-normal text-slate-500">grams</span>
            </div>
            <p className="text-[10px] text-slate-500">Direct street-level particle mitigation</p>
          </div>

          {/* Active Days Streak */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Green Streak</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 dark:text-amber-100 flex items-center gap-1">
              <span>{impactMetrics.currentStreakDays}</span>
              <span className="text-xs font-normal text-slate-500">days</span>
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-[10px] text-slate-500">Consecutive sustainable action days</p>
          </div>

          {/* Clean Air Credits */}
          <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-800/40 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-400">Prana Points</span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-900 dark:text-cyan-100 flex items-center gap-1">
              <span>{impactMetrics.cleanAirPoints}</span>
              <Award className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-[10px] text-slate-500">Environmental stewardship index</p>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              7-Day Avoided Emissions Trajectory
            </h3>
            <p className="text-xs text-slate-500">Daily kg of CO₂ avoided through recorded choices.</p>
          </div>
        </div>

        {mounted ? (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} kg CO₂ avoided`, 'Savings']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="co2SavedKg" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        )}
      </div>

      {/* Recorded Action History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Action History ({impactLogs.length} logged)
            </h3>
            <p className="text-xs text-slate-500">Persisted safely in your local browser storage.</p>
          </div>

          {impactLogs.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all logged actions?')) clearImpactLogs();
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>

        {impactLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-2">
            <p>No actions logged yet. Start recording your daily clean choices!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-800 text-white rounded-xl font-bold cursor-pointer"
            >
              Log First Action
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {impactLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    {getActionIcon(log.actionId)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{log.actionName}</h4>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{log.date}</span>
                      <span>•</span>
                      <span>{log.quantity} units</span>
                      {log.notes && <span>• &quot;{log.notes}&quot;</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                      +{log.co2SavedKg} kg
                    </span>
                    <span className="text-[10px] text-slate-400 block">CO₂ saved</span>
                  </div>

                  <button
                    onClick={() => deleteImpactLog(log.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Sustainable Choice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600" /> Record a Clean-Air Action
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Select Activity:</label>
                <div className="grid grid-cols-2 gap-2">
                  {IMPACT_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleActionChange(action.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedAction === action.id
                          ? 'bg-emerald-800 text-white border-emerald-700 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {action.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Quantity ({currentActionDef.unitLabel}):
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Personal Notes (optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Took purple line metro instead of driving"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-[11px] leading-relaxed">
                <strong>Projected Reduction:</strong> ~{(quantity * currentActionDef.co2SavedPerUnitKg).toFixed(2)} kg CO₂ & ~{(quantity * currentActionDef.pmSavedPerUnitGram).toFixed(2)}g PM2.5.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
