# Here are your Instructions

This project now supports anonymous guest play by entering a player name.  When a user selects any quiz mode they will be prompted to type a name, which will be used for the session and inserted into the leaderboard.  The backend exposes a `/api/auth/guest` endpoint that creates or looks up a guest user record and returns a JWT token.  Spotify authentication remains available but is optional; entering a name will always authenticate the session as a guest.

