import { describe, it, expect } from 'vitest';
import { 
  calculateSubIndex, 
  calculateCpcbAqi, 
  getAqiCategory,
  CPCB_BREAKPOINTS
} from '@/services/cpcbAqi';

describe('CPCB NAQI Calculation Engine (cpcbAqi.ts)', () => {
  it('defines valid CPCB breakpoint tables for all major pollutants', () => {
    expect(CPCB_BREAKPOINTS.pm25).toBeDefined();
    expect(CPCB_BREAKPOINTS.pm10).toBeDefined();
    expect(CPCB_BREAKPOINTS.no2).toBeDefined();
    expect(CPCB_BREAKPOINTS.so2).toBeDefined();
    expect(CPCB_BREAKPOINTS.co).toBeDefined();
    expect(CPCB_BREAKPOINTS.o3).toBeDefined();
  });

  describe('calculateSubIndex', () => {
    it('calculates Good sub-index for PM2.5 within 0-30 µg/m³', () => {
      const res = calculateSubIndex('pm25', 15);
      expect(res).not.toBeNull();
      expect(res?.subIndex).toBe(25);
      expect(res?.category).toBe('Good');
      expect(res?.categoryColor).toBe('#10B981');
    });

    it('calculates Satisfactory sub-index for PM2.5 within 31-60 µg/m³', () => {
      const res = calculateSubIndex('pm25', 45);
      expect(res).not.toBeNull();
      // (45 - 30)/(60 - 30) * (100 - 50) + 50 = (15/30)*50 + 50 = 75
      expect(res?.subIndex).toBe(75);
      expect(res?.category).toBe('Satisfactory');
      expect(res?.categoryColor).toBe('#14B8A6');
    });

    it('calculates Moderate sub-index for PM10 within 101-250 µg/m³', () => {
      const res = calculateSubIndex('pm10', 150);
      expect(res).not.toBeNull();
      expect(res?.category).toBe('Moderate');
      expect(res?.subIndex).toBeGreaterThanOrEqual(101);
      expect(res?.subIndex).toBeLessThanOrEqual(200);
    });

    it('calculates Poor sub-index for NO2 within 189-280 µg/m³', () => {
      const res = calculateSubIndex('no2', 200);
      expect(res).not.toBeNull();
      expect(res?.category).toBe('Poor');
    });

    it('calculates Very Poor sub-index for PM2.5 within 121-250 µg/m³', () => {
      const res = calculateSubIndex('pm25', 150);
      expect(res).not.toBeNull();
      expect(res?.category).toBe('Very Poor');
    });

    it('calculates Severe sub-index for PM2.5 above 250 µg/m³', () => {
      const res = calculateSubIndex('pm25', 300);
      expect(res).not.toBeNull();
      expect(res?.category).toBe('Severe');
      expect(res?.categoryColor).toBe('#7F1D1D');
    });

    it('correctly handles CO unit conversion from µg/m³ to mg/m³', () => {
      // 1000 µg/m³ = 1.0 mg/m³ -> Good range (0 - 1.0 mg/m³ -> 0 - 50)
      const res = calculateSubIndex('co', 1000, 'µg/m³');
      expect(res).not.toBeNull();
      expect(res?.subIndex).toBe(50);
      expect(res?.category).toBe('Good');
    });

    it('caps sub-index at 500 for extreme concentrations', () => {
      const res = calculateSubIndex('pm25', 800);
      expect(res).not.toBeNull();
      expect(res?.subIndex).toBe(500);
      expect(res?.category).toBe('Severe');
    });

    it('handles negative or zero concentrations cleanly', () => {
      const resZero = calculateSubIndex('pm25', 0);
      expect(resZero?.subIndex).toBe(0);
      expect(resZero?.category).toBe('Good');

      const resNeg = calculateSubIndex('pm25', -5);
      expect(resNeg).toBeNull();
    });

    it('returns null for unmonitored or unrecognized pollutants', () => {
      const res = calculateSubIndex('unknown_gas', 50);
      expect(res).toBeNull();
    });
  });

  describe('calculateCpcbAqi', () => {
    it('enforces CPCB 3-pollutant rule: returns isOfficialAqi: false when fewer than 3 pollutants', () => {
      const result = calculateCpcbAqi({
        pm25: { value: 45, unit: 'µg/m³' },
        no2: { value: 30, unit: 'µg/m³' }
      });

      expect(result).not.toBeNull();
      expect(result?.isOfficialAqi).toBe(false);
      expect(result?.pollutantsCount).toBe(2);
      expect(result?.hasParticulate).toBe(true);
      expect(result?.aqi).toBe(75); // Highest sub-index (PM2.5: 75)
      expect(result?.prominentPollutant).toBe('pm25');
    });

    it('enforces CPCB PM rule: returns isOfficialAqi: false when 3 pollutants lack PM2.5 or PM10', () => {
      const result = calculateCpcbAqi({
        no2: { value: 50, unit: 'µg/m³' },
        so2: { value: 30, unit: 'µg/m³' },
        co: { value: 1.5, unit: 'mg/m³' }
      });

      expect(result).not.toBeNull();
      expect(result?.isOfficialAqi).toBe(false);
      expect(result?.hasParticulate).toBe(false);
      expect(result?.pollutantsCount).toBe(3);
    });

    it('declares official CPCB NAQI when >= 3 pollutants including PM are monitored', () => {
      const result = calculateCpcbAqi({
        pm25: { value: 85, unit: 'µg/m³' }, // Moderate (subindex > 100)
        pm10: { value: 120, unit: 'µg/m³' },
        no2: { value: 40, unit: 'µg/m³' },
        so2: { value: 20, unit: 'µg/m³' }
      });

      expect(result).not.toBeNull();
      expect(result?.isOfficialAqi).toBe(true);
      expect(result?.hasParticulate).toBe(true);
      expect(result?.pollutantsCount).toBe(4);
      expect(result?.prominentPollutant).toBe('pm25');
      expect(result?.category).toBe('Moderate');
    });

    it('returns empty result structure if no valid pollutant sub-indices can be calculated', () => {
      const result = calculateCpcbAqi({});
      expect(result.aqi).toBeNull();
      expect(result.category).toBe('Unknown');
      expect(result.pollutantsCount).toBe(0);
    });
  });

  describe('getAqiCategory', () => {
    it('maps boundaries accurately according to CPCB NAQI guidelines', () => {
      expect(getAqiCategory(0).category).toBe('Good');
      expect(getAqiCategory(50).category).toBe('Good');
      expect(getAqiCategory(51).category).toBe('Satisfactory');
      expect(getAqiCategory(100).category).toBe('Satisfactory');
      expect(getAqiCategory(101).category).toBe('Moderate');
      expect(getAqiCategory(200).category).toBe('Moderate');
      expect(getAqiCategory(201).category).toBe('Poor');
      expect(getAqiCategory(300).category).toBe('Poor');
      expect(getAqiCategory(301).category).toBe('Very Poor');
      expect(getAqiCategory(400).category).toBe('Very Poor');
      expect(getAqiCategory(401).category).toBe('Severe');
      expect(getAqiCategory(500).category).toBe('Severe');
    });
  });
});
