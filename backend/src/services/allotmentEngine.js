const dbHelper = require('../database/db');

/**
 * Greed/Scoring preference matching room allotment algorithm:
 * Matches student preferences (floor, room type, block) against available rooms.
 */
function allotRoomForStudent(studentId, preferredFloor, preferredRoomType, preferredBlock) {
  // Check if student already has a room
  const student = dbHelper.get('SELECT * FROM users WHERE id = ?', [studentId]);
  if (!student) {
    throw new Error('Student not found');
  }

  if (student.room_id) {
    return {
      success: false,
      message: 'Student already has an allotted room.',
      roomId: student.room_id
    };
  }

  // Fetch available rooms
  const availableRooms = dbHelper.all(`SELECT * FROM rooms WHERE occupancy < capacity AND status = 'AVAILABLE'`);

  if (availableRooms.length === 0) {
    return {
      success: false,
      message: 'No available rooms found in hostel.'
    };
  }

  // Score candidate rooms based on preference match
  let bestRoom = null;
  let highestScore = -1;

  availableRooms.forEach(room => {
    let score = 0;
    
    // Floor match (+30 points)
    if (preferredFloor && parseInt(room.floor) === parseInt(preferredFloor)) {
      score += 30;
    }

    // Room Type match (+30 points)
    if (preferredRoomType && room.room_type.toLowerCase() === preferredRoomType.toLowerCase()) {
      score += 30;
    }

    // Preferred Block match (+20 points)
    if (preferredBlock && room.block.toLowerCase() === preferredBlock.toLowerCase()) {
      score += 20;
    }

    // Base point for available spot (+10 points)
    score += 10;

    if (score > highestScore) {
      highestScore = score;
      bestRoom = room;
    }
  });

  if (!bestRoom) {
    return {
      success: false,
      message: 'Could not match room.'
    };
  }

  // Allot room
  const newOccupancy = bestRoom.occupancy + 1;
  const newStatus = newOccupancy >= bestRoom.capacity ? 'FULL' : 'AVAILABLE';

  dbHelper.run('UPDATE rooms SET occupancy = ?, status = ? WHERE id = ?', [newOccupancy, newStatus, bestRoom.id]);
  dbHelper.run('UPDATE users SET room_id = ? WHERE id = ?', [bestRoom.id, studentId]);

  return {
    success: true,
    message: `Room ${bestRoom.room_number} successfully allotted!`,
    room: bestRoom,
    score: highestScore
  };
}

module.exports = {
  allotRoomForStudent
};
