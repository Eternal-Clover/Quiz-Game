<<<<<<< HEAD
const bcrypt = require("bcryptjs");
=======
const bcrypt = require('bcryptjs');
>>>>>>> 5fe4631 (fix:generate question with ai)

/**
 * Hash password menggunakan bcrypt
 * @param {string} password - Password plain text
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password: " + error.message);
  }
};

/**
 * Membandingkan password dengan hash
 * @param {string} password - Password plain text
 * @param {string} hashedPassword - Hashed password dari database
 * @returns {Promise<boolean>} True jika cocok, false jika tidak
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Error comparing password: " + error.message);
  }
};

module.exports = {
  hashPassword,
  comparePassword,
};
