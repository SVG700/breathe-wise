export type UserPersona = 
  | 'working-professional'
  | 'college-student'
  | 'school-student'
  | 'senior-citizen'
  | 'family'
  | 'outdoor-worker';

export interface PranaMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    modelUsed?: string;
    actionableTips?: string[];
    riskLevel?: string;
    isFallback?: boolean;
    statusLabel?: string;
    errorNotice?: string;
    sources?: string[];
  };
}

export interface HourlyForecastSummary {
  time: string;
  timestamp: string;
  usAqi: number;
  pm25: number;
  pm10: number;
  ozone: number;
}

export interface PranaContextPayload {
  location: string;
  coordinates: { lat: number; lon: number };
  aqi: number;
  severity: string;
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2?: number;
    co?: number;
    units?: Record<string, string>;
  };
  timeOfDay: string;
  persona: UserPersona;
  specialConditions?: string[];
  hourlyForecast?: HourlyForecastSummary[];
  sourceAttribution?: string;
  isRealTime?: boolean;
  lastUpdated?: string;
  isStale?: boolean;
  station?: any;
}
