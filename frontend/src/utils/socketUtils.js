import { io } from 'socket.io-client';
import { getToken } from './authUtils';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

// Create socket connection
export const connectSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = getToken();
  if (!token) {
    return null;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    
    // Authenticate socket with JWT token
    if (token) {
      socket.emit('authenticate', token);
    }
  });

  socket.on('authenticated', (data) => {
    console.log('Socket authenticated:', data);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

// Get existing socket connection
export const getSocket = () => {
  if (!socket || !socket.connected) {
    return connectSocket();
  }
  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Reconnect socket
export const reconnectSocket = () => {
  disconnectSocket();
  return connectSocket();
};
