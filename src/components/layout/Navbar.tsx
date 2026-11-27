'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Wind, 
  Sparkles, 
  Compass, 
  CalendarDays, 
  Home, 
  Leaf, 
  BarChart3, 
  MapPin, 
  Menu, 
  X,
  RefreshCw
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { location, airQuality, isLoading, refreshAirQuality, setIsPranaModalOpen } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Compass },
    { href: '/assistant', label: 'Prana Assistant', icon: Sparkles, badge: 'प्राण' },
    { href: '/planner', label: 'Daily Planner', icon: CalendarDays },
    { href: '/indoor', label: 'Indoor Air', icon: Home },
    { href: '/sustainable', label: 'Sustainable Living', icon: Leaf },
    { href: '/impact', label: 'Impact Tracker', icon: BarChart3 },
    { href: '/map', label: 'Pollution Map', icon: MapPin },
  ];

  const aqiVal = airQuality?.summary.usAqi ?? 0;
  const aqiColor = airQuality?.summary.color ?? '#10B981';
  const aqiSeverity = airQuality?.summary.severityLevel ?? 'Loading...';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-emerald-900/10 dark:border-emerald-500/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group focus:outline-none"
          title="Breathe Wise — Powered by Prana (प्राण)"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
            <Wind className="w-5 h-5 text-emerald-100" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-emerald-950 dark:text-emerald-100">
                Breathe Wise
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded tracking-wider border border-emerald-200 dark:border-emerald-700/50">
                प्राण
              </span>
            </div>
            <span className="text-[11px] font-medium text-emerald-700/80 dark:text-emerald-400/80 tracking-wide">
              Breathe Better. Live Better.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-200' : 'text-slate-500'}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className={`text-[10px] px-1 py-0.2 rounded font-sans ${isActive ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-100 text-emerald-800'}`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="hidden md:flex items-center gap-3">
          {/* Live AQI Indicator Badge */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 transition-all text-xs"
            title="Current live location air quality"
          >
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: aqiColor }}
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
              {location.name}
            </span>
            <span
              className="px-1.5 py-0.5 rounded font-bold text-[11px] text-white"
              style={{ backgroundColor: aqiColor }}
            >
              AQI {aqiVal}
            </span>
          </Link>

          {/* Quick Refresh */}
          <button
            onClick={() => refreshAirQuality()}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title="Refresh air quality readings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Quick Chat Overlay Button */}
          <button
            onClick={() => setIsPranaModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white text-xs font-semibold shadow-md shadow-emerald-900/15 hover:shadow-lg hover:from-emerald-800 hover:to-teal-900 hover:scale-[1.02] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Ask Prana</span>
            <span className="text-[10px] opacity-80 font-normal">प्राण</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex xl:hidden items-center gap-2">
          <button
            onClick={() => setIsPranaModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Prana</span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-slate-900 border-b border-emerald-900/10 dark:border-emerald-700/20 px-4 pt-2 pb-6 space-y-2 shadow-xl">
          <div className="p-3 bg-emerald-50 dark:bg-slate-800/80 rounded-xl mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: aqiColor }} />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {location.name}: AQI {aqiVal} ({aqiSeverity})
              </span>
            </div>
            <button
              onClick={() => refreshAirQuality()}
              className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-800 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-200' : 'text-slate-500'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-1.5 py-0.5 rounded">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
