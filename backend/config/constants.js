const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  LOCKED: 423,
  INTERNAL_SERVER_ERROR: 500,
  CREATED: 201,
  OK: 200,
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
  FROM_NAME: 'Nairobi Verified Team',
  FROM_EMAIL: 'noreply@nairobiverified.com',
  SUBJECTS: {
    WELCOME: 'Welcome to Nairobi Verified!',
    PASSWORD_RESET: 'Password Reset Request - Nairobi Verified',
    VERIFICATION: 'Business Verification Required - Nairobi Verified',
  },
};

const DEFAULT_MAX_QUANTITY_PER_USER = 5;

const PASSWORD_VALIDATION = {
  REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
  ERROR_MESSAGE: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).'
};

module.exports = {
  HTTP_STATUS,
  TIME,
  EMAIL_CONFIG,
  DEFAULT_MAX_QUANTITY_PER_USER,
  PASSWORD_VALIDATION,
};