const { Quiz, Question } = require('../models');
const { generateQuestions, validateQuestions } = require('../helpers/aiHelper');

/**
 * Delete all quizzes (for testing/reset)
 */
const deleteAllQuizzes = async (req, res) => {
  try {
    await Question.destroy({ where: {}, truncate: true });
    await Quiz.destroy({ where: {}, truncate: true });
    
    res.json({
      success: true,
      message: 'All quizzes deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting quizzes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Create quiz dengan AI-generated questions
 */
const createQuizWithAI = async (req, res) => {
  try {
    const { title, description, category, difficulty, numberOfQuestions = 5 } = req.body;

    // Validasi input
    if (!category || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Category and difficulty are required'
      });
    }

    // Auto-generate title jika tidak ada
    const quizTitle = title || `${category} Quiz - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;

    // Generate questions menggunakan AI
    console.log(`🤖 Generating ${numberOfQuestions} questions for ${category} (${difficulty})...`);
    const aiQuestions = await generateQuestions({
      category,
      difficulty,
      numberOfQuestions
    });

    // Validate questions
    if (!validateQuestions(aiQuestions)) {
      throw new Error('AI generated invalid questions');
    }

    // Buat quiz
    const quiz = await Quiz.create({
      title: quizTitle,
      description: description || `AI Generated ${category} Quiz - ${difficulty} level`,
      category,
      difficulty,
      isAIGenerated: true
    });

    // Buat questions
    const questionPromises = aiQuestions.map(q =>
      Question.create({
        quizId: quiz.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        timeLimit: q.timeLimit,
        points: q.points
      })
    );

    const questions = await Promise.all(questionPromises);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully with AI-generated questions',
      data: {
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          category: quiz.category,
          difficulty: quiz.difficulty,
          isAIGenerated: quiz.isAIGenerated,
          questionCount: questions.length
        },
        questions: questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          timeLimit: q.timeLimit,
          points: q.points
        }))
      }
    });
  } catch (error) {
    console.error('❌ Create quiz with AI error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating quiz with AI',
      error: error.message
    });
  }
};

/**
 * Create quiz manual (tanpa AI)
 */
const createQuiz = async (req, res) => {
  try {
    const { title, description, category, difficulty, questions } = req.body;

    // Validasi input
    if (!title || !category || !difficulty || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, difficulty, and questions array are required'
      });
    }

    // Buat quiz
    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty,
      isAIGenerated: false
    });

    // Buat questions
    const questionPromises = questions.map(q =>
      Question.create({
        quizId: quiz.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        timeLimit: q.timeLimit || 30,
        points: q.points || 100
      })
    );

    const createdQuestions = await Promise.all(questionPromises);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: {
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          category: quiz.category,
          difficulty: quiz.difficulty,
          questionCount: createdQuestions.length
        }
      }
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating quiz',
      error: error.message
    });
  }
};

/**
 * Get all quizzes
 */
const getAllQuizzes = async (req, res) => {
  try {
    const { category, difficulty, isAIGenerated } = req.query;

    const whereClause = {};
    
    if (category) whereClause.category = category;
    if (difficulty) whereClause.difficulty = difficulty;
    if (isAIGenerated !== undefined) whereClause.isAIGenerated = isAIGenerated === 'true';

    const quizzes = await Quiz.findAll({
      where: whereClause,
      include: [
        {
          model: Question,
          as: 'questions',
          attributes: ['id', 'question', 'timeLimit', 'points']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: 'Quizzes retrieved successfully',
      data: quizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        isAIGenerated: quiz.isAIGenerated,
        questionCount: quiz.questions.length,
        createdAt: quiz.createdAt
      }))
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving quizzes',
      error: error.message
    });
  }
};

/**
 * Get quiz by ID dengan semua questions
 */
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id, {
      include: [
        {
          model: Question,
          as: 'questions',
          attributes: ['id', 'question', 'options', 'timeLimit', 'points']
          // Tidak include correctAnswer untuk security
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz retrieved successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Get quiz by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving quiz',
      error: error.message
    });
  }
};

/**
 * Get quiz dengan correct answers (untuk server-side validation)
 */
const getQuizWithAnswers = async (quizId) => {
  try {
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Question,
          as: 'questions'
        }
      ]
    });

    return quiz;
  } catch (error) {
    console.error('Get quiz with answers error:', error);
    throw error;
  }
};

/**
 * Delete quiz
 */
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Delete quiz (questions akan otomatis terhapus karena CASCADE)
    await quiz.destroy();

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting quiz',
      error: error.message
    });
  }
};

/**
 * Get available categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = [
      'Science',
      'History',
      'Geography',
      'Pop Culture',
      'Sports',
      'Technology',
      'General Knowledge',
      'Other'
    ];

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving categories',
      error: error.message
    });
  }
};

module.exports = {
  createQuizWithAI,
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizWithAnswers,
  deleteQuiz,
  deleteAllQuizzes,
  getCategories
};
