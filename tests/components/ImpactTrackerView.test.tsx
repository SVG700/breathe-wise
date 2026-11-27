import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImpactTrackerView from '@/components/impact/ImpactTrackerView';
import * as AppContextModule from '@/context/AppContext';

vi.mock('@/context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof AppContextModule>();
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

describe('ImpactTrackerView Component', () => {
  const mockAddImpactLog = vi.fn();
  const mockDeleteImpactLog = vi.fn();
  const mockClearImpactLogs = vi.fn();

  const mockLogs = [
    {
      id: 'log-1',
      actionId: 'public-transport' as const,
      actionName: 'Metro / Public Transit Commute',
      date: '2026-11-26',
      quantity: 15,
      co2SavedKg: 2.1,
      pmSavedGram: 1.2,
      notes: 'Commute to Whitefield',
    },
    {
      id: 'log-2',
      actionId: 'cycling-walking' as const,
      actionName: 'Bicycle or Walking Trip',
      date: '2026-11-27',
      quantity: 4,
      co2SavedKg: 0.72,
      pmSavedGram: 0.48,
      notes: 'Grocery run',
    },
  ];

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
      impactLogs: mockLogs,
      addImpactLog: mockAddImpactLog,
      deleteImpactLog: mockDeleteImpactLog,
      clearImpactLogs: mockClearImpactLogs,
      impactMetrics: {
        totalCo2SavedKg: 2.82,
        totalPmSavedGram: 1.68,
        totalActionsCount: 2,
        currentStreakDays: 2,
        cleanAirPoints: 120,
      },
      isPranaModalOpen: false,
      setIsPranaModalOpen: vi.fn(),
      requestCurrentLocation: vi.fn(),
      setLocation: vi.fn(),
    });
  });

  it('renders overall impact metrics cards with accurate totals', () => {
    render(<ImpactTrackerView />);

    expect(screen.getByText('2.82')).toBeInTheDocument(); // Total CO2 saved
    expect(screen.getByText('1.68')).toBeInTheDocument(); // Total PM saved
    expect(screen.getByText(/Green Streak/i)).toBeInTheDocument();
  });

  it('renders list of logged impact actions', () => {
    render(<ImpactTrackerView />);

    expect(screen.getByText('Metro / Public Transit Commute')).toBeInTheDocument();
    expect(screen.getByText('Bicycle or Walking Trip')).toBeInTheDocument();
    expect(screen.getByText(/Commute to Whitefield/i)).toBeInTheDocument();
  });

  it('triggers deleteImpactLog when a log entry delete button is clicked', () => {
    render(<ImpactTrackerView />);

    const deleteButtons = screen.getAllByRole('button', { name: /Delete entry/i });
    expect(deleteButtons.length).toBeGreaterThan(0);

    fireEvent.click(deleteButtons[0]);
    expect(mockDeleteImpactLog).toHaveBeenCalledWith('log-1');
  });

  it('opens log action modal when "Record Sustainable Choice" button is clicked', () => {
    render(<ImpactTrackerView />);

    const openModalBtn = screen.getByRole('button', { name: /Record Sustainable Choice/i });
    fireEvent.click(openModalBtn);

    expect(screen.getByText(/Record a Clean-Air Action/i)).toBeInTheDocument();
  });
});
