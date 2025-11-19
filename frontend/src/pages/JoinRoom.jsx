import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getApi } from '../utils/authUtils';
import { ThemeContext } from '../context/ThemeContext';
import { ArrowLeft, DoorOpen, Hash, Info, Plus, Loader2, AlertCircle } from 'lucide-react';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { currentTheme, theme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setError('');
    setJoining(true);

    try {
      console.log('🚪 Joining room with code:', code);
      
      const api = getApi();
      const response = await api.post('/rooms/join', {
        code: code.toUpperCase()
      });

      if (response.data.success) {
        const room = response.data.data;
        console.log('✅ Successfully joined room:', room);
        navigate(`/room/${room.code}`);
      } else {
        setError(response.data.message || 'Failed to join room');
      }
    } catch (error) {
      console.error('❌ Error joining room:', error);
      setError(error.response?.data?.message || 'Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme[currentTheme].bgColor} ${theme[currentTheme].textColor} py-8 px-4 transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className={`flex items-center gap-2 hover:transition-colors mb-6 group ${
            currentTheme === 'light'
              ? 'text-gray-900 hover:text-gray-700'
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
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <DoorOpen className={`w-8 h-8 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`} />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Join Room</h1>
            <p className={currentTheme === 'light' ? 'text-gray-700' : 'text-purple-100'}>Enter the room code to join the game</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          {/* Join Form */}
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div>
              <label className={`text-white font-semibold mb-2 flex items-center gap-2 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                <Hash className="w-5 h-5" />
                Room Code
              </label>
              <input
                type="text"
                className={`w-full px-6 py-4 border-2 rounded-xl text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all uppercase ${
                  currentTheme === 'light'
                    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    : 'bg-white/10 border-white/30 text-white placeholder-purple-200'
                }`}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength="6"
                required
                autoFocus
              />
              <p className={`text-sm mt-2 text-center ${currentTheme === 'light' ? 'text-gray-700' : 'text-purple-100'}`}>
                Ask the host for the room code
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 disabled:bg-white/50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              disabled={joining || code.length !== 6}
            >
              {joining ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Joining...
                </span>
              ) : (
                'Join Room'
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
              <h4 className={`font-bold mb-2 ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>How to join</h4>
              <ul className={`space-y-1 text-sm ${currentTheme === 'light' ? 'text-gray-800' : 'text-purple-100'}`}>
                <li>• Get the 6-digit room code from your host</li>
                <li>• Enter the code above</li>
                <li>• Click "Join Room"</li>
                <li>• Wait for the host to start the game</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className={`flex-1 h-px ${currentTheme === 'light' ? 'bg-gray-300' : 'bg-white/20'}`}></div>
          <span className={`font-semibold ${currentTheme === 'light' ? 'text-gray-700' : 'text-white'}`}>OR</span>
          <div className={`flex-1 h-px ${currentTheme === 'light' ? 'bg-gray-300' : 'bg-white/20'}`}></div>
        </div>

        {/* Create Room Button */}
        <button
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-2 animate-[slideUp_1s_ease-out]"
          onClick={() => navigate('/create-room')}
        >
          <Plus className="w-5 h-5" />
          Create Your Own Room
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;
