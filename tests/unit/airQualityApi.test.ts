import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateAQISummary, fetchAirQuality, searchLocations, DEFAULT_LOCATION } from '@/services/airQualityApi';

describe('Air Quality Service & Calculations', () => {
  describe('calculateAQISummary', () => {
    it('correctly classifies Good AQI (0-50)', () => {
      const summary = calculateAQISummary(35, 18);
      expect(summary.severityLevel).toBe('Good');
      expect(summary.color).toBe('#10B981');
      expect(summary.outdoorSafe).toBe(true);
      expect(summary.maskRecommended).toBe(false);
      expect(summary.ventilationSafe).toBe(true);
      expect(summary.purifierRecommended).toBe(false);
    });

    it('correctly classifies Moderate AQI (51-100)', () => {
      const summary = calculateAQISummary(75, 38);
      expect(summary.severityLevel).toBe('Moderate');
      expect(summary.color).toBe('#F59E0B');
      expect(summary.outdoorSafe).toBe(true);
      expect(summary.maskRecommended).toBe(false);
      expect(summary.ventilationSafe).toBe(true);
    });

    it('correctly classifies Unhealthy for Sensitive Groups (101-150)', () => {
      const summary = calculateAQISummary(135, 68);
      expect(summary.severityLevel).toBe('Unhealthy for Sensitive Groups');
      expect(summary.color).toBe('#F97316');
      expect(summary.outdoorSafe).toBe(false);
      expect(summary.maskRecommended).toBe(true);
      expect(summary.purifierRecommended).toBe(true);
    });

    it('correctly classifies Unhealthy AQI (151-200)', () => {
      const summary = calculateAQISummary(175, 88);
      expect(summary.severityLevel).toBe('Unhealthy');
      expect(summary.color).toBe('#EF4444');
      expect(summary.outdoorSafe).toBe(false);
      expect(summary.maskRecommended).toBe(true);
      expect(summary.ventilationSafe).toBe(false);
    });

    it('correctly classifies Very Unhealthy AQI (201-300)', () => {
      const summary = calculateAQISummary(240, 120);
      expect(summary.severityLevel).toBe('Very Unhealthy');
      expect(summary.color).toBe('#8B5CF6');
      expect(summary.outdoorSafe).toBe(false);
      expect(summary.maskRecommended).toBe(true);
    });

    it('correctly classifies Hazardous AQI (>300)', () => {
      const summary = calculateAQISummary(350, 175);
      expect(summary.severityLevel).toBe('Hazardous');
      expect(summary.color).toBe('#881337');
      expect(summary.outdoorSafe).toBe(false);
      expect(summary.maskRecommended).toBe(true);
      expect(summary.ventilationSafe).toBe(false);
    });
  });

  describe('fetchAirQuality', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('successfully parses valid Open-Meteo responses', async () => {
      const mockApiResponse = {
        current: {
          time: '2026-11-27T12:00:00Z',
          us_aqi: 72,
          european_aqi: 36,
          pm2_5: 22.4,
          pm10: 45.1,
          ozone: 38.0,
          nitrogen_dioxide: 21.5,
          carbon_monoxide: 310,
          sulphur_dioxide: 12.0,
        },
        hourly: {
          time: ['2026-11-27T12:00:00Z', '2026-11-27T13:00:00Z'],
          us_aqi: [72, 70],
          pm2_5: [22.4, 21.0],
          pm10: [45.1, 42.0],
          ozone: [38.0, 39.5],
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as any);

      const result = await fetchAirQuality(DEFAULT_LOCATION);

      expect(result.location.name).toBe('Bengaluru');
      expect(result.summary.usAqi).toBe(72);
      expect(result.pollutants.pm25.value).toBe(22.4);
      expect(result.pollutants.pm10.value).toBe(45.1);
      expect(result.pollutants.ozone.value).toBe(38.0);
      expect(result.pollutants.nitrogenDioxide.value).toBe(21.5);
      expect(result.pollutants.carbonMonoxide.value).toBe(310);
      expect(result.isRealTime).toBe(true);
      expect(result.hourlyForecast.length).toBe(2);
    });

    it('throws meaningful error when API returns failure status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as any);

      await expect(fetchAirQuality(DEFAULT_LOCATION)).rejects.toThrow('Open-Meteo Air Quality API error');
    });
  });

  describe('searchLocations', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns empty array for empty or single-character queries', async () => {
      const resEmpty = await searchLocations('');
      const resShort = await searchLocations('a');
      expect(resEmpty).toEqual([]);
      expect(resShort).toEqual([]);
    });

    it('correctly maps search results from Open-Meteo Geocoding', async () => {
      const mockGeoResults = {
        results: [
          {
            name: 'Bengaluru',
            latitude: 12.9716,
            longitude: 77.5946,
            country: 'India',
            admin1: 'Karnataka',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockGeoResults,
      } as any);

      const results = await searchLocations('Bengaluru');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Bengaluru');
      expect(results[0].country).toBe('India');
    });
  });
});
