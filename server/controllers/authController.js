const User = require('../models/User');
const { generateToken, getCookieOptions } = require('../utils/generateToken');

// Formatter to return only required frontend-safe fields
const getSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  role: user.role,
  avatar: user.avatar || { url: '', publicId: '' },
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt
});

/**
 * Register a new guest
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  try {
    // 1. Check if user already exists in DB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409);
      return next(new Error('Email address is already registered'));
    }

    // 2. Create customer account (role forced to customer)
    const user = new User({
      name,
      email,
      phone: phone || '',
      password,
      role: 'customer' // Public registration is always customer role
    });

    await user.save();

    // 3. Set authentication cookie
    generateToken(res, user._id);

    // 4. Return safe user response
    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: getSafeUser(user)
    });
  } catch (error) {
    // Handle database uniqueness constraint conflicts (duplicate-key error 11000)
    if (error.code === 11000) {
      res.status(409);
      return next(new Error('Email address is already registered'));
    }
    next(error);
  }
};

/**
 * Log in user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Fetch user including password field (normally hidden)
    const user = await User.findOne({ email }).select('+password');
    
    // 2. Generic invalid credential response on missing user or deactivated user
    if (!user) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    if (!user.isActive) {
      res.status(401);
      return next(new Error('This user account has been deactivated'));
    }

    // 3. Securely compare candidate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    // 4. Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    // 5. Generate token cookie
    generateToken(res, user._id);

    // 6. Return safe user
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: getSafeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log out user
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  res.clearCookie('tableflow_token', getCookieOptions());
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};


/**
 * Get current user profile details
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: getSafeUser(req.user)
  });
};

/**
 * Get all customers (admin only)
 * GET /api/auth/users
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(getSafeUser)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  getUsers
};
