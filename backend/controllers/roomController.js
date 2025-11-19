const { Room, User, Quiz, Leaderboard } = require('../models');
const { Op } = require('sequelize');

/**
 * Generate unique room code (6 characters)
 */
const generateRoomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

/**
 * Create room baru
 */
const createRoom = async (req, res) => {
  try {
    console.log('📝 createRoom called');
    console.log('User:', req.user?.username, 'ID:', req.userId);
    console.log('Body:', req.body);
    
    const { quizId, maxPlayers = 10 } = req.body;
    const hostId = req.userId;

    // Validasi quiz jika diberikan
    if (quizId) {
      const quiz = await Quiz.findByPk(quizId);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }
    }

    // Generate unique code
    let code = generateRoomCode();
    let existingRoom = await Room.findOne({ where: { code } });
    
    // Regenerate jika code sudah ada
    while (existingRoom) {
      code = generateRoomCode();
      existingRoom = await Room.findOne({ where: { code } });
    }

    // Buat room
    const room = await Room.create({
      code,
      hostId,
      quizId: quizId || null,
      maxPlayers,
      status: 'waiting',
      currentQuestion: 0,
      players: [hostId] // Host otomatis join
    });

    // Create leaderboard entry untuk host
    await Leaderboard.create({
      roomId: room.id,
      userId: hostId,
      score: 0,
      correctAnswers: 0,
      timeBonus: 0
    });

    // Get room dengan relasi
    const roomData = await Room.findByPk(room.id, {
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'category', 'difficulty']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: roomData
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
};

/**
 * Join room dengan code
 */
const joinRoom = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.userId;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Room code is required'
      });
    }

    // Cari room berdasarkan code
    const room = await Room.findOne({
      where: { code: code.toUpperCase() }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found. Please check the room code.'
      });
    }

    // Check status room
    if (room.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: `Cannot join room. Game is already ${room.status}.`
      });
    }

    // Check apakah user sudah join
    const players = room.players || [];
    if (players.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this room'
      });
    }

    // Check apakah room sudah penuh
    if (players.length >= room.maxPlayers) {
      return res.status(400).json({
        success: false,
        message: 'Room is full'
      });
    }

    // Add player ke room
    players.push(userId);
    room.players = players;
    await room.save();

    // Create leaderboard entry untuk player
    await Leaderboard.create({
      roomId: room.id,
      userId: userId,
      score: 0,
      correctAnswers: 0,
      timeBonus: 0
    });

    // Get room data dengan relasi
    const roomData = await Room.findByPk(room.id, {
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'category', 'difficulty']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Joined room successfully',
      data: roomData
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining room',
      error: error.message
    });
  }
};

/**
 * Get room by ID
 */
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByPk(id, {
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'category', 'difficulty']
        },
        {
          model: Leaderboard,
          as: 'leaderboard',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar']
            }
          ],
          order: [['score', 'DESC']]
        }
      ]
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving room',
      error: error.message
    });
  }
};

/**
 * Get all active rooms
 */
const getAllRooms = async (req, res) => {
  try {
    const { status, code } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (code) {
      whereClause.code = code;
    }

    const rooms = await Room.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'category', 'difficulty']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving rooms',
      error: error.message
    });
  }
};

/**
 * Leave room
 */
const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    const room = await Room.findByPk(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Remove player dari room
    const players = room.players || [];
    const updatedPlayers = players.filter(id => id !== userId);

    // Jika yang leave adalah host dan masih ada player lain, assign host baru
    if (room.hostId === userId && updatedPlayers.length > 0) {
      room.hostId = updatedPlayers[0];
    }

    // Jika tidak ada player lagi, delete room
    if (updatedPlayers.length === 0) {
      await room.destroy();
      return res.status(200).json({
        success: true,
        message: 'Left room successfully. Room deleted as it was empty.'
      });
    }

    room.players = updatedPlayers;
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Left room successfully'
    });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving room',
      error: error.message
    });
  }
};

/**
 * Delete room (hanya host)
 */
const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByPk(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    await room.destroy();

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
};

/**
 * Assign quiz to room (host only)
 */
const assignQuizToRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { quizId } = req.body;
    const userId = req.userId;

    console.log('📚 Assign quiz request:', { roomId, quizId, userId });

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }

    const room = await Room.findByPk(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is host
    if (room.hostId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only host can assign quiz'
      });
    }

    // Validate quiz exists
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Assign quiz
    await room.update({ quizId });

    // Get updated room with relations
    const updatedRoom = await Room.findByPk(roomId, {
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'category', 'difficulty']
        }
      ]
    });

    console.log('✅ Quiz assigned successfully');

    // Emit socket event to notify all players in room
    const io = req.app.get('io');
    if (io) {
      io.to(`room_${room.code}`).emit('quiz-assigned', {
        room: updatedRoom
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz assigned successfully',
      data: updatedRoom
    });
  } catch (error) {
    console.error('❌ Assign quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning quiz',
      error: error.message
    });
  }
};

/**
 * Get leaderboard for a room
 */
const getRoomLeaderboard = async (req, res) => {
  try {
    const { roomId } = req.params;

    const leaderboard = await Leaderboard.findAll({
      where: { roomId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['score', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving leaderboard',
      error: error.message
    });
  }
};

module.exports = {
  createRoom,
  joinRoom,
  getRoomById,
  getAllRooms,
  leaveRoom,
  deleteRoom,
  assignQuizToRoom,
  getRoomLeaderboard
};
