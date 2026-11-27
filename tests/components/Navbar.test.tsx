import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navbar from '@/components/layout/Navbar';
import * as AppContextModule from '@/context/AppContext';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

vi.mock('@/context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof AppContextModule>();
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

describe('Navbar Component', () => {
  it('renders Breathe Wise brand name, Sanskrit badge प्राण, and navigation links', () => {
    vi.mocked(AppContextModule.useApp).mockReturnValue({
      location: { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India' },
      airQuality: {
        location: { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India' },
        pollutants: {} as any,
        summary: {
          usAqi: 75,
          europeanAqi: 25,
          severityLevel: 'Moderate',
          color: '#EAB308',
          bgColor: '#FEF08A',
          borderColor: '#EAB308',
          headline: 'Moderate',
          healthRecommendation: 'Acceptable',
          outdoorSafe: true,
          maskRecommended: false,
          ventilationSafe: true,
          purifierRecommended: false,
        },
        hourlyForecast: [],
        isRealTime: true,
        lastUpdated: '2026-11-27T10:00:00Z',
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
      impactMetrics: {} as any,
      isPranaModalOpen: false,
      setIsPranaModalOpen: vi.fn(),
      requestCurrentLocation: vi.fn(),
      setLocation: vi.fn(),
    });

    render(<Navbar />);

    // Brand and Sanskrit identity
    expect(screen.getByText('Breathe Wise')).toBeInTheDocument();
    expect(screen.getAllByText('प्राण').length).toBeGreaterThan(0);

    // Navigation links
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /prana assistant/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /daily planner/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /indoor air/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sustainable living/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /impact tracker/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pollution map/i })).toBeInTheDocument();
  });
});
