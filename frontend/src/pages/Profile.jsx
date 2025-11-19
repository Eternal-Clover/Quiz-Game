import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateProfile as updateUserProfile, clearAuth } from '../utils/authUtils';
import { ThemeContext } from '../context/ThemeContext';
import { ArrowLeft, User, Mail, Calendar, Edit, LogOut, Shuffle, AlertCircle, CheckCircle, Save, X } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { currentTheme, theme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setFormData({
      username: currentUser.username || '',
      avatar: currentUser.avatar || ''
    });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await updateUserProfile(formData);
    
    if (result.success) {
      setSuccess('Profile updated successfully!');
      setUser(result.data);
      setIsEditing(false);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const generateAvatar = () => {
    const newAvatar = `https://ui-avatars.com/api/?name=${formData.username}&background=random&size=200`;
    setFormData({ ...formData, avatar: newAvatar });
  };

  return (
    <div className={`min-h-screen ${theme[currentTheme].bgColor} ${theme[currentTheme].textColor} py-8 px-4 transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto">
        <button 
          className={`flex items-center gap-2 backdrop-blur-lg border px-6 py-3 rounded-xl font-semibold transition-all duration-300 mb-6 hover:scale-105 ${
            currentTheme === 'light'
              ? 'bg-gray-300 hover:bg-gray-400 text-gray-900 border-gray-300'
              : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
          }`}
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className={`backdrop-blur-xl rounded-3xl border shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden ${
          currentTheme === 'light'
            ? 'bg-white border-gray-300 shadow-gray-300'
            : 'bg-white/10 border-white/20'
        }`}>
          {/* Header with Avatar */}
          <div className={`p-8 text-center ${
            currentTheme === 'light'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
              : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700'
          }`}>
            <div className={`inline-block p-1 rounded-full mb-4 ${
              currentTheme === 'light'
                ? 'bg-white/30'
                : 'bg-white/20'
            }`}>
              <img 
                src={user?.avatar} 
                alt={user?.username}
                className={`w-32 h-32 rounded-full border-4 shadow-xl ${
                  currentTheme === 'light'
                    ? 'border-white/50'
                    : 'border-white/50'
                }`}
              />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{user?.username}</h2>
            <p className={`flex items-center justify-center gap-2 ${currentTheme === 'light' ? 'text-gray-800' : 'text-white/80'}`}>
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
                currentTheme === 'light'
                  ? 'bg-red-100 border border-red-300'
                  : 'bg-red-500/20 border border-red-400/50'
              }`}>
                <AlertCircle className={`w-5 h-5 shrink-0 ${
                  currentTheme === 'light' ? 'text-red-600' : 'text-red-300'
                }`} />
                <div className={currentTheme === 'light' ? 'text-red-800' : 'text-red-100'}>{error}</div>
              </div>
            )}
            {success && (
              <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
                currentTheme === 'light'
                  ? 'bg-green-100 border border-green-300'
                  : 'bg-green-500/20 border border-green-400/50'
              }`}>
                <CheckCircle className={`w-5 h-5 shrink-0 ${
                  currentTheme === 'light' ? 'text-green-600' : 'text-green-300'
                }`} />
                <div className={currentTheme === 'light' ? 'text-green-800' : 'text-green-100'}>{success}</div>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className={`block font-semibold mb-2 flex items-center gap-2 ${
                    currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>
                    <User className="w-4 h-4" />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all ${
                      currentTheme === 'light'
                        ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        : 'bg-white/10 border-white/20 text-white placeholder-purple-300'
                    }`}
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-2 ${
                    currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>Avatar URL</label>
                  <input
                    type="text"
                    name="avatar"
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all ${
                      currentTheme === 'light'
                        ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        : 'bg-white/10 border-white/20 text-white placeholder-purple-300'
                    }`}
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                  />
                  <button
                    type="button"
                    className={`mt-3 flex items-center gap-2 border px-4 py-2 rounded-lg transition-all ${
                      currentTheme === 'light'
                        ? 'bg-gray-300 hover:bg-gray-400 text-gray-900 border-gray-300'
                        : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                    }`}
                    onClick={generateAvatar}
                  >
                    <Shuffle className="w-4 h-4" />
                    Generate Random Avatar
                  </button>
                </div>

                {formData.avatar && (
                  <div className="flex justify-center">
                    <img 
                      src={formData.avatar} 
                      alt="Preview" 
                      className={`w-24 h-24 rounded-full border-2 shadow-lg ${
                        currentTheme === 'light'
                          ? 'border-gray-300'
                          : 'border-white/30'
                      }`}
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-2 border px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      currentTheme === 'light'
                        ? 'bg-gray-300 hover:bg-gray-400 text-gray-900 border-gray-300'
                        : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                    }`}
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        username: user?.username || '',
                        avatar: user?.avatar || ''
                      });
                    }}
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                      currentTheme === 'light'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    }`}
                    disabled={loading}
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className={`rounded-2xl border p-6 ${
                  currentTheme === 'light'
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <h3 className={`text-xl font-bold mb-4 ${
                    currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>Account Information</h3>
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between py-3 border-b ${
                      currentTheme === 'light'
                        ? 'border-gray-200'
                        : 'border-white/10'
                    }`}>
                      <span className={`flex items-center gap-2 ${
                        currentTheme === 'light'
                          ? 'text-gray-700'
                          : 'text-purple-200'
                      }`}>
                        <User className="w-4 h-4" />
                        Username:
                      </span>
                      <span className={`font-semibold ${
                        currentTheme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>{user?.username}</span>
                    </div>
                    <div className={`flex items-center justify-between py-3 border-b ${
                      currentTheme === 'light'
                        ? 'border-gray-200'
                        : 'border-white/10'
                    }`}>
                      <span className={`flex items-center gap-2 ${
                        currentTheme === 'light'
                          ? 'text-gray-700'
                          : 'text-purple-200'
                      }`}>
                        <Mail className="w-4 h-4" />
                        Email:
                      </span>
                      <span className={`font-semibold ${
                        currentTheme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className={`flex items-center gap-2 ${
                        currentTheme === 'light'
                          ? 'text-gray-700'
                          : 'text-purple-200'
                      }`}>
                        <Calendar className="w-4 h-4" />
                        Member since:
                      </span>
                      <span className={`font-semibold ${
                        currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}>
                        {new Date(user?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    className={`w-full flex items-center justify-center gap-2 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:scale-105 ${
                      currentTheme === 'light'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    }`}
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-5 h-5" />
                    Edit Profile
                  </button>
                  <button
                    className={`w-full flex items-center justify-center gap-2 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:scale-105 ${
                      currentTheme === 'light'
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                    }`}
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
