const { httpErrorsCounter } = require('../utils/metrics'); // MONITORING: Import counter

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new Error(message);
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new Error(message);
    error.statusCode = 400;
  }

  const statusCode = error.statusCode || 500; // MONITORING: Get status
  httpErrorsCounter.inc({ status_code: statusCode }); // MONITORING: Increment error by status

  res.status(statusCode).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;