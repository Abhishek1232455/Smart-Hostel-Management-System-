const dbHelper = require('../database/db');
const { allotRoomForStudent } = require('../services/allotmentEngine');

function getAllRooms(req, res) {
  const rooms = dbHelper.all('SELECT * FROM rooms ORDER BY block, floor, room_number');
  res.json({ rooms });
}

function requestAllotment(req, res) {
  const studentId = req.user.id;
  const { preferred_floor, preferred_room_type, preferred_block } = req.body;

  try {
    const result = allotRoomForStudent(studentId, preferred_floor, preferred_room_type, preferred_block);

    // Save request record
    dbHelper.run(
      `INSERT INTO allotment_requests (student_id, preferred_floor, preferred_room_type, preferred_block, status, allotted_room_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, preferred_floor || 1, preferred_room_type || 'Single', preferred_block || 'Block A', result.success ? 'APPROVED' : 'REJECTED', result.room ? result.room.id : null]
    );

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function getAllotmentHistory(req, res) {
  const requests = dbHelper.all(
    `SELECT a.*, r.room_number, r.block, r.floor, u.name as student_name 
     FROM allotment_requests a 
     LEFT JOIN rooms r ON a.allotted_room_id = r.id 
     JOIN users u ON a.student_id = u.id 
     ORDER BY a.created_at DESC`
  );
  res.json({ requests });
}

module.exports = {
  getAllRooms,
  requestAllotment,
  getAllotmentHistory
};
