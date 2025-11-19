import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerUser } from '../utils/authUtils';
import { ThemeContext } from '../context/ThemeContext';
import { GamepadIcon, Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { currentTheme, theme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await registerUser(
      formData.username,
      formData.email,
      formData.password
    );
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const passwordMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordLength = formData.password.length >= 6;

  return (
    <div className={`min-h-screen ${theme[currentTheme].bgColor} ${theme[currentTheme].textColor} flex items-center justify-center px-4 py-8 transition-colors duration-300`}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-[slideUp_0.6s_ease-out]">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GamepadIcon className="w-12 h-12 text-blue-400" />
            <h1 className={`text-4xl font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>QuizGame</h1>
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Create Account</h2>
          <p className={currentTheme === 'light' ? 'text-gray-700' : 'text-purple-100'}>Join the quiz revolution!</p>
        </div>

        {/* Register Card */}
        <div className={`backdrop-blur-md rounded-2xl p-8 border shadow-2xl animate-[slideUp_0.8s_ease-out] ${
          currentTheme === 'light'
            ? 'bg-white border-gray-300 shadow-gray-200'
            : 'bg-white/10 border-white/20'
        }`}>
          {error && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
              currentTheme === 'light'
                ? 'bg-red-100 border border-red-300'
                : 'bg-red-500/20 border border-red-500/50'
            }`}>
              <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                currentTheme === 'light' ? 'text-red-600' : 'text-red-300'
              }`} />
              <p className={`text-sm ${
                currentTheme === 'light' ? 'text-red-800' : 'text-red-100'
              }`}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className={`block font-semibold mb-2 ${
                currentTheme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>Username</label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  currentTheme === 'light' ? 'text-gray-600' : 'text-purple-300'
                }`} />
                <input
                  type="text"
                  name="username"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all ${
                    currentTheme === 'light'
                      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      : 'bg-white/10 border-white/20 text-white placeholder-purple-200'
                  }`}
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className={`block font-semibold mb-2 ${
                currentTheme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>Email</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  currentTheme === 'light' ? 'text-gray-600' : 'text-purple-300'
                }`} />
                <input
                  type="email"
                  name="email"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all ${
                    currentTheme === 'light'
                      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      : 'bg-white/10 border-white/20 text-white placeholder-purple-200'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block font-semibold mb-2 ${
                currentTheme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  currentTheme === 'light' ? 'text-slate-400' : 'text-purple-300'
                }`} />
                <input
                  type="password"
                  name="password"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all ${
                    currentTheme === 'light'
                      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      : 'bg-white/10 border-white/20 text-white placeholder-purple-200'
                  }`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
              {formData.password && (
                <p className={`text-sm mt-2 flex items-center gap-1 ${
                  currentTheme === 'light'
                    ? (passwordLength ? 'text-green-600' : 'text-yellow-600')
                    : currentTheme === 'light'
                ? passwordLength >= 6
                  ? 'text-green-700'
                  : 'text-yellow-700'
                : passwordLength >= 6
                ? 'text-green-300'
                : 'text-yellow-300'
                }`}>
                  {passwordLength ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className={`block font-semibold mb-2 ${
                currentTheme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>Confirm Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  currentTheme === 'light' ? 'text-gray-600' : 'text-purple-300'
                }`} />
                <input
                  type="password"
                  name="confirmPassword"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all ${
                    currentTheme === 'light'
                      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      : 'bg-white/10 border-white/20 text-white placeholder-purple-200'
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              {formData.confirmPassword && (
                <p className={`text-sm mt-2 flex items-center gap-1 ${
                  currentTheme === 'light'
                    ? (passwordMatch ? 'text-green-600' : 'text-red-600')
                    : (passwordMatch ? 'text-green-300' : 'text-red-300')
                }`}>
                  {passwordMatch ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {passwordMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`w-full py-3 rounded-xl font-bold text-lg disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 mt-6 ${
                currentTheme === 'light'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                  : 'bg-white text-purple-600 hover:bg-gray-100 disabled:bg-white/50'
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className={`w-5 h-5 border-2 rounded-full animate-spin ${
                    currentTheme === 'light'
                      ? 'border-white/30 border-t-white'
                      : 'border-purple-600/30 border-t-purple-600'
                  }`}></div>
                  Creating Account...
                </span>
              ) : (
                'Register'
              )}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className={`mt-6 text-center space-y-3 animate-[slideUp_1s_ease-out] ${
          currentTheme === 'light' ? 'text-gray-800' : 'text-white'
        }`}>
          <p>
            Already have an account?{' '}
            <Link to="/login" className={`font-bold transition-colors ${
              currentTheme === 'light'
                ? 'text-blue-600 hover:text-blue-700'
                : 'text-yellow-300 hover:text-yellow-200'
            }`}>
              Login here
            </Link>
          </p>
          <Link 
            to="/" 
            className={`inline-flex items-center gap-2 transition-colors ${
              currentTheme === 'light'
                ? 'text-gray-700 hover:text-gray-900'
                : 'text-purple-100 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
