import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Users, Share2, Info, Crown } from 'lucide-react'

const RoomControls = ({ roomId, username, isHost }) => {
  const [showSettings, setShowSettings] = useState(false)

  const shareRoom = async () => {
    const shareData = {
      title: 'Join my movie room',
      text: `Join me in watching movies together! Room code: ${roomId}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `Join my movie room: ${window.location.href}\nRoom code: ${roomId}`
        )
        // You could add a toast notification here
      }
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="room-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Room Controls
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={shareRoom}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg 
                       border border-white/20 transition-all duration-200
                       flex flex-col items-center space-y-2"
          >
            <Share2 className="w-5 h-5 text-primary" />
            <span className="text-sm text-white">Share Room</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg 
                       border border-white/20 transition-all duration-200
                       flex flex-col items-center space-y-2"
          >
            <Settings className="w-5 h-5 text-accent" />
            <span className="text-sm text-white">Settings</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Room Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="room-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Room Info
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm text-gray-300">Room Code</span>
            <span className="text-sm font-mono text-white bg-white/10 px-2 py-1 rounded">
              {roomId}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm text-gray-300">Your Role</span>
            <div className="flex items-center space-x-2">
              {isHost && <Crown className="w-4 h-4 text-yellow-400" />}
              <span className="text-sm text-white">
                {isHost ? 'Host' : 'Member'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm text-gray-300">Username</span>
            <span className="text-sm text-white">{username}</span>
          </div>
        </div>
      </motion.div>

      {/* Host Controls */}
      {isHost && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="room-card border border-yellow-500/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-yellow-400" />
            Host Controls
          </h3>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-3 bg-yellow-500/20 hover:bg-yellow-500/30 
                         border border-yellow-500/30 rounded-lg transition-all duration-200
                         flex items-center justify-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm text-white">Manage Members</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-3 bg-red-500/20 hover:bg-red-500/30 
                         border border-red-500/30 rounded-lg transition-all duration-200
                         flex items-center justify-center space-x-2"
            >
              <span className="text-sm text-white">End Room</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="room-card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
          
          <div className="space-y-4">
            {/* Video Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video Quality
              </label>
              <select className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg 
                                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                                text-white">
                <option value="auto">Auto</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
              </select>
            </div>

            {/* Audio Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Voice Chat Volume
              </label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="50"
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Enable Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 
                                peer-focus:ring-primary/20 rounded-full peer 
                                peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                after:bg-white after:rounded-full after:h-5 after:w-5 
                                after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default RoomControls 