import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroSection from '@/components/landing/HeroSection';
import * as AppContextModule from '@/context/AppContext';

vi.mock('@/context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof AppContextModule>();
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

describe('HeroSection Landing Component', () => {
  const mockSetIsPranaModalOpen = vi.fn();

  it('renders Breathe Better. Live Better tagline and Sanskrit branding', () => {
    vi.mocked(AppContextModule.useApp).mockReturnValue({
      location: { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India' },
      airQuality: null,
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
      setIsPranaModalOpen: mockSetIsPranaModalOpen,
      requestCurrentLocation: vi.fn(),
      setLocation: vi.fn(),
    });

    render(<HeroSection />);

    // Brand headline and tagline
    expect(screen.getByText(/Breathe Better\./i)).toBeInTheDocument();
    expect(screen.getByText(/Live Better\./i)).toBeInTheDocument();
    expect(screen.getAllByText('प्राण').length).toBeGreaterThan(0);

    // Call to action button
    const meetPranaBtn = screen.getByRole('button', { name: /Meet Prana/i });
    expect(meetPranaBtn).toBeInTheDocument();

    fireEvent.click(meetPranaBtn);
    expect(mockSetIsPranaModalOpen).toHaveBeenCalledWith(true);

    // Navigation link to dashboard
    expect(screen.getByRole('link', { name: /Explore Air Quality/i })).toBeInTheDocument();
  });
});
