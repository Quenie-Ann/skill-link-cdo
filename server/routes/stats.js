// server/routes/stats.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/stats  — admin dashboard counts
router.get('/', async (req, res) => {
  try {
    const [[{ workers }]]  = await db.query(
      "SELECT COUNT(*) AS workers FROM profiles WHERE role = 'worker'"
    );
    const [[{ pending }]]  = await db.query(
      "SELECT COUNT(*) AS pending FROM profiles WHERE is_verified = 0"
    );
    const [[{ requests }]] = await db.query(
      "SELECT COUNT(*) AS requests FROM service_requests"
    );

    res.json({ workers, pending, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;