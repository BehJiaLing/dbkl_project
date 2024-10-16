const express = require('express');
const router = express.Router();
const ChartController = require('../controllers/chartController');

router.get('/chart-data', ChartController.getChartData);

module.exports = router;
