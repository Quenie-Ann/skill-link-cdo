// server/routes/workers.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/workers  — all workers with profile info, newest first
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         w.id, w.experience_years, w.hourly_rate, w.rating, w.skills, w.created_at,
         p.full_name, p.email, p.is_verified
       FROM workers w
       JOIN profiles p ON w.profile_id = p.id
       ORDER BY w.created_at DESC`
    );
    // Parse skills JSON string into array
    const workers = rows.map((r) => ({
      ...r,
      skills: typeof r.skills === 'string' ? JSON.parse(r.skills) : (r.skills || []),
    }));
    res.json(workers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// POST /api/workers  — add a new worker (creates profile + worker row)
router.post('/', async (req, res) => {
  const { full_name, email, experience_years, hourly_rate, skills } = req.body;
  if (!full_name || !email) {
    return res.status(400).json({ error: 'full_name and email are required' });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [profileResult] = await conn.query(
      `INSERT INTO profiles (email, full_name, role, is_verified)
       VALUES (?, ?, 'worker', FALSE)`,
      [email, full_name]
    );
    const profileId = profileResult.insertId;

    await conn.query(
      `INSERT INTO workers (profile_id, experience_years, hourly_rate, skills)
       VALUES (?, ?, ?, ?)`,
      [
        profileId,
        experience_years || 0,
        hourly_rate || 0,
        JSON.stringify(skills || []),
      ]
    );

    await conn.commit();
    res.status(201).json({ message: 'Worker added successfully', profile_id: profileId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A worker with this email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to add worker' });
  } finally {
    conn.release();
  }
});

// PATCH /api/workers/:id/verify  — toggle verification
router.patch('/:id/verify', async (req, res) => {
  const { is_verified } = req.body;
  try {
    await db.query(
      `UPDATE profiles p
       JOIN workers w ON w.profile_id = p.id
       SET p.is_verified = ?
       WHERE w.id = ?`,
      [is_verified ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Verification updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

module.exports = router;