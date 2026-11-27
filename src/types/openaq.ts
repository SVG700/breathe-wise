import { CpcbAqiResult, SubIndexResult } from '@/services/cpcbAqi';

export interface OpenAQMeasurement {
  parameter: string;
  value: number;
  unit: string;
  lastUpdated: string;
  subIndex?: SubIndexResult | null;
}

export interface OpenAQStation {
  id: string | number;
  name: string;
  locality?: string;
  country?: string;
  provider?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distanceKm?: number;
  isRealTime: boolean;
  source: 'OpenAQ Ground Station' | 'Open-Meteo Model Node' | 'openaq' | 'open-meteo-model';
  lastUpdated: string;
  freshnessStatus?: 'Recent (<3 hrs)' | 'Updated today' | 'May be outdated (>24 hrs)' | 'Telemetry pending';
  availableParameters?: string[];
  measurements: Record<string, OpenAQMeasurement>;
  cpcb: CpcbAqiResult;
  cpcbAqi?: CpcbAqiResult | null;
}

export interface StationsApiResponse {
  stations: OpenAQStation[];
  count: number;
  queryCoordinates: {
    latitude: number;
    longitude: number;
  };
  radiusMeters: number;
  openaqConfigured: boolean;
  sourceAttribution: string;
  message?: string;
}
