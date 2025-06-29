#!/bin/bash

echo "🎬 Movie Sync App Setup"
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Create environment files
echo "🔧 Creating environment files..."

# Client .env
if [ ! -f "client/.env" ]; then
    cp client/env.example client/.env
    echo "✅ Created client/.env"
else
    echo "⚠️  client/.env already exists"
fi

# Server .env
if [ ! -f "server/.env" ]; then
    cp server/env.example server/.env
    echo "✅ Created server/.env"
else
    echo "⚠️  server/.env already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit client/.env and server/.env with your configuration"
echo "2. Run 'npm run dev' to start both client and server"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "For production deployment:"
echo "- Frontend: Deploy to Vercel"
echo "- Backend: Deploy to Railway/Render"
echo ""
echo "Happy watching! 🍿" 