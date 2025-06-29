import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize } from 'lucide-react'
import { io } from 'socket.io-client'

const VideoPlayer = ({ roomId, username, isHost }) => {
  const [videoUrl, setVideoUrl] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const containerRef = useRef(null)
  const socketRef = useRef(null)
  const controlsTimeoutRef = useRef(null)

  // Helper to check if the video is a Google Drive embed
  const isGoogleDrive = videoUrl.includes('drive.google.com')

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001')
    
    socketRef.current.emit('join-room', { roomId, username, isHost })
    
    // Socket event listeners
    socketRef.current.on('video-play', () => {
      setIsPlaying(true)
    })
    
    socketRef.current.on('video-pause', () => {
      setIsPlaying(false)
    })
    
    socketRef.current.on('video-seek', (time) => {
      setCurrentTime(time)
    })
    
    socketRef.current.on('video-url-change', (url) => {
      setVideoUrl(url)
    })
    
    socketRef.current.on('sync-time', (time) => {
      setCurrentTime(time)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [roomId, username, isHost])

  const togglePlay = () => {
    if (isHost) {
      const newPlayingState = !isPlaying
      setIsPlaying(newPlayingState)
      socketRef.current?.emit(newPlayingState ? 'video-play' : 'video-pause', { roomId })
    }
  }

  const skipBackward = () => {
    if (isHost) {
      const newTime = Math.max(0, currentTime - 10)
      setCurrentTime(newTime)
      socketRef.current?.emit('video-seek', { roomId, time: newTime })
    }
  }

  const skipForward = () => {
    if (isHost) {
      const newTime = Math.min(duration, currentTime + 10)
      setCurrentTime(newTime)
      socketRef.current?.emit('video-seek', { roomId, time: newTime })
    }
  }

  const handleSeek = (e) => {
    if (!isHost) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    
    setCurrentTime(newTime)
    socketRef.current?.emit('video-seek', { roomId, time: newTime })
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getGoogleDriveEmbedUrl = (url) => {
    // Convert Google Drive sharing URL to embed URL
    const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`
    }
    return url
  }

  return (
    <motion.div
      ref={containerRef}
      className="video-container ambient-glow aspect-video"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video URL Input */}
      {!videoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="text-center p-8 glass-effect rounded-xl max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Add a Video</h3>
            <input
              type="text"
              placeholder="Paste Google Drive video URL"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         text-white placeholder-gray-400 backdrop-blur-sm mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  setVideoUrl(e.target.value)
                  socketRef.current?.emit('video-url-change', { roomId, url: e.target.value })
                }
              }}
            />
            <p className="text-sm text-gray-400">
              Paste a Google Drive video sharing link
            </p>
          </div>
        </motion.div>
      )}

      {/* Video Player */}
      {videoUrl && isGoogleDrive && (
        <iframe
          src={getGoogleDriveEmbedUrl(videoUrl)}
          className="w-full h-full rounded-lg"
          allowFullScreen
          allow="autoplay; encrypted-media"
          title="Video Player"
        />
      )}
      {videoUrl && !isGoogleDrive && (
        <video
          src={videoUrl}
          controls={false}
          className="w-full h-full rounded-lg"
        />
      )}

      {/* Custom Controls: Only show if NOT Google Drive */}
      {videoUrl && !isGoogleDrive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls ? 1 : 0 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
        >
          {/* Progress Bar */}
          <div 
            className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-4"
            onClick={handleSeek}
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                disabled={!isHost}
                className={`control-button ${!isHost ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={skipBackward}
                disabled={!isHost}
                className={`control-button ${!isHost ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <SkipBack className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={skipForward}
                disabled={!isHost}
                className={`control-button ${!isHost ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <SkipForward className="w-5 h-5" />
              </motion.button>

              <span className="text-white text-sm ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                  className="control-button"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </motion.button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                className="control-button"
              >
                <Maximize className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default VideoPlayer 