const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - verifies JWT session cookie and attaches authenticated user
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Read JWT from HTTP-only cookie
  if (req.cookies && req.cookies.tableflow_token) {
    token = req.cookies.tableflow_token;
  }

  // 2. Reject missing tokens
  if (!token) {
    res.status(401);
    return next(new Error('Not authorized - No session token found'));
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Read user from database
    const user = await User.findById(decoded.id);

    // 5. Reject nonexistent or inactive users
    if (!user) {
      res.status(401);
      return next(new Error('Not authorized - User account no longer exists'));
    }

    if (!user.isActive) {
      res.status(401);
      return next(new Error('Not authorized - User account is deactivated'));
    }

    // 6. Attach safe user to req.user
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    res.status(401);
    return next(new Error('Not authorized - Session token is invalid or expired'));
  }
};

/**
 * Restrict routes to specific user roles
 * @param {...string} roles - Allowed roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Run only after protect
    if (!req.user) {
      res.status(501);
      return next(new Error('Authorize roles middleware used without protect'));
    }

    // Never trust role from req.body, check attached req.user.role
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Forbidden - Role [${req.user.role}] does not have permission`));
    }

    next();
  };
};

/**
 * Generic validator middleware using Zod schemas
 * @param {ZodSchema} schema - Zod validator object
 * @param {string} source - Request source to validate ('body' | 'query' | 'params')
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const data = source === 'query' ? req.query : (source === 'params' ? req.params : req.body);
  const result = schema.safeParse(data);
  if (!result.success) {
    res.status(400);
    const err = new Error('Validation failed');
    err.errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return next(err);
  }
  
  // Re-assign parsed data back to req to handle preprocessed values (e.g. string to number conversion)
  if (source === 'query') {
    req.query = result.data;
  } else if (source === 'params') {
    req.params = result.data;
  } else {
    req.body = result.data;
  }
  
  next();
};

module.exports = {
  protect,
  authorizeRoles,
  validate
};
