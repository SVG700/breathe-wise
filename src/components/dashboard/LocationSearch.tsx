'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { POPULAR_CITIES, searchLocations } from '@/services/airQualityApi';
import { GeoLocation } from '@/types/airQuality';
import { Search, MapPin, Navigation, Loader2 } from 'lucide-react';

export default function LocationSearch() {
  const { location, setLocation, requestCurrentLocation, isLoading } = useApp();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchLocations(query);
      setSearchResults(results);
      setShowDropdown(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (loc: GeoLocation) => {
    setLocation(loc);
    setShowDropdown(false);
    setQuery('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, town, or district (e.g., Delhi, London, Tokyo)..."
              aria-label="Search city, town, or district"
              className="w-full pl-10 pr-24 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              aria-label="Submit search query"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors disabled:opacity-40"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 dark:hover:bg-slate-700/60 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/40 last:border-0"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.name} {item.admin1 ? `, ${item.admin1}` : ''}
                  </span>
                  <span className="text-xs text-slate-400">{item.country}</span>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Geolocation Button */}
        <button
          onClick={requestCurrentLocation}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
          title="Detect location automatically via browser"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>Use My Geolocation</span>
        </button>
      </div>

      {/* Popular Quick-Select Cities */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-xs">
        <span className="text-slate-400 font-medium whitespace-nowrap mr-1">Popular:</span>
        {POPULAR_CITIES.map((c) => {
          const isSelected = location.name.toLowerCase() === c.name.toLowerCase();
          return (
            <button
              key={c.name}
              onClick={() => handleSelect(c)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-emerald-800 text-white font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 font-medium'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
