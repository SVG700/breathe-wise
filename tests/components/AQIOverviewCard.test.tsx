import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AQIOverviewCard from '@/components/dashboard/AQIOverviewCard';
import * as AppContextModule from '@/context/AppContext';

vi.mock('@/context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof AppContextModule>();
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

describe('AQIOverviewCard Component', () => {
  it('renders loading skeleton when isLoading is true', () => {
    vi.mocked(AppContextModule.useApp).mockReturnValue({
      location: { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India' },
      airQuality: null,
      isLoading: true,
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

    const { container } = render(<AQIOverviewCard />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders air quality metrics, category badge, and safety checkpoints correctly', () => {
    vi.mocked(AppContextModule.useApp).mockReturnValue({
      location: { name: 'Bengaluru', admin1: 'Karnataka', latitude: 12.9716, longitude: 77.5946, country: 'India' },
      airQuality: {
        location: { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India' },
        lastUpdated: '2026-11-27T10:00:00Z',
        summary: {
          usAqi: 142,
          europeanAqi: 48,
          severityLevel: 'Unhealthy for Sensitive Groups',
          color: '#F97316',
          bgColor: 'rgba(249, 115, 22, 0.1)',
          borderColor: '#F97316',
          headline: 'Elevated particle concentrations observed.',
          healthRecommendation: 'Sensitive individuals should limit prolonged outdoor exertion.',
          outdoorSafe: false,
          maskRecommended: true,
          ventilationSafe: false,
          purifierRecommended: true,
        },
        pollutants: {
          pm25: { code: 'pm25', name: 'PM2.5', value: 52.3, unit: 'µg/m³', safeLimit: 15, severity: 'unhealthy-sensitive', description: 'Fine particles', source: 'Vehicles' },
          pm10: { code: 'pm10', name: 'PM10', value: 105.8, unit: 'µg/m³', safeLimit: 45, severity: 'moderate', description: 'Coarse dust', source: 'Road dust' },
          nitrogenDioxide: { code: 'no2', name: 'NO₂', value: 28.4, unit: 'µg/m³', safeLimit: 25, severity: 'moderate', description: 'Nitrogen dioxide', source: 'Traffic' },
          sulphurDioxide: { code: 'so2', name: 'SO₂', value: 12.1, unit: 'µg/m³', safeLimit: 40, severity: 'good', description: 'Sulfur dioxide', source: 'Industry' },
          ozone: { code: 'o3', name: 'Ozone', value: 45.2, unit: 'µg/m³', safeLimit: 100, severity: 'good', description: 'Ground ozone', source: 'Sunlight' },
          carbonMonoxide: { code: 'co', name: 'CO', value: 680, unit: 'µg/m³', safeLimit: 4000, severity: 'good', description: 'Carbon monoxide', source: 'Combustion' },
        },
        hourlyForecast: [],
        isRealTime: true,
        sourceAttribution: 'Open-Meteo Air Quality API',
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

    render(<AQIOverviewCard />);

    // Verify location name
    expect(screen.getByText(/Bengaluru/i)).toBeInTheDocument();
    expect(screen.getByText(/Karnataka/i)).toBeInTheDocument();

    // Verify AQI numeric score and category
    expect(screen.getByText('142')).toBeInTheDocument();
    expect(screen.getByText(/Unhealthy for Sensitive Groups/i)).toBeInTheDocument();
    expect(screen.getByText(/Elevated particle concentrations observed/i)).toBeInTheDocument();

    // Verify practical safety checkpoints
    expect(screen.getByText('Caution / Avoid')).toBeInTheDocument();
    expect(screen.getByText('Recommended Outdoors')).toBeInTheDocument();
    expect(screen.getByText('Keep Windows Closed')).toBeInTheDocument();
    expect(screen.getByText('Run on Auto/High')).toBeInTheDocument();
  });
});
