const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticate } = require('../middleware/authentication');
const { isRoomHost, isRoomMember } = require('../middleware/authorization');

// All room routes require authentication
router.use(authenticate);

// Room management
router.post('/', roomController.createRoom);
router.post('/join', roomController.joinRoom);
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);

// Room actions - Assign quiz (host only)
router.put('/:roomId/assign-quiz', isRoomHost, roomController.assignQuizToRoom);

// Room actions - Leave room (no middleware needed, anyone can leave)
router.delete('/:roomId/leave', roomController.leaveRoom);

// Room actions (require host permission)
router.delete('/:roomId', isRoomHost, roomController.deleteRoom);

// Leaderboard
router.get('/:roomId/leaderboard', roomController.getRoomLeaderboard);

module.exports = router;
