const dbHelper = require('../database/db');
const { getSLABreachSummary } = require('../services/slaMonitor');

function getWardenDashboardStats(req, res) {
  // 1. Occupancy Breakdown
  const rooms = dbHelper.all('SELECT * FROM rooms ORDER BY block, floor, room_number');
  const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupancy = rooms.reduce((acc, r) => acc + r.occupancy, 0);
  const occupancyPercentage = Math.round((totalOccupancy / totalCapacity) * 100);

  // Group rooms by block
  const blockStats = {};
  rooms.forEach(r => {
    if (!blockStats[r.block]) {
      blockStats[r.block] = { totalRooms: 0, capacity: 0, occupancy: 0, rooms: [] };
    }
    blockStats[r.block].totalRooms++;
    blockStats[r.block].capacity += r.capacity;
    blockStats[r.block].occupancy += r.occupancy;
    blockStats[r.block].rooms.push(r);
  });

  // 2. SLA Breach Summary
  const slaSummary = getSLABreachSummary();

  // 3. Active Visitor Passes
  const activeVisitors = dbHelper.all(
    `SELECT v.*, u.name as student_name, u.roll_number 
     FROM visitor_passes v 
     JOIN users u ON v.student_id = u.id 
     WHERE v.status = 'ACTIVE' AND v.valid_until > datetime('now') 
     ORDER BY v.created_at DESC`
  );

  // 4. Pending Holiday Leaves
  const pendingLeaves = dbHelper.all(
    `SELECT h.*, u.name as student_name, u.roll_number 
     FROM holiday_passes h 
     JOIN users u ON h.student_id = u.id 
     WHERE h.status = 'PENDING' 
     ORDER BY h.created_at DESC`
  );

  // 5. Total Students Count
  const studentCountRes = dbHelper.get(`SELECT COUNT(*) as count FROM users WHERE role = 'student'`);

  res.json({
    summary: {
      totalRooms: rooms.length,
      totalCapacity,
      totalOccupancy,
      occupancyPercentage,
      totalStudents: studentCountRes ? studentCountRes.count : 200,
      activeVisitorsCount: activeVisitors.length,
      slaBreachesCount: slaSummary.totalBreachedCount,
      pendingLeavesCount: pendingLeaves.length
    },
    blockStats,
    slaSummary,
    activeVisitors,
    pendingLeaves
  });
}

module.exports = {
  getWardenDashboardStats
};
