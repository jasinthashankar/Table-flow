const express = require('express');
const router = express.Router();
const { protect, authorizeRoles, validate } = require('../middleware/authMiddleware');
const { joinWaitlistSchema, adminUpdateWaitlistSchema } = require('../validators/waitlistValidators');
const {
  joinWaitlist, getMyWaitlistEntry, cancelWaitlistEntry,
  adminGetWaitlist, adminUpdateWaitlistEntry
} = require('../controllers/waitlistController');

router.use(protect);

// Guest routes
router.post('/', validate(joinWaitlistSchema), joinWaitlist);
router.get('/me', getMyWaitlistEntry);
router.patch('/me/cancel', cancelWaitlistEntry);

// Admin routes
router.get('/', authorizeRoles('admin'), adminGetWaitlist);
router.patch('/:id', authorizeRoles('admin'), validate(adminUpdateWaitlistSchema), adminUpdateWaitlistEntry);

module.exports = router;
