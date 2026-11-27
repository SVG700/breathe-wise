import { describe, it, expect } from 'vitest';

function calculateTestIndoorRisk(params: {
  outdoorAqi: number;
  windowFacing: 'busy-street' | 'quiet-courtyard' | 'park-facing';
  kitchenSetup: 'chimney-vented' | 'exhaust-fan' | 'unvented';
  hasHepa: boolean;
  usesIncense: boolean;
  hasPets: boolean;
}) {
  let riskScore = 20;

  if (params.outdoorAqi > 150) riskScore += 35;
  else if (params.outdoorAqi > 80) riskScore += 20;

  if (params.windowFacing === 'busy-street') riskScore += 15;
  if (params.kitchenSetup === 'unvented') riskScore += 25;
  else if (params.kitchenSetup === 'exhaust-fan') riskScore += 10;

  if (params.usesIncense) riskScore += 20;
  if (params.hasPets) riskScore += 5;

  if (params.hasHepa) riskScore -= 30;

  riskScore = Math.max(10, Math.min(95, riskScore));

  if (riskScore <= 30) return { label: 'Optimal / Clean Safe Zone', score: riskScore, badge: 'Low Risk' };
  if (riskScore <= 60) return { label: 'Moderate Indoor Burden', score: riskScore, badge: 'Moderate Risk' };
  return { label: 'High Indoor Particulate Accumulation', score: riskScore, badge: 'High Risk' };
}

describe('Indoor Air Quality (IAQ) Diagnostic Logic', () => {
  it('identifies clean indoor conditions when outdoor AQI is low and HEPA is active', () => {
    const result = calculateTestIndoorRisk({
      outdoorAqi: 45,
      windowFacing: 'park-facing',
      kitchenSetup: 'chimney-vented',
      hasHepa: true,
      usesIncense: false,
      hasPets: false,
    });

    expect(result.badge).toBe('Low Risk');
    expect(result.score).toBeLessThanOrEqual(30);
  });

  it('identifies high particulate accumulation when unvented kitchen and incense are present', () => {
    const result = calculateTestIndoorRisk({
      outdoorAqi: 180,
      windowFacing: 'busy-street',
      kitchenSetup: 'unvented',
      hasHepa: false,
      usesIncense: true,
      hasPets: true,
    });

    expect(result.badge).toBe('High Risk');
    expect(result.score).toBeGreaterThan(60);
  });

  it('demonstrates that active HEPA filtration meaningfully reduces indoor particulate risk', () => {
    const withoutHepa = calculateTestIndoorRisk({
      outdoorAqi: 120,
      windowFacing: 'busy-street',
      kitchenSetup: 'exhaust-fan',
      hasHepa: false,
      usesIncense: false,
      hasPets: false,
    });

    const withHepa = calculateTestIndoorRisk({
      outdoorAqi: 120,
      windowFacing: 'busy-street',
      kitchenSetup: 'exhaust-fan',
      hasHepa: true,
      usesIncense: false,
      hasPets: false,
    });

    expect(withHepa.score).toBe(withoutHepa.score - 30);
  });
});
