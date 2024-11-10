const bcrypt = require('bcryptjs');
const { SignJWT, jwtVerify } = require('jose');

/**
 * Hashes a plain text password using bcrypt.
 *
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} - The hashed password.
 * @throws {Error} - Throws an error if hashing fails.
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.log('Error hashing password:', error.message);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compares a plain text password with a hashed password.
 *
 * @param {string} password - The plain text password.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - True if passwords match, false otherwise.
 * @throws {Error} - Throws an error if comparison fails.
 */
const comparePasswords = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.log('Error comparing passwords:', error.message);
    throw new Error('Failed to compare passwords');
  }
};

/**
 * Generates a JSON Web Token (JWT) for user authentication using jose.
 *
 * @param {Object} payload - The payload to sign, typically user data.
 * @returns {Promise<string>} - The signed JWT token.
 * @throws {Error} - Throws an error if token generation fails.
 */
const generateToken = async (payload) => {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(process.env.JWT_EXPIRES_IN)
      .sign(secret);

    return token;
  } catch (error) {
    console.log('Error generating token:', error.message);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verifies a JSON Web Token (JWT) using jose.
 *
 * @param {string} token - The JWT to verify.
 * @returns {Promise<Object>} - The decoded token payload.
 * @throws {Error} - Throws an error if token verification fails.
 */
const verifyToken = async (token) => {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.log('Error verifying token:', error.message);
    throw new Error('Failed to verify token');
  }
};

/**
 * Retrieves and verifies the token payload from the cookies.
 *
 * @returns {Promise<Object>} - The decoded token payload.
 * @throws {Error} - Throws an error if the token is missing or invalid.
 */
const getTokenPayloadFromCookies = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get('authToken')?.value;

  if (!token) {
    throw new Error('Please log in.');
  }

  const payload = await verifyToken(token);
  if (!payload) {
    throw new Error('Invalid or expired token. Please log in.');
  }

  return payload;
};

module.exports = {
  hashPassword,
  comparePasswords,
  generateToken,
  verifyToken,
  getTokenPayloadFromCookies
};
