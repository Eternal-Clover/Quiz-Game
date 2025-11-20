import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import RoomLobby from './pages/RoomLobby';
import Game from './pages/Game';
import Results from './pages/Results';
import Profile from './pages/Profile';
import ThemeContextProvider from './context/ThemeContext';
import './index.css';

function App() {
  return (
    <ThemeContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-room" element={<CreateRoom />} />
          <Route path="/join-room" element={<JoinRoom />} />
          <Route path="/room/:code" element={<RoomLobby />} />
          <Route path="/game/:code" element={<Game />} />
          <Route path="/results/:code" element={<Results />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </ThemeContextProvider>
  );
}

export default App;
