import React from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Sparkles, 
  CalendarDays, 
  Home, 
  Leaf, 
  BarChart3, 
  MapPin, 
  ArrowRight 
} from 'lucide-react';

const FEATURES = [
  {
    icon: Compass,
    title: 'Live Air Quality Dashboard',
    desc: 'Instant, real-time measurements of US AQI, PM2.5, PM10, Ozone, NO₂, and CO backed by Open-Meteo and Copernicus CAMS models.',
    href: '/dashboard',
    tag: 'Verified Sensor Data'
  },
  {
    icon: Sparkles,
    title: 'Prana (प्राण) AI Assistant',
    desc: 'Dedicated conversational environmental intelligence answering everyday lifestyle questions with scientific reasoning and empathy.',
    href: '/assistant',
    tag: 'Powered by Gemini'
  },
  {
    icon: CalendarDays,
    title: 'Personalized Daily Planner',
    desc: 'Dynamic daily schedules adapted to your demographic profile—from school children and seniors to working professionals and athletes.',
    href: '/planner',
    tag: 'Circadian Air Planning'
  },
  {
    icon: Home,
    title: 'Indoor Air Quality Advisor',
    desc: 'Actionable guidance on window ventilation timing, kitchen exhausts, HEPA filtration, and honest science on indoor plants.',
    href: '/indoor',
    tag: 'Home Sanctuary'
  },
  {
    icon: Leaf,
    title: 'Sustainable Living Alternatives',
    desc: 'Practical, low-emission travel and energy choices with transparent CO₂ calculations and clear implementation steps.',
    href: '/sustainable',
    tag: 'Lower Your Footprint'
  },
  {
    icon: BarChart3,
    title: 'Environmental Impact Tracker',
    desc: 'Log daily transit and energy-saving decisions to visualize cumulative avoided CO₂ and clean air credits on interactive charts.',
    href: '/impact',
    tag: 'Personal Stewardship'
  },
  {
    icon: MapPin,
    title: 'Cartographic Pollution Map',
    desc: 'Interactive Leaflet OpenStreetMap exploration of regional monitoring nodes and lower-exposure urban commute paths.',
    href: '/map',
    tag: 'Spatial Intelligence'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
            Complete Environmental Companion
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Designed for Smarter, Healthier Daily Living
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Breathe Wise transforms complex atmospheric data into practical, intuitive decisions that protect respiratory wellness and foster sustainable communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Link
                key={idx}
                href={feature.href}
                className="group p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-500/40 hover:shadow-xl transition-all card-hover-effect flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/50 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-700/50">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 group-hover:gap-2.5 transition-all">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
