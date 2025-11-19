const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate } = require('../middleware/authentication');

// Public routes
router.get('/categories', quizController.getCategories);
router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);

// Protected routes (memerlukan authentication)
router.post('/ai-generate', authenticate, quizController.createQuizWithAI);
router.post('/', authenticate, quizController.createQuiz);
router.delete('/:id', authenticate, quizController.deleteQuiz);
router.delete('/', authenticate, quizController.deleteAllQuizzes);

module.exports = router;
