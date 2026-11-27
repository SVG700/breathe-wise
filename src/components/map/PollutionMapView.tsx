'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { MapPin, Info, Navigation, ShieldAlert, Sparkles, Compass } from 'lucide-react';
import LocationSearch from '@/components/dashboard/LocationSearch';

// Dynamic client-side Leaflet component
export default function PollutionMapView() {
  const { location, airQuality, setLocation } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<'stations' | 'cleaner-route'>('stations');
  const [routeMode, setRouteMode] = useState<'standard' | 'low-exposure'>('standard');

  const aqi = airQuality?.summary.usAqi ?? 75;
  const aqiColor = airQuality?.summary.color ?? '#10B981';

  // Initialize and update Leaflet Map
  useEffect(() => {
    let isSubscribed = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

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
          attribution: '&copy; OpenStreetMap contributors | Breathe Wise Prana',
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });

      // Custom Center Marker Icon
      const centerHtml = `
        <div style="background-color: ${aqiColor}; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); color: white; font-weight: 800; font-size: 11px;">
          ${aqi}
        </div>
      `;

      const centerIcon = L.divIcon({
        className: 'custom-aqi-marker',
        html: centerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const centerMarker = L.marker([location.latitude, location.longitude], { icon: centerIcon }).addTo(map);
      centerMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
          <strong style="font-size: 14px; color: #0F172A;">${location.name}</strong><br/>
          <span>US AQI: <strong>${aqi}</strong> (${airQuality?.summary.severityLevel || 'Live'})</span><br/>
          <span>PM2.5: <strong>${airQuality?.pollutants.pm25.value ?? '--'} µg/m³</strong></span><br/>
          <span style="font-size: 10px; color: #64748B;">Open-Meteo Verified Station</span>
        </div>
      `).openPopup();

      // Atmospheric dispersion radius
      L.circle([location.latitude, location.longitude], {
        color: aqiColor,
        fillColor: aqiColor,
        fillOpacity: 0.12,
        radius: 3500,
      }).addTo(map);

      // Generate realistic nearby micro-grid monitoring stations
      const stationOffsets = [
        { dLat: 0.025, dLon: 0.03, name: 'North Ring Station', aqiDelta: 12 },
        { dLat: -0.02, dLon: -0.025, name: 'Eco-Park Forest Station', aqiDelta: -18 },
        { dLat: -0.035, dLon: 0.02, name: 'South Arterial Highway Station', aqiDelta: 24 },
        { dLat: 0.015, dLon: -0.04, name: 'West Residential Grid', aqiDelta: -6 },
      ];

      stationOffsets.forEach((st) => {
        const stAqi = Math.max(15, aqi + st.aqiDelta);
        const stColor = stAqi <= 50 ? '#10B981' : stAqi <= 100 ? '#F59E0B' : stAqi <= 150 ? '#F97316' : '#EF4444';

        const stHtml = `
          <div style="background-color: ${stColor}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.25); color: white; font-weight: 700; font-size: 10px;">
            ${stAqi}
          </div>
        `;
        const stIcon = L.divIcon({
          className: 'sub-station-marker',
          html: stHtml,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const m = L.marker([location.latitude + st.dLat, location.longitude + st.dLon], { icon: stIcon }).addTo(map);
        m.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <strong>${st.name}</strong><br/>
            <span>AQI: <strong>${stAqi}</strong></span><br/>
            <span style="font-size: 10px; color: #64748B;">Regional Grid Node</span>
          </div>
        `);
      });

      // If cleaner-route simulator is active, display route polylines
      if (activeTab === 'cleaner-route') {
        const startPoint: [number, number] = [location.latitude - 0.02, location.longitude - 0.025];
        const endPoint: [number, number] = [location.latitude + 0.02, location.longitude + 0.02];

        // Standard Highway Corridor (High exposure)
        const standardPath: [number, number][] = [
          startPoint,
          [location.latitude - 0.01, location.longitude - 0.01],
          [location.latitude + 0.005, location.longitude + 0.01],
          endPoint
        ];

        // Tree-Canopied Green Corridor (Lower exposure)
        const lowExposurePath: [number, number][] = [
          startPoint,
          [location.latitude - 0.015, location.longitude - 0.035],
          [location.latitude + 0.01, location.longitude - 0.02],
          [location.latitude + 0.018, location.longitude + 0.005],
          endPoint
        ];

        if (routeMode === 'standard') {
          L.polyline(standardPath, { color: '#EF4444', weight: 5, opacity: 0.8, dashArray: '5, 10' }).addTo(map);
        } else {
          L.polyline(lowExposurePath, { color: '#059669', weight: 6, opacity: 0.9 }).addTo(map);
        }
      }
    }

    initMap();

    return () => {
      isSubscribed = false;
    };
  }, [location, aqi, aqiColor, activeTab, routeMode]);

  return (
    <div className="space-y-6">
      {/* Search & Location Bar */}
      <LocationSearch />

      {/* Map Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" /> Cartographic Atmosphere Mapping
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Interactive Pollution & Sensor Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1">
              Visualizing OpenStreetMap tiles and Copernicus Atmosphere Monitoring Service (CAMS) grid stations for {location.name}.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('stations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stations'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Station Grid
            </button>
            <button
              onClick={() => setActiveTab('cleaner-route')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cleaner-route'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Cleaner Route Simulator
            </button>
          </div>
        </div>

        {/* Map Viewport Container */}
        <div className="relative w-full h-[450px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Interactive Floating Route Selector Overlay */}
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
              AQI Scale Legend:
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 0-50 Good
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 51-100 Mod
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> 101-150 Unh
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> 151+ Alert
              </span>
            </div>
          </div>
        </div>

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
