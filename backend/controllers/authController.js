const { User } = require('../models');
const { hashPassword, comparePassword } = require('../helpers/bcrypt');
const { generateToken } = require('../helpers/jwt');

/**
 * Register user baru
 */
const register = async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;

    // Validasi input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Check apakah email sudah digunakan
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check apakah username sudah digunakan
    const existingUsername = await User.findOne({
      where: { username }
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Buat user baru
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=random`
    });

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username
    });

    // Response tanpa password
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Cari user berdasarkan email
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verifikasi password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    // Response tanpa password
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

/**
 * Get user profile (memerlukan authentication)
 */
const getProfile = async (req, res) => {
  try {
    // User data sudah ada di req.user dari middleware authenticate
    const user = req.user;

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, avatar } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update username jika ada
    if (username && username !== user.username) {
      // Check apakah username baru sudah digunakan
      const existingUsername = await User.findOne({
        where: { username }
      });

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }

      user.username = username;
    }

    // Update avatar jika ada
    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

/**
 * Get user by ID (for room lobby player list)
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'avatar', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getUserById
};
