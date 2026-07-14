const jwt = require('jsonwebtoken');

/**
 * Generates a signed JSON Web Token and attaches it to an HTTP-only cookie.
 * @param {Response} res - Express response object
 * @param {string} userId - User database identifier
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieExpiresDays = parseInt(process.env.COOKIE_EXPIRES_DAYS || '7', 10);

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: cookieExpiresDays * 24 * 60 * 60 * 1000 // Convert days to milliseconds
  };

  res.cookie('tableflow_token', token, cookieOptions);
  
  return token;
};

/**
 * Returns environment-aware options for cookie management (e.g. for clearing the session)
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  };
};

module.exports = {
  generateToken,
  getCookieOptions
};
