const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  LOCKED: 423,
  INTERNAL_SERVER_ERROR: 500,
  CREATED: 201,
};

const TIME = {
  SECOND: 1000,
  MINUTE: 1000 * 60,
  HOUR: 1000 * 60 * 60,
  DAY: 1000 * 60 * 60 * 24,
};

const EMAIL_CONFIG = {
  SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  DEV_HOST: 'smtp.ethereal.email',
  DEV_PORT: 587,
  FROM_NAME: 'Nairobi CBD Directory',
  FROM_EMAIL: 'noreply@nairobicbd.com',
  SUBJECTS: {
    WELCOME: 'Welcome to Nairobi CBD Business Directory!',
    PASSWORD_RESET: 'Password Reset Request - Nairobi CBD',
    VERIFICATION: 'Business Verification Required - Nairobi CBD',
  },
};

const DEFAULT_MAX_QUANTITY_PER_USER = 5;

module.exports = {
  HTTP_STATUS,
  TIME,
  EMAIL_CONFIG,
  DEFAULT_MAX_QUANTITY_PER_USER,
};