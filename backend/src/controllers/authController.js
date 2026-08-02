const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbHelper = require('../database/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = dbHelper.get('SELECT * FROM users WHERE username = ?', [username]);

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Get allotted room details if student
  let roomDetails = null;
  if (user.room_id) {
    roomDetails = dbHelper.get('SELECT * FROM rooms WHERE id = ?', [user.room_id]);
  }

  const tokenPayload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    roll_number: user.roll_number,
    batch: user.batch
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      roll_number: user.roll_number,
      batch: user.batch,
      room_id: user.room_id,
      room: roomDetails
    }
  });
}

function getMe(req, res) {
  const user = dbHelper.get('SELECT id, username, name, email, phone, role, roll_number, batch, room_id FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let roomDetails = null;
  if (user.room_id) {
    roomDetails = dbHelper.get('SELECT * FROM rooms WHERE id = ?', [user.room_id]);
  }

  res.json({
    user: {
      ...user,
      room: roomDetails
    }
  });
}

module.exports = {
  login,
  getMe
};
