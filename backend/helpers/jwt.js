const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key';
const JWT_EXPIRES_IN = '7d'; // Token berlaku 7 hari

/**
 * Generate JWT token
 * @param {object} payload - Data yang akan disimpan di token (user id, email, dll)
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
    return token;
  } catch (error) {
    throw new Error('Error generating token: ' + error.message);
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token yang akan diverifikasi
 * @returns {object} Decoded payload dari token
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Error verifying token: ' + error.message);
    }
  }
};

/**
 * Decode JWT token tanpa verifikasi (untuk debugging)
 * @param {string} token - JWT token
 * @returns {object} Decoded token
 */
const decodeToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    throw new Error('Error decoding token: ' + error.message);
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
