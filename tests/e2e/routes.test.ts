import { describe, it, expect } from 'vitest';
import { GET as localDemoGet, POST as localDemoPost } from '@/app/api/local-demo/record/route';
import { POST as pranaChatPost } from '@/app/api/prana/chat/route';
import { NextRequest } from 'next/server';

describe('Application Route and Environment Security Tests', () => {
  describe('Local Demo Production Isolation Security Guard', () => {
    const originalEnv = process.env.NODE_ENV;

    it('returns 404 on GET /api/local-demo/record in production environment', async () => {
      // @ts-ignore
      process.env.NODE_ENV = 'production';
      const response = await localDemoGet();
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Not Found');
      // @ts-ignore
      process.env.NODE_ENV = originalEnv;
    });

    it('returns 404 on POST /api/local-demo/record in production environment', async () => {
      // @ts-ignore
      process.env.NODE_ENV = 'production';
      const req = new NextRequest('http://localhost:3000/api/local-demo/record', {
        method: 'POST',
      });
      const response = await localDemoPost(req);
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Not Found');
      // @ts-ignore
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Prana AI Route Security and Validation', () => {
    it('returns 400 Bad Request when message or messages are missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/prana/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await pranaChatPost(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Message is required');
    });

    it('does not leak internal server secrets or keys on invalid requests', async () => {
      const req = new NextRequest('http://localhost:3000/api/prana/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: true }),
      });

      const response = await pranaChatPost(req);
      const text = await response.text();
      expect(text).not.toContain('GEMINI_API_KEY');
      expect(text).not.toContain('AIzaSy');
    });
  });
});
