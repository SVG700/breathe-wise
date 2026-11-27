import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PollutionMapView from '@/components/map/PollutionMapView';
import * as AppContextModule from '@/context/AppContext';

vi.mock('@/context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof AppContextModule>();
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

vi.mock('leaflet', () => {
  const createMockLayer = () => {
    const layer: any = {};
    layer.addTo = vi.fn().mockReturnValue(layer);
    layer.bindPopup = vi.fn().mockReturnValue(layer);
    layer.openPopup = vi.fn().mockReturnValue(layer);
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
    });
  });

  it('renders cartographic pollution map header and mode toggles', () => {
    render(<PollutionMapView />);

    expect(screen.getByText(/Interactive Pollution & Sensor Map/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Station Grid/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cleaner Route Simulator/i })).toBeInTheDocument();
  });

  it('switches to Cleaner Route Simulator tab and displays exposure options', () => {
    render(<PollutionMapView />);

    const routeSimulatorBtn = screen.getByRole('button', { name: /Cleaner Route Simulator/i });
    fireEvent.click(routeSimulatorBtn);

    expect(screen.getByText(/Commute Exposure Path/i)).toBeInTheDocument();
    expect(screen.getByText(/Tree-Canopied Arterial/i)).toBeInTheDocument();
  });
});
