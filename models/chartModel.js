const db = require('../config/db');

const ChartModel = {
    getChartData: async () => {
        const [rows] = await db.query('SELECT green, red, yellow FROM chart_data');
        return rows[0]; // Assuming there's one row with green, red, yellow data
    }
};

module.exports = ChartModel;
