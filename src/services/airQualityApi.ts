import { AirQualityData, AQISummary, GeoLocation, HourlyForecastItem, PollutantDetail } from '@/types/airQuality';

export const DEFAULT_LOCATION: GeoLocation = {
  name: 'Bengaluru',
  latitude: 12.9716,
  longitude: 77.5946,
  country: 'India',
  admin1: 'Karnataka'
};

export const POPULAR_CITIES: GeoLocation[] = [
  { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India', admin1: 'Karnataka' },
  { name: 'New Delhi', latitude: 28.6139, longitude: 77.2090, country: 'India', admin1: 'Delhi' },
  { name: 'Mumbai', latitude: 19.0760, longitude: 72.8777, country: 'India', admin1: 'Maharashtra' },
  { name: 'Hyderabad', latitude: 17.3850, longitude: 78.4867, country: 'India', admin1: 'Telangana' },
  { name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', admin1: 'England' },
  { name: 'New York', latitude: 40.7128, longitude: -74.0060, country: 'United States', admin1: 'New York' },
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', admin1: 'Tokyo' },
  { name: 'Singapore', latitude: 1.3521, longitude: 103.8198, country: 'Singapore' },
];

export function calculateAQISummary(usAqi: number, europeanAqi: number): AQISummary {
  const effectiveAqi = Math.max(usAqi || 0, Math.round((europeanAqi || 0) * 2));

  if (effectiveAqi <= 50) {
    return {
      usAqi: effectiveAqi,
      europeanAqi: europeanAqi || Math.round(effectiveAqi / 2),
      severityLevel: 'Good',
      color: '#10B981',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-500',
      headline: 'Air quality is satisfactory and poses little or no risk.',
      healthRecommendation: 'Ideal conditions for outdoor exercise, cycling, and natural room ventilation.',
      outdoorSafe: true,
      maskRecommended: false,
      ventilationSafe: true,
      purifierRecommended: false,
    };
  } else if (effectiveAqi <= 100) {
    return {
      usAqi: effectiveAqi,
      europeanAqi: europeanAqi || Math.round(effectiveAqi / 2),
      severityLevel: 'Moderate',
      color: '#F59E0B',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-500',
      headline: 'Air quality is acceptable; slight concern for very sensitive individuals.',
      healthRecommendation: 'Most people can continue normal activities. Unusually sensitive individuals should limit prolonged outdoor exertion.',
      outdoorSafe: true,
      maskRecommended: false,
      ventilationSafe: true,
      purifierRecommended: false,
    };
  } else if (effectiveAqi <= 150) {
    return {
      usAqi: effectiveAqi,
      europeanAqi: europeanAqi || Math.round(effectiveAqi / 2),
      severityLevel: 'Unhealthy for Sensitive Groups',
      color: '#F97316',
      bgColor: 'bg-orange-50 dark:bg-orange-950/40',
      borderColor: 'border-orange-500',
      headline: 'Members of sensitive groups may experience health effects.',
      healthRecommendation: 'Children, seniors, and individuals with respiratory or heart conditions should reduce prolonged outdoor exertion.',
      outdoorSafe: false,
      maskRecommended: true,
      ventilationSafe: false,
      purifierRecommended: true,
    };
  } else if (effectiveAqi <= 200) {
    return {
      usAqi: effectiveAqi,
      europeanAqi: europeanAqi || Math.round(effectiveAqi / 2),
      severityLevel: 'Unhealthy',
      color: '#EF4444',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-500',
      headline: 'Everyone may begin to experience adverse health effects.',
      healthRecommendation: 'Wear an N95/FFP2 mask when commuting outdoors. Keep windows shut and run indoor filtration.',
      outdoorSafe: false,
      maskRecommended: true,
      ventilationSafe: false,
      purifierRecommended: true,
    };
  } else if (effectiveAqi <= 300) {
    return {
      usAqi: effectiveAqi,
      europeanAqi: europeanAqi || Math.round(effectiveAqi / 2),
      severityLevel: 'Very Unhealthy',
      color: '#8B5CF6',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      borderColor: 'border-purple-500',
      headline: 'Health alert: serious risk of health effects for all individuals.',
      healthRecommendation: 'Avoid outdoor exercise completely. Wear protective respirators outside and seal indoor spaces with HEPA filtration.',
      outdoorSafe: false,
      maskRecommended: true,
      ventilationSafe: false,
      purifierRecommended: true,
    };
  } else {
    return {
      usAqi: effectiveAqi,
      europeanAqi: europeanAqi || Math.round(effectiveAqi / 2),
      severityLevel: 'Hazardous',
      color: '#881337',
      bgColor: 'bg-red-100 dark:bg-red-950/60',
      borderColor: 'border-red-800',
      headline: 'Emergency condition: entire population is likely to be affected.',
      healthRecommendation: 'Remain indoors with clean air filtration running. Avoid all non-essential outdoor exposure.',
      outdoorSafe: false,
      maskRecommended: true,
      ventilationSafe: false,
      purifierRecommended: true,
    };
  }
}

function classifySeverity(val: number, goodLimit: number, modLimit: number, unhLimit: number): PollutantDetail['severity'] {
  if (val <= goodLimit) return 'good';
  if (val <= modLimit) return 'moderate';
  if (val <= unhLimit) return 'unhealthy-sensitive';
  return 'unhealthy';
}

export async function fetchAirQuality(location: GeoLocation): Promise<AirQualityData> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi&forecast_days=3&timezone=auto`;

  const response = await fetch(url, { next: { revalidate: 600 } });
  if (!response.ok) {
    throw new Error(`Open-Meteo Air Quality API error (${response.status}): ${response.statusText}`);
  }

  const data = await response.json();
  const current = data.current || {};
  const hourly = data.hourly || {};

  const pm25Val = Number(current.pm2_5 ?? 0);
  const pm10Val = Number(current.pm10 ?? 0);
  const o3Val = Number(current.ozone ?? 0);
  const no2Val = Number(current.nitrogen_dioxide ?? 0);
  const coVal = Number(current.carbon_monoxide ?? 0);
  const so2Val = Number(current.sulphur_dioxide ?? 0);

  const usAqi = current.us_aqi ?? Math.round(pm25Val * 2.8);
  const euroAqi = current.european_aqi ?? Math.round(usAqi / 2);

  const summary = calculateAQISummary(usAqi, euroAqi);

  const pollutants: AirQualityData['pollutants'] = {
    pm25: {
      code: 'PM2.5',
      name: 'Fine Particulate Matter',
      value: Math.round(pm25Val * 10) / 10,
      unit: 'µg/m³',
      safeLimit: 15,
      severity: classifySeverity(pm25Val, 15, 35, 55),
      description: 'Microscopic particles smaller than 2.5 micrometers that penetrate deep into lung tissue and the bloodstream.',
      source: 'Combustion, vehicle exhaust, biomass burning, and industrial processes.'
    },
    pm10: {
      code: 'PM10',
      name: 'Coarse Particulate Matter',
      value: Math.round(pm10Val * 10) / 10,
      unit: 'µg/m³',
      safeLimit: 45,
      severity: classifySeverity(pm10Val, 45, 80, 150),
      description: 'Inhalable dust, pollen, and mold fragments up to 10 micrometers.',
      source: 'Road dust, construction sites, agriculture, and unpaved roads.'
    },
    ozone: {
      code: 'O3',
      name: 'Ground-Level Ozone',
      value: Math.round(o3Val * 10) / 10,
      unit: 'µg/m³',
      safeLimit: 100,
      severity: classifySeverity(o3Val, 60, 100, 140),
      description: 'Secondary pollutant formed when sunlight reacts with vehicular emissions and volatile organic compounds.',
      source: 'Sunlight-driven chemical reactions of nitrogen oxides and volatile organics.'
    },
    nitrogenDioxide: {
      code: 'NO2',
      name: 'Nitrogen Dioxide',
      value: Math.round(no2Val * 10) / 10,
      unit: 'µg/m³',
      safeLimit: 25,
      severity: classifySeverity(no2Val, 25, 50, 100),
      description: 'A pungent, reddish-brown toxic gas causing airway inflammation and reduced lung resistance.',
      source: 'Automobile tailpipes, diesel engines, power generation plants.'
    },
    carbonMonoxide: {
      code: 'CO',
      name: 'Carbon Monoxide',
      value: Math.round(coVal * 10) / 10,
      unit: 'µg/m³',
      safeLimit: 4000,
      severity: classifySeverity(coVal, 2000, 4000, 9000),
      description: 'Colorless, odorless gas that impedes the blood’s capacity to carry oxygen.',
      source: 'Incomplete combustion in motor vehicles, wood stoves, and gas burners.'
    },
    sulphurDioxide: {
      code: 'SO2',
      name: 'Sulphur Dioxide',
      value: Math.round(so2Val * 10) / 10,
      unit: 'µg/m³',
      safeLimit: 40,
      severity: classifySeverity(so2Val, 20, 40, 80),
      description: 'Toxic gas irritating the eyes, throat, and mucous membranes.',
      source: 'Fossil fuel combustion with sulfur content, industrial smelters.'
    }
  };

  // Build hourly forecast points (next 24 hours)
  const hourlyForecast: HourlyForecastItem[] = [];
  if (hourly.time && Array.isArray(hourly.time)) {
    const nowIdx = 0;
    const limit = Math.min(24, hourly.time.length);
    for (let i = nowIdx; i < limit; i++) {
      const timeStr = hourly.time[i];
      const hourLabel = new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      hourlyForecast.push({
        time: hourLabel,
        timestamp: timeStr,
        usAqi: hourly.us_aqi?.[i] ?? Math.round((hourly.pm2_5?.[i] ?? 10) * 2.8),
        pm25: Math.round((hourly.pm2_5?.[i] ?? 0) * 10) / 10,
        pm10: Math.round((hourly.pm10?.[i] ?? 0) * 10) / 10,
        ozone: Math.round((hourly.ozone?.[i] ?? 0) * 10) / 10,
      });
    }
  }

  return {
    location,
    lastUpdated: current.time || new Date().toISOString(),
    summary,
    pollutants,
    hourlyForecast,
    sourceAttribution: 'Open-Meteo Air Quality API / Copernicus Atmosphere Monitoring Service',
    isRealTime: true,
  };
}

export async function searchLocations(query: string): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  if (!json.results || !Array.isArray(json.results)) return [];

  return json.results.map((item: any) => ({
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country,
    admin1: item.admin1
  }));
}

export async function fetchNearbyStations(
  lat: number,
  lon: number,
  radius = 35000,
  pollutant = 'all'
): Promise<any> {
  const url = `/api/air-quality/stations?lat=${lat}&lon=${lon}&radius=${radius}&pollutant=${pollutant}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch stations: HTTP ${res.status}`);
  }
  return res.json();
}

