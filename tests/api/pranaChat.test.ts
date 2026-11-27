import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/prana/chat/route';
import { NextRequest } from 'next/server';

// Mock @google/generative-ai
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation((key: string) => {
      return {
        getGenerativeModel: vi.fn().mockImplementation(({ model }: { model: string }) => {
          if (model === 'trigger-error') {
            throw new Error('Simulated Gemini model error');
          }
          return {
            generateContent: vi.fn().mockResolvedValue({
              response: {
                text: () => `Mocked Gemini response from ${model} for test query.`,
              },
            }),
          };
        }),
      };
    }),
  };
});

describe('Prana AI Assistant API Route (/api/prana/chat)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  it('returns 400 Bad Request when message is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/prana/chat', {
      method: 'POST',
      body: JSON.stringify({ context: {} }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Message is required');
  });

  it('serves autonomous heuristic response when GEMINI_API_KEY is not configured', async () => {
    const req = new NextRequest('http://localhost:3000/api/prana/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Is it safe to go jogging today?',
        context: {
          location: 'Bengaluru',
          aqi: 85,
          severity: 'Moderate',
          pollutants: { pm25: 28.4 },
          persona: 'working-professional',
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.metadata.isFallback).toBe(true);
    expect(data.metadata.modelUsed).toContain('Autonomous');
    expect(data.content).toContain('Bengaluru');
    expect(data.content).toContain('Acceptable with Precautions');
    // Ensure no secret or key is returned
    expect(JSON.stringify(data)).not.toContain('AIza');
  });

  it('calls Google Gemini when GEMINI_API_KEY is present and returns neural response', async () => {
    process.env.GEMINI_API_KEY = 'test-dummy-gemini-key-12345';

    const req = new NextRequest('http://localhost:3000/api/prana/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'What precautions should a family take today?',
        context: {
          location: 'Bengaluru',
          aqi: 120,
          severity: 'Unhealthy for Sensitive Groups',
          pollutants: { pm25: 42.0 },
          persona: 'family',
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.metadata.isFallback).toBe(false);
    expect(data.metadata.modelUsed).toContain('Google Gemini');
    expect(data.content).toContain('Mocked Gemini response');
    // Security check: verify the API key is NEVER exposed in the JSON response
    expect(JSON.stringify(data)).not.toContain('test-dummy-gemini-key-12345');
  });

  it('falls back gracefully to autonomous engine when Gemini API throws an error', async () => {
    process.env.GEMINI_API_KEY = 'test-dummy-gemini-key-12345';

    // Mock GoogleGenerativeAI to simulate API failure
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    (GoogleGenerativeAI as any).mockImplementationOnce(() => {
      return {
        getGenerativeModel: () => {
          throw new Error('503 Service Unavailable / High demand spike');
        },
      };
    });

    const req = new NextRequest('http://localhost:3000/api/prana/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Should I open my windows today?',
        context: {
          location: 'Bengaluru',
          aqi: 140,
          severity: 'Unhealthy for Sensitive Groups',
          pollutants: { pm25: 50.0 },
          persona: 'working-professional',
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.metadata.isFallback).toBe(true);
    expect(data.metadata.modelUsed).toContain('Autonomous Environmental Engine');
    expect(data.content).toContain('Keep Windows Closed');
  });
});
