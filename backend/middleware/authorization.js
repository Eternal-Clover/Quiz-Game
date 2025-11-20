const { Room } = require('../models');

/**
 * Middleware untuk verifikasi apakah user adalah host dari room
 * Hanya host yang bisa melakukan action tertentu (start game, delete room, dll)
 */
const isRoomHost = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    // Cari room
    const room = await Room.findByPk(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check apakah user adalah host
    if (room.hostId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only room host can perform this action.'
      });
    }

    // Tambahkan room ke request object untuk digunakan di controller
    req.room = room;
    
    next();
  } catch (error) {
    console.error('Authorization error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error checking room authorization',
      error: error.message
    });
  }
};

/**
 * Middleware untuk verifikasi apakah user adalah member dari room
 */
const isRoomMember = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    // Cari room dan check apakah user adalah member
    const room = await Room.findByPk(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check apakah user adalah host atau ada di list players
    // Note: players disimpan sebagai JSON array of user IDs
    const players = room.players || [];
    
    console.log('🔐 isRoomMember check:', {
      userId,
      hostId: room.hostId,
      players,
      isHost: room.hostId === userId,
      isInPlayers: players.includes(userId)
    });
    
    if (room.hostId !== userId && !players.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this room.'
      });
    }

    req.room = room;
    
    next();
  } catch (error) {
    console.error('Authorization error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error checking room membership',
      error: error.message
    });
  }
};

/**
 * Middleware untuk role-based authorization (untuk future expansion)
 * Misal: admin bisa delete quiz, user biasa tidak bisa
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Jika user punya role yang sesuai
    if (roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
  };
};

module.exports = {
  isRoomHost,
  isRoomMember,
  authorize
};
