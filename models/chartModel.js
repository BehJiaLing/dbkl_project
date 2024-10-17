const db = require('../config/db');

const ChartModel = {
    getChartData: async () => {
        try {
            // Query to count occurrences of each status (green, red, yellow)
            const [rows] = await db.query(`
                SELECT 
                    SUM(CASE WHEN status = 'green' THEN 1 ELSE 0 END) AS green,
                    SUM(CASE WHEN status = 'red' THEN 1 ELSE 0 END) AS red,
                    SUM(CASE WHEN status = 'yellow' THEN 1 ELSE 0 END) AS yellow
                FROM user
            `);

            return rows[0]; // Return the counts for green, red, and yellow
        } catch (error) {
            console.error('Database query error:', error);
            throw error; // Pass the error up to be handled in the controller
        }
    }
};

module.exports = ChartModel;
