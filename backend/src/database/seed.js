const dbHelper = require('./db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log("Initializing database for seeding...");
  
  // Remove existing hostel.db if we want a clean seed
  const dbPath = path.join(__dirname, '../../hostel.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  await dbHelper.initDb();

  const hashedPassword = bcrypt.hashSync('password', 10);

  console.log("Seeding Users (Admin, Warden, Guard)...");
  
  // Admin
  dbHelper.run(
    `INSERT INTO users (username, password, name, email, phone, role) VALUES (?, ?, ?, ?, ?, ?)`,
    ['admin1', hashedPassword, 'System Administrator', 'admin@hostel.edu', '9876543210', 'admin']
  );

  // Warden
  const wardenId = dbHelper.run(
    `INSERT INTO users (username, password, name, email, phone, role) VALUES (?, ?, ?, ?, ?, ?)`,
    ['warden1', hashedPassword, 'Dr. Rajesh Sharma (Head Warden)', 'warden@hostel.edu', '9876543211', 'warden']
  ).lastInsertRowid;

  // Security Guard
  const guardId = dbHelper.run(
    `INSERT INTO users (username, password, name, email, phone, role) VALUES (?, ?, ?, ?, ?, ?)`,
    ['guard1', hashedPassword, 'Vikram Singh (Main Gate Guard)', 'guard@hostel.edu', '9876543212', 'guard']
  ).lastInsertRowid;

  console.log("Seeding 100 Rooms across Blocks A, B, C, D...");
  const blocks = ['Block A', 'Block B', 'Block C', 'Block D'];
  const roomIds = [];
  
  let roomCount = 0;
  for (let b = 0; b < blocks.length; b++) {
    const block = blocks[b];
    for (let f = 1; f <= 5; f++) {
      for (let r = 1; r <= 5; r++) {
        if (roomCount >= 100) break;
        roomCount++;
        const roomNum = `${block.split(' ')[1]}-${f}0${r}`;
        const roomType = (roomCount % 3 === 0) ? 'Single' : 'Double';
        const capacity = roomType === 'Double' ? 2 : 1;

        const res = dbHelper.run(
          `INSERT INTO rooms (room_number, block, floor, room_type, capacity, occupancy, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [roomNum, block, f, roomType, capacity, 0, 'AVAILABLE']
        );
        roomIds.push({ id: res.lastInsertRowid, roomNum, block, floor: f, capacity, type: roomType });
      }
    }
  }

  console.log(`Successfully created ${roomIds.length} rooms.`);

  console.log("Seeding 200 Student records...");
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Pari', 'Anika', 'Navya', 'Angel', 'Riya', 'Myra'];
  const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Reddy', 'Kumar', 'Singh', 'Joshi', 'Nair', 'Rao', 'Chowdhury', 'Das', 'Mehta', 'Bhat', 'Kulkarni'];
  const batches = ['2023', '2024', '2025', '2026'];

  const studentIds = [];
  let allocatedRoomIndex = 0;
  let roomOccupancyMap = {};

  for (let i = 1; i <= 200; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const name = `${fn} ${ln}`;
    const username = `student${i}`;
    const rollNumber = `CS202${(i % 4) + 3}${100 + i}`;
    const batch = batches[i % batches.length];

    // Assign rooms to first ~120 students so we have realistic hostel occupancy
    let assignedRoomId = null;
    if (i <= 120 && allocatedRoomIndex < roomIds.length) {
      const room = roomIds[allocatedRoomIndex];
      assignedRoomId = room.id;
      roomOccupancyMap[room.id] = (roomOccupancyMap[room.id] || 0) + 1;
      if (roomOccupancyMap[room.id] >= room.capacity) {
        allocatedRoomIndex++;
      }
    }

    const res = dbHelper.run(
      `INSERT INTO users (username, password, name, email, phone, role, roll_number, batch, room_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, name, `${username}@hostel.edu`, `912345${1000 + i}`, 'student', rollNumber, batch, assignedRoomId]
    );
    studentIds.push(res.lastInsertRowid);
  }

  // Update room occupancy counts in database
  for (const roomId in roomOccupancyMap) {
    const occ = roomOccupancyMap[roomId];
    const room = roomIds.find(r => r.id == roomId);
    const status = occ >= room.capacity ? 'FULL' : 'AVAILABLE';
    dbHelper.run(
      `UPDATE rooms SET occupancy = ?, status = ? WHERE id = ?`,
      [occ, status, roomId]
    );
  }

  console.log("Seeding Maintenance Tickets (including SLA breach test cases > 48h)...");
  
  // Normal recent ticket
  dbHelper.run(
    `INSERT INTO maintenance_tickets (student_id, room_id, category, priority, title, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-5 hours'))`,
    [studentIds[0], roomIds[0].id, 'Plumbing', 'High', 'Leaking Tap', 'Bathroom sink tap is leaking continuously.', 'PENDING']
  );

  // Normal in-progress ticket
  dbHelper.run(
    `INSERT INTO maintenance_tickets (student_id, room_id, category, priority, title, description, status, assigned_to, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-18 hours'))`,
    [studentIds[1], roomIds[1].id, 'Electrical', 'Medium', 'Flickering Ceiling Tube Light', 'Tube light flashes every 10 seconds.', 'IN_PROGRESS', 'Electrician Suresh', ]
  );

  // Resolved ticket
  dbHelper.run(
    `INSERT INTO maintenance_tickets (student_id, room_id, category, priority, title, description, status, assigned_to, created_at, resolved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-30 hours'), datetime('now', '-2 hours'))`,
    [studentIds[2], roomIds[2].id, 'Furniture', 'Low', 'Broken Chair Armrest', 'Study chair armrest loose.', 'RESOLVED', 'Carpenter Ramesh']
  );

  // SLA BREACH TEST CASE 1 (> 48h pending)
  dbHelper.run(
    `INSERT INTO maintenance_tickets (student_id, room_id, category, priority, title, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-64 hours'))`,
    [studentIds[3], roomIds[3].id, 'Internet', 'High', 'No Wi-Fi Connection in Room', 'Router on floor 2 not working since 3 days.', 'PENDING']
  );

  // SLA BREACH TEST CASE 2 (> 48h in progress)
  dbHelper.run(
    `INSERT INTO maintenance_tickets (student_id, room_id, category, priority, title, description, status, assigned_to, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-72 hours'))`,
    [studentIds[4], roomIds[4].id, 'Plumbing', 'High', 'Main Flush Leakage', 'Flush valve broken causing floor dampness.', 'IN_PROGRESS', 'Plumber Mahesh']
  );

  console.log("Seeding Visitor Passes...");
  const validUntilActive = new Date(Date.now() + 6 * 3600 * 1000).toISOString();
  const validUntilExpired = new Date(Date.now() - 2 * 3600 * 1000).toISOString();

  // Active pass
  dbHelper.run(
    `INSERT INTO visitor_passes (student_id, visitor_name, visitor_phone, purpose, pass_code, token, status, valid_from, valid_until, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, datetime('now'))`,
    [studentIds[0], 'Ramesh Sharma (Father)', '9988776655', 'Parent Visit', 'VP-1001', 'token-active-1001', 'ACTIVE', validUntilActive]
  );

  // Expired pass
  dbHelper.run(
    `INSERT INTO visitor_passes (student_id, visitor_name, visitor_phone, purpose, pass_code, token, status, valid_from, valid_until, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-10 hours'), ?, datetime('now', '-10 hours'))`,
    [studentIds[1], 'Sunil Kumar (Friend)', '9988776644', 'Study Notes Handover', 'VP-1002', 'token-expired-1002', 'EXPIRED', validUntilExpired]
  );

  console.log("Seeding Mess Feedback Ratings...");
  const meals = ['Breakfast', 'Lunch', 'Dinner'];
  const dishes = {
    Breakfast: ['Poha & Jalebi', 'Idli Sambar', 'Aloo Paratha', 'Masala Dosa'],
    Lunch: ['Rajma Chawal & Salad', 'Paneer Butter Masala & Roti', 'Dal Tadka & Rice', 'Veg Biryani'],
    Dinner: ['Mixed Veg & Chapati', 'Kadhi Pakoda & Chawal', 'Egg Curry / Chana Masala', 'Pav Bhaji']
  };

  const todayStr = new Date().toISOString().split('T')[0];
  for (let d = 0; d < 5; d++) {
    const dateObj = new Date(Date.now() - d * 86400 * 1000);
    const dateStr = dateObj.toISOString().split('T')[0];

    meals.forEach(meal => {
      const dishList = dishes[meal];
      const dish = dishList[d % dishList.length];
      for (let s = 0; s < 5; s++) {
        const studentId = studentIds[(d * 10 + s) % studentIds.length];
        const rating = (s % 5) + 1;
        dbHelper.run(
          `INSERT INTO mess_feedback (student_id, date, meal_type, dish_name, rating, comments) VALUES (?, ?, ?, ?, ?, ?)`,
          [studentId, dateStr, meal, dish, rating, rating >= 4 ? 'Great food quality!' : 'Needs improvement in spice level.']
        );
      }
    });
  }

  console.log("Seeding Holiday Gate Passes...");
  dbHelper.run(
    `INSERT INTO holiday_passes (student_id, destination, reason, departure_date, return_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [studentIds[0], 'Hometown - Jaipur', 'Diwali Festival Break', '2026-08-05', '2026-08-10', 'PENDING']
  );

  dbHelper.run(
    `INSERT INTO holiday_passes (student_id, destination, reason, departure_date, return_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-1 day'))`,
    [studentIds[1], 'New Delhi', 'Medical Appointment', '2026-08-03', '2026-08-06', 'APPROVED']
  );

  dbHelper.saveDb();
  console.log("=========================================");
  console.log("DATABASE SEEDING COMPLETED SUCCESSFULLY!");
  console.log("Summary:");
  console.log("- Admin: admin1 / password");
  console.log("- Warden: warden1 / password");
  console.log("- Guard: guard1 / password");
  console.log("- Students: student1 to student200 / password");
  console.log("- Rooms created: 100 rooms across Blocks A, B, C, D");
  console.log("- Sample SLA breached tickets inserted for verification (>48h)");
  console.log("=========================================");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
});
