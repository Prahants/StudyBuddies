const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    cors_origin: process.env.CORS_ORIGIN || 'not set',
    google_api_key: process.env.GOOGLE_API_KEY ? 'set' : 'not set',
    mongo_uri: process.env.MONGO_URI ? 'set' : 'not set'
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log('🔐 Environment variables:');
  console.log('  - NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('  - PORT:', process.env.PORT || 'not set');
  console.log('  - CORS_ORIGIN:', process.env.CORS_ORIGIN || 'not set');
  console.log('  - GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? 'set' : 'not set');
  console.log('  - MONGO_URI:', process.env.MONGO_URI ? 'set' : 'not set');
}); 