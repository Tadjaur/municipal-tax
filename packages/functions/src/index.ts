import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { onRequest } from 'firebase-functions/v2/https';

// Import routes
import services from './routes/services';
import payments from './routes/payments';

// Create main app
const app = new Hono();

// Middleware
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173', // Admin app local
      'http://localhost:5174', // Client app local
      process.env.ADMIN_APP_URL || '',
      process.env.CLIENT_APP_URL || '',
    ].filter(Boolean),
    credentials: true,
  })
);

app.use('*', logger());

// Health check
app.get('/health', c => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.route('/api/services', services);
app.route('/api/payments', payments);

// 404 handler
app.notFound(c => {
  return c.json({ success: false, error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Global error handler:', err);
  return c.json(
    {
      success: false,
      error: err instanceof Error ? err.message : 'Internal server error',
    },
    500
  );
});

// Export as Firebase Cloud Function
export const api = onRequest({ memory: '256MiB', timeoutSeconds: 60 }, app.fetch);
