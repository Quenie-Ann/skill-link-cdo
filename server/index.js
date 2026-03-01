// server/index.js
require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors    = require('cors');

const statsRouter    = require('./routes/stats');
const requestsRouter = require('./routes/requests');
const workersRouter  = require('./routes/workers');

const app  = express();
const PORT = process.env.SERVER_PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173' })); // Vite dev server
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.use('/api/stats',    statsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/workers',  workersRouter);

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Skill-Link API running at http://localhost:${PORT}`);
});