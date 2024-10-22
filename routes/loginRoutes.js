const express = require('express');
const router = express.Router();
const LoginController = require('../controllers/loginController'); 

router.get('/login-data', LoginController.getAuthData);

module.exports = router;
