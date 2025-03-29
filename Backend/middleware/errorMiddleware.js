// middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
  
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      message = `Resource not found with id of ${err.value}`;
      statusCode = 404;
    }
  
    // Mongoose duplicate key
    if (err.code === 11000) {
      message = 'Duplicate field value entered';
      statusCode = 400;
    }
  
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      message = Object.values(err.errors).map((val) => val.message).join(', ');
      statusCode = 400;
    }
  
    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  };
  
  module.exports = { errorHandler };
  