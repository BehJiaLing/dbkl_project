const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.get('/user-data', UserController.getUserData);

module.exports = router;
