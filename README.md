# 🎓 StudyBuddies

An AI-enhanced group study application that integrates Gemini AI to provide real-time academic assistance within collaborative study rooms. Students can chat, upload PDFs or images, and ask questions to Gemini, which responds instantly using Google's Generative AI.

## ✨ Features

- 🤖 **Gemini AI Integration**: Real-time academic assistance with Google's Generative AI
- 📚 **File Upload & Preview**: Upload PDFs and images for AI analysis
- 💬 **Real-time Chat**: Socket.IO powered messaging with typing indicators
- 🎥 **Video Collaboration**: Synchronized video playback for study sessions
- 🔊 **Voice Chat**: Live voice communication between study partners
- 🎨 **Modern UI**: Beautiful ambient glow effects and responsive design
- 📱 **Cross-platform**: Works seamlessly on desktop and mobile devices
- 💾 **Data Persistence**: MongoDB storage with local storage fallback

## 🏗️ Architecture

```
/client (React + Vite)
  ├── /components
  │   ├── Chat.jsx
  │   ├── GeminiChat.jsx
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
  ├── /models
  └── /uploads
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB (for production)
- Google AI API key (for Gemini integration)

### Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/Prahants/StudyBuddies.git
cd StudyBuddies
npm run install:all
```

2. **Set up environment variables:**
```bash
# Create .env files in both client and server directories
cp client/.env.example client/.env
cp server/.env.example server/.env
```

3. **Configure your environment variables:**
   - Add your Google AI API key for Gemini integration
   - Configure MongoDB connection (optional for production)

4. **Start development servers:**
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🎯 Usage

1. **Create/Join Study Room**: Enter a room code to start or join a study session
2. **Chat with AI**: Ask Gemini AI questions about your study materials
3. **Upload Files**: Share PDFs or images for AI analysis
4. **Collaborate**: Use real-time chat and voice features
5. **Video Sync**: Watch educational videos together with synchronized playback

## 🛠️ Tech Stack

| Frontend | Backend | AI & Communication | Database |
|----------|---------|-------------------|----------|
| React 18 | Node.js | Gemini AI | MongoDB |
| Vite | Express.js | Socket.IO | Local Storage |
| TailwindCSS | CORS | WebRTC | |
| Framer Motion | | | |

## 🔧 Configuration

### Environment Variables

**Client (.env):**
```env
VITE_SERVER_URL=http://localhost:3001
VITE_GOOGLE_API_KEY=your_google_ai_api_key
```

**Server (.env):**
```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
GOOGLE_API_KEY=your_google_ai_api_key
MONGODB_URI=your_mongodb_connection_string
```

## 🤖 AI Features

### Gemini Integration
- **Real-time Q&A**: Ask questions and get instant responses from Google's Generative AI
- **File Analysis**: Upload PDFs and images for AI-powered analysis
- **Contextual Responses**: AI maintains context throughout your study session
- **Academic Focus**: Optimized for educational content and explanations

### Smart Features
- **Typing Indicators**: See when others are typing
- **Message History**: Persistent chat history with MongoDB storage
- **File Previews**: View uploaded documents before AI analysis
- **Fallback Storage**: Local storage ensures functionality during downtime

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

## 🎓 Study Session Features

- **Collaborative Learning**: Multiple students can join study rooms
- **AI-Powered Assistance**: Get help with complex topics instantly
- **File Sharing**: Upload study materials for group analysis
- **Real-time Communication**: Voice and text chat for seamless collaboration
- **Video Synchronization**: Watch educational content together

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

<table>
  <tr>
    <td align="center" style="padding: 20px;">
      <div style="
        width: 130px;
        height: 130px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        margin-bottom: 15px;
      ">
        <img 
          src="https://raw.githubusercontent.com/prahants/StudyBuddies/main/client/public/assets/ritwika.png" 
          alt="Ritwika Banerjee"
          style="
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #fff;
          "
        />
      </div>
      <b style="font-size: 18px;">Ritwika Banerjee</b><br/>
      <sub>Frontend Developer & Idea Creator</sub><br/>
      <a href="https://github.com/RitwikaaBanerjee">@RitwikaaBanerjee</a>
    </td>
    
    <td align="center" style="padding: 20px;">
      <div style="
        width: 130px;
        height: 130px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
        margin-bottom: 15px;
      ">
        <img 
          src="https://raw.githubusercontent.com/prahants/StudyBuddies/main/client/public/assets/prashant.png" 
          alt="Prashant Kumar"
          style="
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #fff;
          "
        />
      </div>
      <b style="font-size: 18px;">Prashant Kumar</b><br/>
      <sub>AI Integration & Backend Developer</sub><br/>
      <a href="https://github.com/prahants">@prahants</a>
    </td>
  </tr>
</table>

## 🌟 About

StudyBuddies is designed to revolutionize group study sessions by combining the power of AI with real-time collaboration. Whether you're preparing for exams, working on group projects, or simply need help understanding complex topics, StudyBuddies provides an innovative learning environment where students can connect, collaborate, and get instant clarity on their doubts from AI. 