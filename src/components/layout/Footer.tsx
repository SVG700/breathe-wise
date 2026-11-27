'use client';

import React from 'react';
import Link from 'next/link';
import { Wind, ShieldCheck, Heart, ExternalLink, Leaf } from 'lucide-react';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Wind className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl text-white tracking-tight">Breathe Wise</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    प्राण
                  </span>
                </div>
                <p className="text-xs text-emerald-400 font-medium">Breathe Better. Live Better.</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              An intelligent urban environmental health companion powered by Prana (प्राण). Helping individuals, families, and communities navigate polluted environments through verified science, actionable daily routines, and lower-emission lifestyle choices.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Open Data
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Climate Action
              </span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Air Quality Dashboard</Link></li>
              <li><Link href="/assistant" className="hover:text-emerald-400 transition-colors">Prana Assistant (प्राण)</Link></li>
              <li><Link href="/planner" className="hover:text-emerald-400 transition-colors">Personalized Daily Planner</Link></li>
              <li><Link href="/indoor" className="hover:text-emerald-400 transition-colors">Indoor Air Quality Advisor</Link></li>
              <li><Link href="/sustainable" className="hover:text-emerald-400 transition-colors">Sustainable Alternatives</Link></li>
              <li><Link href="/impact" className="hover:text-emerald-400 transition-colors">Environmental Impact Tracker</Link></li>
              <li><Link href="/map" className="hover:text-emerald-400 transition-colors">Pollution Map</Link></li>
            </ul>
          </div>

          {/* Environmental Data Sources */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Data Transparency</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-1">
                <span>Open-Meteo Air Quality</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </li>
              <li className="flex items-center gap-1">
                <span>Copernicus CAMS Model</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </li>
              <li>US EPA Air Quality Index Standards</li>
              <li>WHO Global Air Quality Guidelines</li>
              <li>OpenStreetMap Cartography</li>
              <li>IPCC & EPA Commute Emission Factors</li>
            </ul>
          </div>

          {/* Disclaimers & Ethics */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Scientific Integrity</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Breathe Wise never fabricates real-time sensor metrics. Prana provides preventative guidance based on verified meteorological models and peer-reviewed exposure sciences. Prana is an environmental advisor, not a doctor. Consult medical professionals for clinical respiratory symptoms.
            </p>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} Breathe Wise. All rights reserved. Powered by Prana (प्राण).</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Crafted for clean air and human health <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
