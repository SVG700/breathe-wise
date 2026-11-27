import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, _clearStationsCache } from '@/app/api/air-quality/stations/route';
import { NextRequest } from 'next/server';

describe('Stations API Route (/api/air-quality/stations)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAQ_API_KEY;
    _clearStationsCache();
  });

  it('returns 400 Bad Request when lat or lon is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/air-quality/stations?lat=12.9716');
    const res = await GET(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe('Valid latitude and longitude parameters are required');
  });

  it('returns 400 Bad Request when coordinates are out of bounds', async () => {
    const req = new NextRequest('http://localhost:3000/api/air-quality/stations?lat=150&lon=77.5946');
    const res = await GET(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('Latitude must be between -90 and 90');
  });

  it('returns model node when OPENAQ_API_KEY is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/air-quality/stations?lat=12.9716&lon=77.5946');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.openaqConfigured).toBe(false);
    expect(data.stations.length).toBeGreaterThanOrEqual(1);
    expect(data.stations[0].source).toBe('Open-Meteo Model Node');
    expect(data.stations[0].provider).toContain('Copernicus');
    expect(data.stations[0].cpcbAqi).toBeDefined();
  });

  it('integrates OpenAQ v3 stations when OPENAQ_API_KEY is present and API succeeds', async () => {
    process.env.OPENAQ_API_KEY = 'test_openaq_key_123';

    // Mock global fetch for OpenAQ v3 endpoint
    const mockOpenAQResponse = {
      results: [
        {
          id: 101,
          name: 'Bengaluru City Ground Station',
          coordinates: { latitude: 12.98, longitude: 77.60 },
          owner: { name: 'CPCB - Karnataka' },
          datetimeLast: { utc: '2026-11-27T10:00:00Z' },
          sensors: [
            {
              parameter: { name: 'pm25' },
              latest: { value: 35.5 },
              valueUnit: { symbol: 'µg/m³' }
            },
            {
              parameter: { name: 'pm10' },
              latest: { value: 65.0 },
              valueUnit: { symbol: 'µg/m³' }
            },
            {
              parameter: { name: 'no2' },
              latest: { value: 22.0 },
              valueUnit: { symbol: 'µg/m³' }
            }
          ]
        }
      ]
    };

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('api.openaq.org')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockOpenAQResponse)
        });
      }
      return originalFetch(url);
    });

    try {
      const req = new NextRequest('http://localhost:3000/api/air-quality/stations?lat=12.9716&lon=77.5946');
      const res = await GET(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.openaqConfigured).toBe(true);
      expect(data.stations.length).toBeGreaterThanOrEqual(1);
      
      const openaqStation = data.stations.find((s: any) => String(s.id).includes('101'));
      expect(openaqStation).toBeDefined();
      expect(openaqStation.name).toBe('Bengaluru City Ground Station');
      expect(openaqStation.cpcbAqi?.isOfficialAqi).toBe(true); // 3 pollutants including PM
    } finally {
      global.fetch = originalFetch;
    }
  });
});
