// src/middleware/passwordChangeMiddleware.js
/**
 * Middleware to check if a user needs to change their password
 * If they do, they are only allowed to access the password change endpoint
 */
const passwordChangeMiddleware = (req, res, next) => {
  try {
    // Skip check for public routes and the password change route itself
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/verify-email',
      '/api/auth/change-password'
    ];

    if (publicRoutes.some(route => req.path.includes(route))) {
      return next();
    }

    // If user is authenticated and requires password change
    if (req.user && req.user.requirePasswordChange) {
      return res.status(403).json({
        success: false,
        message: 'Password change required before proceeding',
        requirePasswordChange: true
      });
    }

    next();
  } catch (error) {
    console.error('Password change middleware error:', error);
    next(error);
  }
};

module.exports = passwordChangeMiddleware;