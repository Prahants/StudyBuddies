# 🎬 Movie Sync App

A real-time movie streaming application with synchronized playback and voice chat capabilities.

## ✨ Features

- 🎥 **Sync Playback**: Real-time synchronized video playback for multiple users
- 🔊 **Voice Chat**: Live voice communication between users
- 🎨 **Dark Theme**: Beautiful ambient glow effects like YouTube
- 🔗 **Google Drive Integration**: Stream movies directly from Google Drive
- 🌐 **Real-time Sync**: Socket.IO powered synchronization
- 📱 **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

```
/client (React + Vite)
  ├── /components
  │   ├── VideoPlayer.jsx
  │   ├── VoiceChat.jsx
  │   ├── RoomControls.jsx
  │   └── AmbientBackground.jsx
  ├── /pages
  │   ├── Home.jsx
  │   └── Room.jsx
  ├── /styles
  │   └── globals.css
  ├── App.jsx
  └── main.jsx

/server (Node.js + Express + Socket.IO)
  ├── server.js
  ├── /routes
  └── /socket
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd movie-sync-app
npm run install:all
```

2. **Set up environment variables:**
```bash
# Create .env files in both client and server directories
cp client/.env.example client/.env
cp server/.env.example server/.env
```

3. **Start development servers:**
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🎯 Usage

1. **Create/Join Room**: Enter a room code to start or join a session
2. **Add Movie**: Paste a Google Drive video link
3. **Sync Controls**: Use the shared controls to play/pause/skip
4. **Voice Chat**: Enable microphone for live voice communication

## 🛠️ Tech Stack

| Frontend | Backend | Communication | Hosting |
|----------|---------|---------------|---------|
| React 18 | Node.js | Socket.IO | Vercel |
| Vite | Express.js | WebRTC | Railway |
| TailwindCSS | CORS | PeerJS | |
| Framer Motion | | | |

## 🔧 Configuration

### Environment Variables

**Client (.env):**
```env
VITE_SERVER_URL=http://localhost:3001
VITE_GOOGLE_API_KEY=your_google_api_key
```

**Server (.env):**
```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
GOOGLE_API_KEY=your_google_api_key
```

## 📦 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy to Vercel
```

### Backend (Railway/Render)
```bash
cd server
# Deploy to Railway or Render
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details 