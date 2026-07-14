const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, logout, getMe, getUsers } = require('../controllers/authController');
const { protect, authorizeRoles, validate } = require('../middleware/authMiddleware');
const { registerSchema, loginSchema } = require('../validators/authValidators');

const router = express.Router();

// Development-friendly strict rate limiter for login and registration endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/users', protect, authorizeRoles('admin'), getUsers);

module.exports = router;
