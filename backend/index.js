import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import customerRouter from './routes/customer.routes.js';
import productRouter from './routes/product.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import cartRouter from './routes/cart.routes.js';
import orderRouter from './routes/order.routes.js';

dotenv.config({ quiet: true });

const app = express();

// Hosting providers inject the port to bind to (Render sets process.env.PORT).
// Fall back to the original local development port only when it is absent.
const port = process.env.PORT || 8083;

const isProduction = process.env.NODE_ENV === 'production';

// ---------------------------------------------------------------------------
// Startup configuration validation
// Fail fast with a clear message instead of crashing later in a confusing way.
// Never log the values themselves, only the variable names.
// ---------------------------------------------------------------------------
const dbUrl = process.env.dbUrl;
const jwtSecret = process.env.secret;

const missingEnvVars = [];
if (!dbUrl) missingEnvVars.push('dbUrl');
if (!jwtSecret) missingEnvVars.push('secret');

if (missingEnvVars.length > 0) {
  console.error(
    `[startup] Missing required environment variable(s): ${missingEnvVars.join(', ')}. ` +
      'Set them in your hosting provider (e.g. Render) or in backend/.env for local development.'
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// CORS: explicit allow-list of frontend origins.
// FRONTEND_URL may contain one or more comma-separated origins.
// We never reflect arbitrary origins and never combine a wildcard with
// credentials.
// ---------------------------------------------------------------------------
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Local Vite dev server origins are allowed outside production so that local
// development keeps working even when FRONTEND_URL is not set.
const localDevOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const allowedOrigins = isProduction
  ? configuredOrigins
  : [...new Set([...configuredOrigins, ...localDevOrigins])];

if (isProduction && configuredOrigins.length === 0) {
  console.warn(
    '[startup] FRONTEND_URL is not set. Browser requests from the frontend will be blocked by CORS.'
  );
}

const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin and non-browser requests (curl, health checks, SSR)
    // which do not send an Origin header.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    console.warn(`[cors] Blocked request from disallowed origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Health check endpoint.
// Returns a non-sensitive status only (no credentials, env values or errors).
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

app.use('/customers', customerRouter);
app.use('/products', productRouter);
app.use('/wishlist', wishlistRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);

// ---------------------------------------------------------------------------
// Connect to MongoDB before accepting traffic so that requests never hit the
// app before the database is ready. A failed connection is fatal and logged.
// ---------------------------------------------------------------------------
const startServer = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('[startup] MongoDB connected');
  } catch (error) {
    console.error(
      `[startup] Failed to connect to MongoDB: ${error.message}. ` +
        'Verify the "dbUrl" environment variable and MongoDB Atlas network access.'
    );
    process.exit(1);
  }

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[startup] Server listening on port ${port}`);
  });

  // Graceful shutdown so Render restarts/deploys cleanly.
  const shutdown = (signal) => {
    console.log(`[startup] Received ${signal}, shutting down...`);
    server.close(async () => {
      try {
        await mongoose.connection.close();
      } catch (error) {
        console.error(`[shutdown] Error closing MongoDB connection: ${error.message}`);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
