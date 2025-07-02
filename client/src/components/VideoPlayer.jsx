import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize } from 'lucide-react'

const VideoPlayer = ({ roomId, username, isHost, socket, roomState }) => {
  const [videoUrl, setVideoUrl] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const controlsTimeoutRef = useRef(null)

  // Helper to check if the video is a Google Drive embed
  const isGoogleDrive = videoUrl && videoUrl.includes('drive.google.com')

  // Update local state when room state changes
  useEffect(() => {
    if (roomState) {
      setVideoUrl(roomState.videoUrl || '')
      setIsPlaying(roomState.isPlaying || false)
      setCurrentTime(roomState.currentTime || 0)
    }
  }, [roomState])

  // Sync video element with state
  useEffect(() => {
    if (videoRef.current && !isGoogleDrive) {
      if (isPlaying) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying, isGoogleDrive])

  useEffect(() => {
    if (videoRef.current && !isGoogleDrive) {
      videoRef.current.currentTime = currentTime
    }
  }, [currentTime, isGoogleDrive])

  useEffect(() => {
    if (videoRef.current && !isGoogleDrive) {
      videoRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted, isGoogleDrive])

  const togglePlay = () => {
    if (isHost && socket) {
      const newPlayingState = !isPlaying
      setIsPlaying(newPlayingState)
      socket.emit(newPlayingState ? 'video-play' : 'video-pause', { roomId: roomId.toUpperCase() })
    }
  }

  const skipBackward = () => {
    if (isHost && socket) {
      const newTime = Math.max(0, currentTime - 10)
      setCurrentTime(newTime)
      socket.emit('video-seek', { roomId: roomId.toUpperCase(), time: newTime })
    }
  }

  const skipForward = () => {
    if (isHost && socket) {
      const newTime = Math.min(duration, currentTime + 10)
      setCurrentTime(newTime)
      socket.emit('video-seek', { roomId: roomId.toUpperCase(), time: newTime })
    }
  }

  const handleSeek = (e) => {
    if (!isHost || !socket) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    setCurrentTime(newTime)
    socket.emit('video-seek', { roomId: roomId.toUpperCase(), time: newTime })
  }

  const handleVideoUrlSubmit = (url) => {
    if (socket) {
      setVideoUrl(url)
      socket.emit('video-url-change', { roomId: roomId.toUpperCase(), url })
    }
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
            {isHost ? (
              <>
                <input
                  type="text"
                  placeholder="Paste Google Drive video URL or direct video link"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg \
                             focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent\
                             text-white placeholder-gray-400 backdrop-blur-sm mb-4"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      handleVideoUrlSubmit(e.target.value.trim())
                    }
                  }}
                />
                <p className="text-sm text-gray-400">
                  As the host, you can add a Google Drive video link or direct video URL
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">
                Waiting for the host to add a video...
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Video Player */}
      {videoUrl && isGoogleDrive && (
        <div className="relative w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-10">
              <div className="text-white">Loading video...</div>
            </div>
          )}
          <iframe
            src={getGoogleDriveEmbedUrl(videoUrl)}
            className="w-full h-full rounded-lg"
            allowFullScreen
            allow="autoplay; encrypted-media"
            title="Video Player"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      )}
      {videoUrl && !isGoogleDrive && (
        <div className="relative w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-10">
              <div className="text-white">Loading video...</div>
            </div>
          )}
          <video
            ref={videoRef}
            src={videoUrl}
            controls={false}
            className="w-full h-full rounded-lg"
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={(e) => {
              setIsLoading(false)
              setDuration(e.target.duration)
            }}
            onTimeUpdate={(e) => {
              if (!isHost) {
                setCurrentTime(e.target.currentTime)
              }
              // Host syncs time every 5 seconds
              if (isHost && socket) {
                const time = e.target.currentTime
                setCurrentTime(time)
                if (Math.floor(time) % 5 === 0) {
                  socket.emit('sync-time', { roomId: roomId.toUpperCase(), time })
                }
              }
            }}
            autoPlay={isPlaying}
          />
        </div>
      )}

      {/* Custom Controls: Only show if NOT Google Drive */}
      {videoUrl && !isGoogleDrive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls ? 1 : 0 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
        >
          {/* Host/Member Indicator */}
          <div className="text-center mb-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              isHost ? 'bg-yellow-500/20 text-yellow-300' : 'bg-blue-500/20 text-blue-300'
            }`}>
              {isHost ? 'Host' : 'Member'}
            </span>
          </div>
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