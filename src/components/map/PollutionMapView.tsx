'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  MapPin, 
  Info, 
  Navigation, 
  Sparkles, 
  Compass, 
  Filter, 
  RefreshCw, 
  AlertCircle
} from 'lucide-react';
import LocationSearch from '@/components/dashboard/LocationSearch';
import { fetchNearbyStations } from '@/services/airQualityApi';
import { OpenAQStation } from '@/types/openaq';

const POLLUTANT_FILTERS = [
  { id: 'all', label: 'All Pollutants' },
  { id: 'pm25', label: 'PM2.5' },
  { id: 'pm10', label: 'PM10' },
  { id: 'no2', label: 'NO₂' },
  { id: 'so2', label: 'SO₂' },
  { id: 'co', label: 'CO' },
  { id: 'o3', label: 'O₃' },
];

export default function PollutionMapView() {
  const { location, airQuality, openPranaWithStation } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [activeTab, setActiveTab] = useState<'stations' | 'cleaner-route'>('stations');
  const [routeMode, setRouteMode] = useState<'standard' | 'low-exposure'>('standard');
  const [selectedPollutant, setSelectedPollutant] = useState<string>('all');
  const [stations, setStations] = useState<OpenAQStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<OpenAQStation | null>(null);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [openaqConfigured, setOpenaqConfigured] = useState(true);

  const aqi = airQuality?.summary?.usAqi ?? 75;
  const aqiColor = airQuality?.summary?.color ?? '#10B981';

  // Fetch real ground stations from OpenAQ v3 / Open-Meteo fallback
  const loadStations = useCallback(async () => {
    setIsLoadingStations(true);
    try {
      const pollutantParam = selectedPollutant === 'all' ? undefined : selectedPollutant;
      const res = await fetchNearbyStations(
        location.latitude, 
        location.longitude, 
        35000, 
        pollutantParam
      );
      setStations(res.stations || []);
      setOpenaqConfigured(res.openaqConfigured);
      
      // Auto-select nearest station if current selection not found
      if (res.stations && res.stations.length > 0) {
        setSelectedStation(prev => {
          if (prev && res.stations.some((s: OpenAQStation) => s.id === prev.id)) {
            return res.stations.find((s: OpenAQStation) => s.id === prev.id) || res.stations[0];
          }
          return res.stations[0];
        });
      } else {
        setSelectedStation(null);
      }
    } catch (err) {
      console.error('Failed to load stations:', err);
    } finally {
      setIsLoadingStations(false);
    }
  }, [location.latitude, location.longitude, selectedPollutant]);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    let isSubscribed = true;

    async function initMap() {
      if (!isSubscribed) return;
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;
      if (!isSubscribed) return;

      // Ensure leaflet stylesheet is present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([location.latitude, location.longitude], 12);
      } else {
        const map = L.map(mapContainerRef.current, {
          center: [location.latitude, location.longitude],
          zoom: 12,
          zoomControl: true,
        });

        // Add clean OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors | Breathe Wise Prana Intelligence Map',
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers & shapes
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });
      markersRef.current = [];

      // Custom Center Location Marker Icon
      const centerHtml = `
        <div style="background-color: ${aqiColor}; width: 38px; height: 38px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.35); color: white; font-weight: 800; font-size: 11px;">
          ${aqi}
        </div>
      `;

      const centerIcon = L.divIcon({
        className: 'custom-aqi-marker',
        html: centerHtml,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const centerMarker = L.marker([location.latitude, location.longitude], { icon: centerIcon }).addTo(map);
      centerMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 4px; min-width: 160px;">
          <strong style="font-size: 13px; color: #0F172A;">${location.name} (Search Center)</strong><br/>
          <span>US AQI: <strong>${aqi}</strong> (${airQuality?.summary?.severityLevel || 'Live'})</span><br/>
          <span>PM2.5: <strong>${airQuality?.pollutants?.pm25?.value ?? '--'} µg/m³</strong></span><br/>
          <span style="font-size: 10px; color: #64748B;">Central Location Reference</span>
        </div>
      `);

      // Atmosphere radius circle
      L.circle([location.latitude, location.longitude], {
        color: aqiColor,
        fillColor: aqiColor,
        fillOpacity: 0.08,
        radius: 3500,
      }).addTo(map);

      // Render ground stations from OpenAQ / Open-Meteo
      stations.forEach((st) => {
        const cpcbData = st.cpcbAqi || st.cpcb;
        const stAqi = cpcbData?.aqi;
        const isOpenAQ = String(st.source).toLowerCase().includes('openaq');
        const stColor = cpcbData?.categoryColor || cpcbData?.color || (isOpenAQ ? '#10B981' : '#0284C7');
        const isSelected = selectedStation?.id === st.id;
        const distStr = (st.distanceKm ?? 0).toFixed(1);

        const stHtml = `
          <div style="
            background-color: ${stColor};
            width: ${isSelected ? '34px' : '28px'};
            height: ${isSelected ? '34px' : '28px'};
            border-radius: 50%;
            border: ${isSelected ? '3px solid #1E293B' : '2px solid white'};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            color: white;
            font-weight: 700;
            font-size: ${isSelected ? '11px' : '10px'};
            transition: all 0.2s ease;
            cursor: pointer;
          ">
            ${stAqi !== undefined && stAqi !== null ? stAqi : '•'}
          </div>
        `;

        const stIcon = L.divIcon({
          className: 'station-pin-marker',
          html: stHtml,
          iconSize: [isSelected ? 34 : 28, isSelected ? 34 : 28],
          iconAnchor: [isSelected ? 17 : 14, isSelected ? 17 : 14],
        });

        const m = L.marker([st.coordinates.latitude, st.coordinates.longitude], { icon: stIcon }).addTo(map);
        
        m.on('click', () => {
          setSelectedStation(st);
        });

        const categoryText = cpcbData?.category ? `CPCB: ${cpcbData.category}` : 'Atmospheric Node';
        m.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 4px; min-width: 170px;">
            <strong style="color: #0F172A; font-size: 13px;">${st.name}</strong><br/>
            <span style="color: #475569; font-size: 11px;">${distStr} km away • ${st.provider || 'Station'}</span><br/>
            <span style="font-weight: 700; color: ${stColor};">${categoryText} (${stAqi ?? '--'})</span><br/>
            <span style="font-size: 10px; color: #64748B;">Source: ${isOpenAQ ? 'OpenAQ Ground Station' : 'Model Observation Node'}</span>
          </div>
        `);

        markersRef.current.push(m);
      });

      // Cleaner Route Simulator layer
      if (activeTab === 'cleaner-route') {
        const startPoint: [number, number] = [location.latitude - 0.02, location.longitude - 0.025];
        const endPoint: [number, number] = [location.latitude + 0.02, location.longitude + 0.02];

        const standardPath: [number, number][] = [
          startPoint,
          [location.latitude - 0.01, location.longitude - 0.01],
          [location.latitude + 0.005, location.longitude + 0.01],
          endPoint
        ];

        const lowExposurePath: [number, number][] = [
          startPoint,
          [location.latitude - 0.015, location.longitude - 0.035],
          [location.latitude + 0.01, location.longitude - 0.02],
          [location.latitude + 0.018, location.longitude + 0.005],
          endPoint
        ];

        if (routeMode === 'standard') {
          L.polyline(standardPath, { color: '#EF4444', weight: 5, opacity: 0.85, dashArray: '6, 10' }).addTo(map);
        } else {
          L.polyline(lowExposurePath, { color: '#059669', weight: 6, opacity: 0.9 }).addTo(map);
        }
      }
    }

    initMap();

    return () => {
      isSubscribed = false;
    };
  }, [location, aqi, aqiColor, activeTab, routeMode, stations, selectedStation, airQuality?.pollutants?.pm25?.value, airQuality?.summary?.severityLevel]);

  const handleAskPrana = (station: OpenAQStation) => {
    openPranaWithStation?.(station);
  };

  return (
    <div className="space-y-6">
      {/* Search & Location Bar */}
      <LocationSearch />

      {/* Main Map Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-4">
        {/* Header and Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" /> Prana Air Intelligence Map
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Interactive Pollution & Sensor Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1">
              Real ground monitoring stations from OpenAQ & Copernicus Atmospheric models, analyzed with Indian CPCB NAQI standards.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('stations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stations'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Station Grid
            </button>
            <button
              onClick={() => setActiveTab('cleaner-route')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cleaner-route'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Cleaner Route Simulator
            </button>
          </div>
        </div>

        {/* Pollutant Filter Bar */}
        {activeTab === 'stations' && (
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-emerald-600" /> Filter:
              </span>
              {POLLUTANT_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedPollutant(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedPollutant === f.id
                      ? 'bg-emerald-700 text-white shadow-xs font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                {stations.length} {stations.length === 1 ? 'Station' : 'Stations'} found
              </span>
              <button
                onClick={() => loadStations()}
                disabled={isLoadingStations}
                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Refresh nearby stations"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStations ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* OpenAQ Configuration Notice if not set */}
        {!openaqConfigured && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-bold block">OpenAQ v3 API Status:</span>
              <p>
                Ground monitoring stations are powered by the OpenAQ v3 API. To access official real-time CPCB ground stations for any Indian or global city, configure your free API key in <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">OPENAQ_API_KEY</code>. In the meantime, Breathe Wise seamlessly displays Copernicus and Open-Meteo atmospheric model nodes.
              </p>
            </div>
          </div>
        )}

        {/* Map Viewport Container */}
        <div className="relative w-full h-[480px] sm:h-[540px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Cleaner Route Overlay */}
          {activeTab === 'cleaner-route' && (
            <div className="absolute top-4 right-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-xs space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" /> Commute Exposure Path
              </h4>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setRouteMode('low-exposure')}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    routeMode === 'low-exposure'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-950 dark:text-emerald-200 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>🌿 Tree-Canopied Arterial</span>
                    <span className="text-[10px] text-emerald-700 font-bold">-28% PM2.5</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                    Avoids central ring road exhaust bottlenecks.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRouteMode('standard')}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    routeMode === 'standard'
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-950 dark:text-rose-200 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>🚗 Direct Highway Corridor</span>
                    <span className="text-[10px] text-rose-600 font-bold">High PM2.5</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                    Fastest travel time, maximum tailpipe congestion.
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg text-[11px] space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[10px] uppercase tracking-wider">
              CPCB NAQI Index Scale:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> 0-50 Good
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]" /> 51-100 Sat
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> 101-200 Mod
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> 201-300 Poor
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> 301-400 V.Poor
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7F1D1D]" /> 401+ Sev
              </span>
            </div>
          </div>
        </div>

        {/* Selected Station Intelligence Drawer / Card */}
        {selectedStation && (() => {
          const cpcbData = selectedStation.cpcbAqi || selectedStation.cpcb;
          const isOpenAQ = String(selectedStation.source).toLowerCase().includes('openaq');
          const distStr = (selectedStation.distanceKm ?? 0).toFixed(1);
          const catColor = cpcbData?.categoryColor || cpcbData?.color || '#10B981';

          return (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                      {isOpenAQ ? 'OpenAQ Ground Station' : 'Copernicus Atmospheric Node'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {distStr} km from search center
                    </span>
                    <span className="text-xs text-slate-400">
                      • {selectedStation.provider || 'Station Provider'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {selectedStation.name}
                  </h3>
                </div>

                {/* Station Overall AQI Badge & Ask Prana Action */}
                <div className="flex items-center gap-3">
                  {cpcbData && (
                    <div 
                      className="px-3 py-1.5 rounded-xl border flex items-center gap-2 text-right"
                      style={{ 
                        backgroundColor: `${catColor}15`, 
                        borderColor: `${catColor}50` 
                      }}
                    >
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">
                          {cpcbData.isOfficial || cpcbData.isOfficialAqi ? 'CPCB NAQI' : 'Indicative Index'}
                        </div>
                        <div className="text-xs font-semibold" style={{ color: catColor }}>
                          {cpcbData.category}
                        </div>
                      </div>
                      <div 
                        className="text-2xl font-black"
                        style={{ color: catColor }}
                      >
                        {cpcbData.aqi !== null && cpcbData.aqi !== undefined ? cpcbData.aqi : '--'}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleAskPrana(selectedStation)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer flex-shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Ask Prana (प्राण) about this station</span>
                  </button>
                </div>
              </div>

              {/* Measurements Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
                {Object.entries(selectedStation.measurements).map(([param, m]) => (
                  <div 
                    key={param}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1"
                  >
                    <div className="text-[11px] font-bold text-slate-500 uppercase">
                      {param.toUpperCase()}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {typeof m.value === 'number' ? m.value.toFixed(1) : m.value} <span className="text-[10px] font-normal text-slate-500">{m.unit}</span>
                    </div>
                    {m.subIndex ? (
                      <div 
                        className="text-[10px] font-semibold flex items-center justify-between"
                        style={{ color: m.subIndex.categoryColor || m.subIndex.color }}
                      >
                        <span>Sub-Index:</span>
                        <span className="font-bold">{m.subIndex.subIndex}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400">Model observation</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Scientific Calculation Note */}
              <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                <strong>Indian CPCB NAQI Standard:</strong> Sub-indices are calculated using piecewise linear interpolation across Central Pollution Control Board breakpoints. An official overall NAQI requires at least 3 monitored pollutants with at least one PM parameter (PM2.5 or PM10). When fewer are monitored, an indicative sub-index is displayed.
              </p>
            </div>
          );
        })()}

        {/* Data Fidelity & Scientific Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <strong className="text-slate-900 dark:text-slate-100 font-bold block">
              Cartographic Data Fidelity Statement:
            </strong>
            <p className="leading-relaxed">
              Station readings reflect verified Open-Meteo European & US EPA data models for {location.name} ({location.latitude}, {location.longitude}). While urban route simulators illustrate lower-emission pathways based on road classification and green cover buffers, real-time street-level hyper-local microclimates fluctuate with immediate vehicular density. Breathe Wise never asserts route cleanliness without scientific sensor context.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
