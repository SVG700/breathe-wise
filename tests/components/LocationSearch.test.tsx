import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LocationSearch from '@/components/dashboard/LocationSearch';
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
    searchLocations: vi.fn(),
  };
});

describe('LocationSearch Component', () => {
  const mockSetLocation = vi.fn();
  const mockRequestCurrentLocation = vi.fn();

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
      addImpactLog: vi.fn(),
      deleteImpactLog: vi.fn(),
      clearImpactLogs: vi.fn(),
      impactMetrics: {} as any,
      isPranaModalOpen: false,
      setIsPranaModalOpen: vi.fn(),
      requestCurrentLocation: mockRequestCurrentLocation,
      setLocation: mockSetLocation,
    });
  });

  it('renders search input, geolocation button, and popular cities', () => {
    render(<LocationSearch />);

    expect(screen.getByPlaceholderText(/Search city, town, or district/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Use My Geolocation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delhi/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mumbai/i })).toBeInTheDocument();
  });

  it('clicking a popular city updates location state', () => {
    render(<LocationSearch />);

    const delhiBtn = screen.getByRole('button', { name: /New Delhi/i });
    fireEvent.click(delhiBtn);

    expect(mockSetLocation).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Delhi' })
    );
  });

  it('triggers geolocation callback when geolocation button is clicked', () => {
    render(<LocationSearch />);

    const geoBtn = screen.getByRole('button', { name: /Use My Geolocation/i });
    fireEvent.click(geoBtn);

    expect(mockRequestCurrentLocation).toHaveBeenCalled();
  });

  it('performs location search and allows selecting a search result', async () => {
    vi.mocked(AirQualityApiModule.searchLocations).mockResolvedValue([
      { name: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041 },
    ]);

    render(<LocationSearch />);

    const input = screen.getByPlaceholderText(/Search city, town, or district/i);
    fireEvent.change(input, { target: { value: 'Amsterdam' } });

    const submitBtn = screen.getByRole('button', { name: /Submit search query/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Amsterdam')).toBeInTheDocument();
      expect(screen.getByText('Netherlands')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Amsterdam'));
    expect(mockSetLocation).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Amsterdam' })
    );
  });
});
