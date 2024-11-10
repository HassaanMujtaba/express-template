const bcrypt = require('bcryptjs');
const { UserModel } = require('../../models');
const { withErrorHandling } = require('../../utils/withErrorHandling');
const { validateInput } = require('../../utils/validateInput');
const customResponse = require('../../utils/customResponse');
const { userRegistrationSchema } = require('../../inputSchemas/userRegistrationSchema');
const { generateToken } = require('../../utils/authUtils'); // Import token generation function

/**
 * Controller for user registration
 * @param req - Express request object
 * @param res - Express response object
 */
const registerUser = async (req, res) => {
  const { firstName, lastName, username, email, password, role } = req.body;
  
  // Validate input data
  await validateInput(userRegistrationSchema, req.body); // Validate user input

  // Check if the user already exists
  const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return customResponse({
      message: 'User already exists',
      status: 400
    }, res);
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser = new UserModel({
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword,
    role,
  });

  // Save the user to the database
  await newUser.save();

  // Generate JWT token after successful registration
  const token = await generateToken({ userId: newUser._id, username: newUser.username, role: newUser.role });

  // Send the response with the token and user details
  return customResponse({
    message: 'User registered and logged in successfully',
    data: {
      token, // Include the JWT token in the response
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }
    },
    status: 201
  }, res);
};

// Wrap the registerUser function with error handling before exporting
module.exports = { registerUser: withErrorHandling(registerUser) };
