// routes/auth/register.js
const express = require('express');
const { registerUser } = require('../../controllers/auth/registerUser');

const router = express.Router();

router.post('/', registerUser);  // Assuming POST request for registration

module.exports = router;
