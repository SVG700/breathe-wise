import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PollutionMapView from '@/components/map/PollutionMapView';
import * as AppContextModule from '@/context/AppContext';
import * as AirQualityApiModule from '@/services/airQualityApi';

vi.mock('@/context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof AppContextModule>();
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

vi.mock('@/services/airQualityApi', async (importOriginal) => {
  const actual = await importOriginal<typeof AirQualityApiModule>();
  return {
    ...actual,
    fetchNearbyStations: vi.fn(),
  };
});

vi.mock('leaflet', () => {
  const createMockLayer = () => {
    const layer: any = {};
    layer.addTo = vi.fn().mockReturnValue(layer);
    layer.bindPopup = vi.fn().mockReturnValue(layer);
    layer.openPopup = vi.fn().mockReturnValue(layer);
    layer.on = vi.fn().mockReturnValue(layer);
    return layer;
  };

  const mockMap: any = {
    setView: vi.fn().mockReturnThis(),
    eachLayer: vi.fn(),
    removeLayer: vi.fn(),
    addLayer: vi.fn(),
  };

  return {
    default: {
      map: vi.fn(() => mockMap),
      tileLayer: vi.fn(() => createMockLayer()),
      marker: vi.fn(() => createMockLayer()),
      circle: vi.fn(() => createMockLayer()),
      polyline: vi.fn(() => createMockLayer()),
      divIcon: vi.fn(() => ({})),
      Marker: class {},
      Circle: class {},
      Polyline: class {},
    },
  };
});

describe('PollutionMapView Component', () => {
  const mockOpenPranaWithStation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AppContextModule.useApp).mockReturnValue({
      location: { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India' },
      airQuality: {
        location: { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India' },
        lastUpdated: '2026-11-27T10:00:00Z',
        summary: {
          usAqi: 85,
          europeanAqi: 28,
          severityLevel: 'Moderate',
          color: '#EAB308',
          bgColor: 'rgba(234, 179, 8, 0.1)',
          borderColor: '#EAB308',
          headline: 'Air quality is moderate.',
          healthRecommendation: 'Moderate air.',
          outdoorSafe: true,
          maskRecommended: false,
          ventilationSafe: true,
          purifierRecommended: false,
        },
        pollutants: {} as any,
        hourlyForecast: [],
        isRealTime: true,
        sourceAttribution: 'Open-Meteo',
      },
      isLoading: false,
      error: null,
      refreshAirQuality: vi.fn(),
      persona: 'working-professional',
      setPersona: vi.fn(),
      impactLogs: [],
      addImpactLog: vi.fn(),
      deleteImpactLog: vi.fn(),
      clearImpactLogs: vi.fn(),
      impactMetrics: {
        totalCo2SavedKg: 0,
        totalPmSavedGram: 0,
        totalActionsCount: 0,
        currentStreakDays: 0,
        cleanAirPoints: 0,
      },
      isPranaModalOpen: false,
      setIsPranaModalOpen: vi.fn(),
      requestCurrentLocation: vi.fn(),
      setLocation: vi.fn(),
      stationContext: null,
      setStationContext: vi.fn(),
      initialPranaPrompt: null,
      setInitialPranaPrompt: vi.fn(),
      openPranaWithStation: mockOpenPranaWithStation,
      activeTab: 'map',
      setActiveTab: vi.fn(),
    } as any);

    vi.mocked(AirQualityApiModule.fetchNearbyStations).mockResolvedValue({
      stations: [
        {
          id: 'test-station-1',
          name: 'BTM Layout Central Sensor',
          provider: 'CPCB - Karnataka SPCB',
          source: 'openaq',
          coordinates: { latitude: 12.9165, longitude: 77.6101 },
          distanceKm: 6.2,
          measurements: {
            pm25: {
              parameter: 'pm25',
              value: 48,
              unit: 'µg/m³',
              lastUpdated: '2026-11-27T10:00:00Z',
              subIndex: {
                pollutant: 'pm25',
                concentration: 48,
                unit: 'µg/m³',
                subIndex: 80,
                category: 'Satisfactory',
                categoryColor: '#14B8A6',
              },
            },
            pm10: {
              parameter: 'pm10',
              value: 75,
              unit: 'µg/m³',
              lastUpdated: '2026-11-27T10:00:00Z',
              subIndex: {
                pollutant: 'pm10',
                concentration: 75,
                unit: 'µg/m³',
                subIndex: 75,
                category: 'Satisfactory',
                categoryColor: '#14B8A6',
              },
            },
          },
          cpcbAqi: {
            aqi: 80,
            category: 'Satisfactory',
            categoryColor: '#14B8A6',
            prominentPollutant: 'pm25',
            isOfficialAqi: false,
            pollutantsCount: 2,
            hasParticulate: true,
            subIndices: { pm25: 80, pm10: 75 },
          },
          lastUpdated: '2026-11-27T10:00:00Z',
        },
      ],
      count: 1,
      openaqConfigured: true,
      radiusKm: 35,
      center: { lat: 12.9716, lon: 77.5946 },
    });
  });

  it('renders cartographic pollution map header and mode toggles', () => {
    render(<PollutionMapView />);

    expect(screen.getByText(/Interactive Pollution & Sensor Map/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Station Grid/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cleaner Route Simulator/i })).toBeInTheDocument();
  });

  it('renders pollutant filter pills in Station Grid mode', () => {
    render(<PollutionMapView />);

    expect(screen.getByRole('button', { name: /All Pollutants/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^PM2\.5$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^PM10$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^NO₂$/i })).toBeInTheDocument();
  });

  it('displays selected station drawer with CPCB AQI and Ask Prana button', async () => {
    render(<PollutionMapView />);

    await waitFor(() => {
      expect(screen.getByText('BTM Layout Central Sensor')).toBeInTheDocument();
      expect(screen.getByText(/CPCB - Karnataka SPCB/i)).toBeInTheDocument();
    });

    const askPranaBtn = screen.getByRole('button', { name: /Ask Prana \(प्राण\) about this station/i });
    expect(askPranaBtn).toBeInTheDocument();

    fireEvent.click(askPranaBtn);
    expect(mockOpenPranaWithStation).toHaveBeenCalledTimes(1);
  });

  it('switches to Cleaner Route Simulator tab and displays exposure options', () => {
    render(<PollutionMapView />);

    const routeSimulatorBtn = screen.getByRole('button', { name: /Cleaner Route Simulator/i });
    fireEvent.click(routeSimulatorBtn);

    expect(screen.getByText(/Commute Exposure Path/i)).toBeInTheDocument();
    expect(screen.getByText(/Tree-Canopied Arterial/i)).toBeInTheDocument();
  });
});
