import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Copy, Settings } from 'lucide-react'
import VideoPlayer from '../components/VideoPlayer'
import VoiceChat from '../components/VoiceChat'
import RoomControls from '../components/RoomControls'

const Room = () => {
  const { roomId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { username, isHost } = location.state || {}
  
  const [users, setUsers] = useState([])
  const [showVoiceChat, setShowVoiceChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (!username) {
      navigate('/')
    }
  }, [username, navigate])

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId)
    // You could add a toast notification here
  }

  const goBack = () => {
    navigate('/')
  }

  if (!username) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect border-b border-white/10 p-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goBack}
              className="control-button"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            
            <div>
              <h1 className="text-xl font-bold text-white">Room {roomId}</h1>
              <p className="text-sm text-gray-400">Welcome, {username}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Room Code */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyRoomCode}
              className="control-button"
              title="Copy room code"
            >
              <Copy className="w-4 h-4" />
            </motion.button>

            {/* Users Count */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="control-button"
              title="Room members"
            >
              <Users className="w-4 h-4" />
              <span className="ml-1 text-sm">{users.length + 1}</span>
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="control-button"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <VideoPlayer 
              roomId={roomId}
              username={username}
              isHost={isHost}
            />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {/* Voice Chat */}
            <VoiceChat 
              roomId={roomId}
              username={username}
              isOpen={showVoiceChat}
              onToggle={() => setShowVoiceChat(!showVoiceChat)}
            />

            {/* Room Controls */}
            <RoomControls 
              roomId={roomId}
              username={username}
              isHost={isHost}
            />

            {/* Users List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="room-card"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Room Members
              </h3>
              
              <div className="space-y-2">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-2 rounded-lg bg-white/5"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-white">{user.name}</span>
                    {user.isHost && (
                      <span className="text-xs bg-primary px-2 py-1 rounded-full text-white">
                        Host
                      </span>
                    )}
                  </motion.div>
                ))}
                
                {/* Current User */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: users.length * 0.1 }}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-primary/20 border border-primary/30"
                >
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-white">{username}</span>
                  {isHost && (
                    <span className="text-xs bg-primary px-2 py-1 rounded-full text-white">
                      Host
                    </span>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Room 