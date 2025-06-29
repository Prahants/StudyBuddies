# 🚀 Deployment Guide

This guide covers deploying the Movie Sync App to both development and production environments.

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone <your-repo-url>
cd movie-sync-app

# Run the setup script
./setup.sh

# Start development servers
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🌐 Production Deployment

### Frontend (Vercel)

1. **Connect to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   # Build the client
   cd client
   npm run build
   
   # Deploy to Vercel
   vercel --prod
   ```

3. **Environment Variables**
   - Go to your Vercel dashboard
   - Add environment variable: `VITE_SERVER_URL` = your backend URL

### Backend (Railway/Render)

#### Option 1: Railway

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select the `server` directory

2. **Environment Variables**
   ```env
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

3. **Deploy**
   - Railway will automatically deploy on push to main branch

#### Option 2: Render

1. **Create Web Service**
   - Go to [Render](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository

2. **Configuration**
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: `server`

3. **Environment Variables**
   ```env
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

### Alternative: Heroku

1. **Create Heroku App**
   ```bash
   # Install Heroku CLI
   # Create app
   heroku create your-app-name
   
   # Set buildpacks
   heroku buildpacks:set heroku/nodejs
   ```

2. **Deploy**
   ```bash
   # Deploy to Heroku
   git subtree push --prefix server heroku main
   ```

3. **Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

## 🔧 Environment Configuration

### Frontend (.env)
```env
VITE_SERVER_URL=https://your-backend-domain.com
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.vercel.app
GOOGLE_API_KEY=your_google_api_key_here
```

## 🌍 Domain Configuration

### Custom Domain (Optional)

1. **Frontend (Vercel)**
   - Go to Vercel dashboard
   - Add custom domain
   - Configure DNS records

2. **Backend (Railway/Render)**
   - Use provided subdomain or add custom domain
   - Update CORS_ORIGIN in environment variables

## 🔒 Security Considerations

### Production Checklist
- [ ] Use HTTPS for all connections
- [ ] Set proper CORS origins
- [ ] Use environment variables for sensitive data
- [ ] Enable rate limiting (consider adding to server)
- [ ] Set up monitoring and logging

### Google Drive API (Optional)
For enhanced Google Drive integration:

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project
   - Enable Google Drive API

2. **Create API Key**
   - Go to APIs & Services > Credentials
   - Create API Key
   - Restrict to Google Drive API

3. **Add to Environment**
   ```env
   VITE_GOOGLE_API_KEY=your_api_key_here
   GOOGLE_API_KEY=your_api_key_here
   ```

## 📊 Monitoring

### Health Check
Your backend includes a health check endpoint:
```
GET https://your-backend-domain.com/health
```

### Room Information
```
GET https://your-backend-domain.com/api/rooms
GET https://your-backend-domain.com/api/rooms/:roomId
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CORS_ORIGIN is set correctly
   - Check that frontend URL matches exactly

2. **Socket.IO Connection Issues**
   - Verify server URL in frontend environment
   - Check that server is running and accessible

3. **Voice Chat Not Working**
   - Ensure PeerJS server is running
   - Check browser permissions for microphone

4. **Video Not Loading**
   - Verify Google Drive sharing settings
   - Check if video URL is accessible

### Debug Mode
Enable debug logging in development:
```env
NODE_ENV=development
DEBUG=socket.io:*
```

## 📈 Scaling Considerations

### For High Traffic
- Consider using Redis for Socket.IO adapter
- Implement room cleanup for inactive sessions
- Add rate limiting for API endpoints
- Use CDN for static assets

### Database Integration (Future)
For persistent rooms and user management:
- Add MongoDB/PostgreSQL
- Implement user authentication
- Store room history and preferences

## 🎯 Performance Optimization

### Frontend
- Enable Vite build optimization
- Use lazy loading for components
- Optimize bundle size

### Backend
- Enable compression
- Implement caching headers
- Use PM2 for process management

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review server logs
3. Test with minimal setup
4. Create issue in repository

---

**Happy Deploying! 🚀** 