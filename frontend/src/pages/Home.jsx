import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, clearAuth } from "../utils/authUtils";
import { ThemeContext } from "../context/ThemeContext";
import {
  GamepadIcon,
  Rocket,
  Users,
  Trophy,
  PlayCircle,
  UserPlus,
  Moon,
  Sun,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { currentTheme, setCurrentTheme, theme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    // Load user from localStorage on component mount
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    navigate('/');
  };

  const isAuthenticated = !!user;

  const handleCreateRoom = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/create-room");
  };

  const handleJoinRoom = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/join-room");
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/room/${roomCode.toUpperCase()}`);
    }
  };

  return (
    <div className={`min-h-screen ${theme[currentTheme].bgColor} ${theme[currentTheme].textColor} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${currentTheme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-slate-800/90 border-slate-700'} backdrop-blur-md border-b shadow-lg transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <GamepadIcon className="w-8 h-8 text-blue-400" />
              <h1 className={`text-2xl font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>QuizGame</h1>
            </div>

            {/* User Menu & Theme Toggle */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button
                onClick={() => setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  currentTheme === 'light'
                    ? 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                    : 'bg-slate-700 hover:bg-slate-600 text-yellow-400'
                }`}
                title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
              >
                {currentTheme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 ${currentTheme === 'light' ? 'bg-gray-300' : 'bg-slate-700/50'} px-4 py-2 rounded-full border ${currentTheme === 'light' ? 'border-gray-300' : 'border-slate-600'}`}>
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className={`font-medium ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      {user.username}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate("/profile")}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gradient-to-br from-pink-400 to-pink-900 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/login")}
                    className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 ${
                      currentTheme === 'light'
                        ? 'text-gray-900 hover:bg-gray-200'
                        : 'text-white hover:bg-slate-700/50'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className={`text-5xl md:text-6xl font-bold mb-6 animate-[slideUp_0.6s_ease-out] ${
            currentTheme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            Play, Compete, Win!
          </h2>
          <p className={`text-xl mb-12 animate-[slideUp_0.8s_ease-out] ${
            currentTheme === 'light' ? 'text-gray-700' : 'text-purple-100'
          }`}>
            Join millions of players in the most exciting AI-powered quiz game
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-[slideUp_1s_ease-out]">
            <button
              onClick={handleCreateRoom}
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Create Room
            </button>
            <button
              onClick={handleJoinRoom}
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/50 hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <Rocket className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Join Room
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <div className={`backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2 ${
              currentTheme === 'light'
                ? 'bg-gray-100/50 border-gray-200 hover:bg-gray-100/80'
                : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className={`w-8 h-8 ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                currentTheme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Compete & Win
              </h3>
              <p className={`${
                currentTheme === 'light' ? 'text-gray-700' : 'text-purple-100'
              }`}>
                Challenge players worldwide and climb the leaderboard
              </p>
            </div>

            <div className={`backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2 ${
              currentTheme === 'light'
                ? 'bg-gray-100/50 border-gray-200 hover:bg-gray-100/80'
                : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-300 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className={`w-8 h-8 ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                currentTheme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Multiplayer Fun
              </h3>
              <p className={`${
                currentTheme === 'light' ? 'text-slate-600' : 'text-purple-100'
              }`}>
                Play with friends or join random matches instantly
              </p>
            </div>

            <div className={`backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2 ${
              currentTheme === 'light'
                ? 'bg-gray-100/50 border-gray-200 hover:bg-gray-100/80'
                : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <GamepadIcon className={`w-8 h-8 ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                currentTheme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>AI-Powered</h3>
              <p className={`${
                currentTheme === 'light' ? 'text-gray-700' : 'text-purple-100'
              }`}>
                Endless questions generated by advanced AI technology
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
