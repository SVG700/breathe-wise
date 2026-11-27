import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SustainableAlternativesView from '@/components/sustainable/SustainableAlternativesView';
import * as AppContextModule from '@/context/AppContext';

vi.mock('@/context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof AppContextModule>();
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

describe('SustainableAlternativesView Component', () => {
  const mockAddImpactLog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AppContextModule.useApp).mockReturnValue({
      location: { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India' },
      airQuality: null,
      isLoading: false,
      error: null,
      refreshAirQuality: vi.fn(),
      persona: 'working-professional',
      setPersona: vi.fn(),
      impactLogs: [],
      addImpactLog: mockAddImpactLog,
      deleteImpactLog: vi.fn(),
      clearImpactLogs: vi.fn(),
      impactMetrics: {
        totalCo2SavedKg: 12.5,
        totalPmSavedGram: 6.2,
        totalActionsCount: 5,
        currentStreakDays: 3,
        cleanAirPoints: 150,
      },
      isPranaModalOpen: false,
      setIsPranaModalOpen: vi.fn(),
      requestCurrentLocation: vi.fn(),
      setLocation: vi.fn(),
    });
  });

  it('renders title and commute comparator sections', () => {
    render(<SustainableAlternativesView />);
    expect(screen.getByText(/Sustainable Living & Clean Alternatives/i)).toBeInTheDocument();
    expect(screen.getByText(/Interactive Commute Emission Comparator/i)).toBeInTheDocument();
  });

  it('calculates emissions accurately when distance slider changes', () => {
    render(<SustainableAlternativesView />);
    
    // Default 15km: Car = 15 * 0.18 = 2.7
    expect(screen.getByText('2.7')).toBeInTheDocument();

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '25' } });

    // At 25km: Car = 25 * 0.18 = 4.5
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('triggers addImpactLog when quick log action is clicked', () => {
    render(<SustainableAlternativesView />);
    
    const quickLogBtns = screen.getAllByRole('button', { name: /Log /i });
    expect(quickLogBtns.length).toBeGreaterThan(0);

    fireEvent.click(quickLogBtns[0]);
    expect(mockAddImpactLog).toHaveBeenCalled();
  });
});
