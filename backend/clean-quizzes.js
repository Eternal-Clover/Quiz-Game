require('dotenv').config();
const { Quiz, Question } = require('./models');

async function cleanQuizzes() {
  console.log('🧹 Cleaning up quizzes with sample questions...\n');
  
  try {
    // Find all quizzes
    const quizzes = await Quiz.findAll({
      include: [{
        model: Question,
        as: 'questions'
      }]
    });

    console.log(`Found ${quizzes.length} quizzes total\n`);

    let deletedCount = 0;
    
    for (const quiz of quizzes) {
      // Check if any question contains "Sample"
      const hasSampleQuestions = quiz.questions.some(q => 
        q.question.toLowerCase().includes('sample')
      );

      if (hasSampleQuestions) {
        console.log(`🗑️  Deleting quiz: ${quiz.title} (ID: ${quiz.id})`);
        console.log(`   - Has ${quiz.questions.length} questions`);
        
        // Delete questions first (cascade should handle this but being explicit)
        await Question.destroy({ where: { quizId: quiz.id } });
        
        // Delete quiz
        await quiz.destroy();
        
        deletedCount++;
        console.log('   ✅ Deleted\n');
      } else {
        console.log(`✅ Keeping quiz: ${quiz.title} (ID: ${quiz.id})`);
        console.log(`   - Has ${quiz.questions.length} real questions\n`);
      }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Deleted: ${deletedCount} quizzes`);
    console.log(`   Kept: ${quizzes.length - deletedCount} quizzes`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error cleaning quizzes:', error);
    process.exit(1);
  }
}

cleanQuizzes();
