const dbHelper = require('../database/db');

function requestHolidayPass(req, res) {
  const studentId = req.user.id;
  const { destination, reason, departure_date, return_date } = req.body;

  if (!destination || !reason || !departure_date || !return_date) {
    return res.status(400).json({ error: 'Destination, reason, departure date, and return date are required' });
  }

  const result = dbHelper.run(
    `INSERT INTO holiday_passes (student_id, destination, reason, departure_date, return_date, status) VALUES (?, ?, ?, ?, ?, 'PENDING')`,
    [studentId, destination, reason, departure_date, return_date]
  );

  res.status(201).json({
    message: 'Holiday pass request submitted! Pending Warden approval.',
    passId: result.lastInsertRowid
  });
}

function getMyHolidayPasses(req, res) {
  const passes = dbHelper.all(
    `SELECT * FROM holiday_passes WHERE student_id = ? ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ passes });
}

function getAllHolidayPasses(req, res) {
  const passes = dbHelper.all(
    `SELECT h.*, u.name as student_name, u.roll_number, u.batch, r.room_number 
     FROM holiday_passes h 
     JOIN users u ON h.student_id = u.id 
     LEFT JOIN rooms r ON u.room_id = r.id 
     ORDER BY h.created_at DESC`
  );
  res.json({ passes });
}

function updateHolidayPassStatus(req, res) {
  const { passId } = req.params;
  const { status } = req.body; // APPROVED, REJECTED, CHECKED_OUT, COMPLETED

  let updateSql = `UPDATE holiday_passes SET status = ?`;
  const params = [status];

  if (status === 'CHECKED_OUT') {
    updateSql += `, checked_out_at = datetime('now')`;
  } else if (status === 'COMPLETED') {
    updateSql += `, checked_in_at = datetime('now')`;
  }

  updateSql += ` WHERE id = ?`;
  params.push(passId);

  dbHelper.run(updateSql, params);

  res.json({ message: `Holiday pass status updated to ${status}` });
}

module.exports = {
  requestHolidayPass,
  getMyHolidayPasses,
  getAllHolidayPasses,
  updateHolidayPassStatus
};
