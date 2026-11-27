import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/prana/chat/route';
import { NextRequest } from 'next/server';

describe('Prana AI Scientific Accuracy & Regression Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GEMINI_API_KEY; // Run in autonomous engine mode for deterministic validation
  });

  it('never declares a specific time as safest when hourly forecast data is unavailable', async () => {
    const req = new NextRequest('http://localhost:3000/api/prana/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'What is the safest time to go outside today?',
        context: {
          location: 'Bengaluru',
          aqi: 78,
          severity: 'Moderate',
          pollutants: { pm25: 24.5 },
          persona: 'working-professional',
          hourlyForecast: [], // No hourly forecast available
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    // Must clearly state uncertainty rather than fabricating a window
    expect(data.content).toContain('Hourly Forecast Data Unavailable');
    expect(data.content).toContain('Prana will not declare a specific time of day to be the \'safest\' window without verified hourly forecast data');
    // Must NOT declare arbitrary assumptions like "11:00 AM and 3:00 PM" as safest
    expect(data.content).not.toContain('ideally between 11:00 AM and 3:00 PM');
  });

  it('correctly uses verified Open-Meteo hourly forecast data to identify lowest pollution window', async () => {
    const req = new NextRequest('http://localhost:3000/api/prana/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'When is it safe to jog today?',
        context: {
          location: 'Bengaluru',
          aqi: 80,
          severity: 'Moderate',
          pollutants: { pm25: 26.0 },
          persona: 'working-professional',
          hourlyForecast: [
            { time: '08:00 AM', timestamp: '2026-11-27T08:00:00Z', usAqi: 95, pm25: 33.2, pm10: 60, ozone: 20 },
            { time: '01:00 PM', timestamp: '2026-11-27T13:00:00Z', usAqi: 44, pm25: 11.5, pm10: 25, ozone: 32 },
            { time: '07:00 PM', timestamp: '2026-11-27T19:00:00Z', usAqi: 88, pm25: 30.1, pm10: 55, ozone: 15 },
          ],
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.content).toContain('Verified Hourly Forecast Analysis');
    expect(data.content).toContain('01:00 PM');
    expect(data.content).toContain('AQI 44');
    expect(data.content).toContain('11.5 µg/m³');
  });

  it('correctly handles and warns on stale measurements older than 24 hours', async () => {
    const req = new NextRequest('http://localhost:3000/api/prana/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Tell me about air quality at this station',
        context: {
          location: 'Bengaluru',
          station: {
            id: 'openaq-797',
            name: 'City Railway Station - KSPCB',
            source: 'OpenAQ Ground Station',
            provider: 'CPCB',
            distanceKm: 2.7,
            lastUpdated: '2018-02-22T03:00:00Z',
            freshnessStatus: 'May be outdated (>24 hrs)',
            cpcbAqi: { aqi: 73, category: 'Satisfactory', isOfficial: true },
            measurements: {
              pm25: { value: 43.79, unit: 'µg/m³' },
            },
          },
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.content).toContain('Data Staleness Advisory');
    expect(data.content).toContain('older than 24 hours');
    expect(data.content).toContain('historical baseline context rather than real-time conditions');
  });

  it('clearly distinguishes OpenAQ ground stations from Open-Meteo model simulations', async () => {
    // 1. Model Node Test
    const modelReq = new NextRequest('http://localhost:3000/api/prana/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'What is the air quality at this location?',
        context: {
          location: 'Bengaluru',
          station: {
            id: 'model-open-meteo',
            name: 'Atmospheric Model Grid (12.97°, 77.59°)',
            source: 'Open-Meteo Model Node',
            provider: 'Open-Meteo & Copernicus CAMS Model',
            distanceKm: 0,
            lastUpdated: '2026-11-27T20:30',
            cpcbAqi: { aqi: 55, category: 'Satisfactory', isOfficial: true },
          },
        },
      }),
    });

    const modelRes = await POST(modelReq);
    const modelData = await modelRes.json();
    expect(modelData.content).toContain('Atmospheric Model Simulation (Copernicus CAMS)');
    expect(modelData.content).not.toContain('Physical Ground Monitoring Sensor');

    // 2. Physical Ground Station Test
    const groundReq = new NextRequest('http://localhost:3000/api/prana/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'What is the air quality at this location?',
        context: {
          location: 'Bengaluru',
          station: {
            id: 'openaq-123',
            name: 'BTM Layout Monitor',
            source: 'OpenAQ Ground Station',
            provider: 'CPCB',
            distanceKm: 3.1,
            lastUpdated: new Date().toISOString(),
            freshnessStatus: 'Recent',
            cpcbAqi: { aqi: 62, category: 'Satisfactory', isOfficial: true },
          },
        },
      }),
    });

    const groundRes = await POST(groundReq);
    const groundData = await groundRes.json();
    expect(groundData.content).toContain('Physical Ground Monitoring Sensor (CPCB / OpenAQ)');
  });

  it('does not automatically recommend opening windows based only on time of day', async () => {
    const req = new NextRequest('http://localhost:3000/api/prana/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Can I open windows between 11 AM and 3 PM today?',
        context: {
          location: 'Bengaluru',
          aqi: 88,
          severity: 'Moderate',
          pollutants: { pm25: 29.5 },
          persona: 'working-professional',
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    // Must explicitly state that windows should NOT be opened automatically based on time of day
    expect(data.content).toContain('Opening windows should NOT be done automatically based on the time of day or assumed traffic slowdowns');
    expect(data.content).toContain('HEPA air purifier');
  });

  it('does not declare outdoor exercise safe based solely on low PM2.5 when overall AQI is elevated', async () => {
    const req = new NextRequest('http://localhost:3000/api/prana/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Is it safe to go for a run right now?',
        context: {
          location: 'Bengaluru',
          aqi: 125, // Unhealthy for sensitive groups overall
          severity: 'Unhealthy for Sensitive Groups',
          pollutants: {
            pm25: 14.0, // Low PM2.5 alone
            pm10: 115.0, // Elevated coarse particulate
            o3: 95.0, // Elevated ozone
          },
          persona: 'working-professional',
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    // Should NOT declare safe merely because PM2.5 is low
    expect(data.content).toContain('Outdoor Cardio Not Recommended');
    expect(data.content).toContain('Current AQI is **125 (Unhealthy for Sensitive Groups)**');
    expect(data.content).not.toContain('Safe for Outdoor Activities');
  });

  it('delivers concise, role-specific guidance for working professionals', async () => {
    const req = new NextRequest('http://localhost:3000/api/prana/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Give me general clean air guidance for today',
        context: {
          location: 'Bengaluru',
          aqi: 65,
          severity: 'Moderate',
          pollutants: { pm25: 18.2 },
          persona: 'working-professional',
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.content).toContain('Working Professional Note');
    expect(data.content).toContain('office');
  });
});
