import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getApi } from '../utils/authUtils';
import { ThemeContext } from '../context/ThemeContext';
import { ArrowLeft, Sparkles, BookOpen, Users, Settings, Info, Loader2 } from 'lucide-react';

const CreateRoom = () => {
  const navigate = useNavigate();
  const { currentTheme, theme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    quizId: '',
    maxPlayers: 10,
    category: 'General Knowledge',
    difficulty: 'medium',
    numberOfQuestions: 5
  });

  const [roomMode, setRoomMode] = useState('ai'); // 'existing' or 'ai' only

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchQuizzes();
  }, [navigate]);

  const fetchQuizzes = async () => {
    try {
      const api = getApi();
      const response = await api.get('/quizzes');
      if (response.data.success) {
        setQuizzes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    console.log('🎯 handleCreateRoom triggered');
    console.log('Room Mode:', roomMode);
    console.log('Form Data:', formData);
    
    setError('');
    setCreating(true);

    try {
      const api = getApi();
      let quizId = null;

      // Jika mode AI, buat quiz baru dulu
      if (roomMode === 'ai') {
        console.log('🤖 AI mode - generating quiz with Gemini...');
        const aiResponse = await api.post('/quizzes/ai-generate', {
          category: formData.category,
          difficulty: formData.difficulty,
          numberOfQuestions: parseInt(formData.numberOfQuestions)
        });

        if (aiResponse.data.success) {
          quizId = aiResponse.data.data.quiz.id;
          console.log('✅ Quiz generated with ID:', quizId);
        } else {
          setError('Failed to generate quiz with AI');
          setCreating(false);
          return;
        }
      } else if (roomMode === 'existing') {
        // Jika mode existing, gunakan quizId yang dipilih
        console.log('📚 Existing quiz mode - using quizId:', formData.quizId);
        quizId = formData.quizId ? parseInt(formData.quizId) : null;
        
        if (!quizId) {
          setError('Please select a quiz');
          setCreating(false);
          return;
        }
      }

      // Buat room
      const roomData = {
        maxPlayers: parseInt(formData.maxPlayers)
      };
      
      // Tambahkan quizId hanya jika ada
      if (quizId) {
        roomData.quizId = quizId;
      }

      console.log('📤 Sending room creation request:', roomData);
      const response = await api.post('/rooms', roomData);

      console.log('✅ Room created:', response.data);
      
      if (response.data.success) {
        const room = response.data.data;
        console.log('🚪 Navigating to room:', room.code);
        navigate(`/room/${room.code}`);
      } else {
        setError(response.data.message || 'Failed to create room');
      }
    } catch (error) {
      console.error('❌ Error creating room:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to create room');
    } finally {
      console.log('🏁 Create room process finished');
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme[currentTheme].bgColor} flex items-center justify-center transition-colors duration-300`}>
        <Loader2 className={`w-12 h-12 animate-spin ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme[currentTheme].bgColor} ${theme[currentTheme].textColor} transition-colors duration-300`}>

      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className={`flex items-center gap-2 transition-colors mb-6 group ${
            currentTheme === 'light'
              ? 'text-slate-900 hover:text-slate-700'
              : 'text-white hover:text-purple-100'
          }`}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Main Card */}
        <div className={`backdrop-blur-md rounded-2xl p-8 border shadow-2xl animate-[slideUp_0.6s_ease-out] ${
          currentTheme === 'light'
            ? 'bg-white border-gray-300'
            : 'bg-white/10 border-white/20'
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings className={`w-8 h-8 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`} />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Create Room</h1>
            <p className={currentTheme === 'light' ? 'text-gray-700' : 'text-purple-100'}>Setup your quiz game room</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className={`mb-6 p-4 rounded-xl border ${
              currentTheme === 'light'
                ? 'bg-red-100 border-red-300'
                : 'bg-red-500/20 border-red-500/50'
            }`}>
              <p className={`text-sm ${
                currentTheme === 'light' ? 'text-red-800' : 'text-red-100'
              }`}>{error}</p>
            </div>
          )}

          <form onSubmit={handleCreateRoom} className="space-y-6">
            {/* Room Mode Selection */}
            <div>
              <h3 className={`font-bold text-lg mb-4 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Choose Room Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRoomMode('existing')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    roomMode === 'existing'
                      ? currentTheme === 'light'
                        ? 'bg-gray-100 border-gray-400 shadow-lg scale-105'
                        : 'bg-white/20 border-white shadow-lg scale-105'
                      : currentTheme === 'light'
                      ? 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                >
                  <BookOpen className={`w-8 h-8 mx-auto mb-3 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`} />
                  <div className={`font-bold mb-1 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Existing Quiz</div>
                  <div className={`text-sm ${currentTheme === 'light' ? 'text-slate-600' : 'text-purple-100'}`}>Select from available quizzes</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setRoomMode('ai')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    roomMode === 'ai'
                      ? currentTheme === 'light'
                        ? 'bg-gray-100 border-gray-400 shadow-lg scale-105'
                        : 'bg-white/20 border-white shadow-lg scale-105'
                      : currentTheme === 'light'
                      ? 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className={`w-8 h-8 mx-auto mb-3 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`} />
                  <div className={`font-bold mb-1 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>AI Generated</div>
                  <div className={`text-sm ${currentTheme === 'light' ? 'text-slate-600' : 'text-purple-100'}`}>Generate quiz with Gemini AI</div>
                </button>
              </div>
            </div>

            {/* AI Generation Form */}
            {roomMode === 'ai' && (
              <div className="space-y-5 animate-[slideUp_0.4s_ease-out]">
                <div>
                  <label className={`block font-semibold mb-2 ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>Category</label>
                  <select
                    name="category"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                      currentTheme === 'light'
                        ? 'bg-white border-gray-300 text-gray-900'
                        : 'bg-white/10 border-white/20 text-white'
                    }`}
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Pop Culture">Pop Culture</option>
                    <option value="Sports">Sports</option>
                    <option value="Technology">Technology</option>
                    <option value="General Knowledge">General Knowledge</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-2 ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>Difficulty</label>
                  <select
                    name="difficulty"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                      currentTheme === 'light'
                        ? 'bg-white border-gray-300 text-gray-900'
                        : 'bg-white/10 border-white/20 text-white'
                    }`}
                    value={formData.difficulty}
                    onChange={handleChange}
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-2 ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>Number of Questions</label>
                  <input
                    type="number"
                    name="numberOfQuestions"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                      currentTheme === 'light'
                        ? 'bg-white border-gray-300 text-gray-900'
                        : 'bg-white/10 border-white/20 text-white'
                    }`}
                    min="3"
                    max="20"
                    value={formData.numberOfQuestions}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* Select Existing Quiz */}
            {roomMode === 'existing' && (
              <div className="animate-[slideUp_0.4s_ease-out]">
                <label className={`block font-semibold mb-2 ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>Select Quiz</label>
                {quizzes.length > 0 ? (
                  <select
                    name="quizId"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                      currentTheme === 'light'
                        ? 'bg-white border-gray-300 text-gray-900'
                        : 'bg-white/10 border-white/20 text-white'
                    }`}
                    value={formData.quizId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose a quiz...</option>
                    {quizzes.map((quiz) => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.title} ({quiz.category} - {quiz.difficulty})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className={`p-6 rounded-xl text-center border ${
                    currentTheme === 'light'
                      ? 'bg-yellow-100 border-yellow-300'
                      : 'bg-yellow-500/20 border-yellow-500/50'
                  }`}>
                    <p className={`mb-3 ${currentTheme === 'light' ? 'text-yellow-800' : 'text-yellow-100'}`}>No quizzes available yet.</p>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        currentTheme === 'light'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-white text-purple-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setRoomMode('ai')}
                    >
                      Generate with AI instead
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Max Players */}
            <div>
              <label className={`font-semibold mb-2 flex items-center gap-2 ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                <Users className="w-5 h-5" />
                Max Players
              </label>
              <input
                type="number"
                name="maxPlayers"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                  currentTheme === 'light'
                    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    : 'bg-white/10 border-white/20 text-white'
                }`}
                min="2"
                max="50"
                value={formData.maxPlayers}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:cursor-not-allowed ${
                currentTheme === 'light'
                  ? 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400'
                  : 'bg-white text-purple-600 hover:bg-gray-100 disabled:bg-white/50'
              }`}
              disabled={creating || (roomMode === 'existing' && !formData.quizId)}
            >
              {creating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {roomMode === 'ai' ? 'Generating Quiz & Creating Room...' : 'Creating Room...'}
                </span>
              ) : (
                'Create Room'
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className={`mt-6 backdrop-blur-md rounded-xl p-6 border animate-[slideUp_0.8s_ease-out] ${
          currentTheme === 'light'
            ? 'bg-gray-50 border-gray-300'
            : 'bg-white/10 border-white/20'
        }`}>
          <div className="flex items-start gap-3">
            <Info className={`w-6 h-6 shrink-0 mt-0.5 ${currentTheme === 'light' ? 'text-gray-700' : 'text-purple-200'}`} />
            <div>
              <h4 className={`font-bold mb-2 ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>How it works</h4>
              <ul className={`space-y-1 text-sm ${currentTheme === 'light' ? 'text-gray-700' : 'text-purple-100'}`}>
                <li>• Create a room and get a unique code</li>
                <li>• Share the code with friends</li>
                <li>• Wait for players to join</li>
                <li>• Start the game when ready!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
