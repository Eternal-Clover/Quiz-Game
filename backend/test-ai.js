require('dotenv').config();
const { generateQuestions } = require('./helpers/aiHelper');

async function testAI() {
  console.log('🧪 Testing Gemini AI...\n');
  
  // Check API key
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
  }
  
  console.log('✅ GEMINI_API_KEY is set (length:', process.env.GEMINI_API_KEY.length, ')');
  console.log('🤖 Generating 3 Science questions (easy difficulty)...\n');
  
  try {
    const questions = await generateQuestions({
      category: 'Science',
      difficulty: 'easy',
      numberOfQuestions: 3
    });
    
    console.log('\n✅ SUCCESS! Generated', questions.length, 'questions:\n');
    
    questions.forEach((q, index) => {
      console.log(`Question ${index + 1}:`);
      console.log(`  Q: ${q.question}`);
      console.log(`  Options:`, q.options);
      console.log(`  Correct Answer Index: ${q.correctAnswer}`);
      console.log(`  Points: ${q.points}, Time: ${q.timeLimit}s\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testAI();
