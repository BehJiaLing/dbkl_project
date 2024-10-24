const express = require('express');
const router = express.Router();
const PageController = require('../controllers/pageController');

router.get('/page-data', PageController.getPageData);

module.exports = router;
