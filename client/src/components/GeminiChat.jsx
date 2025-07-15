import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client'; // Enable real-time updates

const GeminiChat = ({ roomId, username }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]); // File objects
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const fileInputRef = useRef();
  const chatEndRef = useRef();
  const socketRef = useRef();

  // Setup socket connection for real-time Gemini chat
  useEffect(() => {
    // Connect to the server (explicit URL for debugging)
    socketRef.current = io('http://localhost:3001');
    console.log('Connecting to socket server at http://localhost:3001');
    // Join the room for Gemini chat updates
    socketRef.current.emit('join-room', { roomId, username, isHost: false });
    console.log('Emitted join-room for', roomId, username);

    // Listen for Gemini chat messages
    socketRef.current.on('gemini-message', (newMessages) => {
      console.log('Received gemini-message:', newMessages);
      setMessages((prev) => [...prev, ...newMessages]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, username]);

  // Fetch chat history
  useEffect(() => {
    axios.get(`/api/gemini/${roomId}`).then(res => setMessages(res.data));
  }, [roomId]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle file selection
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setUploading(true);
    const uploaded = [];
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploaded.push({ name: file.name, url: res.data.url, type: file.type });
      } catch (err) {
        // Optionally show error
      }
    }
    setFiles(prev => [...prev, ...uploaded]);
    setUploading(false);
    fileInputRef.current.value = '';
  };

  // Send prompt to Gemini
  const sendPrompt = async () => {
    if (!prompt.trim() && files.length === 0) return;
    
    // Clear previous errors
    setError('');
    setIsRateLimited(false);
    
    const fileUrls = files.map(f => f.url);
    const currentPrompt = prompt;
    const currentFiles = [...files];
    
    // Show user message instantly
    setMessages(prev => [
      ...prev,
      { username, message: currentPrompt, role: 'user', files: fileUrls },
    ]);
    setPrompt('');
    setFiles([]);
    
    try {
      console.log('Sending prompt to Gemini...', { roomId, username, prompt: currentPrompt, files: fileUrls });
      const res = await axios.post('/api/gemini', { roomId, username, prompt: currentPrompt, files: fileUrls });
      setMessages(prev => [
        ...prev,
        { 
          username: 'Gemini AI', 
          message: res.data.reply, 
          role: 'gemini', 
          files: [],
          isFallback: res.data.isFallback 
        },
      ]);
      
      // Show fallback warning if applicable
      if (res.data.isFallback) {
        setError('Daily API limit reached. Using fallback response. Please try again tomorrow.');
        setTimeout(() => setError(''), 5000); // Clear after 5 seconds
      }
      // TODO: Listen for real-time updates via Socket.IO
    } catch (err) {
      console.error('❌ Gemini request failed:', err.response?.data || err.message);
      
      // Handle rate limiting
      if (err.response?.status === 429) {
        setIsRateLimited(true);
        const retryAfter = err.response.data.retryAfter || 60;
        setError(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
        
        // Auto-clear rate limit after retry time
        setTimeout(() => {
          setIsRateLimited(false);
          setError('');
        }, retryAfter * 1000);
      } else {
        setError(err.response?.data?.error || 'Failed to get response from Gemini. Please try again.');
      }
      
      // Remove the user message since it failed
      setMessages(prev => prev.slice(0, -1));
      // Restore the prompt and files
      setPrompt(currentPrompt);
      setFiles(currentFiles);
    }
  };

  // File preview (PDF/image)
  const renderFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return <img src={file.url} alt={file.name} className="max-h-24 rounded shadow" />;
    }
    if (file.type === 'application/pdf') {
      return <a href={file.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-300">{file.name}</a>;
    }
    return <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>;
  };

  return (
    <div className="room-card p-4 flex flex-col h-80 max-h-96 mt-0 bg-black/30 border border-white/10 text-white">
      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <span className="inline-flex items-center"><span className="bg-primary/20 rounded-full p-1 mr-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l1.41-1.41M6.34 6.34L4.93 4.93" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>Gemini AI Assistant</span>
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 bg-black/20 rounded p-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`text-sm ${msg.role === 'gemini' ? 'bg-primary/10 text-primary-200' : 'bg-white/10 text-white'} rounded-lg p-2 ${msg.isFallback ? 'border-l-4 border-orange-400' : ''}`}> 
            <span className="font-bold text-blue-300">{msg.username}</span>
            {msg.isFallback && <span className="text-xs text-orange-300 ml-2">(Fallback)</span>}
            <div className="text-white break-words">{msg.message}</div>
            {msg.files && msg.files.length > 0 && (
              <div className="flex gap-2 mt-1 flex-wrap">
                {msg.files.map((fileUrl, i) => (
                  <a key={i} href={fileUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-300">File {i + 1}</a>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      
      {/* Error display */}
      {error && (
        <div className="mb-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      {/* File preview before sending */}
      {files.length > 0 && (
        <div className="px-2 pb-2 flex gap-2 flex-wrap">
          {files.map((file, i) => (
            <div key={i} className="flex flex-col items-center">
              {renderFilePreview(file)}
              <span className="text-xs text-white/70 mt-1">{file.name}</span>
            </div>
          ))}
        </div>
      )}
      <div className="relative w-full mt-2">
        <div className="flex items-center space-x-2 overflow-hidden">
          <input
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendPrompt()}
            placeholder="Ask Gemini something..."
            className="flex-1 px-3 py-2 rounded bg-black/30 text-white focus:outline-none min-w-0 border border-white/10"
            disabled={uploading}
          />
          <input
            type="file"
            accept="image/*,application/pdf"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="control-button flex-shrink-0"
            disabled={uploading}
            title="Attach file"
          >
            {uploading ? 'Uploading...' : 'Attach'}
          </button>
          <button
            onClick={sendPrompt}
            className="control-button flex-shrink-0"
            disabled={uploading || (!prompt.trim() && files.length === 0) || isRateLimited}
          >
            {isRateLimited ? 'Rate Limited' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiChat; 