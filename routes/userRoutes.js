const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.get('/user-data', UserController.getUserData);
router.put('/update-status', UserController.updateUserStatus);
router.put('/increment-submit-attend', UserController.incrementSubmitAttend);

module.exports = router;
