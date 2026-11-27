'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { AirQualityData, GeoLocation } from '@/types/airQuality';
import { UserPersona } from '@/types/prana';
import { ActionCategory, ImpactLogEntry, ImpactMetrics, ImpactActionOption } from '@/types/impact';
import { OpenAQStation } from '@/types/openaq';
import { DEFAULT_LOCATION, fetchAirQuality } from '@/services/airQualityApi';

export const IMPACT_ACTIONS: ImpactActionOption[] = [
  {
    id: 'public-transport',
    name: 'Metro / Public Transit Commute',
    icon: 'Train',
    co2SavedPerUnitKg: 0.14, // per km vs private petrol car (180g - 40g)
    pmSavedPerUnitGram: 0.08,
    unitLabel: 'kilometers',
    defaultUnit: 15,
    description: 'Replacing single-occupancy driving with metro rail or shared electric bus transit.',
    assumptionNote: 'Based on average mid-size petrol car emitting ~180g CO₂/km vs ~40g CO₂/km per metro passenger.'
  },
  {
    id: 'cycling-walking',
    name: 'Bicycle or Walking Trip',
    icon: 'Bike',
    co2SavedPerUnitKg: 0.18, // per km
    pmSavedPerUnitGram: 0.12,
    unitLabel: 'kilometers',
    defaultUnit: 4,
    description: 'Zero-emission active mobility for short urban errands.',
    assumptionNote: 'Directly substitutes tailpipe emissions of typical short automotive trips.'
  },
  {
    id: 'carpooling',
    name: 'Shared Ride / Carpooling',
    icon: 'Users',
    co2SavedPerUnitKg: 0.09, // per km saved
    pmSavedPerUnitGram: 0.05,
    unitLabel: 'kilometers',
    defaultUnit: 12,
    description: 'Sharing vehicle occupancy with 2 or more commuters.',
    assumptionNote: 'Assumes halving individual vehicle-km footprint per commuter.'
  },
  {
    id: 'reduced-idling',
    name: 'Engine Idling Avoided',
    icon: 'PowerOff',
    co2SavedPerUnitKg: 0.04, // per minute
    pmSavedPerUnitGram: 0.03,
    unitLabel: 'minutes',
    defaultUnit: 10,
    description: 'Turning engine off during red signals and prolonged pick-up halts.',
    assumptionNote: 'Idling consumes ~0.6L fuel/hour without distance travelled, producing concentrated local PM.'
  },
  {
    id: 'energy-saving',
    name: 'Home Energy Conservation',
    icon: 'Zap',
    co2SavedPerUnitKg: 0.82, // per kWh saved (grid average)
    pmSavedPerUnitGram: 0.15,
    unitLabel: 'kWh saved',
    defaultUnit: 3,
    description: 'Turning off high-load air conditioning or switching to natural ventilation when AQI permits.',
    assumptionNote: 'Regional coal/thermal grid emission factor ~0.82 kg CO₂/kWh.'
  },
  {
    id: 'indoor-efficiency',
    name: 'Optimized Induction Cooking',
    icon: 'Flame',
    co2SavedPerUnitKg: 0.45, // per meal
    pmSavedPerUnitGram: 0.25,
    unitLabel: 'meals cooked',
    defaultUnit: 2,
    description: 'Using high-efficiency electric induction cooking instead of biomass or open combustion burners.',
    assumptionNote: 'Reduces both indoor PM2.5 spikes and direct fossil combustion emissions.'
  }
];

interface AppContextType {
  location: GeoLocation;
  setLocation: (loc: GeoLocation) => void;
  airQuality: AirQualityData | null;
  isLoading: boolean;
  error: string | null;
  refreshAirQuality: () => Promise<void>;
  persona: UserPersona;
  setPersona: (p: UserPersona) => void;
  impactLogs: ImpactLogEntry[];
  addImpactLog: (actionId: ActionCategory, quantity: number, notes?: string) => void;
  deleteImpactLog: (id: string) => void;
  clearImpactLogs: () => void;
  impactMetrics: ImpactMetrics;
  isPranaModalOpen: boolean;
  setIsPranaModalOpen: (open: boolean) => void;
  requestCurrentLocation: () => Promise<void>;
  stationContext?: OpenAQStation | null;
  setStationContext?: (st: OpenAQStation | null) => void;
  initialPranaPrompt?: string | null;
  setInitialPranaPrompt?: (prompt: string | null) => void;
  openPranaWithStation?: (station: OpenAQStation, prompt?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<GeoLocation>(DEFAULT_LOCATION);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersonaState] = useState<UserPersona>('working-professional');
  const [impactLogs, setImpactLogs] = useState<ImpactLogEntry[]>([]);
  const [isPranaModalOpen, setIsPranaModalOpen] = useState<boolean>(false);
  const [stationContext, setStationContext] = useState<OpenAQStation | null>(null);
  const [initialPranaPrompt, setInitialPranaPrompt] = useState<string | null>(null);

  const openPranaWithStation = useCallback((station: OpenAQStation, customPrompt?: string) => {
    setStationContext(station);
    const defaultPrompt = customPrompt || `Tell me about air quality at ${station.name}. Is it safe for outdoor activities?`;
    setInitialPranaPrompt(defaultPrompt);
    setIsPranaModalOpen(true);
  }, []);

  // Load persisted settings and impact logs on client mount
  useEffect(() => {
    try {
      const savedPersona = localStorage.getItem('breathewise_persona');
      if (savedPersona) setPersonaState(savedPersona as UserPersona);

      const savedLoc = localStorage.getItem('breathewise_location');
      if (savedLoc) setLocationState(JSON.parse(savedLoc));

      const savedLogs = localStorage.getItem('breathewise_impact_logs');
      if (savedLogs) {
        setImpactLogs(JSON.parse(savedLogs));
      } else {
        // Pre-populate with realistic starter entries if empty
        const initialLogs: ImpactLogEntry[] = [
          {
            id: 'sample-1',
            actionId: 'public-transport',
            actionName: 'Metro / Public Transit Commute',
            date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
            quantity: 18,
            co2SavedKg: 2.52,
            pmSavedGram: 1.44,
            notes: 'Commute via Purple Line Metro'
          },
          {
            id: 'sample-2',
            actionId: 'cycling-walking',
            actionName: 'Bicycle or Walking Trip',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            quantity: 5,
            co2SavedKg: 0.9,
            pmSavedGram: 0.6,
            notes: 'Evening grocery run by bicycle'
          },
          {
            id: 'sample-3',
            actionId: 'reduced-idling',
            actionName: 'Engine Idling Avoided',
            date: new Date().toISOString().split('T')[0],
            quantity: 12,
            co2SavedKg: 0.48,
            pmSavedGram: 0.36,
            notes: 'Shut off ignition at signal junctions'
          }
        ];
        setImpactLogs(initialLogs);
        localStorage.setItem('breathewise_impact_logs', JSON.stringify(initialLogs));
      }
    } catch (e) {
      console.warn('LocalStorage access warning:', e);
    }
  }, []);

  const setPersona = useCallback((newPersona: UserPersona) => {
    setPersonaState(newPersona);
    try {
      localStorage.setItem('breathewise_persona', newPersona);
    } catch {}
  }, []);

  const setLocation = useCallback((newLoc: GeoLocation) => {
    setLocationState(newLoc);
    try {
      localStorage.setItem('breathewise_location', JSON.stringify(newLoc));
    } catch {}
  }, []);

  const loadData = useCallback(async (loc: GeoLocation) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAirQuality(loc);
      setAirQuality(data);
    } catch (err: unknown) {
      console.error('Failed to fetch air quality:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch air quality data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(location);
  }, [location, loadData]);

  const refreshAirQuality = useCallback(async () => {
    await loadData(location);
  }, [loadData, location]);

  const requestCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLoc: GeoLocation = {
          name: 'My Current Location',
          latitude: Math.round(latitude * 10000) / 10000,
          longitude: Math.round(longitude * 10000) / 10000,
          admin1: 'Local Coordinates'
        };
        setLocation(newLoc);
      },
      (geoErr) => {
        setIsLoading(false);
        console.warn('Geolocation error:', geoErr);
        alert('Could not detect location. Please check browser permissions or select a city manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [setLocation]);

  const addImpactLog = useCallback((actionId: ActionCategory, quantity: number, notes?: string) => {
    const actionDef = IMPACT_ACTIONS.find(a => a.id === actionId);
    if (!actionDef) return;

    const co2SavedKg = Math.round(quantity * actionDef.co2SavedPerUnitKg * 100) / 100;
    const pmSavedGram = Math.round(quantity * actionDef.pmSavedPerUnitGram * 100) / 100;

    const newEntry: ImpactLogEntry = {
      id: Date.now().toString(),
      actionId,
      actionName: actionDef.name,
      date: new Date().toISOString().split('T')[0],
      quantity,
      co2SavedKg,
      pmSavedGram,
      notes
    };

    setImpactLogs(prev => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem('breathewise_impact_logs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const deleteImpactLog = useCallback((id: string) => {
    setImpactLogs(prev => {
      const updated = prev.filter(log => log.id !== id);
      try {
        localStorage.setItem('breathewise_impact_logs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearImpactLogs = useCallback(() => {
    setImpactLogs([]);
    try {
      localStorage.removeItem('breathewise_impact_logs');
    } catch {}
  }, []);

  // Calculate cumulative impact metrics
  const impactMetrics: ImpactMetrics = useMemo(() => {
    const totalCo2SavedKg = Math.round(impactLogs.reduce((acc, log) => acc + log.co2SavedKg, 0) * 10) / 10;
    const totalPmSavedGram = Math.round(impactLogs.reduce((acc, log) => acc + log.pmSavedGram, 0) * 10) / 10;
    const totalActionsCount = impactLogs.length;

    // Calculate active streak days
    const uniqueDates = Array.from(new Set(impactLogs.map(l => l.date)));
    const currentStreakDays = Math.max(1, uniqueDates.length);

    const cleanAirPoints = Math.round(totalCo2SavedKg * 10 + totalActionsCount * 5);

    return {
      totalCo2SavedKg,
      totalPmSavedGram,
      totalActionsCount,
      currentStreakDays: Math.max(1, currentStreakDays),
      cleanAirPoints,
    };
  }, [impactLogs]);

  const contextValue = useMemo<AppContextType>(() => ({
    location,
    setLocation,
    airQuality,
    isLoading,
    error,
    refreshAirQuality,
    persona,
    setPersona,
    impactLogs,
    addImpactLog,
    deleteImpactLog,
    clearImpactLogs,
    impactMetrics,
    isPranaModalOpen,
    setIsPranaModalOpen,
    requestCurrentLocation,
    stationContext,
    setStationContext,
    initialPranaPrompt,
    setInitialPranaPrompt,
    openPranaWithStation,
  }), [
    location,
    setLocation,
    airQuality,
    isLoading,
    error,
    refreshAirQuality,
    persona,
    setPersona,
    impactLogs,
    addImpactLog,
    deleteImpactLog,
    clearImpactLogs,
    impactMetrics,
    isPranaModalOpen,
    stationContext,
    initialPranaPrompt,
    openPranaWithStation,
    requestCurrentLocation,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
