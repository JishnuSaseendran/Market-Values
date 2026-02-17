import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ access_token: 'test-token', token_type: 'bearer' });
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({ access_token: 'test-token', token_type: 'bearer' });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({ id: 1, username: 'testuser', email: 'test@test.com', is_active: true });
  }),

  http.get('/api/stocks', () => {
    return HttpResponse.json({
      data: [
        { symbol: 'RELIANCE.NS', current_price: 2500, previous_close: 2450, change: 50, percent_change: 2.04 },
        { symbol: 'TCS.NS', current_price: 3500, previous_close: 3530, change: -30, percent_change: -0.85 },
      ],
    });
  }),

  http.get('/api/stocks/candles/:symbol', () => {
    return HttpResponse.json({ data: [], indicators: {} });
  }),

  http.get('/api/news', () => {
    return HttpResponse.json({ articles: [] });
  }),

  http.get('/api/watchlists', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/portfolio', () => {
    return HttpResponse.json({ entries: [], total_invested: 0, total_current: 0, total_pnl: 0, total_pnl_percent: 0 });
  }),

  http.get('/api/alerts', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/preferences', () => {
    return HttpResponse.json({ default_symbol: 'RELIANCE.NS', default_interval: '5m', theme: 'dark' });
  }),
];
