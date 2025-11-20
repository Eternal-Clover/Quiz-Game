const { verifyToken } = require('../helpers/jwt');
const { User } = require('../models');

/**
 * Middleware untuk verifikasi JWT token
 * Middleware ini akan memverifikasi token dari header Authorization
 * dan menambahkan user data ke request object
 */
const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 Authentication middleware:', req.method, req.path);
    
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login first.'
      });
    }

    // Format: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Use: Bearer <token>'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    console.log('✅ Token verified, userId:', decoded.id);
    
    // Cari user berdasarkan id dari token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] } // Exclude password dari response
    });
    
    if (!user) {
      console.log('❌ User not found for id:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'User not found. Token may be invalid.'
      });
    }

    console.log('✅ User authenticated:', user.username);
    
    // Tambahkan user data ke request object
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Authentication failed.',
      error: error.message
    });
  }
};

/**
 * Middleware untuk optional authentication
 * Jika ada token, verifikasi. Jika tidak ada, tetap lanjut.
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        try {
          const decoded = verifyToken(token);
          const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
          });
          
          if (user) {
            req.user = user;
            req.userId = user.id;
          }
        } catch (error) {
          // Token invalid, tapi tetap lanjut
          console.log('Optional auth: Invalid token, proceeding without user');
        }
      }
    }
    
    next();
  } catch (error) {
    // Error tapi tetap lanjut
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};
