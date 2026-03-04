# Music Genre Exploration and Quiz Bot - PRD

## Original Problem Statement
Build a production-ready full-stack web application called "Music Genre Exploration and Quiz Bot" - an interactive conversational web app that fetches music data from Spotify API, uses LLM for generating quizzes/hints/fun facts, allows users to play music-based quiz games, personalizes content based on mood and preferences, and tracks user scores and history.

## Architecture
- **Frontend**: React + TailwindCSS + shadcn/ui + Recharts + Framer Motion
- **Backend**: FastAPI (Python) + Motor (MongoDB async driver) + Spotipy + EmergentIntegrations (Gemini LLM)
- **Database**: MongoDB
- **Auth**: Spotify OAuth → JWT session tokens
- **LLM**: Gemini 3 Flash via EmergentIntegrations
- **Theme**: "Abyssal Tech" deep ocean teal dark theme

## User Personas
1. **Music Enthusiast** (16-35) - Wants to test knowledge across genres
2. **Casual Gamer** - Quick quiz sessions during breaks
3. **Competitive Player** - Chases leaderboard rank and streaks

## Core Requirements (Static)
- Spotify OAuth authentication
- 4 game modes: Genre Guess, Artist Guess, Mood-Based, Timed Challenge
- Chat-style quiz interface with AI-generated responses
- Audio playback of Spotify track previews
- User dashboard with stats, charts, genre accuracy
- Leaderboard system
- Score/streak tracking
- Rule-based personalization (difficulty, genre variety)

## What's Been Implemented (Feb 17, 2026)
### Backend
- [x] FastAPI server with all /api prefixed routes
- [x] Spotify OAuth flow (login redirect, callback, token exchange)
- [x] JWT token generation and validation
- [x] Spotify Client Credentials for track fetching by genre/mood
- [x] Gemini 3 Flash integration for quiz generation, hints, fun facts
- [x] Quiz endpoints: start (all 4 modes), answer, session retrieval
- [x] User profile and stats endpoints
- [x] Leaderboard endpoint
- [x] MongoDB: Users and QuizSessions collections
- [x] Genre accuracy tracking, streak system

### Frontend
- [x] Landing page with Spotify login and feature cards
- [x] Auth callback handler
- [x] Quiz Hub with 4 game mode selection cards
- [x] Quiz Game with chat-style interface (bot/user bubbles)
- [x] Audio player with play/pause/replay + wave visualizer
- [x] Mood selector for mood-based mode
- [x] Dashboard with bento grid stats + Recharts (Area + Bar charts)
- [x] Leaderboard page with rankings
- [x] Navbar with dropdown menu
- [x] Auth context + Player context providers
- [x] Protected routes with redirect
- [x] Deep ocean teal dark theme throughout
- [x] All data-testid attributes on interactive elements

## Prioritized Backlog
### P0 (Critical)
- None remaining for MVP

### P1 (High)
- Daily quiz mode
- Friends challenge system
- Spotify user top tracks integration for personalized quizzes

### P2 (Medium)
- Streak tracking with visual badges
- Reverse audio challenge
- Lyrics guessing mode
- Profile settings page with genre preferences

### P3 (Low)
- Social sharing of scores
- Achievement system
- Sound effects and animations polish

## Next Tasks
1. Add Spotify redirect URI to Spotify Developer Dashboard (user action)
2. Implement daily quiz challenge
3. Add profile settings/preferences page
4. Implement friends challenge mode
