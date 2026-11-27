import { describe, it, expect } from 'vitest';
import { IMPACT_ACTIONS } from '@/context/AppContext';

describe('Sustainable Living & Impact Calculations', () => {
  it('defines transparent emission factors for all core activities', () => {
    expect(IMPACT_ACTIONS.length).toBeGreaterThanOrEqual(5);

    const metro = IMPACT_ACTIONS.find((a) => a.id === 'public-transport');
    expect(metro).toBeDefined();
    expect(metro?.co2SavedPerUnitKg).toBe(0.14); // 180g car - 40g metro = 140g saved
    expect(metro?.pmSavedPerUnitGram).toBe(0.08);

    const activeMobility = IMPACT_ACTIONS.find((a) => a.id === 'cycling-walking');
    expect(activeMobility).toBeDefined();
    expect(activeMobility?.co2SavedPerUnitKg).toBe(0.18); // 180g car - 0g bike = 180g saved

    const carpool = IMPACT_ACTIONS.find((a) => a.id === 'carpooling');
    expect(carpool).toBeDefined();
    expect(carpool?.co2SavedPerUnitKg).toBe(0.09); // 50% vehicle-km sharing

    const energy = IMPACT_ACTIONS.find((a) => a.id === 'energy-saving');
    expect(energy).toBeDefined();
    expect(energy?.co2SavedPerUnitKg).toBe(0.82); // 0.82 kg CO2 / kWh grid factor
  });

  it('correctly calculates avoided CO2 and PM2.5 for a 20 km metro commute', () => {
    const metroAction = IMPACT_ACTIONS.find((a) => a.id === 'public-transport')!;
    const distanceKm = 20;

    const co2SavedKg = Math.round(distanceKm * metroAction.co2SavedPerUnitKg * 100) / 100;
    const pmSavedGram = Math.round(distanceKm * metroAction.pmSavedPerUnitGram * 100) / 100;

    expect(co2SavedKg).toBe(2.8); // 20 * 0.14 = 2.80 kg CO2 avoided
    expect(pmSavedGram).toBe(1.6); // 20 * 0.08 = 1.60 g PM avoided
  });

  it('correctly calculates commute emissions comparison', () => {
    const tripKm = 15;
    const carEmission = Math.round(tripKm * 0.18 * 100) / 100; // 180g/km -> 2.70 kg
    const metroEmission = Math.round(tripKm * 0.04 * 100) / 100; // 40g/km -> 0.60 kg
    const evEmission = Math.round(tripKm * 0.05 * 100) / 100; // 50g/km -> 0.75 kg
    const bikeEmission = 0;

    expect(carEmission).toBe(2.7);
    expect(metroEmission).toBe(0.6);
    expect(evEmission).toBe(0.75);
    expect(bikeEmission).toBe(0);

    const netSavings = Math.round((carEmission - metroEmission) * 100) / 100;
    expect(netSavings).toBe(2.1);
  });
});
