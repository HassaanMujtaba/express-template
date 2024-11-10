// routes/auth/login.js
const express = require('express');
const { loginUser } = require('../../controllers/auth/loginUser');

const router = express.Router();

router.post('/', loginUser);  // Assuming POST request for login

module.exports = router;
