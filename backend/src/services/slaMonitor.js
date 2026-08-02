const dbHelper = require('../database/db');

/**
 * Calculates SLA breach status for maintenance tickets.
 * An unresolved ticket (PENDING or IN_PROGRESS) created > 48 hours ago is marked as SLA BREACHED.
 */
function enrichTicketWithSLA(ticket) {
  let dateStr = ticket.created_at;
  if (typeof dateStr === 'string' && !dateStr.includes('T')) {
    dateStr = dateStr.replace(' ', 'T') + 'Z';
  }
  const createdAt = new Date(dateStr).getTime();
  const now = Date.now();
  const ageInHours = (now - createdAt) / (1000 * 3600);

  const isUnresolved = ticket.status !== 'RESOLVED';
  const isSlaBreached = isUnresolved && ageInHours >= 48;

  return {
    ...ticket,
    ageInHours: Math.round(ageInHours * 10) / 10,
    isSlaBreached,
    slaRemainingHours: isUnresolved ? Math.max(0, Math.round((48 - ageInHours) * 10) / 10) : null
  };
}

function getSLABreachSummary() {
  const tickets = dbHelper.all(`SELECT t.*, u.name as student_name, r.room_number, r.block FROM maintenance_tickets t JOIN users u ON t.student_id = u.id JOIN rooms r ON t.room_id = r.id WHERE t.status != 'RESOLVED'`);

  const enriched = tickets.map(enrichTicketWithSLA);
  const breachedTickets = enriched.filter(t => t.isSlaBreached);

  return {
    totalActiveTickets: enriched.length,
    totalBreachedCount: breachedTickets.length,
    breachedTickets,
    allActiveTickets: enriched
  };
}

module.exports = {
  enrichTicketWithSLA,
  getSLABreachSummary
};
