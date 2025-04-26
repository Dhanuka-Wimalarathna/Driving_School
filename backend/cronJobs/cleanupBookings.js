// cronJobs/cleanupBookings.js
import cron from 'node-cron';
import sqldb from '../config/sqldb.js'; // Adjust path to your DB connection

// Run every day at midnight
cron.schedule('0 0 * * *', () => {
  const today = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD

  const query = 'DELETE FROM bookings WHERE date < ?';
  
  sqldb.query(query, [today], (err, result) => {
    if (err) {
      console.error('Error deleting old bookings:', err);
    } else {
      console.log(`Deleted ${result.affectedRows} old bookings.`);
    }
  });
});
