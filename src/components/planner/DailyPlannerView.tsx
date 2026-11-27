'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserPersona } from '@/types/prana';
import { 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw
} from 'lucide-react';

interface RoutineSlot {
  period: 'Morning' | 'Mid-Day' | 'Afternoon' | 'Evening' | 'Night';
  timeRange: string;
  action: string;
  status: 'optimal' | 'caution' | 'alert';
  whyItMatters: string;
  tips: string[];
}

const PERSONA_CONFIG: Record<UserPersona, { label: string; icon: string; desc: string }> = {
  'working-professional': {
    label: 'Working Professional',
    icon: '💼',
    desc: 'Commuting, office environments, AC exposure, evening outdoor transitions'
  },
  'college-student': {
    label: 'College Student',
    icon: '🎓',
    desc: 'Campus movement, library study sessions, evening sports, budget transit'
  },
  'school-student': {
    label: 'School Student',
    icon: '🎒',
    desc: 'Morning bus commute, outdoor recess, school sports, developing lung care'
  },
  'senior-citizen': {
    label: 'Senior Citizen',
    icon: '🧓',
    desc: 'Morning walks, respiratory wellness, joint care, tranquil indoor recovery'
  },
  'family': {
    label: 'Family with Children',
    icon: '👨‍👩‍👧',
    desc: 'Multi-age routines, home cooking ventilation, park outings, bedroom sleep air'
  },
  'outdoor-worker': {
    label: 'Outdoor Worker',
    icon: '👷',
    desc: 'Prolonged roadside exposure, delivery runs, hydration, protective gear'
  }
};

export default function DailyPlannerView() {
  const { persona, setPersona, airQuality, location, setIsPranaModalOpen } = useApp();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const aqi = airQuality?.summary.usAqi ?? 75;

  const generateSchedule = (): RoutineSlot[] => {
    const isHighPollution = aqi > 120;
    const isModerate = aqi > 60 && aqi <= 120;

    switch (persona) {
      case 'school-student':
        return [
          {
            period: 'Morning',
            timeRange: '6:30 AM – 8:00 AM',
            action: isHighPollution ? 'Enclosed Commute with N95 Mask' : 'Normal Morning School Commute',
            status: isHighPollution ? 'alert' : 'optimal',
            whyItMatters: 'Morning temperature inversions trap diesel exhaust at street breathing heights. Young lungs inhale 50% more air volume per kg.',
            tips: ['Keep school bus windows closed along major ring roads', 'Pack an extra breathable mask in backpack']
          },
          {
            period: 'Mid-Day',
            timeRange: '11:30 AM – 1:30 PM',
            action: 'Classroom Lunch & Moderated Recess',
            status: 'optimal',
            whyItMatters: 'Ground temperatures rise by midday, helping disperse heavy particulate layers.',
            tips: ['Prefer indoor auditorium games if ambient AQI is spiking', 'Keep hydrated to preserve mucosal barrier defenses']
          },
          {
            period: 'Afternoon',
            timeRange: '3:30 PM – 5:30 PM',
            action: isHighPollution ? 'Shift Sports Practice to Indoor Gym' : 'Outdoor Sports & Games',
            status: isHighPollution ? 'caution' : 'optimal',
            whyItMatters: 'Heavy cardio breathing bypasses nasal hairs, depositing ultrafine particles into pulmonary alveoli.',
            tips: ['If playing outside, avoid pitches adjacent to construction sites', 'Wash face and hands immediately after outdoor games']
          },
          {
            period: 'Night',
            timeRange: '8:30 PM – 7:00 AM',
            action: 'Clean Air Bedroom Sleep Sanctuary',
            status: 'optimal',
            whyItMatters: 'Nightly cellular repair requires 8+ hours of low-particulate air for developing lungs.',
            tips: ['Run room HEPA purifier in low/sleep mode', 'Keep bedroom door slightly ajar for CO2 balance if room is compact']
          }
        ];

      case 'senior-citizen':
        return [
          {
            period: 'Morning',
            timeRange: '6:00 AM – 8:30 AM',
            action: isHighPollution ? 'Postpone Walk to 10:00 AM or Walk Indoors' : 'Gentle Park Walk in Green Canopy',
            status: isHighPollution ? 'alert' : isModerate ? 'caution' : 'optimal',
            whyItMatters: 'Early morning winter smog settles at ground level. Cold air mixed with PM2.5 can trigger bronchial spasms.',
            tips: ['Wrap a light scarf or mask around nose and mouth in chilly air', 'Do stretching exercises indoors first']
          },
          {
            period: 'Mid-Day',
            timeRange: '11:00 AM – 2:00 PM',
            action: 'Sunlight Exposure & Natural Room Aeration',
            status: 'optimal',
            whyItMatters: 'Warmest hours of the day offer maximum atmospheric dispersion and fresh air exchange.',
            tips: ['Open courtyard/balcony doors for 20 minutes', 'Hydrate with warm water and antioxidant teas']
          },
          {
            period: 'Evening',
            timeRange: '5:00 PM – 7:30 PM',
            action: isHighPollution ? 'Indoor Socializing & Breathing Exercises' : 'Evening Stroll Away from Arterial Roads',
            status: isHighPollution ? 'caution' : 'optimal',
            whyItMatters: 'Evening rush hour traffic generates fresh nitric oxide and soot spikes.',
            tips: ['Practice pranayama or gentle yoga in a filtered living room', 'Keep emergency inhalers accessible if asthmatic']
          },
          {
            period: 'Night',
            timeRange: '9:00 PM – 6:00 AM',
            action: 'Bedroom Air Purification & Quiet Rest',
            status: 'optimal',
            whyItMatters: 'Reduces overnight strain on the cardiovascular system while resting.',
            tips: ['Keep windows firmly latched against night inversions', 'Maintain steady room temperature (~22-24°C)']
          }
        ];

      case 'outdoor-worker':
        return [
          {
            period: 'Morning',
            timeRange: '7:00 AM – 11:00 AM',
            action: 'High-Exposure Shift with Certified N95 Mask',
            status: 'caution',
            whyItMatters: 'Peak morning vehicular exhaust contains volatile organic compounds and concentrated diesel soot.',
            tips: ['Wear an N95/FFP2 respirator with tight nasal seal', 'Take 5-minute indoor breaks away from idling buses']
          },
          {
            period: 'Mid-Day',
            timeRange: '12:00 PM – 3:00 PM',
            action: 'Shaded Lunch & Deep Hydration',
            status: 'optimal',
            whyItMatters: 'Solar ozone peaks in the afternoon; direct heat increases respiration strain.',
            tips: ['Rest in air-conditioned or well-ventilated indoor spaces', 'Rinse eyes with clean water to remove dust irritants']
          },
          {
            period: 'Afternoon',
            timeRange: '4:00 PM – 7:30 PM',
            action: 'Evening Traffic Corridor Protection',
            status: isHighPollution ? 'alert' : 'caution',
            whyItMatters: 'Second wave of vehicular stagnation traps tailpipe gases at pavement level.',
            tips: ['Replace or rotate disposable respirator if damp or clogged', 'Avoid resting right behind diesel exhaust pipes']
          },
          {
            period: 'Night',
            timeRange: '8:30 PM – 6:00 AM',
            action: 'Detoxifying Shower & Indoor Rest',
            status: 'optimal',
            whyItMatters: 'Clearing settled particulate matter from skin and nasal passages prevents nocturnal inflammation.',
            tips: ['Wash hair and face to eliminate particulate residues', 'Drink warm fluids to support airway clearing']
          }
        ];

      case 'working-professional':
      default:
        return [
          {
            period: 'Morning',
            timeRange: '6:30 AM – 9:00 AM',
            action: isHighPollution ? 'Indoor Workout + Metro/EV Commute' : 'Outdoor Jogging + Public Transit',
            status: isHighPollution ? 'alert' : 'optimal',
            whyItMatters: 'Commuting via metro rail reduces personal PM2.5 inhalation by over 60% compared to open two-wheelers or autorickshaws.',
            tips: ['Check live Breathe Wise AQI before stepping out', 'Recirculate AC air inside car rather than pulling outside smoke']
          },
          {
            period: 'Mid-Day',
            timeRange: '12:00 PM – 2:00 PM',
            action: 'Midday Walk & Healthy Hydration',
            status: 'optimal',
            whyItMatters: 'Midday thermal lift thins out localized vehicle exhaust. Great time for a short campus or office courtyard walk.',
            tips: ['Take stairs to stay active', 'Hydrate with citrus water or green tea rich in antioxidants']
          },
          {
            period: 'Afternoon',
            timeRange: '4:30 PM – 6:30 PM',
            action: isHighPollution ? 'Plan Departure to Avoid Peak Gridlock' : 'Standard Commute',
            status: isHighPollution ? 'caution' : 'optimal',
            whyItMatters: 'Vehicle idling at crowded traffic signals exposes drivers to 40% higher toxic VOCs and carbon monoxide.',
            tips: ['Carpool or take rapid transit', 'Wear an N95 mask if walking near main intersections']
          },
          {
            period: 'Night',
            timeRange: '8:00 PM – 6:30 AM',
            action: 'Home Relaxation & Bedroom HEPA Filtration',
            status: 'optimal',
            whyItMatters: 'Continuous low PM2.5 exposure during REM sleep lowers blood pressure and systemic inflammation.',
            tips: ['Keep windows closed if evening AQI is >100', 'Run air purifier on whisper quiet mode']
          }
        ];
    }
  };

  const schedule = generateSchedule();

  const handleSimulateRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header & Persona Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Prana Dynamic Routine Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Personalized Daily Clean-Air Planner
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1">
              Tailored daily schedules generated in real time based on {location.name}’s current AQI of <strong>{aqi}</strong> and your specific daily lifestyle persona.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-900 dark:text-emerald-300 font-semibold text-xs rounded-xl border border-emerald-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Recalibrate for Current Hour</span>
            </button>
          </div>
        </div>

        {/* Persona Selector Cards */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 block">
            Select Your Demographic Profile:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {Object.entries(PERSONA_CONFIG).map(([key, item]) => {
              const isSelected = persona === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPersona(key as UserPersona)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-700 shadow-md scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div>
                    <div className="font-bold text-xs leading-snug">{item.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Routine Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          Recommended Chrono-Routine for {PERSONA_CONFIG[persona].label}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedule.map((slot, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-900/10 dark:border-slate-800 shadow-sm card-hover-effect flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                      {slot.period}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {slot.timeRange}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      slot.status === 'optimal'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : slot.status === 'caution'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {slot.status === 'optimal' ? 'Low Risk Window' : slot.status === 'caution' ? 'Moderate Risk' : 'Pollution Alert'}
                  </span>
                </div>

                <div className="pt-3">
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {slot.action}
                  </h4>
                  <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong className="text-slate-800 dark:text-slate-100 font-bold block mb-1">
                      Why This Recommendation Matters:
                    </strong>
                    {slot.whyItMatters}
                  </div>
                </div>
              </div>

              {/* Actionable Tips */}
              <div className="space-y-1.5 pt-2">
                {slot.tips.map((tip, tipIdx) => (
                  <div key={tipIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ask Prana to Custom Tune */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <h4 className="font-extrabold text-base">Have specific plans or unique health conditions?</h4>
          </div>
          <p className="text-xs text-emerald-200/90 leading-relaxed">
            Prana can adapt this timeline for specific meetings, marathon training schedules, or elder care requirements.
          </p>
        </div>
        <button
          onClick={() => setIsPranaModalOpen(true)}
          className="flex-shrink-0 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          Customize with Prana (प्राण)
        </button>
      </div>
    </div>
  );
}
