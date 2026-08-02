const dbHelper = require('../database/db');
const { enrichTicketWithSLA, getSLABreachSummary } = require('../services/slaMonitor');

function createTicket(req, res) {
  const studentId = req.user.id;
  const { category, priority, title, description } = req.body;

  if (!category || !title || !description) {
    return res.status(400).json({ error: 'Category, title, and description are required' });
  }

  // Get student's room
  const student = dbHelper.get('SELECT room_id FROM users WHERE id = ?', [studentId]);
  if (!student || !student.room_id) {
    return res.status(400).json({ error: 'Student must have an allotted room to submit a maintenance ticket.' });
  }

  const result = dbHelper.run(
    `INSERT INTO maintenance_tickets (student_id, room_id, category, priority, title, description, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
    [studentId, student.room_id, category, priority || 'Medium', title, description]
  );

  const ticket = dbHelper.get('SELECT * FROM maintenance_tickets WHERE id = ?', [result.lastInsertRowid]);

  res.status(201).json({
    message: 'Maintenance ticket created successfully!',
    ticket: enrichTicketWithSLA(ticket)
  });
}

function getMyTickets(req, res) {
  const tickets = dbHelper.all(
    `SELECT t.*, r.room_number, r.block FROM maintenance_tickets t JOIN rooms r ON t.room_id = r.id WHERE t.student_id = ? ORDER BY t.created_at DESC`,
    [req.user.id]
  );

  const enrichedTickets = tickets.map(enrichTicketWithSLA);
  res.json({ tickets: enrichedTickets });
}

function getAllTickets(req, res) {
  const tickets = dbHelper.all(
    `SELECT t.*, u.name as student_name, u.roll_number, r.room_number, r.block, r.floor 
     FROM maintenance_tickets t 
     JOIN users u ON t.student_id = u.id 
     JOIN rooms r ON t.room_id = r.id 
     ORDER BY t.created_at DESC`
  );

  const enrichedTickets = tickets.map(enrichTicketWithSLA);
  res.json({ tickets: enrichedTickets });
}

function updateTicketStatus(req, res) {
  const { ticketId } = req.params;
  const { status, assigned_to } = req.body;

  let updateSql = `UPDATE maintenance_tickets SET status = ?`;
  const params = [status];

  if (assigned_to !== undefined) {
    updateSql += `, assigned_to = ?`;
    params.push(assigned_to);
  }

  if (status === 'RESOLVED') {
    updateSql += `, resolved_at = datetime('now')`;
  }

  updateSql += ` WHERE id = ?`;
  params.push(ticketId);

  dbHelper.run(updateSql, params);

  const updatedTicket = dbHelper.get(
    `SELECT t.*, u.name as student_name, r.room_number FROM maintenance_tickets t JOIN users u ON t.student_id = u.id JOIN rooms r ON t.room_id = r.id WHERE t.id = ?`,
    [ticketId]
  );

  res.json({
    message: `Ticket updated to ${status}`,
    ticket: enrichTicketWithSLA(updatedTicket)
  });
}

function getSLABreachAlerts(req, res) {
  const summary = getSLABreachSummary();
  res.json(summary);
}

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
  getSLABreachAlerts
};
