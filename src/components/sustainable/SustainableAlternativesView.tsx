'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Leaf, 
  Train, 
  Bike, 
  Users, 
  Zap, 
  Trash2, 
  ArrowRight, 
  Check, 
  HelpCircle,
  Calculator,
  PlusCircle
} from 'lucide-react';
import { ActionCategory } from '@/types/impact';

interface AlternativeItem {
  id: string;
  category: ActionCategory;
  title: string;
  icon: any;
  whatToChange: string;
  whyItHelps: string;
  estimatedBenefit: string;
  howToImplement: string[];
  assumptions: string;
}

const ALTERNATIVES: AlternativeItem[] = [
  {
    id: 'metro-transit',
    category: 'public-transport',
    title: 'Metro Rail & Electric Bus Rapid Transit',
    icon: Train,
    whatToChange: 'Replace solo petrol/diesel car or cab journeys with electrified mass transit.',
    whyItHelps: 'Mass transit concentrates passengers into a single high-efficiency electric corridor, completely eliminating tailpipe PM2.5 and nitrogen oxide emissions at street level.',
    estimatedBenefit: '~140g CO₂ and ~0.08g PM2.5 avoided per passenger-kilometer.',
    howToImplement: [
      'Locate the nearest metro station or EV feeder bus route',
      'Use smart mobility cards to avoid ticket queue delays',
      'Combine with first/last-mile electric scooter or short walk'
    ],
    assumptions: 'Based on an average 1.5L petrol car emitting ~180g CO₂/km versus ~40g CO₂/km per passenger in an electrified metro train powered by regional grid mix.'
  },
  {
    id: 'active-mobility',
    category: 'cycling-walking',
    title: 'Bicycle or Walking for Short Urban Trips (<4 km)',
    icon: Bike,
    whatToChange: 'Substitute motorized short runs (groceries, errands, nearby cafes) with active pedal or pedestrian trips.',
    whyItHelps: 'Vehicles run "cold" in the first 3 kilometers, during which catalytic converters are not warm and emit 2 to 3 times more toxic pollutants per minute.',
    estimatedBenefit: '~180g CO₂ and ~0.12g PM2.5 avoided per kilometer.',
    howToImplement: [
      'Choose pedestrian paths or secondary tree-shaded avenues',
      'Wear a breathable dust mask if passing high-traffic intersections',
      'Carry a lightweight reusable backpack for groceries'
    ],
    assumptions: 'Assumes zero tailpipe emissions directly offsetting cold-start combustion trips.'
  },
  {
    id: 'carpooling-rideshare',
    category: 'carpooling',
    title: 'Workplace Carpooling & Shared Commutes',
    icon: Users,
    whatToChange: 'Coordinate with colleagues or neighbors to share vehicle occupancy instead of driving 4 separate cars.',
    whyItHelps: 'Instantly cuts peak-hour vehicle density on congested roads, reducing gridlock and chronic low-gear idle emissions.',
    estimatedBenefit: '~90g CO₂ per kilometer per additional passenger.',
    howToImplement: [
      'Create an office Slack or WhatsApp commuter circle',
      'Designate rotational driving days among car owners',
      'Agree on common pickup points along major arterial flyovers'
    ],
    assumptions: 'Assumes average carpool occupancy of 2.5 persons dividing standard 180g CO₂/km travel load.'
  },
  {
    id: 'idle-reduction',
    category: 'reduced-idling',
    title: 'Engine Shutdown at Traffic Signals (>20 seconds)',
    icon: Zap,
    whatToChange: 'Switch off the engine during long signal stops or while waiting for passengers.',
    whyItHelps: 'Restarting a modern electronic fuel-injected engine uses less fuel than 10 seconds of continuous idling, preventing localized toxic smog hotspots.',
    estimatedBenefit: '~40g CO₂ and ~0.03g PM2.5 per minute of idling avoided.',
    howToImplement: [
      'Observe countdown signal timers; turn off ignition if timer is above 20s',
      'Activate vehicle Auto Start-Stop feature if equipped',
      'Never idle the engine in enclosed garages or basements'
    ],
    assumptions: 'Standard passenger vehicles consume roughly 0.6 to 1.0 liters of fuel per hour of neutral idling with AC on.'
  },
  {
    id: 'smart-energy',
    category: 'energy-saving',
    title: 'Energy-Efficient Cooling & Ventilation',
    icon: Zap,
    whatToChange: 'Set AC thermostats to 24–26°C and utilize natural cross-ventilation during low-AQI hours.',
    whyItHelps: 'Thermal power plants generate a large percentage of urban electricity, producing sulfur dioxide and greenhouse gases.',
    estimatedBenefit: '~0.82 kg CO₂ avoided per kWh saved.',
    howToImplement: [
      'Use ceiling fans to maintain air circulation while keeping AC at 25°C',
      'Clean AC and purifier air filters monthly for optimal airflow',
      'Unplug phantom electronics on standby'
    ],
    assumptions: 'Grid emission intensity calculated using regional thermal/renewable blended average factor (~0.82 kg CO₂/kWh).'
  }
];

export default function SustainableAlternativesView() {
  const { addImpactLog } = useApp();
  const [commuteDistance, setCommuteDistance] = useState<number>(15);
  const [loggedNotification, setLoggedNotification] = useState<string | null>(null);

  // Commute Comparator Calculations (15 km default)
  const carEmission = Math.round(commuteDistance * 0.18 * 100) / 100; // 180g/km
  const metroEmission = Math.round(commuteDistance * 0.04 * 100) / 100; // 40g/km
  const evEmission = Math.round(commuteDistance * 0.05 * 100) / 100; // 50g/km grid equivalent
  const bikeEmission = 0;

  const co2SavedByMetro = Math.max(0, Math.round((carEmission - metroEmission) * 100) / 100);

  const handleQuickLog = (alt: AlternativeItem) => {
    addImpactLog(alt.category, alt.category === 'energy-saving' ? 2 : commuteDistance, `Logged from Sustainable Alternatives: ${alt.title}`);
    setLoggedNotification(`Successfully logged ${alt.title} to your Impact Tracker!`);
    setTimeout(() => setLoggedNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5" /> Everyday Emission Reductions
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sustainable Living & Clean Alternatives
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Clean air is both a personal right and a collective responsibility. Explore actionable changes that cut your personal exposure while reducing the emissions your lifestyle contributes back into your neighborhood.
        </p>

        {loggedNotification && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-xl border border-emerald-300 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{loggedNotification}</span>
          </div>
        )}
      </div>

      {/* Interactive Commute Carbon & PM Comparator Tool */}
      <div className="bg-gradient-to-br from-white to-emerald-50/40 dark:from-slate-900 dark:to-slate-900/60 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              Interactive Commute Emission Comparator
            </h3>
            <p className="text-xs text-slate-500">
              Slide to see how shifting commute modes directly impacts personal CO₂ and PM2.5 generation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Trip Distance: <span className="text-emerald-700 dark:text-emerald-400 text-sm">{commuteDistance} km</span>
            </label>
            <input
              type="range"
              min="2"
              max="50"
              value={commuteDistance}
              onChange={(e) => setCommuteDistance(Number(e.target.value))}
              className="w-36 accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>

        {/* 4 Mode Comparison Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Solo Petrol Car */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Solo Petrol Car</div>
            <div className="text-2xl font-black text-rose-600">{carEmission} <span className="text-xs font-normal text-slate-500">kg CO₂</span></div>
            <p className="text-[11px] text-slate-500">Baseline single-occupancy benchmark.</p>
          </div>

          {/* Metro Rail */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Metro Rail</div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{metroEmission} <span className="text-xs font-normal text-slate-500">kg CO₂</span></div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
              Avoids {co2SavedByMetro} kg CO₂ per trip!
            </p>
          </div>

          {/* Electric Vehicle (EV) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Electric Vehicle (EV)</div>
            <div className="text-2xl font-black text-teal-600">{evEmission} <span className="text-xs font-normal text-slate-500">kg CO₂</span></div>
            <p className="text-[11px] text-slate-500">Zero tailpipe, grid generation factor.</p>
          </div>

          {/* Bicycle / Walking */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bicycle / Walking</div>
            <div className="text-2xl font-black text-emerald-600">0.00 <span className="text-xs font-normal text-slate-500">kg CO₂</span></div>
            <p className="text-[11px] text-slate-500">100% Zero tailpipe, active wellness.</p>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>
            <strong>Calculation Transparency:</strong> These figures are model estimates using ARAI and EPA average passenger vehicle fuel economies and regional grid emissions, not direct sensor facts.
          </span>
        </div>
      </div>

      {/* Structured Alternatives Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Practical Alternatives Catalog
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALTERNATIVES.map((alt) => {
            const Icon = alt.icon;
            return (
              <div
                key={alt.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-900/10 dark:border-slate-800 shadow-sm card-hover-effect flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {alt.title}
                      </h4>
                    </div>
                  </div>

                  <div className="pt-3 space-y-3 text-xs">
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold block mb-0.5">
                        What You Can Change:
                      </strong>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{alt.whatToChange}</p>
                    </div>

                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold block mb-0.5">
                        Why It Helps:
                      </strong>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{alt.whyItHelps}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-semibold">
                      Estimated Environmental Benefit: {alt.estimatedBenefit}
                    </div>

                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold block mb-1">
                        How to Implement:
                      </strong>
                      <ul className="space-y-1">
                        {alt.howToImplement.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                      <strong>Assumption:</strong> {alt.assumptions}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleQuickLog(alt)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-900 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Log this Choice into Impact Tracker</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
