// ✅ FINAL VERSION: React Video Player with Full Play/Pause Sync for YouTube

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const YOUTUBE_API_SRC = 'https://www.youtube.com/iframe_api'

const VideoPlayer = ({ roomId, username, isHost, socket, roomState }) => {
  const [videoUrl, setVideoUrl] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const youtubePlayerRef = useRef(null)
  const youtubePlayerReadyRef = useRef(false)

  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))

  useEffect(() => {
    if (roomState) {
      setVideoUrl(roomState.videoUrl || '')
      setIsPlaying(roomState.isPlaying || false)
      setCurrentTime(roomState.currentTime || 0)
    }
  }, [roomState])

  const getYouTubeVideoId = (url) => {
    if (url.includes('youtube.com/watch')) {
      return url.match(/[?&]v=([^&]+)/)?.[1]
    } else if (url.includes('youtu.be/')) {
      return url.match(/youtu\.be\/([^?]+)/)?.[1]
    } else if (url.includes('youtube.com/embed/')) {
      return url.match(/embed\/([^?]+)/)?.[1]
    }
    return null
  }

  // Load YouTube API script
  useEffect(() => {
    if (!isYouTube) return
    if (window.YT && window.YT.Player) return
    const tag = document.createElement('script')
    tag.src = YOUTUBE_API_SRC
    tag.id = 'youtube-iframe-api'
    document.body.appendChild(tag)
    return () => {
      const existing = document.getElementById('youtube-iframe-api')
      if (existing) existing.remove()
    }
  }, [isYouTube])

  useEffect(() => {
    if (!isYouTube) return

    function createPlayer() {
      const videoId = getYouTubeVideoId(videoUrl)
      if (!videoId) return
      if (youtubePlayerRef.current) youtubePlayerRef.current.destroy()

      youtubePlayerRef.current = new window.YT.Player('youtube-player', {
        videoId,
        playerVars: { autoplay: 0, rel: 0, modestbranding: 1 },
        events: {
          onReady: (event) => {
            youtubePlayerReadyRef.current = true
            setDuration(event.target.getDuration())
            if (!isHost) {
              event.target.seekTo(currentTime, true)
              isPlaying ? event.target.playVideo() : event.target.pauseVideo()
            }
          },
          onStateChange: (event) => {
            if (!isHost) return
            const time = youtubePlayerRef.current.getCurrentTime()

            if (event.data === window.YT.PlayerState.PLAYING) {
              socket.emit('video-play', { roomId: roomId.toUpperCase(), time })
              setIsPlaying(true)
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              socket.emit('video-pause', { roomId: roomId.toUpperCase(), time })
              setIsPlaying(false)
            }
          }
        }
      })
    }

    if (window.YT && window.YT.Player) createPlayer()
    else window.onYouTubeIframeAPIReady = createPlayer

    return () => {
      if (youtubePlayerRef.current) youtubePlayerRef.current.destroy()
    }
  }, [videoUrl, isYouTube])

  useEffect(() => {
    if (!isYouTube || isHost || !socket) return

    const handlePlay = ({ time }) => {
      youtubePlayerRef.current?.seekTo(time, true)
      youtubePlayerRef.current?.playVideo()
    }

    const handlePause = ({ time }) => {
      youtubePlayerRef.current?.seekTo(time, true)
      setTimeout(() => youtubePlayerRef.current?.pauseVideo(), 200)
    }

    const handleSeek = ({ time }) => {
      youtubePlayerRef.current?.seekTo(time, true)
    }

    socket.on('video-play', handlePlay)
    socket.on('video-pause', handlePause)
    socket.on('video-seek', handleSeek)

    return () => {
      socket.off('video-play', handlePlay)
      socket.off('video-pause', handlePause)
      socket.off('video-seek', handleSeek)
    }
  }, [socket, isYouTube, isHost])

  const togglePlay = () => {
    if (!isHost || !youtubePlayerRef.current) return
    if (isPlaying) {
      youtubePlayerRef.current.pauseVideo()
    } else {
      youtubePlayerRef.current.playVideo()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="video-container ambient-glow aspect-video relative overflow-hidden"
    >
      {/* Video URL Input (Host only, if no video) */}
      {!videoUrl && isHost && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="glass-effect p-8 rounded-xl max-w-md w-full text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Add a YouTube Video</h3>
            <input
              type="text"
              placeholder="Paste YouTube URL"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setVideoUrl(e.target.value)
                  socket.emit('video-url-change', { roomId: roomId.toUpperCase(), url: e.target.value })
                }
              }}
            />
            <p className="text-sm text-gray-400">As the host, you can add a YouTube video URL</p>
          </div>
        </div>
      )}

      {/* YouTube Player */}
      {isYouTube && <div id="youtube-player" className="w-full h-full rounded-lg" />}
    </motion.div>
  )
}

export default VideoPlayer
