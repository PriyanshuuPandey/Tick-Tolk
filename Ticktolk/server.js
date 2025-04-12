// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
mongoose.connect('mongodb://localhost:27017/shorts-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Models
const User = require('./models/User');
const Video = require('./models/Video');
const LiveStream = require('./models/LiveStream');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/live', require('./routes/live'));
app.use('/api/chat', require('./routes/chat'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));// server.js (add to existing)
const socketio = require('socket.io');
const io = socketio(server);

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join live stream room
  socket.on('join-stream', (streamId) => {
    socket.join(streamId);
  });
  
  // Handle chat messages
  socket.on('stream-chat', ({ streamId, message, user }) => {
    io.to(streamId).emit('new-message', { message, user });
  });
  
  // Handle gifts
  socket.on('send-gift', ({ streamId, gift, user }) => {
    io.to(streamId).emit('new-gift', { gift, user });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});// server.js additions
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));