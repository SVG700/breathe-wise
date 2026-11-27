import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AQIOverviewCard from '@/components/dashboard/AQIOverviewCard';
import IndoorAdvisorView from '@/components/indoor/IndoorAdvisorView';
import SustainableAlternativesView from '@/components/sustainable/SustainableAlternativesView';
import PranaAssistantModal from '@/components/prana/PranaAssistantModal';
import * as AppContextModule from '@/context/AppContext';

vi.mock('@/context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof AppContextModule>();
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

// Mock PranaChatView inside modal to avoid child hook dependencies
vi.mock('@/components/prana/PranaChatView', () => ({
  default: () => <div data-testid="mocked-prana-chat">Prana Chat Body</div>,
}));

describe('WCAG 2.1 AA Accessibility Standards Verification', () => {
  const baseMockContext = {
    location: { name: 'Bengaluru', admin1: 'Karnataka', latitude: 12.9716, longitude: 77.5946, country: 'India' },
    airQuality: {
      location: { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India' },
      lastUpdated: '2026-11-27T10:00:00Z',
      summary: {
        usAqi: 72,
        europeanAqi: 35,
        severityLevel: 'Moderate' as const,
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: '#F59E0B',
        headline: 'Acceptable ambient air quality.',
        healthRecommendation: 'Sensitive individuals should take normal precautions.',
        outdoorSafe: true,
        maskRecommended: false,
        ventilationSafe: true,
        purifierRecommended: false,
      },
      pollutants: {
        pm25: { code: 'pm25', name: 'PM2.5', value: 22.4, unit: 'µg/m³', safeLimit: 15, severity: 'moderate' as const, description: 'Fine particles', source: 'Vehicles' },
        pm10: { code: 'pm10', name: 'PM10', value: 45.1, unit: 'µg/m³', safeLimit: 45, severity: 'good' as const, description: 'Coarse dust', source: 'Road dust' },
        nitrogenDioxide: { code: 'no2', name: 'NO₂', value: 18.2, unit: 'µg/m³', safeLimit: 25, severity: 'good' as const, description: 'Vehicle gas', source: 'Traffic' },
        sulphurDioxide: { code: 'so2', name: 'SO₂', value: 5.4, unit: 'µg/m³', safeLimit: 40, severity: 'good' as const, description: 'Industrial gas', source: 'Industry' },
        ozone: { code: 'o3', name: 'Ozone', value: 38.0, unit: 'µg/m³', safeLimit: 100, severity: 'good' as const, description: 'Ground ozone', source: 'Sunlight' },
        carbonMonoxide: { code: 'co', name: 'CO', value: 310, unit: 'µg/m³', safeLimit: 4000, severity: 'good' as const, description: 'Carbon monoxide', source: 'Combustion' },
      },
      hourlyForecast: [],
      dailyForecast: [],
      isRealTime: true,
      sourceAttribution: 'Open-Meteo Air Quality API',
    },
    isLoading: false,
    error: null,
    refreshAirQuality: vi.fn(),
    persona: 'working-professional' as const,
    setPersona: vi.fn(),
    impactLogs: [],
    addImpactLog: vi.fn(),
    deleteImpactLog: vi.fn(),
    clearImpactLogs: vi.fn(),
    impactMetrics: {
      totalCo2SavedKg: 12.4,
      totalPmSavedGram: 6.8,
      totalActionsCount: 5,
      currentStreakDays: 3,
      cleanAirPoints: 149,
    },
    isPranaModalOpen: false,
    setIsPranaModalOpen: vi.fn(),
    requestCurrentLocation: vi.fn(),
    setLocation: vi.fn(),
  };

  it('verifies Dashboard AQI Overview includes a top-level h1 heading element', () => {
    vi.mocked(AppContextModule.useApp).mockReturnValue(baseMockContext);
    render(<AQIOverviewCard />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain('Bengaluru');
  });

  it('verifies Indoor IAQ Advisor includes a top-level h1 heading element', () => {
    vi.mocked(AppContextModule.useApp).mockReturnValue(baseMockContext);
    render(<IndoorAdvisorView />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain('Indoor Air Quality (IAQ) Advisor');
  });

  it('verifies Indoor IAQ Advisor checkboxes have accessible labels and IDs', () => {
    vi.mocked(AppContextModule.useApp).mockReturnValue(baseMockContext);
    render(<IndoorAdvisorView />);
    
    const hepaCheckbox = screen.getByLabelText(/HEPA Purifier Active/i);
    expect(hepaCheckbox).toBeInTheDocument();
    expect(hepaCheckbox).toHaveAttribute('id', 'filter-hepa');

    const incenseCheckbox = screen.getByLabelText(/Incense \/ Candles Used/i);
    expect(incenseCheckbox).toBeInTheDocument();
    expect(incenseCheckbox).toHaveAttribute('id', 'filter-incense');

    const petsCheckbox = screen.getByLabelText(/Indoor Pets Present/i);
    expect(petsCheckbox).toBeInTheDocument();
    expect(petsCheckbox).toHaveAttribute('id', 'filter-pets');
  });

  it('verifies Sustainable Alternatives view has an h1 heading and accessible range slider', () => {
    vi.mocked(AppContextModule.useApp).mockReturnValue(baseMockContext);
    render(<SustainableAlternativesView />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain('Sustainable Living & Clean Alternatives');

    const slider = screen.getByRole('slider', { name: /Daily round-trip commute distance in kilometers/i });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuenow', '15');
    expect(slider).toHaveAttribute('aria-valuemin', '2');
    expect(slider).toHaveAttribute('aria-valuemax', '50');
  });

  it('verifies Prana Assistant Modal dialog has role="dialog", aria-modal="true", and aria-labelledby', () => {
    vi.mocked(AppContextModule.useApp).mockReturnValue({
      ...baseMockContext,
      isPranaModalOpen: true,
    });
    render(<PranaAssistantModal />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'prana-modal-title');

    const modalTitle = screen.getByText('Breathe Wise — Prana Assistant');
    expect(modalTitle).toHaveAttribute('id', 'prana-modal-title');
  });
});
