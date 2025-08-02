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

<div align="center">

<table>
  <tr>
    <td align="center" style="padding: 40px; background: transparent;">
      <div style="
        display: inline-block;
        padding: 6px;
        background: linear-gradient(45deg, #ff6b6b, #ff8e53, #ff6b9d, #c44569, #f8b500, #e55039, #3c40c6, #05c46b);
        background-size: 300% 300%;
        animation: gradientShift 3s ease infinite;
        border-radius: 50%;
        box-shadow: 
          0 10px 30px rgba(255, 107, 107, 0.3),
          0 0 20px rgba(255, 142, 83, 0.2),
          inset 0 2px 4px rgba(255, 255, 255, 0.1);
        margin-bottom: 25px;
        transform: scale(1);
        transition: all 0.3s ease;
      ">
        <img 
          src="https://avatars.githubusercontent.com/u/157148580?s=400&u=e5114676a140e0ecdd7d169af1ad7c387cb36105&v=4" 
          width="140" 
          height="140" 
          style="
            border-radius: 50%;
            border: 5px solid #ffffff;
            object-fit: cover;
            display: block;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            filter: brightness(1.05) contrast(1.1);
          " 
          alt="Ritwika Banerjee Profile Picture"
        />
      </div>
      <h3 style="
        font-size: 24px;
        color: #2c3e50;
        margin: 15px 0 8px 0;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-shadow: 0 2px 8px rgba(44, 62, 80, 0.1);
      ">Ritwika Banerjee</h3>
      <p style="
        color: #7f8c8d; 
        font-size: 16px; 
        margin: 8px 0 20px 0;
        font-style: italic;
        font-weight: 500;
      ">Frontend Developer & Idea Creator</p>
      <a href="https://github.com/RitwikaaBanerjee" style="
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
        padding: 12px 30px;
        border-radius: 25px;
        background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        border: none;
        box-shadow: 
          0 8px 20px rgba(255, 107, 107, 0.3),
          0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        display: inline-block;
        transform: translateY(0);
      " 
      onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 25px rgba(255, 107, 107, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15)';"
      onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px rgba(255, 107, 107, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)';">
        @RitwikaaBanerjee
      </a>
    </td>
    <td align="center" style="padding: 40px; background: transparent;">
      <div style="
        display: inline-block;
        padding: 6px;
        background: linear-gradient(45deg, #25d366, #128c7e, #075e54, #34b7f1, #00d4aa, #26c6da, #00acc1, #0097a7);
        background-size: 300% 300%;
        animation: gradientShift 3s ease infinite;
        border-radius: 50%;
        box-shadow: 
          0 10px 30px rgba(37, 211, 102, 0.3),
          0 0 20px rgba(18, 140, 126, 0.2),
          inset 0 2px 4px rgba(255, 255, 255, 0.1);
        margin-bottom: 25px;
        transform: scale(1);
        transition: all 0.3s ease;
      ">
        <img 
          src="https://avatars.githubusercontent.com/u/114816986?s=400&u=975fea81731428cab862c28db7a1d2815568cfce&v=4" 
          width="140" 
          height="140" 
          style="
            border-radius: 50%;
            border: 5px solid #ffffff;
            object-fit: cover;
            display: block;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            filter: brightness(1.05) contrast(1.1);
          " 
          alt="Prashant Kumar Profile Picture"
        />
      </div>
      <h3 style="
        font-size: 24px;
        color: #2c3e50;
        margin: 15px 0 8px 0;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-shadow: 0 2px 8px rgba(44, 62, 80, 0.1);
      ">Prashant Kumar</h3>
      <p style="
        color: #7f8c8d; 
        font-size: 16px; 
        margin: 8px 0 20px 0;
        font-style: italic;
        font-weight: 500;
      ">AI Integration & Backend Developer</p>
      <a href="https://github.com/prahants" style="
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
        padding: 12px 30px;
        border-radius: 25px;
        background: linear-gradient(135deg, #25d366, #128c7e);
        border: none;
        box-shadow: 
          0 8px 20px rgba(37, 211, 102, 0.3),
          0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        display: inline-block;
        transform: translateY(0);
      "
      onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 25px rgba(37, 211, 102, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15)';"
      onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px rgba(37, 211, 102, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)';">
        @prahants
      </a>
    </td>
  </tr>
</table>

<style>
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.team-card:hover .profile-border {
  transform: scale(1.05);
  box-shadow: 
    0 15px 35px rgba(255, 107, 107, 0.4),
    0 0 25px rgba(255, 142, 83, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
}
</style>

</div>

## 🌟 About

StudyBuddies is designed to revolutionize group study sessions by combining the power of AI with real-time collaboration. Whether you're preparing for exams, working on group projects, or simply need help understanding complex topics, StudyBuddies provides an innovative learning environment where students can connect, collaborate, and get instant clarity on their doubts from AI.