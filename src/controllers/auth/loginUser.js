const { comparePasswords, generateToken } = require('../../utils/authUtils');
const { UserModel } = require('../../models');
const { withErrorHandling } = require('../../utils/withErrorHandling');
const { validateInput } = require('../../utils/validateInput');
const customResponse = require('../../utils/customResponse');
const { loginSchema } = require('../../inputSchemas/loginSchema');

/**
 * Controller for user login
 * @param req - Express request object
 * @param res - Express response object
 */
const loginUser = async (req, res) => {
  const { credentials, password } = req.body;
  // Validate input data for login
  await validateInput(loginSchema, req.body); // Validate user input

  // Find user by email or username
  const user = await UserModel.findOne({
    $or: [{ email: credentials }, { username: credentials }]
  });

  if (!user) {
    return customResponse({
      message: 'Invalid credentials',
      status: 400
    }, res);
  }

  // Check if the password matches
  const isMatch = await comparePasswords(password, user.password);
  if (!isMatch) {
    return customResponse({
      message: 'Invalid email or password',
      status: 400
    }, res);
  }

  // Generate JWT token
  const token = await generateToken({ userId: user._id });

  return customResponse({
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    },
    status: 200
  }, res);
};

// Wrap the loginUser function with error handling before exporting
module.exports = { loginUser: withErrorHandling(loginUser) };
