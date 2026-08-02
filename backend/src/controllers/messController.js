const dbHelper = require('../database/db');

function submitMessRating(req, res) {
  const studentId = req.user.id;
  const { date, meal_type, dish_name, rating, comments } = req.body;

  if (!meal_type || !dish_name || !rating) {
    return res.status(400).json({ error: 'Meal type, dish name, and rating (1-5) are required' });
  }

  const ratingDate = date || new Date().toISOString().split('T')[0];

  const result = dbHelper.run(
    `INSERT INTO mess_feedback (student_id, date, meal_type, dish_name, rating, comments) VALUES (?, ?, ?, ?, ?, ?)`,
    [studentId, ratingDate, meal_type, dish_name, parseInt(rating), comments || '']
  );

  res.status(201).json({
    message: 'Mess rating submitted successfully!',
    feedbackId: result.lastInsertRowid
  });
}

function getMessFeedbackTrends(req, res) {
  const ratings = dbHelper.all(
    `SELECT meal_type, dish_name, AVG(rating) as avg_rating, COUNT(*) as total_reviews 
     FROM mess_feedback 
     GROUP BY meal_type, dish_name 
     ORDER BY avg_rating DESC`
  );

  const dailyTrends = dbHelper.all(
    `SELECT date, AVG(rating) as daily_avg, COUNT(*) as count 
     FROM mess_feedback 
     GROUP BY date 
     ORDER BY date ASC`
  );

  const recentReviews = dbHelper.all(
    `SELECT m.*, u.name as student_name 
     FROM mess_feedback m 
     JOIN users u ON m.student_id = u.id 
     ORDER BY m.created_at DESC LIMIT 20`
  );

  res.json({
    dishRankings: ratings.map(r => ({ ...r, avg_rating: Math.round(r.avg_rating * 10) / 10 })),
    dailyTrends: dailyTrends.map(d => ({ ...d, daily_avg: Math.round(d.daily_avg * 10) / 10 })),
    recentReviews
  });
}

module.exports = {
  submitMessRating,
  getMessFeedbackTrends
};
