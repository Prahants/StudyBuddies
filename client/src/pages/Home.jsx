import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Users, Mic, Video, Sparkles } from 'lucide-react'

const Home = () => {
  const [roomId, setRoomId] = useState('')
  const [username, setUsername] = useState('')
  const navigate = useNavigate()

  const createRoom = () => {
    if (!username.trim()) return
    
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    navigate(`/room/${newRoomId}`, { 
      state: { username, isHost: true } 
    })
  }

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) return
    
    navigate(`/room/${roomId.toUpperCase()}`, { 
      state: { username, isHost: false } 
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-4xl font-bold text-gradient">Study Buddies</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Learn together with friends in real-time
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="room-card"
        >
          {/* Username Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         text-white placeholder-gray-400 backdrop-blur-sm"
            />
          </div>

          {/* Room Actions */}
          <div className="space-y-4">
            {/* Create Room */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createRoom}
              disabled={!username.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-accent 
                         hover:from-primary-hover hover:to-accent-hover
                         rounded-lg font-medium text-white transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Create New Room</span>
            </motion.button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background-secondary text-gray-400">or</span>
              </div>
            </div>

            {/* Join Room */}
            <div className="space-y-3">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room code"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                           text-white placeholder-gray-400 backdrop-blur-sm text-center text-lg font-mono"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={joinRoom}
                disabled={!roomId.trim() || !username.trim()}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 
                           border border-white/20 rounded-lg font-medium text-white 
                           transition-all duration-200 disabled:opacity-50 
                           disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>Join Room</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="text-center p-4 glass-effect rounded-lg">
            <Video className="w-6 h-6 text-primary mx-auto mb-2" />
            <h3 className="font-medium text-white">Sync Playback</h3>
            <p className="text-sm text-gray-400">Watch together in perfect sync</p>
          </div>
          <div className="text-center p-4 glass-effect rounded-lg">
            <Mic className="w-6 h-6 text-accent mx-auto mb-2" />
            <h3 className="font-medium text-white">Voice Chat</h3>
            <p className="text-sm text-gray-400">Talk while watching</p>
          </div>
          <div className="text-center p-4 glass-effect rounded-lg">
            <Users className="w-6 h-6 text-glow-purple mx-auto mb-2" />
            <h3 className="font-medium text-white">Real-time</h3>
            <p className="text-sm text-gray-400">Instant synchronization</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Home 