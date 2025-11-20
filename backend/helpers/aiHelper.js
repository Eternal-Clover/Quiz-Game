const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Generate quiz questions menggunakan Google Gemini AI
 * @param {object} params - Parameter untuk generate questions
 * @param {string} params.category - Kategori quiz (Science, History, Pop Culture, dll)
 * @param {string} params.difficulty - Difficulty level (easy, medium, hard)
 * @param {number} params.numberOfQuestions - Jumlah pertanyaan yang ingin digenerate
 * @returns {Promise<Array>} Array of questions
 */
const generateQuestions = async ({ category, difficulty, numberOfQuestions = 5 }) => {
  try {
    console.log('🔍 AI Helper - generateQuestions called with:', { category, difficulty, numberOfQuestions });
    
    if (!GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found!');
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    console.log('✅ GEMINI_API_KEY found, length:', GEMINI_API_KEY.length);

    const pointsMap = { easy: 100, medium: 200, hard: 300 };
    const timeLimitMap = { easy: 30, medium: 45, hard: 60 };

    const prompt = `Generate ${numberOfQuestions} multiple choice quiz questions about ${category} with ${difficulty} difficulty level.

For each question, provide:
1. The question text
2. Four answer options
3. The correct answer index (0, 1, 2, or 3)
4. Points value (easy: 100, medium: 200, hard: 300)
5. Time limit in seconds (easy: 30, medium: 45, hard: 60)

Return ONLY a valid JSON array with this exact structure, no markdown, no extra text:
[
  {
    "question": "Question text here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": 0,
    "points": ${pointsMap[difficulty]},
    "timeLimit": ${timeLimitMap[difficulty]}
  }
]

Important: 
- correctAnswer must be an integer (0, 1, 2, or 3) representing the index of the correct option
- Return ONLY the JSON array, no markdown formatting, no code blocks
- Make sure questions are accurate and well-written`;

    console.log('📡 Sending request to Gemini API...');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Received response from Gemini API');
    
    const content = response.data.candidates[0].content.parts[0].text;
    
    console.log('🤖 Gemini AI Response:', content.substring(0, 200) + '...');
    
    // Parse JSON response
    let questions;
    try {
      // Coba parse langsung
      questions = JSON.parse(content);
    } catch (e) {
      // Jika gagal, coba extract JSON dari markdown code block
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[1]);
      } else {
        // Coba cari array JSON di dalam text
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          questions = JSON.parse(arrayMatch[0]);
        } else {
          throw new Error('Failed to parse AI response');
        }
      }
    }

    // Validate and normalize questions
    questions = questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: parseInt(q.correctAnswer),
      points: q.points || pointsMap[difficulty],
      timeLimit: q.timeLimit || timeLimitMap[difficulty]
    }));

    console.log(`✅ Generated ${questions.length} questions with Gemini AI`);
    
    return questions;
  } catch (error) {
    console.error('❌ Error generating questions with Gemini AI:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.request) {
      console.error('Request failed - no response received');
    }
    
    console.log('⚠️  Falling back to sample questions...');
    // Fallback: return dummy questions jika AI gagal
    return generateFallbackQuestions(category, difficulty, numberOfQuestions);
  }
};

/**
 * Generate fallback questions jika AI tidak tersedia
 */
const generateFallbackQuestions = (category, difficulty, numberOfQuestions) => {
  const pointsMap = { easy: 100, medium: 200, hard: 300 };
  const timeLimitMap = { easy: 30, medium: 45, hard: 60 };
  
  const questions = [];
  
  for (let i = 0; i < numberOfQuestions; i++) {
    questions.push({
      question: `Sample ${category} question ${i + 1} (${difficulty} level)?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0, // Changed to integer
      points: pointsMap[difficulty] || 100,
      timeLimit: timeLimitMap[difficulty] || 30
    });
  }
  
  return questions;
};

/**
 * Validate generated questions
 */
const validateQuestions = (questions) => {
  if (!Array.isArray(questions)) {
    console.error('❌ Validation failed: questions is not an array');
    return false;
  }
  
  if (questions.length === 0) {
    console.error('❌ Validation failed: questions array is empty');
    return false;
  }
  
  return questions.every((q, index) => {
    const isValid = (
      q.question &&
      typeof q.question === 'string' &&
      Array.isArray(q.options) &&
      q.options.length >= 2 &&
      q.options.length <= 4 &&
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 &&
      q.correctAnswer < q.options.length &&
      typeof q.points === 'number' &&
      q.points > 0 &&
      typeof q.timeLimit === 'number' &&
      q.timeLimit > 0
    );
    
    if (!isValid) {
      console.error(`❌ Validation failed for question ${index + 1}:`, q);
    }
    
    return isValid;
  });
};

module.exports = {
  generateQuestions,
  validateQuestions
};
