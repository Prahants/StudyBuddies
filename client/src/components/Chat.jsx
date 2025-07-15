import { useState, useEffect, useRef } from 'react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

const Chat = ({ roomId, username, socket }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!socket) return
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg])
    }
    socket.on('chat-message', handleMessage)
    return () => {
      socket.off('chat-message', handleMessage)
    }
  }, [socket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'nearest' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    const msg = {
      roomId,
      username,
      message: input,
      timestamp: new Date().toISOString()
    }
    socket.emit('chat-message', msg)
    setInput('')
    setShowEmoji(false)
  }

  const handleEmojiSelect = (emoji) => {
    setInput(input + emoji.native)
  }

  return (
    <div className="room-card p-4 flex flex-col h-80 max-h-96">
      <h3 className="text-lg font-semibold text-white mb-2">Chat</h3>
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 bg-black/10 rounded p-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="text-sm">
            <span className="font-bold text-blue-300">{msg.username}</span>
            <span className="text-gray-400 text-xs ml-2">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            <div className="text-white break-words">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="relative w-full">
        <div className="flex items-center space-x-2 overflow-hidden">
          <button
            className="control-button flex-shrink-0"
            onClick={() => setShowEmoji((v) => !v)}
            title="Add emoji"
          >
            😊
          </button>
          <input
            className="flex-1 px-3 py-2 rounded bg-white/10 text-white focus:outline-none min-w-0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
            placeholder="Type a message..."
          />
          <button
            className="control-button flex-shrink-0"
            onClick={sendMessage}
            disabled={!input.trim()}
          >
            Send
          </button>
        </div>
        {showEmoji && (
          <div className="absolute left-0 bottom-full mb-2 z-50">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="dark" previewPosition="none" />
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat 