const dbHelper = require('../database/db');
const { generateVisitorToken, verifyVisitorToken } = require('../services/qrService');

function requestVisitorPass(req, res) {
  const studentId = req.user.id;
  const { visitor_name, visitor_phone, purpose } = req.body;

  if (!visitor_name || !visitor_phone || !purpose) {
    return res.status(400).json({ error: 'Visitor name, phone, and purpose are required' });
  }

  const passCode = 'VP-' + Math.floor(100000 + Math.random() * 900000);
  
  // Create pass in DB first
  const validFrom = new Date().toISOString();
  const validUntil = new Date(Date.now() + 8 * 3600 * 1000).toISOString();

  const insertRes = dbHelper.run(
    `INSERT INTO visitor_passes (student_id, visitor_name, visitor_phone, purpose, pass_code, token, status, valid_from, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [studentId, visitor_name, visitor_phone, purpose, passCode, 'PENDING_TOKEN', 'ACTIVE', validFrom, validUntil]
  );

  const passId = insertRes.lastInsertRowid;
  const { token } = generateVisitorToken(passId, studentId, visitor_name, 8);

  // Update token in DB
  dbHelper.run(`UPDATE visitor_passes SET token = ? WHERE id = ?`, [token, passId]);

  const pass = dbHelper.get(`SELECT * FROM visitor_passes WHERE id = ?`, [passId]);

  res.status(201).json({
    message: 'Visitor pass created successfully! Valid for 8 hours.',
    pass
  });
}

function getMyVisitorPasses(req, res) {
  const passes = dbHelper.all(
    `SELECT * FROM visitor_passes WHERE student_id = ? ORDER BY created_at DESC`,
    [req.user.id]
  );

  // Auto update expired passes
  const now = new Date().toISOString();
  passes.forEach(p => {
    if (p.status === 'ACTIVE' && new Date(p.valid_until) < new Date(now)) {
      p.status = 'EXPIRED';
      dbHelper.run(`UPDATE visitor_passes SET status = 'EXPIRED' WHERE id = ?`, [p.id]);
    }
  });

  res.json({ passes });
}

function getAllVisitorPasses(req, res) {
  const passes = dbHelper.all(
    `SELECT v.*, u.name as student_name, u.roll_number, g.name as scanned_by_guard 
     FROM visitor_passes v 
     JOIN users u ON v.student_id = u.id 
     LEFT JOIN users g ON v.scanned_by_guard_id = g.id 
     ORDER BY v.created_at DESC`
  );

  // Auto update expired passes
  const now = new Date().toISOString();
  passes.forEach(p => {
    if (p.status === 'ACTIVE' && new Date(p.valid_until) < new Date(now)) {
      p.status = 'EXPIRED';
      dbHelper.run(`UPDATE visitor_passes SET status = 'EXPIRED' WHERE id = ?`, [p.id]);
    }
  });

  res.json({ passes });
}

function verifyAndScanPass(req, res) {
  const { codeOrToken } = req.body;
  const guardId = req.user ? req.user.id : null;

  if (!codeOrToken) {
    return res.status(400).json({ error: 'QR Code payload or Pass Code is required' });
  }

  const result = verifyVisitorToken(codeOrToken);

  if (!result.valid) {
    return res.status(400).json({
      valid: false,
      error: result.reason,
      pass: result.pass || null
    });
  }

  // Log scan in DB
  const pass = result.pass;
  dbHelper.run(
    `UPDATE visitor_passes SET scanned_at = datetime('now'), scanned_by_guard_id = ? WHERE id = ?`,
    [guardId, pass.id]
  );

  res.json({
    valid: true,
    message: 'Visitor pass VERIFIED successfully!',
    pass: {
      ...pass,
      scanned_at: new Date().toISOString()
    }
  });
}

function checkOutVisitor(req, res) {
  const { passId } = req.params;
  dbHelper.run(`UPDATE visitor_passes SET status = 'USED' WHERE id = ?`, [passId]);
  res.json({ message: 'Visitor marked as checked-out.' });
}

module.exports = {
  requestVisitorPass,
  getMyVisitorPasses,
  getAllVisitorPasses,
  verifyAndScanPass,
  checkOutVisitor
};
