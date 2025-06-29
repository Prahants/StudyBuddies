import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react'
import { io } from 'socket.io-client'
import Peer from 'peerjs'

const VoiceChat = ({ roomId, username, isOpen, onToggle }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [peers, setPeers] = useState([])
  const [localStream, setLocalStream] = useState(null)
  
  const peerRef = useRef(null)
  const socketRef = useRef(null)
  const localAudioRef = useRef(null)
  const remoteAudioRefs = useRef({})

  useEffect(() => {
    if (!isOpen) return

    // Initialize Socket.IO
    socketRef.current = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001')
    
    // Initialize PeerJS
    peerRef.current = new Peer(`${username}-${roomId}`, {
      host: 'localhost',
      port: 9000,
      path: '/peerjs'
    })

    // Socket event listeners
    socketRef.current.on('user-joined', ({ userId, username: peerUsername }) => {
      console.log(`${peerUsername} joined the voice chat`)
      callPeer(userId, peerUsername)
    })

    socketRef.current.on('user-left', ({ userId }) => {
      console.log(`User ${userId} left the voice chat`)
      disconnectPeer(userId)
    })

    socketRef.current.on('voice-signal', ({ from, signal }) => {
      if (peerRef.current) {
        peerRef.current.signal(signal)
      }
    })

    // PeerJS event listeners
    peerRef.current.on('open', (id) => {
      console.log('Voice chat peer opened:', id)
      socketRef.current.emit('join-voice', { roomId, userId: id, username })
    })

    peerRef.current.on('call', (call) => {
      console.log('Receiving call from:', call.peer)
      
      call.answer(localStream)
      
      call.on('stream', (remoteStream) => {
        const audio = new Audio()
        audio.srcObject = remoteStream
        audio.autoplay = true
        remoteAudioRefs.current[call.peer] = audio
      })
    })

    // Get user media
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        setLocalStream(stream)
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream
        }
      })
      .catch((err) => {
        console.error('Error accessing microphone:', err)
      })

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      if (peerRef.current) {
        peerRef.current.destroy()
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [isOpen, roomId, username])

  const callPeer = (peerId, peerUsername) => {
    if (!localStream || !peerRef.current) return

    const call = peerRef.current.call(peerId, localStream)
    
    call.on('stream', (remoteStream) => {
      const audio = new Audio()
      audio.srcObject = remoteStream
      audio.autoplay = true
      remoteAudioRefs.current[peerId] = audio
      
      setPeers(prev => [...prev, { id: peerId, username: peerUsername }])
    })

    call.on('close', () => {
      disconnectPeer(peerId)
    })
  }

  const disconnectPeer = (peerId) => {
    if (remoteAudioRefs.current[peerId]) {
      remoteAudioRefs.current[peerId].pause()
      delete remoteAudioRefs.current[peerId]
    }
    
    setPeers(prev => prev.filter(peer => peer.id !== peerId))
  }

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleDeafen = () => {
    setIsDeafened(!isDeafened)
    
    // Mute all remote audio
    Object.values(remoteAudioRefs.current).forEach(audio => {
      audio.muted = !isDeafened
    })
  }

  const toggleVoiceChat = () => {
    if (isConnected) {
      // Disconnect
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      if (peerRef.current) {
        peerRef.current.destroy()
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      setIsConnected(false)
      setPeers([])
    } else {
      // Connect
      setIsConnected(true)
    }
    onToggle()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="room-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Mic className="w-5 h-5 mr-2" />
              Voice Chat
            </h3>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleVoiceChat}
              className={`control-button ${isConnected ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'}`}
            >
              {isConnected ? <Phone className="w-4 h-4" /> : <PhoneOff className="w-4 h-4" />}
            </motion.button>
          </div>

          {isConnected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Local Audio Controls */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white">{username} (You)</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMute}
                    className={`control-button ${isMuted ? 'bg-red-500/20 border-red-500/30' : ''}`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleDeafen}
                    className={`control-button ${isDeafened ? 'bg-red-500/20 border-red-500/30' : ''}`}
                    title={isDeafened ? 'Undeafen' : 'Deafen'}
                  >
                    {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>

              {/* Connected Peers */}
              {peers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Connected ({peers.length})</h4>
                  <div className="space-y-2">
                    {peers.map((peer) => (
                      <motion.div
                        key={peer.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-white">{peer.username}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* No peers connected */}
              {peers.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">No one else is connected</p>
                  <p className="text-xs text-gray-500 mt-1">Share the room code to invite friends</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Hidden audio element for local stream */}
          <audio ref={localAudioRef} autoPlay muted />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default VoiceChat 