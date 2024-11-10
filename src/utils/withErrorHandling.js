const customResponse = require('./customResponse');

/**
 * Error handling utility to wrap async functions and handle errors centrally.
 *
 * @param {Function} fn - The asynchronous function to wrap.
 * @returns {Function} - A wrapped function with centralized error handling.
 */
 function withErrorHandling(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      console.log("Error occurred:", error);

      if (error.name === "ValidationError") {
        const errorMessages = Array.isArray(error.messages)
          ? error.messages.join(", ")
          : "Invalid input data";
        return customResponse({
          message: "Validation Error",
          data: errorMessages,
          status: 400,
        }, res);
      } else if (error.name === "MongoError" && error.code === 11000) {
        // MongoDB duplicate key error
        return customResponse({
          message: "Duplicate entry error",
          status: 409,
        }, res);
      } else if (error.name === "JsonWebTokenError") {
        // Invalid JWT Token
        return customResponse({ message: "Invalid token", status: 401 }, res);
      } else if (error.name === "TokenExpiredError") {
        // Expired JWT Token
        return customResponse({ message: "Token expired", status: 401 }, res);
      } else if (error.message.includes("NetworkError")) {
        // Network issues, e.g., database connection
        return customResponse({
          message: "Network error, please try again",
          status: 503,
        }, res);
      } else if (error.name === "CastError") {
        // MongoDB object ID casting error
        return customResponse({ message: "Invalid data format", status: 400 }, res);
      } else if (error.name === "SyntaxError") {
        // Syntax errors in requests (usually malformed JSON)
        return customResponse({
          message: "Syntax error in request",
          status: 400,
        }, res);
      } else if (error.code === "ECONNREFUSED") {
        // Database connection refused
        return customResponse({
          message: "Service unavailable, connection refused",
          status: 503,
        }, res);
      } else if (error.status === 404) {
        // Resource not found (can be used for specific route errors)
        return customResponse({
          message: "Resource not found",
          status: 404,
        }, res);
      } else if (error.status === 403) {
        // Forbidden
        return customResponse({
          message: "Forbidden",
          status: 403,
        }, res);
      } else if (error.status === 400) {
        // Bad Request (General error handling)
        return customResponse({
          message: "Bad request",
          status: 400,
        }, res);
      } else {
        // Generic internal server error
        return customResponse({
          message: "An internal server error occurred",
          status: 500,
        }, res);
      }
    });
  };
}

module.exports ={withErrorHandling}