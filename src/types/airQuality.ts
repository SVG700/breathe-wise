export interface GeoLocation {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string; // State / Region
}

export interface PollutantDetail {
  code: string;
  name: string;
  value: number;
  unit: string;
  safeLimit: number;
  severity: 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
  description: string;
  source: string;
}

export interface AQISummary {
  usAqi: number;
  europeanAqi: number;
  severityLevel: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  color: string;
  bgColor: string;
  borderColor: string;
  headline: string;
  healthRecommendation: string;
  outdoorSafe: boolean;
  maskRecommended: boolean;
  ventilationSafe: boolean;
  purifierRecommended: boolean;
}

export interface HourlyForecastItem {
  time: string;
  timestamp: string;
  usAqi: number;
  pm25: number;
  pm10: number;
  ozone: number;
}

export interface AirQualityData {
  location: GeoLocation;
  lastUpdated: string;
  summary: AQISummary;
  pollutants: {
    pm25: PollutantDetail;
    pm10: PollutantDetail;
    ozone: PollutantDetail;
    nitrogenDioxide: PollutantDetail;
    carbonMonoxide: PollutantDetail;
    sulphurDioxide: PollutantDetail;
  };
  hourlyForecast: HourlyForecastItem[];
  sourceAttribution: string;
  isRealTime: boolean;
}
