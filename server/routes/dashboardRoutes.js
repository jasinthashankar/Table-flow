const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { getAdminDashboard, getGuestDashboard } = require('../controllers/dashboardController');

router.use(protect);

router.get('/admin', authorizeRoles('admin'), getAdminDashboard);
router.get('/guest', getGuestDashboard);

module.exports = router;
