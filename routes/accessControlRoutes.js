const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const AccessControlController = require('../controllers/accessControlController');

// For dashboard
router.get('/my-pages', verifyToken, AccessControlController.getMyPages);

// Access Management
router.get('/roles-users', verifyToken, AccessControlController.getRolesWithUsers);
router.get('/pages', verifyToken, AccessControlController.getAllPages);
router.get('/role-pages/:roleId', verifyToken, AccessControlController.getRolePages);
router.post('/update-role-pages', verifyToken, AccessControlController.updateRolePages);

module.exports = router;
