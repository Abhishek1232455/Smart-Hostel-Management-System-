const dbHelper = require('../database/db');

function createNotification(userId, title, message, type = 'GENERAL') {
  try {
    dbHelper.run(
      `INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, 0)`,
      [userId, title, message, type]
    );
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}

function getMyNotifications(req, res) {
  const notifications = dbHelper.all(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
    [req.user.id]
  );
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  res.json({
    unreadCount,
    notifications
  });
}

function markNotificationAsRead(req, res) {
  const { id } = req.params;
  dbHelper.run(
    `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
    [id, req.user.id]
  );
  res.json({ message: 'Notification marked as read' });
}

function markAllAsRead(req, res) {
  dbHelper.run(
    `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
    [req.user.id]
  );
  res.json({ message: 'All notifications marked as read' });
}

module.exports = {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
  markAllAsRead
};
