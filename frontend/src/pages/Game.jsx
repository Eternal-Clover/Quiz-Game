import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser, getApi } from '../utils/authUtils';
import { connectSocket, getSocket } from '../utils/socketUtils';
import { playGameMusic, stopAllMusic } from '../utils/audioUtils';
import { ThemeContext } from '../context/ThemeContext';
import { Clock, Diamond, ArrowRight, Loader2 } from 'lucide-react';

const Game = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { currentTheme, theme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  
  const [room, setRoom] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  
  // Track if music has been started to avoid re-starting
  const musicStartedRef = useRef(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setUser(currentUser);
    
    const socketConnection = connectSocket() || getSocket();
    setSocket(socketConnection);
    
    fetchRoomData();
    fetchGameState();
  }, [navigate, code]);

  useEffect(() => {
    if (!socket) return;

    const api = getApi();
    console.log('🎮 Game page loaded for room:', code);

    // Listen for game started event (first question)
    socket.on('game-started', (data) => {
      console.log('🚀 Game started:', data);
      console.log('📝 Quiz data:', data.quiz);
      console.log('❓ Question data:', data.question);
      setQuiz(data.quiz);
      setCurrentQuestion(data.question);
      setQuestionNumber(data.question.questionNumber);
      setTotalQuestions(data.quiz.totalQuestions);
      setTimeRemaining(data.question.timeLimit);
      setLoading(false);
      // Play game music when game starts
      if (!musicStartedRef.current) {
        playGameMusic();
        musicStartedRef.current = true;
      }
    });

    // Listen for next question
    socket.on('nextQuestion', (data) => {
      console.log('➡️ Next question:', data);
      setCurrentQuestion(data);
      setQuestionNumber(data.questionNumber);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setAnswerResult(null);
      setTimeRemaining(data.timeLimit);
    });

    // Listen for answer result
    socket.on('answerResult', (data) => {
      console.log('📊 Answer result:', data);
      if (data.userId === user?.id) {
        setAnswerResult({
          isCorrect: data.isCorrect,
          points: data.points,
          timeBonus: data.timeBonus
        });
      }
    });

    // Listen for game finished
    socket.on('gameFinished', (data) => {
      console.log('🏁 Game finished:', data);
      // Stop game music when game finishes
      stopAllMusic();
      musicStartedRef.current = false;
      navigate(`/results/${code}`);
    });

    return () => {
      socket.off('game-started');
      socket.off('nextQuestion');
      socket.off('answerResult');
      socket.off('gameFinished');
      // Stop music when leaving game page
      console.log('🚪 Leaving game page, stopping music...');
      stopAllMusic();
      musicStartedRef.current = false;
    };
  }, [socket, code, navigate, user]);

  const fetchRoomData = async () => {
    try {
      const api = getApi();
      const response = await api.get(`/rooms?code=${code}`);
      if (response.data.success && response.data.data.length > 0) {
        setRoom(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching room:', error);
    }
  };

  const fetchGameState = async () => {
    try {
      const api = getApi();
      const response = await api.get(`/rooms?code=${code}`);
      if (response.data.success && response.data.data.length > 0) {
        const roomData = response.data.data[0];
        
        if (roomData.status !== 'playing') {
          setError('Game has not started yet');
          setLoading(false);
          return;
        }

        if (!roomData.quizId) {
          setError('No quiz assigned to this room');
          setLoading(false);
          return;
        }

        // Fetch quiz with questions
        const quizResponse = await api.get(`/quizzes/${roomData.quizId}`);
        if (quizResponse.data.success) {
          const quizData = quizResponse.data.data;
          setQuiz({
            id: quizData.id,
            title: quizData.title,
            totalQuestions: quizData.questions.length
          });

          // Get current question based on room's currentQuestion
          const questionIndex = roomData.currentQuestion - 1;
          if (questionIndex >= 0 && questionIndex < quizData.questions.length) {
            const currentQ = quizData.questions[questionIndex];
            setCurrentQuestion({
              id: currentQ.id,
              question: currentQ.question,
              options: currentQ.options,
              timeLimit: currentQ.timeLimit,
              points: currentQ.points,
              questionNumber: roomData.currentQuestion,
              totalQuestions: quizData.questions.length
            });
            setQuestionNumber(roomData.currentQuestion);
            setTotalQuestions(quizData.questions.length);
            setTimeRemaining(currentQ.timeLimit);
          }

          setLoading(false);
          
          // Play game music when game state is loaded (for mid-game joins or refreshes)
          if (!musicStartedRef.current) {
            console.log('🎵 Game state loaded, starting music...');
            playGameMusic();
            musicStartedRef.current = true;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
      setError('Failed to load game state');
      setLoading(false);
    }
  };

  const handleSelectAnswer = (index) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = async (answer) => {
    if (hasAnswered) return;
    
    setHasAnswered(true);

    const answerToSubmit = answer !== null ? answer : selectedAnswer;

    console.log('🎯 Frontend - Submitting answer:');
    console.log('  - Answer index:', answerToSubmit, '(type:', typeof answerToSubmit, ')');
    console.log('  - Selected option:', currentQuestion.options[answerToSubmit]);
    console.log('  - Question:', currentQuestion.question);

    try {
      socket.emit('submitAnswer', {
        roomCode: code,
        userId: user.id,
        questionId: currentQuestion.id,
        answer: answerToSubmit,
        timeRemaining
      }, (response) => {
        console.log('✅ Answer submitted, response:', response);
      });
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!currentQuestion || hasAnswered) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          if (!hasAnswered && socket) {
            socket.emit('submitAnswer', {
              roomCode: code,
              userId: user?.id,
              questionId: currentQuestion.id,
              answer: selectedAnswer,
              timeRemaining: 0
            });
            setHasAnswered(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, hasAnswered, selectedAnswer, code, user, socket]);

  const handleNextQuestion = () => {
    setAnswerResult(null);
    // Host will trigger next question via socket
    if (room?.hostId === user.id) {
      socket.emit('nextQuestion', { roomCode: code }, (response) => {
        if (!response.success) {
          console.error('Error getting next question:', response.message);
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
        <div className={`backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border ${
          currentTheme === 'light'
            ? 'bg-white border-gray-300'
            : 'bg-white/10 border-white/20'
        }`}>
          <h2 className={`text-2xl font-bold mb-4 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>❌ Error</h2>
          <p className={`mb-6 ${currentTheme === 'light' ? 'text-slate-700' : 'text-white/90'}`}>{error}</p>
          <button 
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
            onClick={() => navigate(`/room/${code}`)}
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <h2 className="text-white text-xl">⏳ Waiting for next question...</h2>
        </div>
      </div>
    );
  }

  const getTimerColor = () => {
    if (timeRemaining <= 5) return '#ef4444';
    if (timeRemaining <= 10) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className={`min-h-screen ${theme[currentTheme].bgColor} ${theme[currentTheme].textColor} py-8 px-4 transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`backdrop-blur-lg rounded-2xl p-6 mb-6 border ${
          currentTheme === 'light'
            ? 'bg-white border-gray-300'
            : 'bg-white/10 border-white/20'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className={`text-2xl font-bold mb-1 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>{quiz?.title || 'Quiz Game'}</h2>
              <p className={currentTheme === 'light' ? 'text-slate-700' : 'text-white/80'}>
                Question {questionNumber} of {totalQuestions}
              </p>
            </div>
            <div className={`flex items-center gap-2 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              <Clock className="w-6 h-6" style={{ color: getTimerColor() }} />
              <span className="text-3xl font-bold" style={{ color: getTimerColor() }}>{timeRemaining}s</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500" 
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className={`backdrop-blur-lg rounded-2xl p-8 mb-6 border ${
          currentTheme === 'light'
            ? 'bg-white border-slate-300'
            : 'bg-white/10 border-white/20'
        }`}>
          <h3 className={`text-2xl font-semibold mb-4 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>{currentQuestion.question}</h3>
          <div className={`flex items-center gap-2 ${currentTheme === 'light' ? 'text-slate-700' : 'text-yellow-300'}`}>
            <Diamond className={`w-5 h-5 ${currentTheme === 'light' ? 'fill-slate-700' : 'fill-yellow-300'}`} />
            <span className="font-semibold">{currentQuestion.points} points</span>
          </div>
        </div>

        {/* Answer Result */}
        {answerResult && (
          <div className={`mb-6 p-4 rounded-xl backdrop-blur-lg border-2 ${
            answerResult.isCorrect 
              ? 'bg-green-500/20 border-green-400' 
              : 'bg-red-500/20 border-red-400'
          }`}>
            <h4 className="text-xl font-bold text-white mb-2">
              {answerResult.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
            </h4>
            {answerResult.isCorrect && (
              <p className="text-white/90">
                +{answerResult.points} points 
                {answerResult.timeBonus > 0 && ` (including ${answerResult.timeBonus} time bonus)`}
              </p>
            )}
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isAnswered = hasAnswered && isSelected;
            const isCorrect = answerResult?.isCorrect;
            
            return (
              <button
                key={index}
                className={`p-6 rounded-xl text-left transition-all duration-300 border-2 backdrop-blur-lg ${
                  isAnswered
                    ? isCorrect
                      ? 'bg-green-500/30 border-green-400'
                      : 'bg-red-500/30 border-red-400'
                    : isSelected
                      ? currentTheme === 'light'
                        ? 'bg-gray-200 border-gray-400 transform scale-105'
                        : 'bg-white/30 border-white transform scale-105'
                      : currentTheme === 'light'
                      ? 'bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-gray-400'
                      : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40'
                }`}
                onClick={() => handleSelectAnswer(index)}
                disabled={hasAnswered}
              >
                <div className="flex items-center gap-4">
                  <span className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                    isAnswered
                      ? isCorrect
                        ? 'bg-green-400 text-green-900'
                        : 'bg-red-400 text-red-900'
                      : isSelected
                        ? currentTheme === 'light'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-purple-600'
                        : currentTheme === 'light'
                        ? 'bg-slate-300 text-slate-900'
                        : 'bg-white/20 text-white'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className={`font-medium ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        {!hasAnswered && (
          <button
            className={`w-full px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              selectedAnswer !== null
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 shadow-lg shadow-green-500/50'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
            onClick={() => handleSubmitAnswer(selectedAnswer)}
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </button>
        )}

        {/* Next Question (for host) */}
        {hasAnswered && room?.hostId === user.id && (
          <button
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/50 flex items-center justify-center gap-2"
            onClick={handleNextQuestion}
          >
            Next Question
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        {/* Waiting for host */}
        {hasAnswered && room?.hostId !== user.id && (
          <div className="text-center p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
            <Loader2 className="w-6 h-6 text-white animate-spin mx-auto mb-2" />
            <p className={currentTheme === 'light' ? 'text-slate-700' : 'text-white/90'}>⏳ Waiting for host to continue...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
