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
  socket.on('video-play', ({ roomId }) => {
    roomId = roomId.toUpperCase()
    const room = rooms.get(roomId)
    if (room) {
      room.isPlaying = true
      socket.to(roomId).emit('video-play')
      console.log(`Video play in room ${roomId}`)
    }
  })

  socket.on('video-pause', ({ roomId }) => {
    roomId = roomId.toUpperCase()
    const room = rooms.get(roomId)
    if (room) {
      room.isPlaying = false
      socket.to(roomId).emit('video-pause')
      console.log(`Video pause in room ${roomId}`)
    }
  })

  socket.on('video-seek', ({ roomId, time }) => {
    roomId = roomId.toUpperCase()
    const room = rooms.get(roomId)
    if (room) {
      room.currentTime = time
      socket.to(roomId).emit('video-seek', time)
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
      socket.to(roomId).emit('sync-time', time)
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
})