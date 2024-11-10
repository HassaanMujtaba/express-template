// routes/auth/index.js
const express = require('express');
const loginRoute = require('./login');   // Import the login route
const registerRoute = require('./register');  // Import the register route

const router = express.Router();

// Mount the individual routes
router.use('/login', loginRoute);
router.use('/register', registerRoute);

module.exports = router;
