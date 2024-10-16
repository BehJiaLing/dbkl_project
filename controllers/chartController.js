const ChartModel = require('../models/chartModel');

const ChartController = {
    getChartData: async (req, res) => {
        try {
            const chartData = await ChartModel.getChartData();
            res.json(chartData); // Send the data in JSON format
        } catch (error) {
            res.status(500).json({ message: 'Error fetching chart data' });
        }
    }
};

module.exports = ChartController;
