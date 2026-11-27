import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IndoorAdvisorView from '@/components/indoor/IndoorAdvisorView';
import * as AppContextModule from '@/context/AppContext';

vi.mock('@/context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof AppContextModule>();
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

describe('IndoorAdvisorView Component', () => {
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

  it('renders IAQ diagnostic interface with outdoor baseline', () => {
    render(<IndoorAdvisorView />);

    expect(screen.getByText(/Indoor Air Quality \(IAQ\) Advisor/i)).toBeInTheDocument();
    expect(screen.getByText(/Current ambient outdoor baseline in/i)).toBeInTheDocument();
    expect(screen.getByText('Bengaluru')).toBeInTheDocument();
  });

  it('displays the dwelling layout and exterior exposure controls', () => {
    render(<IndoorAdvisorView />);

    expect(screen.getByRole('button', { name: /Mid\/High-Rise Apartment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Facing Main Traffic Road/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Facing Park or Trees/i })).toBeInTheDocument();
  });

  it('updates risk profile when selecting different dwelling options', () => {
    render(<IndoorAdvisorView />);

    const parkFacingBtn = screen.getByRole('button', { name: /Facing Park or Trees/i });
    fireEvent.click(parkFacingBtn);

    // After switching from busy street to park facing, low risk badge should be visible
    expect(screen.getByText(/Low Risk/i)).toBeInTheDocument();
  });

  it('renders the scientific comparison between mechanical HEPA and houseplants', () => {
    render(<IndoorAdvisorView />);

    expect(screen.getByText(/Science Reality Check: Indoor Plants vs/i)).toBeInTheDocument();
    expect(screen.getByText(/Plants do NOT meaningfully capture PM2.5/i)).toBeInTheDocument();
  });
});
