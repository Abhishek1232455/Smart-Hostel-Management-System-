const jwt = require('jsonwebtoken');
const dbHelper = require('../database/db');

const QR_SECRET = process.env.QR_SECRET || 'smart-hostel-qr-secret-pass-2026';

function generateVisitorToken(passId, studentId, visitorName, validHours = 8) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + (validHours * 3600);

  const payload = {
    passId,
    studentId,
    visitorName,
    type: 'VISITOR_PASS',
    iat: issuedAt,
    exp: expiresAt
  };

  const token = jwt.sign(payload, QR_SECRET);
  return { token, validFrom: new Date(issuedAt * 1000).toISOString(), validUntil: new Date(expiresAt * 1000).toISOString() };
}

function verifyVisitorToken(token) {
  // First check if token corresponds directly to a pass_code or token in DB
  const passByCode = dbHelper.get(
    `SELECT v.*, u.name as student_name, u.roll_number, u.room_id 
     FROM visitor_passes v 
     JOIN users u ON v.student_id = u.id 
     WHERE v.pass_code = ? OR v.token = ?`,
    [token, token]
  );

  if (passByCode) {
    if (passByCode.status === 'EXPIRED' || new Date(passByCode.valid_until) < new Date()) {
      dbHelper.run(`UPDATE visitor_passes SET status = 'EXPIRED' WHERE id = ?`, [passByCode.id]);
      return { valid: false, reason: 'Visitor pass has EXPIRED (8-hour limit reached)', pass: passByCode };
    }
    if (passByCode.status === 'USED') {
      return { valid: false, reason: 'Pass has already been used and checked out', pass: passByCode };
    }
    return { valid: true, pass: passByCode };
  }

  try {
    const decoded = jwt.verify(token, QR_SECRET);
    const pass = dbHelper.get(
      `SELECT v.*, u.name as student_name, u.roll_number, u.room_id 
       FROM visitor_passes v 
       JOIN users u ON v.student_id = u.id 
       WHERE v.id = ?`,
      [decoded.passId]
    );

    if (!pass) {
      return { valid: false, reason: 'Pass not found in database' };
    }

    if (pass.status === 'EXPIRED' || new Date(pass.valid_until) < new Date()) {
      dbHelper.run(`UPDATE visitor_passes SET status = 'EXPIRED' WHERE id = ?`, [pass.id]);
      return { valid: false, reason: 'Visitor pass has EXPIRED (8-hour limit reached)', pass };
    }

    if (pass.status === 'USED') {
      return { valid: false, reason: 'Pass has already been used and checked out', pass };
    }

    return { valid: true, pass, decoded };
  } catch (err) {
    return { valid: false, reason: 'Invalid or expired QR code pass: ' + err.message };
  }
}

module.exports = {
  generateVisitorToken,
  verifyVisitorToken
};
