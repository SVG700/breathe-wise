/**
 * Central Pollution Control Board (CPCB) India - National Air Quality Index (NAQI)
 * Calculation Engine and Sub-Index Methodology
 * 
 * References:
 * - CPCB National Air Quality Index, Ministry of Environment, Forest and Climate Change (Govt. of India)
 * - Breakpoints and Sub-index interpolation formula:
 *   Ip = I_low + ((I_high - I_low) / (B_high - B_low)) * (Cp - B_low)
 * 
 * Requirement: An official overall AQI requires at least 3 pollutants to be monitored,
 * with at least one being particulate matter (PM2.5 or PM10).
 * If fewer than 3 are available, only an indicative sub-index is reported.
 */

export interface PollutantBreakpoint {
  bLow: number;
  bHigh: number;
  iLow: number;
  iHigh: number;
}

export type AQICategory = 
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe'
  | 'Unknown';

export interface SubIndexResult {
  pollutant: string;
  concentration: number;
  unit: string;
  subIndex: number;
  category: AQICategory;
  color: string;
  categoryColor: string;
}

export interface CpcbAqiResult {
  aqi: number | null;
  category: AQICategory;
  color: string;
  categoryColor: string;
  dominantPollutant: string | null;
  prominentPollutant: string | null;
  isOfficial: boolean;
  isOfficialAqi: boolean;
  hasParticulate: boolean;
  subIndices: Record<string, SubIndexResult>;
  pollutantsCount: number;
  methodologyNote: string;
}

// CPCB Breakpoints (Concentrations in standard CPCB units: µg/m³ except CO in mg/m³)
export const CPCB_BREAKPOINTS: Record<string, PollutantBreakpoint[]> = {
  pm25: [
    { bLow: 0, bHigh: 30, iLow: 0, iHigh: 50 },
    { bLow: 31, bHigh: 60, iLow: 51, iHigh: 100 },
    { bLow: 61, bHigh: 90, iLow: 101, iHigh: 200 },
    { bLow: 91, bHigh: 120, iLow: 201, iHigh: 300 },
    { bLow: 121, bHigh: 250, iLow: 301, iHigh: 400 },
    { bLow: 251, bHigh: 500, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { bLow: 0, bHigh: 50, iLow: 0, iHigh: 50 },
    { bLow: 51, bHigh: 100, iLow: 51, iHigh: 100 },
    { bLow: 101, bHigh: 250, iLow: 101, iHigh: 200 },
    { bLow: 251, bHigh: 350, iLow: 201, iHigh: 300 },
    { bLow: 351, bHigh: 430, iLow: 301, iHigh: 400 },
    { bLow: 431, bHigh: 600, iLow: 401, iHigh: 500 },
  ],
  no2: [
    { bLow: 0, bHigh: 40, iLow: 0, iHigh: 50 },
    { bLow: 41, bHigh: 80, iLow: 51, iHigh: 100 },
    { bLow: 81, bHigh: 180, iLow: 101, iHigh: 200 },
    { bLow: 181, bHigh: 280, iLow: 201, iHigh: 300 },
    { bLow: 281, bHigh: 400, iLow: 301, iHigh: 400 },
    { bLow: 401, bHigh: 600, iLow: 401, iHigh: 500 },
  ],
  so2: [
    { bLow: 0, bHigh: 40, iLow: 0, iHigh: 50 },
    { bLow: 41, bHigh: 80, iLow: 51, iHigh: 100 },
    { bLow: 81, bHigh: 380, iLow: 101, iHigh: 200 },
    { bLow: 381, bHigh: 800, iLow: 201, iHigh: 300 },
    { bLow: 801, bHigh: 1600, iLow: 301, iHigh: 400 },
    { bLow: 1601, bHigh: 2000, iLow: 401, iHigh: 500 },
  ],
  co: [
    { bLow: 0, bHigh: 1.0, iLow: 0, iHigh: 50 },
    { bLow: 1.1, bHigh: 2.0, iLow: 51, iHigh: 100 },
    { bLow: 2.1, bHigh: 10.0, iLow: 101, iHigh: 200 },
    { bLow: 10.1, bHigh: 17.0, iLow: 201, iHigh: 300 },
    { bLow: 17.1, bHigh: 34.0, iLow: 301, iHigh: 400 },
    { bLow: 34.1, bHigh: 50.0, iLow: 401, iHigh: 500 },
  ],
  o3: [
    { bLow: 0, bHigh: 50, iLow: 0, iHigh: 50 },
    { bLow: 51, bHigh: 100, iLow: 51, iHigh: 100 },
    { bLow: 101, bHigh: 168, iLow: 101, iHigh: 200 },
    { bLow: 169, bHigh: 208, iLow: 201, iHigh: 300 },
    { bLow: 209, bHigh: 748, iLow: 301, iHigh: 400 },
    { bLow: 749, bHigh: 1000, iLow: 401, iHigh: 500 },
  ],
};

export const CPCB_CATEGORY_COLORS: Record<AQICategory, string> = {
  'Good': '#10B981',         // 0 - 50 (Green)
  'Satisfactory': '#14B8A6', // 51 - 100 (Teal)
  'Moderate': '#F59E0B',     // 101 - 200 (Amber)
  'Poor': '#F97316',         // 201 - 300 (Orange)
  'Very Poor': '#EF4444',    // 301 - 400 (Red)
  'Severe': '#7F1D1D',       // 401 - 500 (Deep Maroon)
  'Unknown': '#94A3B8',      // Incomplete
};

export function getCpcbCategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export const getAqiCategory = (aqi: number) => {
  const cat = getCpcbCategory(aqi);
  return {
    category: cat,
    color: CPCB_CATEGORY_COLORS[cat],
    description: `CPCB category ${cat}`
  };
};

/**
 * Calculate CPCB Sub-Index for a single pollutant
 */
export function calculateSubIndex(
  rawPollutant: string,
  rawConcentration: number,
  unit = 'µg/m³'
): SubIndexResult | null {
  if (rawConcentration < 0 || isNaN(rawConcentration)) return null;

  const pollutant = rawPollutant.toLowerCase().replace(/[^a-z0-9]/g, '');
  let concentration = rawConcentration;

  // Unit normalization: CO is evaluated in mg/m³
  if (pollutant === 'co') {
    if (unit.toLowerCase().includes('ppm')) {
      // 1 ppm CO ≈ 1.145 mg/m³ at STP
      concentration = rawConcentration * 1.145;
    } else if (unit.toLowerCase().includes('µg') || unit.toLowerCase().includes('ug')) {
      concentration = rawConcentration / 1000;
    }
  }

  const breakpoints = CPCB_BREAKPOINTS[pollutant];
  if (!breakpoints) return null;

  for (const bp of breakpoints) {
    if (concentration >= bp.bLow && concentration <= bp.bHigh) {
      const subIndex = Math.round(
        bp.iLow + ((bp.iHigh - bp.iLow) / (bp.bHigh - bp.bLow)) * (concentration - bp.bLow)
      );
      const category = getCpcbCategory(subIndex);
      const color = CPCB_CATEGORY_COLORS[category];
      return {
        pollutant,
        concentration: Math.round(concentration * 100) / 100,
        unit: pollutant === 'co' ? 'mg/m³' : 'µg/m³',
        subIndex: Math.min(500, Math.max(0, subIndex)),
        category,
        color,
        categoryColor: color,
      };
    }
  }

  // Concentration exceeds max breakpoint -> Severe (capped at 500)
  return {
    pollutant,
    concentration: Math.round(concentration * 100) / 100,
    unit: pollutant === 'co' ? 'mg/m³' : 'µg/m³',
    subIndex: 500,
    category: 'Severe',
    color: CPCB_CATEGORY_COLORS['Severe'],
    categoryColor: CPCB_CATEGORY_COLORS['Severe'],
  };
}

/**
 * Calculate Overall CPCB AQI following national criteria:
 * - At least 3 valid pollutant sub-indices must exist.
 * - At least one must be PM2.5 or PM10.
 * - The overall AQI is the maximum of all valid sub-indices (dominant pollutant).
 */
export function calculateCpcbAqi(
  measurements: Record<string, { value: number; unit?: string }>
): CpcbAqiResult {
  const subIndices: Record<string, SubIndexResult> = {};

  for (const [key, item] of Object.entries(measurements)) {
    if (item && typeof item.value === 'number' && !isNaN(item.value)) {
      const res = calculateSubIndex(key, item.value, item.unit);
      if (res) {
        subIndices[res.pollutant] = res;
      }
    }
  }

  const keys = Object.keys(subIndices);
  const hasParticulate = 'pm25' in subIndices || 'pm10' in subIndices;

  // Criteria: Minimum 3 pollutants with at least one particulate parameter
  if (keys.length >= 3 && hasParticulate) {
    let maxSubIndex = 0;
    let dominant: string | null = null;

    for (const [p, sub] of Object.entries(subIndices)) {
      if (sub.subIndex > maxSubIndex) {
        maxSubIndex = sub.subIndex;
        dominant = p;
      }
    }

    const category = getCpcbCategory(maxSubIndex);
    const color = CPCB_CATEGORY_COLORS[category];

    return {
      aqi: maxSubIndex,
      category,
      color,
      categoryColor: color,
      dominantPollutant: dominant ? dominant.toUpperCase() : null,
      prominentPollutant: dominant || null,
      isOfficial: true,
      isOfficialAqi: true,
      hasParticulate: true,
      subIndices,
      pollutantsCount: keys.length,
      methodologyNote: `Official CPCB NAQI calculated from ${keys.length} monitoring parameters with dominant pollutant ${dominant?.toUpperCase()}.`,
    };
  }

  // When fewer than 3 pollutants are available:
  if (keys.length > 0) {
    // Determine the highest available sub-index as an indicative indicator
    let maxSubIndex = 0;
    let dominant: string | null = null;

    for (const [p, sub] of Object.entries(subIndices)) {
      if (sub.subIndex > maxSubIndex) {
        maxSubIndex = sub.subIndex;
        dominant = p;
      }
    }

    const category = getCpcbCategory(maxSubIndex);
    const color = CPCB_CATEGORY_COLORS[category];

    return {
      aqi: maxSubIndex,
      category,
      color,
      categoryColor: color,
      dominantPollutant: dominant ? dominant.toUpperCase() : null,
      prominentPollutant: dominant || null,
      isOfficial: false,
      isOfficialAqi: false,
      hasParticulate,
      subIndices,
      pollutantsCount: keys.length,
      methodologyNote: `Indicative sub-index based on ${keys.length} parameter(s) (${dominant?.toUpperCase()}). CPCB NAQI standard requires minimum 3 pollutants for an official AQI.`,
    };
  }

  return {
    aqi: null,
    category: 'Unknown',
    color: CPCB_CATEGORY_COLORS['Unknown'],
    categoryColor: CPCB_CATEGORY_COLORS['Unknown'],
    dominantPollutant: null,
    prominentPollutant: null,
    isOfficial: false,
    isOfficialAqi: false,
    hasParticulate: false,
    subIndices: {},
    pollutantsCount: 0,
    methodologyNote: 'No valid pollutant measurements available to compute sub-indices.',
  };
}
