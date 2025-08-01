const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const { ExpressPeerServer } = require('peer')
require('dotenv').config()
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

// Create PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/peerjs'
})

app.use('/peerjs', peerServer)

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}))
app.use(express.json())

// MongoDB connection with better error handling
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, { 
    serverSelectionTimeoutMS: 5000, // 5 second timeout
    socketTimeoutMS: 45000, // 45 second timeout
    maxPoolSize: 10,
    retryWrites: true
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Don't crash the server, just log the error
  });
} else {
  console.log('MongoDB URI not provided - running without database');
}

// Chat schema
const ChatSchema = new mongoose.Schema({
  roomId: String,
  username: String,
  message: String,
  role: String, // 'user' or 'gemini'
  files: [String], // Array of file URLs
  timestamp: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', ChatSchema);

// Gemini AI setup
let genAI = null;
if (process.env.GOOGLE_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  console.log('Gemini AI initialized');
} else {
  console.log('Google API key not provided - AI features will be limited');
}

// Multer setup for file uploads (local storage for now)
const upload = multer({
  dest: path.join(__dirname, 'uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  // In production, upload to Cloudinary/Firebase and return the URL
  // For now, return local file path (not secure for prod!)
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Serve uploaded files statically (for local dev only)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting for Gemini API
const geminiRateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 15; // Conservative limit for free tier

// Enhanced fallback responses when Gemini is unavailable
const FALLBACK_RESPONSES = [
  "I'm currently experiencing high demand. Please try again in a few minutes!",
  "Sorry, I'm temporarily unavailable due to rate limits. Please wait a moment and try again.",
  "I'm a bit busy right now! Please try your request again shortly.",
  "Rate limit reached - I'll be back to help you soon!",
  "Temporarily unavailable due to high usage. Please try again in a minute.",
  "Daily API limit reached. I'll be available again tomorrow!",
  "Currently at capacity. Please try again later today or tomorrow.",
  "Service temporarily limited. Your patience is appreciated!",
  "API quota exceeded for today. I'll be back with full functionality tomorrow!",
  "Rate limited due to high usage. Please try again in a few hours."
];

// Simple local AI responses for common questions
const LOCAL_AI_RESPONSES = {
  hello: [
    "Hello! I'm your AI assistant. How can I help you today?",
    "Hi there! I'm here to help with your questions.",
    "Hello! What would you like to know?"
  ],
  help: [
    "I'm here to help! What do you need assistance with?",
    "Sure, I'd be happy to help. What's your question?",
    "I'm ready to assist you. What can I help with?"
  ],
  movie: [
    "I can help you with movie recommendations! What genre do you like?",
    "Movies are great! Are you looking for something specific?",
    "I love movies too! What kind of films do you enjoy?"
  ],
  weather: [
    "I can't check the weather right now, but you can use a weather app!",
    "For weather updates, try checking a weather service online.",
    "Weather information would be available through weather apps or websites."
  ],
  time: [
    `The current time is ${new Date().toLocaleTimeString()}.`,
    `It's currently ${new Date().toLocaleTimeString()}.`,
    `Right now it's ${new Date().toLocaleTimeString()}.`
  ]
};

// Simple local AI function
function getLocalAIResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Check for specific keywords
  for (const [keyword, responses] of Object.entries(LOCAL_AI_RESPONSES)) {
    if (lowerPrompt.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  // Default responses for general questions
  const generalResponses = [
    "That's an interesting question! I'm currently in fallback mode, but I'd be happy to help with basic queries.",
    "I'm operating with limited functionality right now, but I can assist with simple questions.",
    "I'm in offline mode currently. I can help with basic information and chat!",
    "I'm temporarily using local responses. I can help with general questions and conversation.",
    "I'm currently running on local AI. I can assist with basic queries and chat!"
  ];
  
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

// Gemini chat endpoint
app.post('/api/gemini', async (req, res) => {
  const { roomId, username, prompt, files } = req.body;
  
  // Check rate limiting
  const now = Date.now();
  const userKey = `${roomId}-${username}`;
  const userRequests = geminiRateLimit.get(userKey) || [];
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Please wait a moment before sending another message.',
      retryAfter: Math.ceil((recentRequests[0] + RATE_LIMIT_WINDOW - now) / 1000)
    });
  }
  
  // Add current request to rate limit tracking
  recentRequests.push(now);
  geminiRateLimit.set(userKey, recentRequests);
  
  // Check if MongoDB is connected
  const isMongoConnected = mongoose.connection.readyState === 1;
  
  try {
    if (!genAI) {
      const fallbackResponse = "I'm sorry, but AI features are currently unavailable. Please check your API configuration.";
      
      if (isMongoConnected) {
        try {
          console.log('💬 Inserting fallback response into MongoDB...');
          const inserted = await Chat.insertMany([
            { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
            { roomId, username: 'Gemini AI', message: fallbackResponse, role: 'gemini', files: [], timestamp: new Date() }
          ]);
          console.log('✅ Fallback messages inserted:', inserted.length);
        } catch (insertErr) {
          console.error('❌ MongoDB insert failed:', insertErr);
          // Fallback to local storage
          if (!localChatStorage.has(roomId)) {
            localChatStorage.set(roomId, []);
          }
          const roomChats = localChatStorage.get(roomId);
          roomChats.push(
            { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
            { roomId, username: 'Gemini AI', message: fallbackResponse, role: 'gemini', files: [], timestamp: new Date() }
          );
          localChatStorage.set(roomId, roomChats);
          console.log('✅ Fallback messages saved to local storage');
        }
      } else {
        // MongoDB not connected, use local storage
        if (!localChatStorage.has(roomId)) {
          localChatStorage.set(roomId, []);
        }
        const roomChats = localChatStorage.get(roomId);
        roomChats.push(
          { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
          { roomId, username: 'Gemini AI', message: fallbackResponse, role: 'gemini', files: [], timestamp: new Date() }
        );
        localChatStorage.set(roomId, roomChats);
        console.log('✅ Fallback messages saved to local storage (MongoDB not connected)');
      }

      res.json({ reply: fallbackResponse });
      // Emit real-time Gemini chat to all clients in the room
      io.to(roomId).emit('gemini-message', [
        { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
        { roomId, username: 'Gemini AI', message: fallbackResponse, role: 'gemini', files: [], timestamp: new Date() }
      ]);
      console.log('Emitted fallback gemini-message to room', roomId, 'with user', username);
      return;
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const geminiReply = result.response.text();

            if (isMongoConnected) {
          try {
            console.log('💬 Inserting chat messages into MongoDB...');
            const inserted = await Chat.insertMany([
              { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
              { roomId, username: 'Gemini AI', message: geminiReply, role: 'gemini', files: [], timestamp: new Date() }
            ]);
            console.log('✅ Messages inserted:', inserted.length);
          } catch (insertErr) {
            console.error('❌ MongoDB insert failed:', insertErr);
            // Fallback to local storage
            if (!localChatStorage.has(roomId)) {
              localChatStorage.set(roomId, []);
            }
            const roomChats = localChatStorage.get(roomId);
            roomChats.push(
              { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
              { roomId, username: 'Gemini AI', message: geminiReply, role: 'gemini', files: [], timestamp: new Date() }
            );
            localChatStorage.set(roomId, roomChats);
            console.log('✅ Messages saved to local storage');
          }
        } else {
          // MongoDB not connected, use local storage
          if (!localChatStorage.has(roomId)) {
            localChatStorage.set(roomId, []);
          }
          const roomChats = localChatStorage.get(roomId);
          roomChats.push(
            { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
            { roomId, username: 'Gemini AI', message: geminiReply, role: 'gemini', files: [], timestamp: new Date() }
          );
          localChatStorage.set(roomId, roomChats);
          console.log('✅ Messages saved to local storage (MongoDB not connected)');
        }

    res.json({ reply: geminiReply });
    // Emit real-time Gemini chat to all clients in the room
    io.to(roomId).emit('gemini-message', [
      { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
      { roomId, username: 'Gemini AI', message: geminiReply, role: 'gemini', files: [], timestamp: new Date() }
    ]);
    console.log('Emitted gemini-message to room', roomId, 'with user', username);
      } catch (err) {
      console.error('❌ Gemini request failed:', err);
      
      // Handle specific error types
      if (err.status === 429) {
        // Rate limit exceeded by Google API
        const retryDelay = err.errorDetails?.find(detail => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')?.retryDelay;
        const retrySeconds = retryDelay ? parseInt(retryDelay.replace('s', '')) : 60;
        
        // Check if it's a daily quota exceeded (retry delay > 30 seconds)
        if (retrySeconds > 30) {
          // Daily quota exceeded - provide fallback response
          const fallbackResponse = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
          
                  if (isMongoConnected) {
          try {
            console.log('💬 Inserting fallback response into MongoDB...');
            const inserted = await Chat.insertMany([
              { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
              { roomId, username: 'Gemini AI', message: fallbackResponse, role: 'gemini', files: [], timestamp: new Date() }
            ]);
            console.log('✅ Fallback messages inserted:', inserted.length);
          } catch (insertErr) {
            console.error('❌ MongoDB insert failed:', insertErr);
            // Fallback to local storage
            if (!localChatStorage.has(roomId)) {
              localChatStorage.set(roomId, []);
            }
            const roomChats = localChatStorage.get(roomId);
            roomChats.push(
              { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
              { roomId, username: 'Gemini AI', message: fallbackResponse, role: 'gemini', files: [], timestamp: new Date() }
            );
            localChatStorage.set(roomId, roomChats);
            console.log('✅ Fallback messages saved to local storage');
          }
        } else {
          // MongoDB not connected, use local storage
          if (!localChatStorage.has(roomId)) {
            localChatStorage.set(roomId, []);
          }
          const roomChats = localChatStorage.get(roomId);
          roomChats.push(
            { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
            { roomId, username: 'Gemini AI', message: fallbackResponse, role: 'gemini', files: [], timestamp: new Date() }
          );
          localChatStorage.set(roomId, roomChats);
          console.log('✅ Fallback messages saved to local storage (MongoDB not connected)');
        }
          
          res.json({ 
            reply: fallbackResponse,
            isFallback: true,
            retryAfter: retrySeconds
          });
          // Emit fallback Gemini chat to all clients in the room
          io.to(roomId).emit('gemini-message', [
            { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
            { roomId, username: 'Gemini AI', message: fallbackResponse, role: 'gemini', files: [], timestamp: new Date() }
          ]);
          console.log('Emitted gemini-message (fallback) to room', roomId, 'with user', username);
        } else {
          // Short-term rate limit - ask user to wait
          res.status(429).json({ 
            error: 'Gemini API rate limit exceeded. Please try again later.',
            retryAfter: retrySeconds
          });
        }
      } else if (err.status === 400) {
        // Check if it's an API key issue
        const isApiKeyError = err.errorDetails?.some(detail => 
          detail['@type'] === 'type.googleapis.com/google.rpc.ErrorInfo' && 
          detail.reason === 'API_KEY_INVALID'
        );
        
        if (isApiKeyError) {
          // API key expired or invalid - use local AI response
          const localResponse = getLocalAIResponse(prompt);
          
          if (isMongoConnected) {
            try {
              console.log('💬 Inserting API key error fallback into MongoDB...');
              const inserted = await Chat.insertMany([
                { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
                { roomId, username: 'Gemini AI', message: localResponse, role: 'gemini', files: [], timestamp: new Date() }
              ]);
              console.log('✅ API key error fallback inserted:', inserted.length);
            } catch (insertErr) {
              console.error('❌ MongoDB insert failed:', insertErr);
              // Fallback to local storage
              if (!localChatStorage.has(roomId)) {
                localChatStorage.set(roomId, []);
              }
              const roomChats = localChatStorage.get(roomId);
              roomChats.push(
                { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
                { roomId, username: 'Gemini AI', message: localResponse, role: 'gemini', files: [], timestamp: new Date() }
              );
              localChatStorage.set(roomId, roomChats);
              console.log('✅ API key error fallback saved to local storage');
            }
          } else {
            // MongoDB not connected, use local storage
            if (!localChatStorage.has(roomId)) {
              localChatStorage.set(roomId, []);
            }
            const roomChats = localChatStorage.get(roomId);
            roomChats.push(
              { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
              { roomId, username: 'Gemini AI', message: localResponse, role: 'gemini', files: [], timestamp: new Date() }
            );
            localChatStorage.set(roomId, roomChats);
            console.log('✅ API key error local AI saved to local storage (MongoDB not connected)');
          }
          
          res.json({ 
            reply: localResponse,
            isFallback: true,
            error: 'API key expired. Using local AI response.'
          });
          // Emit local fallback Gemini chat to all clients in the room
          io.to(roomId).emit('gemini-message', [
            { roomId, username, message: prompt, role: 'user', files, timestamp: new Date() },
            { roomId, username: 'Gemini AI', message: localResponse, role: 'gemini', files: [], timestamp: new Date() }
          ]);
          console.log('Emitted gemini-message (local fallback) to room', roomId, 'with user', username);
        } else {
          res.status(400).json({ error: 'Invalid request to Gemini API' });
        }
      } else if (err.status === 401) {
        res.status(401).json({ error: 'Gemini API key is invalid' });
      } else {
        res.status(500).json({ error: 'Gemini request failed. Please try again.' });
      }
    }
});

// Get chat history for a room
app.get('/api/gemini/:roomId', async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  
  if (isMongoConnected) {
    try {
      const chats = await Chat.find({ roomId: req.params.roomId }).sort({ timestamp: 1 });
      res.json(chats);
    } catch (err) {
      console.error('❌ Failed to fetch chat history from MongoDB:', err);
      // Fallback to local storage
      const localChats = localChatStorage.get(req.params.roomId) || [];
      res.json(localChats);
    }
  } else {
    // MongoDB not connected, use local storage
    const localChats = localChatStorage.get(req.params.roomId) || [];
    res.json(localChats);
  }
});

// Store active rooms and users
const rooms = new Map()
const users = new Map()

// Local chat storage fallback when MongoDB is unavailable
const localChatStorage = new Map()

// Helper function to get room members array
const getRoomMembers = (roomId) => {
  const room = rooms.get(roomId)
  if (!room) return []
  return Array.from(room.users.values())
}

// Helper function to broadcast room members to all users in room
const broadcastRoomMembers = (roomId) => {
  const members = getRoomMembers(roomId)
  io.to(roomId).emit('room-members', members)
  console.log(`Broadcasting ${members.length} members to room ${roomId}`)
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join room
  socket.on('join-room', ({ roomId, username, isHost }) => {
    // Normalize room ID
    roomId = roomId.toUpperCase()
    console.log(`${username} attempting to join room ${roomId} as ${isHost ? 'Host' : 'Member'}`)
    
    // Join the socket room
    socket.join(roomId)
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        videoUrl: '',
        isPlaying: false,
        currentTime: 0,
        host: null,
        createdAt: new Date()
      })
      console.log(`Created new room: ${roomId}`)
    }
    
    const room = rooms.get(roomId)
    const user = {
      id: socket.id,
      username,
      isHost,
      joinedAt: new Date()
    }
    
    // Add user to room
    room.users.set(socket.id, user)
    users.set(socket.id, { roomId, username, isHost })
    
    // Set host if this is the first user or explicitly a host
    if (isHost || !room.host) {
      room.host = socket.id
      user.isHost = true // Ensure host flag is set
    }
    
    console.log(`${username} joined room ${roomId}. Room now has ${room.users.size} users`)
    
    // Send current room state to the new user
    socket.emit('room-state', {
      users: Array.from(room.users.values()),
      videoUrl: room.videoUrl,
      isPlaying: room.isPlaying,
      currentTime: room.currentTime,
      host: room.host
    })
    
    // Notify other users in the room about new user
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      username,
      isHost: user.isHost
    })
    
    // Broadcast updated member list to all users in room
    broadcastRoomMembers(roomId)
  })

  // Video control events (with room validation and case normalization)
  socket.on('video-play', ({ roomId, time }) => {
    roomId = roomId.toUpperCase()
    const room = rooms.get(roomId)
    if (room) {
      room.isPlaying = true
      if (typeof time === 'number') room.currentTime = time
      socket.to(roomId).emit('video-play', { time })
      console.log(`Video play in room ${roomId} at time ${time}`)
    }
  })

  socket.on('video-pause', ({ roomId, time }) => {
    roomId = roomId.toUpperCase()
    const room = rooms.get(roomId)
    if (room) {
      room.isPlaying = false
      if (typeof time === 'number') room.currentTime = time
      socket.to(roomId).emit('video-pause', { time })
      console.log(`Video pause in room ${roomId} at time ${time}`)
    }
  })

  socket.on('video-seek', ({ roomId, time }) => {
    roomId = roomId.toUpperCase()
    const room = rooms.get(roomId)
    if (room) {
      room.currentTime = time
      socket.to(roomId).emit('video-seek', { time }) // ✅ Fixed: Send object with time property
      console.log(`Video seek to ${time}s in room ${roomId}`)
    }
  })

  socket.on('video-url-change', ({ roomId, url }) => {
    roomId = roomId.toUpperCase()
    const room = rooms.get(roomId)
    if (room) {
      room.videoUrl = url
      socket.to(roomId).emit('video-url-change', url)
      console.log(`Video URL changed in room ${roomId}`)
    }
  })

  socket.on('sync-time', ({ roomId, time }) => {
    roomId = roomId.toUpperCase()
    const room = rooms.get(roomId)
    if (room) {
      room.currentTime = time
      socket.to(roomId).emit('sync-time', { time }) // ✅ Fixed: Send object with time property
    }
  })

  // Voice chat events
  socket.on('join-voice', ({ roomId, userId, username }) => {
    roomId = roomId.toUpperCase()
    socket.to(roomId).emit('user-joined-voice', { userId, username })
  })

  socket.on('voice-signal', ({ roomId, to, signal }) => {
    roomId = roomId.toUpperCase()
    socket.to(to).emit('voice-signal', {
      from: socket.id,
      signal
    })
  })

  // Request room members (useful for debugging)
  socket.on('get-room-members', ({ roomId }) => {
    roomId = roomId.toUpperCase()
    const members = getRoomMembers(roomId)
    socket.emit('room-members', members)
  })

  // Add test-event handler for debugging
  socket.on('test-event', ({ msg, roomId }) => {
    console.log('Server received test-event:', msg, 'for room', roomId);
    socket.to(roomId).emit('test-event', { msg });
  });

  // Add chat-message event handling
  socket.on('chat-message', ({ roomId, username, message, timestamp }) => {
    roomId = roomId.toUpperCase();
    io.to(roomId).emit('chat-message', { username, message, timestamp });
    console.log(`[Chat] ${username} in ${roomId}: ${message}`);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const user = users.get(socket.id)
    if (user) {
      const { roomId, username } = user
      const room = rooms.get(roomId)
      
      if (room) {
        const disconnectedUser = room.users.get(socket.id)
        room.users.delete(socket.id)
        
        console.log(`${username} left room ${roomId}. Room now has ${room.users.size} users`)
        
        // If host disconnected, assign new host
        if (room.host === socket.id && room.users.size > 0) {
          const newHostUser = Array.from(room.users.values())[0]
          room.host = newHostUser.id
          newHostUser.isHost = true
          
          // Notify new host
          io.to(newHostUser.id).emit('host-changed', { 
            newHostId: newHostUser.id,
            isHost: true 
          })
          
          console.log(`New host assigned: ${newHostUser.username}`)
        }
        
        // Remove room if empty
        if (room.users.size === 0) {
          rooms.delete(roomId)
          console.log(`Room ${roomId} deleted (empty)`)
        } else {
          // Notify other users about disconnection
          socket.to(roomId).emit('user-left', {
            userId: socket.id,
            username: disconnectedUser?.username
          })
          
          // Broadcast updated member list
          broadcastRoomMembers(roomId)
        }
      }
      
      users.delete(socket.id)
    }
    
    console.log('User disconnected:', socket.id)
  })
})

// PeerJS connection handling
peerServer.on('connection', (client) => {
  console.log('Peer connected:', client.getId())
})

peerServer.on('disconnect', (client) => {
  console.log('Peer disconnected:', client.getId())
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    rooms: rooms.size,
    users: users.size
  })
})

// Get room info
app.get('/api/rooms/:roomId', (req, res) => {
  const roomId = req.params.roomId.toUpperCase()
  const room = rooms.get(roomId)
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' })
  }
  
  res.json({
    id: room.id,
    userCount: room.users.size,
    users: Array.from(room.users.values()),
    host: room.host,
    videoUrl: room.videoUrl,
    isPlaying: room.isPlaying,
    currentTime: room.currentTime
  })
})

// Get all rooms (for debugging)
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    userCount: room.users.size,
    users: Array.from(room.users.values()),
    host: room.host,
    videoUrl: room.videoUrl,
    createdAt: room.createdAt
  }))
  
  res.json(roomList)
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 Socket.IO server ready`)
  console.log(`🎤 PeerJS server ready on /peerjs`)
  console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`)
  console.log('🔐 CORS:', process.env.CORS_ORIGIN);
  console.log('🔐 MONGO_URI present:', !!process.env.MONGO_URI);
})