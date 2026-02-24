from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import jwt as pyjwt
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials, SpotifyOAuth
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from pathlib import Path
import random
import requests
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'musicquiz')]

# Config
SPOTIFY_CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID', 'dummy_spotify_id')
SPOTIFY_CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET', 'dummy_spotify_secret')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'dummy_gemini_key')
LLM_API_KEY = GEMINI_API_KEY
JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback_secret')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

# Spotify OAuth
#SPOTIFY_REDIRECT_URI = os.environ.get('SPOTIPY_REDIRECT_URI', f"{FRONTEND_URL}/callback")
SPOTIFY_REDIRECT_URI = "http://127.0.0.1:8888/callback"
SPOTIFY_SCOPES = "user-read-private user-read-email user-top-read"

print("SPOTIFY REDIRECT URI =", SPOTIFY_REDIRECT_URI)
sp_oauth = SpotifyOAuth(
    client_id=SPOTIFY_CLIENT_ID,
    client_secret=SPOTIFY_CLIENT_SECRET,
    redirect_uri=SPOTIFY_REDIRECT_URI,
    scope=SPOTIFY_SCOPES
)

# Spotify client credentials for general API access
sp_client = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=SPOTIFY_CLIENT_ID,
    client_secret=SPOTIFY_CLIENT_SECRET
))

# Gemini LLM
import google.generativeai as genai

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Pydantic Models ---
class SpotifyCallbackRequest(BaseModel):
    code: str

class QuizStartRequest(BaseModel):
    mode: str
    mood: Optional[str] = None
    difficulty: Optional[str] = "medium"

class QuizAnswerRequest(BaseModel):
    session_id: str
    question_index: int
    answer: str

class UserProfileUpdate(BaseModel):
    favorite_genres: Optional[List[str]] = None
    difficulty_level: Optional[str] = None

# --- Auth Helpers ---
def create_jwt_token(user_id: str, spotify_token: str) -> str:
    payload = {
        "user_id": user_id,
        "spotify_token": spotify_token,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "iat": datetime.now(timezone.utc)
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_jwt_token(token: str) -> dict:
    try:
        return pyjwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")
    token = auth_header.split(" ")[1]
    payload = decode_jwt_token(token)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["spotify_token"] = payload.get("spotify_token", "")
    return user

# --- Genre & Mood Mappings ---
GENRE_LIST = ["pop", "rock", "hip hop", "electronic", "jazz", "classical", "r&b", "country", "latin", "indie", "metal", "blues", "folk", "reggae", "soul"]

MOOD_GENRE_MAP = {
    "happy": ["pop", "dance", "funk", "disco"],
    "chill": ["ambient", "acoustic", "lofi", "indie"],
    "energetic": ["electronic", "hip hop", "rock", "punk"],
    "sad": ["blues", "indie", "folk", "soul"],
    "focus": ["classical", "ambient", "jazz", "piano"]
}

MOOD_SEARCH_TERMS = {
    "happy": ["happy hits", "feel good", "summer vibes", "party anthems"],
    "chill": ["chill vibes", "acoustic morning", "lo-fi beats", "mellow"],
    "energetic": ["workout energy", "edm bangers", "rock anthems", "hype"],
    "sad": ["sad songs", "heartbreak", "melancholy", "emotional ballads"],
    "focus": ["study music", "classical focus", "ambient work", "concentration"]
}

DIFFICULTY_SETTINGS = {
    "easy": {"options": 3, "points": 10},
    "medium": {"options": 4, "points": 20},
    "hard": {"options": 5, "points": 30}
}

# --- Deezer Preview Helper ---
def get_deezer_preview(track_name: str, artist_name: str) -> Optional[str]:
    """Search Deezer for a matching track and return its 30-sec preview URL."""
    try:
        query = f"{track_name} {artist_name}"
        r = requests.get("https://api.deezer.com/search", params={"q": query, "limit": 3}, timeout=5)
        if r.status_code == 200:
            data = r.json()
            for item in data.get("data", []):
                preview = item.get("preview")
                if preview:
                    return preview
    except Exception as e:
        logger.warning(f"Deezer preview lookup failed for {track_name}: {e}")
    return None

# --- Spotify Track Fetching ---
def fetch_spotify_tracks(search_queries: list, limit_per_query: int = 10) -> list:
    """Fetch tracks from Spotify and enrich with Deezer previews."""
    all_tracks = []
    seen_ids = set()

    for query in search_queries:
        try:
            results = sp_client.search(q=query, type="track", limit=limit_per_query, market="US")
            for track in results["tracks"]["items"]:
                if track["id"] in seen_ids:
                    continue
                seen_ids.add(track["id"])

                artist_name = ", ".join([a["name"] for a in track["artists"]])
                album_art = track["album"]["images"][0]["url"] if track["album"]["images"] else None

                # Get Deezer preview
                preview_url = get_deezer_preview(track["name"], track["artists"][0]["name"])

                all_tracks.append({
                    "id": track["id"],
                    "name": track["name"],
                    "artist": artist_name,
                    "artists": [a["name"] for a in track["artists"]],
                    "album": track["album"]["name"],
                    "album_art": album_art,
                    "preview_url": preview_url,
                    "spotify_url": track["external_urls"].get("spotify", ""),
                    "popularity": track["popularity"]
                })
        except Exception as e:
            logger.error(f"Spotify search error for '{query}': {e}")

    return all_tracks

def get_tracks_for_genre_quiz(limit: int = 20) -> list:
    """Get diverse tracks across genres for genre guessing."""
    genre_queries = [
        ("pop", ["top pop hits 2024", "pop classics"]),
        ("rock", ["rock anthems", "classic rock hits"]),
        ("hip hop", ["hip hop hits", "rap classics"]),
        ("electronic", ["edm hits", "electronic dance"]),
        ("jazz", ["jazz standards", "smooth jazz"]),
        ("classical", ["famous classical pieces", "classical music popular"]),
        ("r&b", ["r&b hits", "soul r&b"]),
        ("country", ["country hits", "country music top"]),
        ("latin", ["latin hits reggaeton", "latin pop"]),
        ("indie", ["indie rock hits", "alternative indie"]),
        ("metal", ["heavy metal hits", "metal rock"]),
        ("blues", ["blues music classic", "blues guitar"]),
    ]

    all_tracks = []
    selected_genres = random.sample(genre_queries, min(6, len(genre_queries)))

    for genre_name, queries in selected_genres:
        query = random.choice(queries)
        tracks = fetch_spotify_tracks([query], limit_per_query=6)
        for t in tracks:
            t["genre"] = genre_name
        all_tracks.extend(tracks)

    random.shuffle(all_tracks)
    return all_tracks[:limit]

def get_tracks_for_artist_quiz(limit: int = 20) -> list:
    """Get tracks from well-known artists for artist guessing."""
    artist_queries = [
        "Taylor Swift", "Drake", "The Weeknd", "Billie Eilish",
        "Ed Sheeran", "Dua Lipa", "Post Malone", "Ariana Grande",
        "Kendrick Lamar", "Bruno Mars", "Adele", "Coldplay",
        "Eminem", "Rihanna", "Justin Bieber", "Lady Gaga",
        "Beyonce", "Travis Scott", "Bad Bunny", "Harry Styles"
    ]
    selected = random.sample(artist_queries, min(8, len(artist_queries)))
    tracks = fetch_spotify_tracks(selected, limit_per_query=3)
    random.shuffle(tracks)

    for t in tracks:
        t["genre"] = "mixed"
    return tracks[:limit]

def get_tracks_for_mood(mood: str, limit: int = 20) -> list:
    """Get mood-appropriate tracks."""
    queries = MOOD_SEARCH_TERMS.get(mood, ["popular music"])
    tracks = fetch_spotify_tracks(queries, limit_per_query=8)
    genres = MOOD_GENRE_MAP.get(mood, ["pop"])
    for t in tracks:
        t["genre"] = random.choice(genres)
    random.shuffle(tracks)
    return tracks[:limit]

# --- Gemini LLM Helpers ---
async def generate_quiz_content(track: dict, mode: str, options: list):
    """Use Gemini to generate quiz question, hint, and fun fact."""
    session_id = f"quiz-{uuid.uuid4().hex[:8]}"
    genai.configure(api_key=LLM_API_KEY)
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction="You are a music quiz master. Generate engaging quiz content. Respond ONLY in valid JSON, no markdown."
    )

    if mode == "genre":
        prompt = f"""Generate a genre quiz question for "{track['name']}" by {track['artist']}.
The correct genre is "{track['genre']}". Wrong options: {options}.
Return JSON: {{"question": "a fun question asking to identify the genre of this song", "hint": "a subtle hint about the musical style without saying the genre", "fun_fact": "an interesting fact about this song, artist, or genre"}}"""
    elif mode == "artist":
        prompt = f"""Generate an artist quiz question for the song "{track['name']}" by {track['artist']}.
Wrong artist options: {options}.
Return JSON: {{"question": "an engaging question about who performs this song", "hint": "a clever clue about the artist without revealing the name", "fun_fact": "an interesting fact about {track['artist']}"}}"""
    else:
        prompt = f"""Generate a music trivia question about "{track['name']}" by {track['artist']} (genre: {track['genre']}).
Return JSON: {{"question": "a fun trivia question about this track or genre", "hint": "a helpful hint", "fun_fact": "a fascinating music fact"}}"""

    try:
        response = await model.generate_content_async(prompt)
        import json
        cleaned = response.text.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            cleaned = "\n".join(lines[1:])
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
        return json.loads(cleaned)
    except Exception as e:
        logger.error(f"Gemini quiz generation error: {e}")
        if mode == "genre":
            return {"question": f"What genre does \"{track['name']}\" by {track['artist']} belong to?", "hint": f"Think about the musical style of {track['artist']}.", "fun_fact": f"\"{track['name']}\" is a great track by {track['artist']}!"}
        elif mode == "artist":
            return {"question": f"Who performs the song \"{track['name']}\"?", "hint": f"This artist is known for their unique style.", "fun_fact": f"\"{track['name']}\" showcases incredible musical talent!"}
        return {"question": f"Music trivia: What do you know about \"{track['name']}\"?", "hint": "Listen to the musical elements.", "fun_fact": "Music brings people together!"}

async def generate_answer_response(track: dict, correct: bool, user_answer: str, correct_answer: str):
    genai.configure(api_key=LLM_API_KEY)
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction="You are a fun, encouraging music quiz host. Keep responses to 2 sentences max. Be enthusiastic but concise."
    )

    if correct:
        prompt = f"The user correctly answered '{correct_answer}' for \"{track['name']}\" by {track['artist']}. Give a brief congrats and one music fact. 2 sentences max."
    else:
        prompt = f"The user guessed '{user_answer}' but the answer was '{correct_answer}' for \"{track['name']}\" by {track['artist']}. Encourage them briefly. 2 sentences max."

    try:
        response = await model.generate_content_async(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini answer response error: {e}")
        if correct:
            return f"Nailed it! \"{track['name']}\" by {track['artist']} - you really know your music!"
        return f"Close! The answer was {correct_answer}. \"{track['name']}\" by {track['artist']} is worth a listen!"

# --- Auth Routes ---
@api_router.get("/auth/spotify-login")
async def spotify_login():
    auth_url = sp_oauth.get_authorize_url()
    return {"auth_url": auth_url}

@api_router.post("/auth/spotify-callback")
async def spotify_callback(req: SpotifyCallbackRequest):
    try:
        token_info = sp_oauth.get_access_token(req.code, as_dict=True)
        sp_user = spotipy.Spotify(auth=token_info["access_token"])
        profile = sp_user.me()

        user_id = profile["id"]
        display_name = profile.get("display_name", user_id)
        email = profile.get("email", "")
        avatar = profile["images"][0]["url"] if profile.get("images") else None

        existing_user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if existing_user:
            await db.users.update_one(
                {"id": user_id},
                {"$set": {"display_name": display_name, "email": email, "avatar": avatar, "last_login": datetime.now(timezone.utc).isoformat()}}
            )
        else:
            await db.users.insert_one({
                "id": user_id,
                "display_name": display_name,
                "email": email,
                "avatar": avatar,
                "favorite_genres": [],
                "total_score": 0,
                "total_games": 0,
                "total_correct": 0,
                "total_questions": 0,
                "genre_accuracy": {},
                "difficulty_level": "medium",
                "streak": 0,
                "best_streak": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_login": datetime.now(timezone.utc).isoformat()
            })

        jwt_token = create_jwt_token(user_id, token_info["access_token"])
        return {"token": jwt_token, "user": {"id": user_id, "display_name": display_name, "email": email, "avatar": avatar}}
    except Exception as e:
        logger.error(f"Spotify callback error: {e}")
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return {k: v for k, v in user.items() if k != "spotify_token"}

# --- Quiz Routes ---
@api_router.post("/quiz/start")
async def start_quiz(req: QuizStartRequest, user=Depends(get_current_user)):
    mode = req.mode
    difficulty = req.difficulty or user.get("difficulty_level", "medium")
    settings = DIFFICULTY_SETTINGS.get(difficulty, DIFFICULTY_SETTINGS["medium"])

    logger.info(f"Starting quiz: mode={mode}, mood={req.mood}, difficulty={difficulty}")

    # Fetch tracks based on mode
    if mode == "mood" and req.mood:
        tracks = get_tracks_for_mood(req.mood)
    elif mode == "artist":
        tracks = get_tracks_for_artist_quiz()
    elif mode == "genre":
        tracks = get_tracks_for_genre_quiz()
    elif mode == "timed":
        tracks = get_tracks_for_genre_quiz(limit=25)
    else:
        tracks = get_tracks_for_genre_quiz()

    logger.info(f"Fetched {len(tracks)} tracks, {sum(1 for t in tracks if t.get('preview_url'))} with audio previews")

    if len(tracks) < 4:
        raise HTTPException(status_code=400, detail="Not enough tracks found. Please try again.")

    # Build questions
    num_questions = 5 if mode != "timed" else 10
    selected_tracks = random.sample(tracks, min(num_questions, len(tracks)))
    questions = []

    for track in selected_tracks:
        if mode == "genre":
            correct = track["genre"]
            wrong_pool = [g for g in GENRE_LIST if g.lower() != correct.lower()]
            wrong = random.sample(wrong_pool, min(settings["options"] - 1, len(wrong_pool)))
            all_options = [correct] + wrong
            random.shuffle(all_options)
        elif mode == "artist":
            correct = track["artist"]
            other_artists = list(set([t["artist"] for t in tracks if t["artist"] != correct]))
            if len(other_artists) < settings["options"] - 1:
                other_artists += ["Unknown Artist", "Mystery Singer", "Anonymous Band"]
            wrong = random.sample(other_artists, min(settings["options"] - 1, len(other_artists)))
            all_options = [correct] + wrong
            random.shuffle(all_options)
        else:
            correct = track["genre"]
            wrong_pool = [g for g in GENRE_LIST if g.lower() != correct.lower()]
            wrong = random.sample(wrong_pool, min(settings["options"] - 1, len(wrong_pool)))
            all_options = [correct] + wrong
            random.shuffle(all_options)

        # Generate AI content
        try:
            llm_data = await generate_quiz_content(track, mode, wrong)
        except Exception as ex:
            logger.error(f"LLM generation failed: {ex}")
            llm_data = {
                "question": f"What genre is \"{track['name']}\"?" if mode == "genre" else f"Who sings \"{track['name']}\"?",
                "hint": "Think about the musical style!",
                "fun_fact": f"This track is by {track['artist']}."
            }

        questions.append({
            "track": {
                "id": track["id"],
                "name": track["name"],
                "artist": track["artist"],
                "album": track["album"],
                "album_art": track["album_art"],
                "preview_url": track.get("preview_url"),
                "spotify_url": track.get("spotify_url", ""),
                "genre": track["genre"]
            },
            "question": llm_data.get("question", "Guess!"),
            "hint": llm_data.get("hint", "Listen carefully!"),
            "fun_fact": llm_data.get("fun_fact", "Music is amazing!"),
            "options": all_options,
            "correct_answer": correct,
            "mode": mode
        })

    session_id = str(uuid.uuid4())
    session = {
        "id": session_id,
        "user_id": user["id"],
        "mode": mode,
        "mood": req.mood,
        "difficulty": difficulty,
        "questions": questions,
        "answers": [],
        "score": 0,
        "total_questions": len(questions),
        "current_index": 0,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed": False,
        "time_limit": 60 if mode == "timed" else None
    }
    await db.quiz_sessions.insert_one(session)

    # Return session without correct answers
    safe_questions = []
    for q in questions:
        safe_questions.append({
            "track": {
                "name": q["track"]["name"],
                "album": q["track"]["album"],
                "album_art": q["track"]["album_art"],
                "preview_url": q["track"].get("preview_url"),
                "spotify_url": q["track"].get("spotify_url", ""),
            },
            "question": q["question"],
            "hint": q["hint"],
            "options": q["options"],
            "mode": q["mode"]
        })

    return {
        "session_id": session_id,
        "questions": safe_questions,
        "total_questions": len(questions),
        "difficulty": difficulty,
        "mode": mode,
        "time_limit": session["time_limit"],
        "points_per_correct": settings["points"]
    }

@api_router.post("/quiz/answer")
async def answer_question(req: QuizAnswerRequest, user=Depends(get_current_user)):
    session = await db.quiz_sessions.find_one({"id": req.session_id, "user_id": user["id"]}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Quiz session not found")
    if session["completed"]:
        raise HTTPException(status_code=400, detail="Quiz already completed")
    if req.question_index >= len(session["questions"]):
        raise HTTPException(status_code=400, detail="Invalid question index")

    question = session["questions"][req.question_index]
    correct_answer = question["correct_answer"]
    is_correct = req.answer.lower().strip() == correct_answer.lower().strip()
    difficulty = session.get("difficulty", "medium")
    points = DIFFICULTY_SETTINGS.get(difficulty, DIFFICULTY_SETTINGS["medium"])["points"] if is_correct else 0

    bot_response = await generate_answer_response(question["track"], is_correct, req.answer, correct_answer)

    answer_record = {
        "question_index": req.question_index,
        "user_answer": req.answer,
        "correct_answer": correct_answer,
        "is_correct": is_correct,
        "points": points,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    new_score = session["score"] + points
    is_last = req.question_index >= len(session["questions"]) - 1

    update_data = {
        "$push": {"answers": answer_record},
        "$set": {"score": new_score, "current_index": req.question_index + 1}
    }
    if is_last:
        update_data["$set"]["completed"] = True
        update_data["$set"]["completed_at"] = datetime.now(timezone.utc).isoformat()

    await db.quiz_sessions.update_one({"id": req.session_id}, update_data)

    # Update user stats
    genre = question["track"].get("genre", "unknown")
    user_update = {"$inc": {"total_questions": 1}}
    if is_correct:
        user_update["$inc"]["total_correct"] = 1
        user_update["$inc"]["total_score"] = points
    await db.users.update_one({"id": user["id"]}, user_update)

    # Update genre accuracy
    genre_key = f"genre_accuracy.{genre}"
    inc_update = {f"{genre_key}.total": 1}
    if is_correct:
        inc_update[f"{genre_key}.correct"] = 1
    await db.users.update_one({"id": user["id"]}, {"$inc": inc_update})

    # Update streak
    if is_correct:
        user_data = await db.users.find_one({"id": user["id"]}, {"_id": 0, "streak": 1, "best_streak": 1})
        new_streak = (user_data.get("streak", 0) or 0) + 1
        best = max(new_streak, user_data.get("best_streak", 0) or 0)
        await db.users.update_one({"id": user["id"]}, {"$set": {"streak": new_streak, "best_streak": best}})
    else:
        await db.users.update_one({"id": user["id"]}, {"$set": {"streak": 0}})

    if is_last:
        await db.users.update_one({"id": user["id"]}, {"$inc": {"total_games": 1}})

    return {
        "is_correct": is_correct,
        "correct_answer": correct_answer,
        "points": points,
        "total_score": new_score,
        "bot_response": bot_response,
        "fun_fact": question.get("fun_fact", ""),
        "track_info": {
            "name": question["track"]["name"],
            "artist": question["track"]["artist"],
            "album": question["track"]["album"],
            "album_art": question["track"]["album_art"],
            "genre": question["track"].get("genre", ""),
            "spotify_url": question["track"].get("spotify_url", "")
        },
        "is_last_question": is_last,
        "question_index": req.question_index
    }

@api_router.get("/quiz/session/{session_id}")
async def get_quiz_session(session_id: str, user=Depends(get_current_user)):
    session = await db.quiz_sessions.find_one(
        {"id": session_id, "user_id": user["id"]},
        {"_id": 0, "questions.correct_answer": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

# --- User Routes ---
@api_router.get("/user/profile")
async def get_user_profile(user=Depends(get_current_user)):
    return {k: v for k, v in user.items() if k != "spotify_token"}

@api_router.put("/user/profile")
async def update_user_profile(req: UserProfileUpdate, user=Depends(get_current_user)):
    update = {}
    if req.favorite_genres is not None:
        update["favorite_genres"] = req.favorite_genres
    if req.difficulty_level is not None:
        update["difficulty_level"] = req.difficulty_level
    if update:
        await db.users.update_one({"id": user["id"]}, {"$set": update})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return {k: v for k, v in updated.items() if k != "spotify_token"}

@api_router.get("/user/stats")
async def get_user_stats(user=Depends(get_current_user)):
    user_data = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    sessions = await db.quiz_sessions.find(
        {"user_id": user["id"], "completed": True},
        {"_id": 0, "id": 1, "mode": 1, "score": 1, "total_questions": 1, "started_at": 1, "difficulty": 1}
    ).sort("started_at", -1).to_list(50)

    total_correct = user_data.get("total_correct", 0)
    total_questions = user_data.get("total_questions", 0)
    accuracy = round((total_correct / total_questions * 100), 1) if total_questions > 0 else 0

    genre_accuracy = user_data.get("genre_accuracy", {})
    best_genre = worst_genre = None
    best_acc = -1
    worst_acc = 101
    for genre, data in genre_accuracy.items():
        if isinstance(data, dict) and data.get("total", 0) > 0:
            acc = data.get("correct", 0) / data["total"] * 100
            if acc > best_acc:
                best_acc = acc
                best_genre = genre
            if acc < worst_acc:
                worst_acc = acc
                worst_genre = genre

    score_history = [{"date": s.get("started_at", ""), "score": s.get("score", 0), "mode": s.get("mode", ""), "total_questions": s.get("total_questions", 0)} for s in sessions[-20:]]

    return {
        "total_games": user_data.get("total_games", 0),
        "total_score": user_data.get("total_score", 0),
        "total_correct": total_correct,
        "total_questions": total_questions,
        "accuracy": accuracy,
        "best_genre": best_genre,
        "worst_genre": worst_genre,
        "genre_accuracy": genre_accuracy,
        "streak": user_data.get("streak", 0),
        "best_streak": user_data.get("best_streak", 0),
        "difficulty_level": user_data.get("difficulty_level", "medium"),
        "score_history": score_history,
        "recent_sessions": sessions[:10]
    }

# --- Leaderboard ---
@api_router.get("/leaderboard")
async def get_leaderboard():
    users = await db.users.find(
        {"total_games": {"$gt": 0}},
        {"_id": 0, "id": 1, "display_name": 1, "avatar": 1, "total_score": 1, "total_games": 1, "total_correct": 1, "total_questions": 1, "best_streak": 1}
    ).sort("total_score", -1).to_list(50)

    leaderboard = []
    for i, u in enumerate(users):
        total_q = u.get("total_questions", 0)
        accuracy = round(u.get("total_correct", 0) / total_q * 100, 1) if total_q > 0 else 0
        leaderboard.append({
            "rank": i + 1,
            "id": u["id"],
            "display_name": u.get("display_name", "Anonymous"),
            "avatar": u.get("avatar"),
            "total_score": u.get("total_score", 0),
            "total_games": u.get("total_games", 0),
            "accuracy": accuracy,
            "best_streak": u.get("best_streak", 0)
        })
    return {"leaderboard": leaderboard}

# --- Health ---
@api_router.get("/")
async def root():
    return {"message": "Music Quiz Bot API", "status": "running"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
