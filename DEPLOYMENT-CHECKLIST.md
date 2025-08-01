# 🔍 StudyBuddies Deployment Error Checklist

## 🚨 Common Deployment Errors & Solutions

### **Backend Deployment Errors**

#### **1. Build Failures**
**Error**: `npm install` fails
**Solution**:
- Check `server/package.json` exists
- Verify all dependencies are listed
- Try: `cd server && npm install --production`

#### **2. Start Command Errors**
**Error**: `npm start` fails
**Solution**:
- Verify `server/package.json` has `"start": "node server.js"`
- Check `server.js` exists in server directory
- Test locally: `cd server && npm start`

#### **3. Environment Variable Issues**
**Error**: Server crashes due to missing env vars
**Solution**:
- Set these in Render dashboard:
  ```
  NODE_ENV=production
  PORT=10000
  CORS_ORIGIN=https://your-frontend-url.onrender.com
  GOOGLE_API_KEY=your_google_ai_key
  MONGO_URI=your_mongodb_connection (optional)
  PEER_HOST=your-backend-url.onrender.com
  PEER_PORT=443
  ```

#### **4. MongoDB Connection Errors**
**Error**: `MongoDB connection error`
**Solution**:
- MongoDB is optional - server will run without it
- If you want MongoDB, get free cluster from MongoDB Atlas
- Add connection string to `MONGO_URI` environment variable

#### **5. Google API Key Errors**
**Error**: `GoogleGenerativeAI` initialization fails
**Solution**:
- Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Add to `GOOGLE_API_KEY` environment variable
- Server will run without AI features if key is missing

### **Frontend Deployment Errors**

#### **1. Build Failures**
**Error**: `npm run build` fails
**Solution**:
- Check `client/package.json` exists
- Verify all dependencies are listed
- Try: `cd client && npm install && npm run build`

#### **2. Environment Variable Issues**
**Error**: Frontend can't connect to backend
**Solution**:
- Set `VITE_SERVER_URL` to your backend URL
- Format: `https://studybuddies-backend.onrender.com`
- No trailing slash

#### **3. CORS Errors**
**Error**: `CORS policy` errors in browser
**Solution**:
- Update backend `CORS_ORIGIN` to match frontend URL
- Include protocol: `https://studybuddies-frontend.onrender.com`

### **Connection Issues**

#### **1. Socket.IO Connection Fails**
**Error**: WebSocket connection errors
**Solution**:
- Verify backend URL in frontend environment
- Check that backend is running
- Ensure CORS is configured correctly

#### **2. API Endpoints Not Found**
**Error**: 404 errors for API calls
**Solution**:
- Check that backend is deployed and running
- Verify API routes are working
- Test health endpoint: `/health`

## 🔧 Debugging Steps

### **Step 1: Test Backend Locally**
```bash
cd server
npm install
npm start
```
Visit: `http://localhost:3001/health`

### **Step 2: Test Frontend Locally**
```bash
cd client
npm install
npm run dev
```
Visit: `http://localhost:5173`

### **Step 3: Check Render Logs**
1. Go to Render dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for error messages

### **Step 4: Test Environment Variables**
Use the test server:
```bash
cd server
node test-server.js
```

## 🚀 Quick Fix Commands

### **If Backend Won't Start**
```bash
# Check if server.js exists
ls server/server.js

# Test server locally
cd server && npm start

# Check package.json
cat server/package.json
```

### **If Frontend Won't Build**
```bash
# Check if client directory exists
ls client/

# Test build locally
cd client && npm run build

# Check package.json
cat client/package.json
```

### **If Environment Variables Are Wrong**
1. Go to Render dashboard
2. Click on your service
3. Go to "Environment" tab
4. Update variables:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `CORS_ORIGIN=https://your-frontend-url.onrender.com`

## 📞 Common Error Messages & Solutions

| Error Message | Solution |
|---------------|----------|
| `Cannot find module` | Check `package.json` and run `npm install` |
| `EADDRINUSE` | Change PORT environment variable |
| `CORS policy` | Update CORS_ORIGIN environment variable |
| `MongoDB connection` | Add MONGO_URI or remove MongoDB dependency |
| `GoogleGenerativeAI` | Add GOOGLE_API_KEY or remove AI features |
| `Build failed` | Check all dependencies in package.json |
| `Static site not found` | Verify build directory path |

## ✅ Pre-Deployment Checklist

- [ ] Backend builds locally: `cd server && npm start`
- [ ] Frontend builds locally: `cd client && npm run build`
- [ ] Environment variables are prepared
- [ ] Google API key is ready (optional)
- [ ] MongoDB connection string is ready (optional)
- [ ] GitHub repository is up to date

## 🆘 Still Having Issues?

1. **Check Render Logs**: Look for specific error messages
2. **Test Locally**: Make sure everything works on your machine
3. **Verify Environment Variables**: Ensure all required vars are set
4. **Check Dependencies**: Make sure all packages are in package.json
5. **Review Configuration**: Double-check render.yaml or manual settings

---

**Need more help?** Check the main `DEPLOYMENT.md` file for detailed instructions! 