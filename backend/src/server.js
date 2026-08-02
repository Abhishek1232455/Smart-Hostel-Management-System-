const express = require('express');
const cors = require('cors');
const path = require('path');
const dbHelper = require('./database/db');

// Import controllers
const authController = require('./controllers/authController');
const roomController = require('./controllers/roomController');
const visitorController = require('./controllers/visitorController');
const maintenanceController = require('./controllers/maintenanceController');
const messController = require('./controllers/messController');
const holidayController = require('./controllers/holidayController');
const dashboardController = require('./controllers/dashboardController');

// Import middleware
const { authenticateToken, authorizeRoles } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database on startup and auto-seed if empty
dbHelper.initDb().then(() => {
  console.log("Database initialized.");
  const userCount = dbHelper.get("SELECT COUNT(*) as count FROM users");
  if (!userCount || userCount.count === 0) {
    console.log("Database empty. Auto-seeding 100 rooms and 200 students...");
    require('./database/seed');
  }
}).catch(err => {
  console.error("Database initialization failed:", err);
});

// --- Auth Routes ---
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authenticateToken, authController.getMe);

// --- Room & Allotment Routes ---
app.get('/api/rooms', roomController.getAllRooms);
app.post('/api/rooms/allot', authenticateToken, authorizeRoles('student'), roomController.requestAllotment);
app.get('/api/rooms/requests', authenticateToken, authorizeRoles('warden', 'admin'), roomController.getAllotmentHistory);

// --- Visitor Pass Routes ---
app.post('/api/visitors/pass', authenticateToken, authorizeRoles('student'), visitorController.requestVisitorPass);
app.get('/api/visitors/my-passes', authenticateToken, authorizeRoles('student'), visitorController.getMyVisitorPasses);
app.get('/api/visitors/all', authenticateToken, authorizeRoles('warden', 'guard', 'admin'), visitorController.getAllVisitorPasses);
app.post('/api/visitors/verify', visitorController.verifyAndScanPass);
app.post('/api/visitors/checkout/:passId', authenticateToken, authorizeRoles('guard', 'warden', 'admin'), visitorController.checkOutVisitor);

// --- Maintenance & SLA Routes ---
app.post('/api/maintenance/ticket', authenticateToken, authorizeRoles('student'), maintenanceController.createTicket);
app.get('/api/maintenance/my-tickets', authenticateToken, authorizeRoles('student'), maintenanceController.getMyTickets);
app.get('/api/maintenance/tickets', authenticateToken, authorizeRoles('warden', 'admin', 'guard'), maintenanceController.getAllTickets);
app.patch('/api/maintenance/tickets/:ticketId', authenticateToken, authorizeRoles('warden', 'admin'), maintenanceController.updateTicketStatus);
app.get('/api/maintenance/sla-alerts', authenticateToken, authorizeRoles('warden', 'admin'), maintenanceController.getSLABreachAlerts);

// --- Mess Feedback Routes ---
app.post('/api/mess/rating', authenticateToken, authorizeRoles('student'), messController.submitMessRating);
app.get('/api/mess/trends', messController.getMessFeedbackTrends);

// --- Holiday Pass Routes ---
app.post('/api/holiday/request', authenticateToken, authorizeRoles('student'), holidayController.requestHolidayPass);
app.get('/api/holiday/my-passes', authenticateToken, authorizeRoles('student'), holidayController.getMyHolidayPasses);
app.get('/api/holiday/all', authenticateToken, authorizeRoles('warden', 'guard', 'admin'), holidayController.getAllHolidayPasses);
app.patch('/api/holiday/:passId/status', authenticateToken, authorizeRoles('warden', 'guard', 'admin'), holidayController.updateHolidayPassStatus);

// --- Warden Dashboard Stats Route ---
app.get('/api/dashboard/warden', authenticateToken, authorizeRoles('warden', 'admin'), dashboardController.getWardenDashboardStats);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Hostel Management System API Server running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
