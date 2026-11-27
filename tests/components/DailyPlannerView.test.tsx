import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DailyPlannerView from '@/components/planner/DailyPlannerView';
import * as AppContextModule from '@/context/AppContext';

vi.mock('@/context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof AppContextModule>();
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

describe('DailyPlannerView Component', () => {
  const mockSetPersona = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AppContextModule.useApp).mockReturnValue({
      location: { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India' },
      airQuality: {
        location: { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India' },
        lastUpdated: '2026-11-27T10:00:00Z',
        summary: {
          usAqi: 75,
          europeanAqi: 25,
          severityLevel: 'Moderate',
          color: '#EAB308',
          bgColor: 'rgba(234, 179, 8, 0.1)',
          borderColor: '#EAB308',
          headline: 'Air quality is moderate.',
          healthRecommendation: 'Enjoy moderate outdoor activities.',
          outdoorSafe: true,
          maskRecommended: false,
          ventilationSafe: true,
          purifierRecommended: false,
        },
        pollutants: {
          pm25: { code: 'pm25', name: 'PM2.5', value: 24.5, unit: 'µg/m³', safeLimit: 15, severity: 'moderate', description: 'Fine particles', source: 'Traffic' },
          pm10: { code: 'pm10', name: 'PM10', value: 55, unit: 'µg/m³', safeLimit: 45, severity: 'moderate', description: 'Coarse dust', source: 'Road dust' },
          nitrogenDioxide: { code: 'no2', name: 'NO₂', value: 18, unit: 'µg/m³', safeLimit: 25, severity: 'good', description: 'Nitrogen dioxide', source: 'Traffic' },
          sulphurDioxide: { code: 'so2', name: 'SO₂', value: 8, unit: 'µg/m³', safeLimit: 40, severity: 'good', description: 'Sulfur dioxide', source: 'Industry' },
          ozone: { code: 'o3', name: 'Ozone', value: 35, unit: 'µg/m³', safeLimit: 100, severity: 'good', description: 'Ground ozone', source: 'Sunlight' },
          carbonMonoxide: { code: 'co', name: 'CO', value: 420, unit: 'µg/m³', safeLimit: 4000, severity: 'good', description: 'Carbon monoxide', source: 'Combustion' },
        },
        hourlyForecast: [],
        isRealTime: true,
        sourceAttribution: 'Open-Meteo',
      },
      isLoading: false,
      error: null,
      refreshAirQuality: vi.fn(),
      persona: 'working-professional',
      setPersona: mockSetPersona,
      impactLogs: [],
      addImpactLog: vi.fn(),
      deleteImpactLog: vi.fn(),
      clearImpactLogs: vi.fn(),
      impactMetrics: {} as any,
      isPranaModalOpen: false,
      setIsPranaModalOpen: vi.fn(),
      requestCurrentLocation: vi.fn(),
      setLocation: vi.fn(),
    });
  });

  it('renders persona selector options and daily routine schedule', () => {
    render(<DailyPlannerView />);

    expect(screen.getByText(/Personalized Daily Clean-Air Planner/i)).toBeInTheDocument();
    expect(screen.getByText('Working Professional')).toBeInTheDocument();
    expect(screen.getByText('Senior Citizen')).toBeInTheDocument();
    expect(screen.getByText('School Student')).toBeInTheDocument();
  });

  it('calls setPersona when another persona button is selected', () => {
    render(<DailyPlannerView />);

    const seniorBtn = screen.getByRole('button', { name: /Senior Citizen/i });
    fireEvent.click(seniorBtn);

    expect(mockSetPersona).toHaveBeenCalledWith('senior-citizen');
  });

  it('renders time-slotted routine steps with why-it-matters explanations', () => {
    render(<DailyPlannerView />);

    expect(screen.getByText('Morning')).toBeInTheDocument();
    expect(screen.getByText('Night')).toBeInTheDocument();
  });
});
