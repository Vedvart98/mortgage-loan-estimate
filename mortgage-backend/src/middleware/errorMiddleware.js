const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
    console.error('Error Details:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for ${field}`;
    error = {
      message,
      statusCode: 400
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = {
      message,
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = {
      message,
      statusCode: 401
    };
  }

  // Custom Application Error
  if (err.name === 'ApplicationError') {
    error = {
      message: err.message,
      statusCode: err.statusCode || 500
    };
  }

  // API Rate Limit Error
  if (err.name === 'RateLimitError') {
    error = {
      message: 'Too many requests. Please try again later.',
      statusCode: 429
    };
  }

  // File Upload Errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 10MB';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
    error = {
      message,
      statusCode: 400
    };
  }

  // Database Connection Errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    error = {
      message: 'Database error occurred',
      statusCode: 503
    };
  }

  // External API Errors
  if (err.isAxiosError) {
    const message = err.response?.data?.message || 'External API error';
    error = {
      message,
      statusCode: err.response?.status || 500
    };
  }

  // Default Error Response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

// Custom Error Classes
class ApplicationError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'ApplicationError';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends ApplicationError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ValidationError extends ApplicationError {
  constructor(message = 'Validation failed') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class UnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

class ConflictError extends ApplicationError {
  constructor(message = 'Conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

// Async Error Handler Wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = errorHandler;
module.exports.ApplicationError = ApplicationError;
module.exports.NotFoundError = NotFoundError;
module.exports.ValidationError = ValidationError;
module.exports.UnauthorizedError = UnauthorizedError;
module.exports.ForbiddenError = ForbiddenError;
module.exports.ConflictError = ConflictError;
module.exports.asyncHandler = asyncHandler;
