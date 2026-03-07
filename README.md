# 🎵 Music Genre Exploration and Quiz Bot

A production-ready full-stack web application for interactive music-based quiz games with AI-powered content generation, Spotify integration, and real-time leaderboards.

## 📋 Project Overview

This is an immersive music quiz platform featuring:
- **4 Interactive Game Modes**: Genre Guess, Artist Guess, Mood-Based Quiz, Timed Challenge
- **Spotify OAuth Authentication**: Secure login with optional guest play
- **AI-Powered Content**: Gemini 3 Flash generates dynamic quizzes, hints, and fun facts
- **Audio Playback**: Integrated Spotify preview audio with wave visualizer
- **User Dashboard**: Stats, charts, and genre accuracy tracking
- **Global Leaderboard**: Real-time ranking system with streaks
- **Deep Ocean Dark Theme**: "Abyssal Tech" design with bio-luminescent UI

---

## 🔧 Required VS Code Extensions

Before starting development, install these extensions for optimal productivity:

### Frontend Development
1. **ES7+ React/Redux/React-Native snippets**
   - ID: `dsznajder.es7-react-js-snippets`
   - Purpose: React code snippets and productivity
   - Install: Extensions → Search → Install

2. **Tailwind CSS IntelliSense**
   - ID: `bradlc.vscode-tailwindcss`
   - Purpose: Tailwind class autocompletion
   - Install: Extensions → Search → Install

3. **Prettier - Code formatter**
   - ID: `esbenp.prettier-vscode`
   - Purpose: Automatic code formatting
   - Install: Extensions → Search → Install

### Backend Development
4. **Python**
   - ID: `ms-python.python`
   - Purpose: Python language support and debugging
   - Install: Extensions → Search → Install

5. **Pylance**
   - ID: `ms-python.vscode-pylance`
   - Purpose: Advanced Python type checking
   - Install: Extensions → Search → Install

6. **FastAPI**
   - ID: `ms-python.vscode-flask`
   - Purpose: FastAPI snippet support
   - Install: Extensions → Search → Install

### General Development
7. **Git Graph**
   - ID: `mhutchie.git-graph`
   - Purpose: Visualize git history and branches
   - Install: Extensions → Search → Install

8. **Thunder Client**
   - ID: `rangav.vscode-thunder-client`
   - Purpose: API endpoint testing (replaces Postman)
   - Install: Extensions → Search → Install

### Batch Installation Command
Run this in your terminal to install all extensions at once:
```bash
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code --install-extension mhutchie.git-graph
code --install-extension rangav.vscode-thunder-client
```

---

## 📦 Installation & Setup Guide

### Prerequisites
Before starting, ensure you have:
- **Node.js** (v16 or higher) + npm or yarn
- **Python** (v3.9 or higher)
- **MongoDB** (MongoDB Atlas cloud or local instance)
- **Spotify Developer Account** (register at https://developer.spotify.com)
- **Google AI API Key** (free tier at https://ai.google.dev)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install all Python dependencies
pip install -r requirements.txt

# Create .env file in backend/ directory
# Copy and paste the following variables:
```

**Backend .env file template:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/musicquiz
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/callback
GEMINI_API_KEY=your_google_gemini_api_key_here
JWT_SECRET=create_a_secure_random_secret_key_here
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Step 2: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install
# or if using yarn:
yarn install

# Create .env file in frontend/ directory
# Copy and paste the following variables:
```

**Frontend .env file template:**
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/callback
```

---

## 🚀 Running the Application

### Start the Backend Server

```bash
# From backend/ directory (with virtual environment activated)
python server.py

# Expected output:
# Uvicorn running on http://127.0.0.1:8000
# Application startup complete

# Backend runs on: http://localhost:8000
# API documentation: http://localhost:8000/docs (Swagger UI)
# Alternative docs: http://localhost:8000/redoc
```

**Available Backend API Endpoints:**
```
Authentication:
POST   /api/auth/login          - Spotify OAuth login
GET    /api/auth/callback       - OAuth callback handler
POST   /api/auth/guest          - Guest authentication

Quiz Operations:
POST   /api/quiz/start          - Start a new quiz session
POST   /api/quiz/answer         - Submit quiz answer
GET    /api/quiz/session/{id}   - Get quiz session details

User & Leaderboard:
GET    /api/users/profile       - Get user profile and stats
GET    /api/leaderboard         - Get global leaderboard

Utilities:
GET    /health                  - Health check endpoint
```

### Start the Frontend Application

```bash
# From frontend/ directory
npm start
# or if using yarn:
yarn start

# Expected output:
# webpack compiled successfully
# http://localhost:3000 is now open in your browser

# Frontend runs on: http://localhost:3000
```

**Development Features Enabled:**
- ✨ Hot reload - See changes instantly
- 🔍 React Developer Tools support
- 🎨 Tailwind class intellisense
- 📊 Redux DevTools compatible
- 🔧 Prettier on save formatting

---

## 🛠️ Project Structure

```
musicquiz2-main/
│
├── backend/
│   ├── server.py               # FastAPI application entry point
│   ├── quiz_data.py            # Quiz generation & LLM integration
│   ├── seed_data.py            # Database seeding scripts
│   ├── requirements.txt         # Python package dependencies
│   └── __pycache__/            # Python cache (auto-generated)
│
├── frontend/
│   ├── src/
│   │   ├── App.js              # Main React app component
│   │   ├── App.css             # App-level styles
│   │   ├── index.js            # React DOM entry point
│   │   ├── index.css           # Global styles
│   │   │
│   │   ├── components/         # Reusable React components
│   │   │   ├── AudioPlayer.js  # Audio playback with visualizer
│   │   │   ├── MoodSelector.js # Mood selection component
│   │   │   ├── Navbar.js       # Navigation bar
│   │   │   ├── QuizQuestion.js # Quiz question display
│   │   │   └── ui/             # shadcn/ui component library
│   │   │       ├── accordion.jsx
│   │   │       ├── alert.jsx
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       ├── dialog.jsx
│   │   │       ├── input.jsx
│   │   │       ├── select.jsx
│   │   │       └── ... more components
│   │   │
│   │   ├── contexts/           # React Context for state management
│   │   │   ├── AuthContext.js  # Authentication state
│   │   │   ├── PlayerContext.js # Audio player state
│   │   │   └── QuizContext.js  # Quiz state
│   │   │
│   │   ├── pages/              # Full page components
│   │   │   ├── AuthCallback.js # Spotify OAuth callback
│   │   │   ├── Dashboard.js    # User dashboard
│   │   │   ├── EducationalQuiz.js
│   │   │   ├── Leaderboard.js  # Rankings page
│   │   │   ├── LandingPage.js  # Home page
│   │   │   ├── QuizGame.js     # Main quiz interface
│   │   │   └── QuizHub.js      # Mode selection page
│   │   │
│   │   ├── hooks/              # Custom React hooks
│   │   │   └── use-toast.js
│   │   │
│   │   └── lib/                # Utility functions
│   │       └── utils.js        # Helper utilities
│   │
│   ├── public/
│   │   └── index.html          # HTML entry point
│   ├── package.json            # NPM dependencies
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── craco.config.js         # Create React App config override
│   └── jsconfig.json           # JS path aliases
│
├── design_guidelines.json      # UI/UX design specifications
├── memory/ 
│   └── PRD.md                  # Product requirements document
├── test_reports/               # Test results
├── vercel.json                 # Vercel deployment config
└── README.md                   # This file
```

---

## ✅ Implementation Status

### ✨ Completed Features (Production Ready)

- Educational quiz has level selector: easy, moderate, difficult or hybrid.  Scoring now reflects level (10/15/20 points per correct answer, hybrid mixes levels).

- ✅ Spotify OAuth authentication system
- ✅ Guest player mode with name entry
- ✅ 4 game modes with full functionality
- ✅ AI-powered quiz generation using Gemini
- ✅ Chat-style quiz interface
- ✅ Audio player with waveform visualizer
- ✅ User dashboard with analytics charts
- ✅ Global leaderboard system
- ✅ Streak and score tracking
- ✅ MongoDB database integration
- ✅ JWT session management
- ✅ Responsive mobile UI
- ✅ Deep ocean dark theme (Abyssal Tech)
- ✅ CORS and security headers

### 🎯 TODO List - Next Features (Prioritized)

#### 🔴 **P1 - High Priority**
- [ ] **Daily Quiz Challenge** - New quiz every 24 hours with bonus points
- [ ] **Friends Challenge System** - Multiplayer mode to compete with friends
- [ ] **Spotify Top Tracks Integration** - Personalize quizzes based on user's top tracks
- [ ] **User Profile Settings** - Allow users to customize preferences and difficulty

#### 🟡 **P2 - Medium Priority**
- [ ] **Streak Badges & Visual Rewards** - Unlock achievements for maintaining streaks
- [ ] **Reverse Audio Challenge** - Identify songs by reversed audio clips
- [ ] **Lyrics Guessing Mode** - New game mode that shows song lyrics
- [ ] **Difficulty Level Selection** - Easy, Medium, Hard options per quiz
- [ ] **Quiz History & Statistics** - Track all past quizzes and performance

#### 🟢 **P3 - Low Priority**
- [ ] **Social Score Sharing** - Share results on social media
- [ ] **Achievement/Badge System** - Unlock badges for milestones
- [ ] **Sound Effects & Animations** - Polish audio and visual feedback
- [ ] **Light Theme Support** - Allow users to switch themes
- [ ] **Multi-language Support** - i18n for international users
- [ ] **Offline Mode** - Basic functionality without internet

---

## 🧪 Testing & Quality Assurance

### Running Backend Tests
```bash
cd backend
# (with venv activated)
pytest
```

### Running Frontend Tests
```bash
cd frontend
npm test
# or
yarn test
```

### Manual API Testing with Thunder Client
1. Open Thunder Client (VS Code sidebar)
2. Click "New Request"
3. Use examples from http://localhost:8000/docs
4. Test authentication, quiz, and leaderboard endpoints

**Example Test Scenarios:**
- Start a quiz session
- Submit an incorrect answer
- Submit a correct answer
- Check leaderboard updates
- Test guest mode authentication

---

## 🎨 Design System & Theming

### Theme: "Abyssal Tech"
An immersive deep ocean aesthetic combined with bio-luminescent UI elements

**Color Palette:**
```
Primary Background:   #041C1C (Deep Ocean Teal)
Primary Accent:       #22d3ee (Bio-luminescent Cyan)
Secondary Accent:     #a855f7 (Bio-luminescent Purple)
Destructive:          #ef4444 (Red for errors)
Text Primary:         #f1f5f9 (Light slate)
Text Secondary:       #cbd5e1 (Medium slate)
Border:              rgba(34, 211, 238, 0.2) (Cyan with transparency)
```

### UI Component Libraries
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Pre-built Radix UI components with Tailwind
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - React charting library for dashboards
- **Lucide React** - Beautiful SVG icon library

**Font Stack:**
```
Headings:    Space Grotesk (weights: 300, 500, 700)
Body:        DM Sans (weights: 400, 500, 700)
Mono:        JetBrains Mono (weights: 400, 700)
```

---

## 📱 Browser & Device Support

| Platform | Browser | Min Version | Status |
|----------|---------|-------------|--------|
| Desktop | Chrome | Latest 2 versions | ✅ Full Support |
| Desktop | Firefox | Latest 2 versions | ✅ Full Support |
| Desktop | Safari | Latest 2 versions | ✅ Full Support |
| Desktop | Edge | Latest 2 versions | ✅ Full Support |
| Mobile | Safari | iOS 12+ | ✅ Full Support |
| Mobile | Chrome | Latest | ✅ Full Support |
| Tablet | All | Latest | ✅ Full Support |

---

## 🔐 Authentication & Security

### Authentication Flow 1: Spotify OAuth
```
1. User clicks "Login with Spotify"
   ↓
2. Redirects to Spotify authorization page
   ↓
3. User grants permissions
   ↓
4. Spotify redirects to callback URL with authorization code
   ↓
5. Backend exchanges code for access token
   ↓
6. Backend creates JWT token and stores user in MongoDB
   ↓
7. Frontend stores JWT in secure context
   ↓
8. User can access protected routes and features
```

### Authentication Flow 2: Guest Mode
```
1. User enters a username/player name
   ↓
2. Frontend sends name to /api/auth/guest endpoint
   ↓
3. Backend creates guest user in MongoDB
   ↓
4. Backend returns JWT token
   ↓
5. User can play all quiz modes
   ↓
6. Scores appear on leaderboard anonymously
```

---

## 🤝 Contributing Guidelines

### Creating a Feature Branch
```bash
# Create new feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Edit files, add new components, etc.

# Commit with descriptive message
git commit -m "Add feature description"
git commit -m "Fix bug: description"
git commit -m "Refactor: description"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub with description
```

### Code Style Guidelines
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use TypeScript/JSDoc for type safety
- Test your changes before committing

---

## 📝 Deployment Instructions

### Deploy Frontend to Vercel
```bash
# From frontend directory
cd frontend

# Build optimized production version
npm run build

# Login to Vercel and deploy
vercel deploy --prod

# Configure environment variables:
REACT_APP_API_URL=https://your-backend-url
REACT_APP_SPOTIFY_CLIENT_ID=your_id
REACT_APP_SPOTIFY_REDIRECT_URI=https://your-frontend-url/auth/callback
```

### Deploy Backend to Render/Railway/Heroku
```bash
# Push to your deployment platform
# In platform dashboard, set environment variables:
MONGODB_URI=your_production_mongodb_url
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
SPOTIFY_REDIRECT_URI=https://your-frontend-url/auth/callback
GEMINI_API_KEY=your_api_key
JWT_SECRET=production_secret_key
CORS_ORIGINS=https://your-frontend-url,https://your-backend-url
```

---

## 🐛 Troubleshooting Guide

### Backend Won't Start
**Error:** `Application startup failed`
**Solutions:**
1. Verify MongoDB URI in `.env` is correct
2. Check Python version: `python --version` (should be 3.9+)
3. Verify all dependencies: `pip install -r requirements.txt --upgrade`
4. Check if port 8000 is available: `netstat -an | grep 8000`

### Frontend Build Fails
**Error:** `Module not found` or `npm ERR!`
**Solutions:**
1. Remove node_modules: `rm -rf node_modules`
2. Clear npm cache: `npm cache clean --force`
3. Reinstall: `npm install`
4. Check Node version: `node --version` (should be v16+)

### Spotify OAuth Not Working
**Error:** `Invalid redirect URI` or `CORS error`
**Solutions:**
1. Verify Redirect URI in Spotify Developer Dashboard matches `.env`
2. Ensure `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are correct
3. Check `CORS_ORIGINS` in backend `.env` includes frontend URL
4. Check browser console for specific error messages

### Leaderboard Shows No Data
**Error:** Empty leaderboard or old scores not updating
**Solutions:**
1. Verify MongoDB connection in backend logs
2. Check browser console for API errors
3. Test endpoint: `GET http://localhost:8000/api/leaderboard`
4. Verify MongoDB database has quiz sessions collection
5. Check JWT token is being sent in requests

### Audio Player Not Working
**Error:** No audio plays or visualizer doesn't display
**Solutions:**
1. Check browser console for audio errors
2. Verify Spotify preview URL is valid
3. Check CORS headers allow audio loading
4. Test in another browser to isolate issue
5. Verify browser allows audio autoplay

---

## 📚 Additional Resources & Documentation

### Official Documentation
- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Official Guide](https://react.dev)
- [Tailwind CSS Reference](https://tailwindcss.com/docs)
- [Google Gemini AI Docs](https://ai.google.dev)
- [MongoDB Documentation](https://docs.mongodb.com)
- [shadcn/ui Component Library](https://ui.shadcn.com)

### Helpful Guides
- [MongoDB Atlas Setup Guide](https://docs.atlas.mongodb.com)
- [Spotify OAuth Flow](https://developer.spotify.com/documentation/general/guides/authorization/)
- [FastAPI with MongoDB](https://fastapi.tiangolo.com/deployment/concepts/)
- [React Context API](https://react.dev/reference/react/useContext)
- [Tailwind CSS with React](https://tailwindcss.com/docs/guides/create-react-app)

---

## 📊 Database Schema Overview

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String (optional for guests),
  spotify_id: String (optional),
  guest_player: Boolean,
  total_score: Number,
  current_streak: Number,
  max_streak: Number,
  quizzes_played: Number,
  genre_accuracy: Object,
  created_at: Date,
  updated_at: Date
}
```

### Quiz Sessions Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  mode: String (genre/artist/mood/timed),
  difficulty: String (easy/medium/hard),
  score: Number,
  answers: Array,
  duration: Number,
  status: String (active/completed),
  created_at: Date
}
```

---

## 🎯 Performance Optimization Tips

- Enable caching for leaderboard queries
- Implement pagination for large result sets
- Use code splitting for frontend bundle
- Enable gzip compression on backend
- Optimize database indexes on frequently queried fields
- Use Redis for session caching (future enhancement)

---

## 📞 Support & Contact

- Open an issue on GitHub for bugs
- Check PRD.md for requirements details
- Review design_guidelines.json for UI specifications
- Check test_result.md for known issues

---

**Project Status:** Production Ready (MVP Complete)  
**Last Updated:** March 5, 2026  
**Version:** 1.0.0  
**License:** MIT  

Made with ❤️ for music lovers everywhere 🎵

