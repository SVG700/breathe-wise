import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PranaChatView from '@/components/prana/PranaChatView';
import * as AppContextModule from '@/context/AppContext';

vi.mock('@/context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof AppContextModule>();
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

describe('PranaChatView Component', () => {
  const mockLocation = {
    name: 'Bengaluru',
    latitude: 12.9716,
    longitude: 77.5946,
    country: 'India',
  };

  const mockAirQuality = {
    location: mockLocation,
    current: { aqi: 85, pm25: 28.5, pm10: 65, no2: 20, so2: 8, o3: 35, co: 450 },
    pollutants: {
      pm25: { name: 'PM2.5', code: 'pm25', value: 28.5, unit: 'µg/m³', whoLimit: 15, ratioOfLimit: 1.9, status: 'fair' },
    },
    summary: {
      usAqi: 85,
      severityLevel: 'Moderate',
      color: '#EAB308',
      primaryPollutant: 'PM2.5',
      headline: 'Air quality is moderate.',
      healthImplications: 'Acceptable air quality.',
    },
    forecast: [],
    hourly: [],
    lastUpdated: '2026-11-27T10:00:00Z',
    sourceAttribution: 'Open-Meteo',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AppContextModule.useApp).mockReturnValue({
      location: mockLocation,
      airQuality: mockAirQuality as any,
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

  it('renders initial welcome message containing Prana (प्राण) identity', () => {
    render(<PranaChatView />);
    expect(screen.getAllByText(/Prana \(प्राण\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bengaluru/i).length).toBeGreaterThan(0);
  });

  it('renders suggested prompts for quick exploration', () => {
    render(<PranaChatView />);
    expect(screen.getByText(/Is it safe to go jogging today\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Should I open my windows today\?/i)).toBeInTheDocument();
  });

  it('allows user to type into message input field', () => {
    render(<PranaChatView />);
    const input = screen.getByPlaceholderText(/Ask Prana about/i);
    fireEvent.change(input, { target: { value: 'Should I wear a mask today?' } });
    expect(input).toHaveValue('Should I wear a mask today?');
  });

  it('submits a message and triggers fetch call to /api/prana/chat', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: 'Based on your AQI of 85, a mask is generally optional for healthy adults.',
        modelUsed: 'Google Gemini 3.5 Flash (Prana AI)',
        isFallback: false,
      }),
    });

    render(<PranaChatView />);
    const input = screen.getByPlaceholderText(/Ask Prana about/i);
    fireEvent.change(input, { target: { value: 'Should I wear a mask today?' } });

    // Find and click the send button
    const submitBtn = screen.getByRole('button', { name: /send/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/prana/chat',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});
