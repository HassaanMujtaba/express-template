const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

/**
 * Middleware to authenticate user based on JWT token
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  // Attach the decoded user information to the request
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
