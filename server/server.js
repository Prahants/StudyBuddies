const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const { ExpressPeerServer } = require('peer')
require('dotenv').config()

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

// Store active rooms and users
const rooms = new Map()
const users = new Map()

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join room
  socket.on('join-room', ({ roomId, username, isHost }) => {
    socket.join(roomId)
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        videoUrl: '',
        isPlaying: false,
        currentTime: 0,
        host: null
      })
    }
    
    const room = rooms.get(roomId)
    const user = {
      id: socket.id,
      username,
      isHost,
      joinedAt: new Date()
    }
    
    room.users.set(socket.id, user)
    users.set(socket.id, { roomId, username })
    
    if (isHost && !room.host) {
      room.host = socket.id
    }
    
    // Notify other users in the room
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      username,
      isHost
    })
    
    // Send current room state to the new user
    socket.emit('room-state', {
      users: Array.from(room.users.values()),
      videoUrl: room.videoUrl,
      isPlaying: room.isPlaying,
      currentTime: room.currentTime
    })
    
    console.log(`${username} joined room ${roomId}`)
  })

  // Video control events
  socket.on('video-play', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (room) {
      room.isPlaying = true
      socket.to(roomId).emit('video-play')
    }
  })

  socket.on('video-pause', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (room) {
      room.isPlaying = false
      socket.to(roomId).emit('video-pause')
    }
  })

  socket.on('video-seek', ({ roomId, time }) => {
    const room = rooms.get(roomId)
    if (room) {
      room.currentTime = time
      socket.to(roomId).emit('video-seek', time)
    }
  })

  socket.on('video-url-change', ({ roomId, url }) => {
    const room = rooms.get(roomId)
    if (room) {
      room.videoUrl = url
      socket.to(roomId).emit('video-url-change', url)
    }
  })

  socket.on('sync-time', ({ roomId, time }) => {
    const room = rooms.get(roomId)
    if (room) {
      room.currentTime = time
      socket.to(roomId).emit('sync-time', time)
    }
  })

  // Voice chat events
  socket.on('join-voice', ({ roomId, userId, username }) => {
    socket.to(roomId).emit('user-joined-voice', { userId, username })
  })

  socket.on('voice-signal', ({ roomId, to, signal }) => {
    socket.to(roomId).emit('voice-signal', {
      from: socket.id,
      signal
    })
  })

  // Disconnect handling
  socket.on('disconnect', () => {
    const user = users.get(socket.id)
    if (user) {
      const room = rooms.get(user.roomId)
      if (room) {
        const disconnectedUser = room.users.get(socket.id)
        room.users.delete(socket.id)
        
        // If host disconnected, assign new host
        if (room.host === socket.id && room.users.size > 0) {
          const newHost = Array.from(room.users.values())[0]
          room.host = newHost.id
          io.to(newHost.id).emit('host-changed', { newHostId: newHost.id })
        }
        
        // Remove room if empty
        if (room.users.size === 0) {
          rooms.delete(user.roomId)
          console.log(`Room ${user.roomId} deleted (empty)`)
        } else {
          // Notify other users
          socket.to(user.roomId).emit('user-left', {
            userId: socket.id,
            username: disconnectedUser?.username
          })
        }
        
        console.log(`${disconnectedUser?.username || 'Unknown user'} left room ${user.roomId}`)
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
  const { roomId } = req.params
  const room = rooms.get(roomId)
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' })
  }
  
  res.json({
    id: room.id,
    userCount: room.users.size,
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
    host: room.host,
    videoUrl: room.videoUrl
  }))
  
  res.json(roomList)
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 Socket.IO server ready`)
  console.log(`🎤 PeerJS server ready on /peerjs`)
  console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`)
}) 