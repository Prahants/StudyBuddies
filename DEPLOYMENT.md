# 🚀 StudyBuddies Deployment Guide

This guide will help you deploy your StudyBuddies application to Render.

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be on GitHub
3. **Environment Variables**: Prepare your API keys and configuration

## 🔧 Environment Variables Setup

### Backend Environment Variables

You'll need to set these in your Render backend service:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `10000` |
| `CORS_ORIGIN` | Frontend URL | `https://your-frontend.onrender.com` |
| `GOOGLE_API_KEY` | Google AI API key | `your_google_ai_key` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `PEER_HOST` | PeerJS host | `your-backend.onrender.com` |
| `PEER_PORT` | PeerJS port | `443` |

### Frontend Environment Variables

Set these in your Render frontend service:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SERVER_URL` | Backend API URL | `https://your-backend.onrender.com` |
| `VITE_GOOGLE_API_KEY` | Google API key (optional) | `your_google_api_key` |

## 🚀 Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub** with the `render.yaml` file
2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

### Option 2: Manual Deployment

#### Backend Deployment

1. **Create Web Service**:
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Backend Service**:
   ```
   Name: studybuddies-backend
   Environment: Node
   Build Command: cd server && npm install
   Start Command: cd server && npm start
   ```

3. **Set Environment Variables** (see table above)

#### Frontend Deployment

1. **Create Static Site**:
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend Service**:
   ```
   Name: studybuddies-frontend
   Build Command: cd client && npm install && npm run build
   Publish Directory: client/dist
   ```

3. **Set Environment Variables** (see table above)

## 🔑 Required API Keys

### Google AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your backend environment variables as `GOOGLE_API_KEY`

### MongoDB (Optional)
1. Create a free MongoDB Atlas cluster
2. Get your connection string
3. Add it to your backend environment variables as `MONGO_URI`

## 🌐 Custom Domains

After deployment, you can add custom domains:

1. **Backend**: `api.yourdomain.com`
2. **Frontend**: `yourdomain.com`

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure build commands are correct
   - Verify environment variables are set

2. **CORS Errors**:
   - Make sure `CORS_ORIGIN` points to your frontend URL
   - Include protocol (https://)

3. **Socket.IO Issues**:
   - Verify WebSocket connections are enabled
   - Check that the backend URL is correct in frontend

4. **Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify API keys are valid

### Debug Commands

```bash
# Check backend logs
render logs studybuddies-backend

# Check frontend logs
render logs studybuddies-frontend

# View environment variables
render env ls studybuddies-backend
```

## 📊 Monitoring

- **Health Check**: Visit `https://your-backend.onrender.com/health`
- **Room Status**: Visit `https://your-backend.onrender.com/api/rooms`
- **Render Dashboard**: Monitor performance and logs

## 🔄 Updates

To update your deployment:

1. Push changes to GitHub
2. Render will automatically redeploy
3. Monitor the deployment logs for any issues

## 🆘 Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **GitHub Issues**: Create issues in your repository
- **Community**: Join Render's Discord community

---

**Happy Deploying! 🎉** 