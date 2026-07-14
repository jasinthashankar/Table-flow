// Middleware for handling undefined routes (404 Not Found)
const notFound = (req, res, next) => {
  const error = new Error('Route not found');
  res.status(404);
  next(error);
};

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  const response = {
    success: false,
    message: err.message || 'Unable to complete request',
    errors: err.errors || []
  };

  // Only expose stack trace in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  console.error(`[Error Handler] ${statusCode} - ${err.message}`);
  res.json(response);
};

module.exports = {
  notFound,
  errorHandler
};
