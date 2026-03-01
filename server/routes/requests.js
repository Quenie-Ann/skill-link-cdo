// server/routes/requests.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/requests  — all service requests, newest first
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, customer_name, service_type, status, assigned_worker, created_at
       FROM service_requests
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// POST /api/requests  — create a new request
router.post('/', async (req, res) => {
  const { customer_name, service_type, notes } = req.body;
  if (!customer_name || !service_type) {
    return res.status(400).json({ error: 'customer_name and service_type are required' });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO service_requests (customer_name, service_type, notes)
       VALUES (?, ?, ?)`,
      [customer_name, service_type, notes || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Request created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// PATCH /api/requests/:id/status  — update status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending','matched','in_progress','completed','cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  try {
    await db.query(
      'UPDATE service_requests SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;