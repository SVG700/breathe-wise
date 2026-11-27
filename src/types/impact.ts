export type ActionCategory = 
  | 'public-transport'
  | 'cycling-walking'
  | 'carpooling'
  | 'energy-saving'
  | 'reduced-idling'
  | 'indoor-efficiency';

export interface ImpactActionOption {
  id: ActionCategory;
  name: string;
  icon: string;
  co2SavedPerUnitKg: number; // kg CO2 avoided
  pmSavedPerUnitGram: number; // grams PM2.5 avoided
  unitLabel: string;
  defaultUnit: number;
  description: string;
  assumptionNote: string;
}

export interface ImpactLogEntry {
  id: string;
  actionId: ActionCategory;
  actionName: string;
  date: string; // ISO date string YYYY-MM-DD
  quantity: number;
  co2SavedKg: number;
  pmSavedGram: number;
  notes?: string;
}

export interface ImpactMetrics {
  totalCo2SavedKg: number;
  totalPmSavedGram: number;
  totalActionsCount: number;
  currentStreakDays: number;
  cleanAirPoints: number;
}
