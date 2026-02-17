import requests
import sys
import jwt as pyjwt
import pymongo
from datetime import datetime, timezone, timedelta
import uuid

class MusicQuizAPITester:
    def __init__(self, base_url="https://vibe-check-quiz.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.mongo_client = None
        self.db = None
        self.test_user_id = f"test_user_{datetime.now().strftime('%H%M%S')}"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)

            print(f"   Status: {response.status_code}")
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Expected {expected_status}, got {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict):
                        for key, value in list(response_data.items())[:3]:  # Show first 3 keys
                            print(f"   Response: {key} = {str(value)[:50]}...")
                    else:
                        print(f"   Response: {str(response_data)[:100]}...")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if response.status_code < 400 else {}

        except requests.exceptions.Timeout:
            print(f"❌ FAILED - Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ FAILED - Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        if success:
            expected_keys = ['message', 'status']
            if any(key in response for key in expected_keys):
                print(f"   ✓ Health check response looks valid")
                return True
            else:
                print(f"   ⚠️  Health check response missing expected keys")
        return success

    def test_spotify_login_url(self):
        """Test Spotify login URL endpoint"""
        success, response = self.run_test(
            "Spotify Login URL",
            "GET",
            "auth/spotify-login",
            200
        )
        if success and 'auth_url' in response:
            auth_url = response['auth_url']
            if 'spotify.com' in auth_url and 'authorize' in auth_url:
                print(f"   ✓ Valid Spotify auth URL returned")
                return True
            else:
                print(f"   ⚠️  Auth URL doesn't look like Spotify URL: {auth_url[:100]}...")
        return success

    def test_leaderboard_empty(self):
        """Test leaderboard endpoint returns empty leaderboard"""
        success, response = self.run_test(
            "Empty Leaderboard",
            "GET",
            "leaderboard",
            200
        )
        if success:
            if 'leaderboard' in response:
                leaderboard = response['leaderboard']
                if isinstance(leaderboard, list):
                    print(f"   ✓ Leaderboard is a list with {len(leaderboard)} entries")
                    return True
                else:
                    print(f"   ⚠️  Leaderboard is not a list: {type(leaderboard)}")
            else:
                print(f"   ⚠️  No 'leaderboard' key in response")
        return success

    def setup_mongodb_connection(self):
        """Setup MongoDB connection for test user creation"""
        try:
            self.mongo_client = pymongo.MongoClient("mongodb://localhost:27017")
            self.db = self.mongo_client["test_database"]
            print("✓ Connected to MongoDB")
            return True
        except Exception as e:
            print(f"❌ Failed to connect to MongoDB: {str(e)}")
            return False

    def create_test_user_and_token(self):
        """Create a test user in MongoDB and generate JWT token"""
        if self.db is None:
            return False
            
        try:
            # Create test user in MongoDB
            test_user = {
                "id": self.test_user_id,
                "display_name": "Test User",
                "email": "test@example.com",
                "avatar": None,
                "favorite_genres": ["pop", "rock"],
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
            }
            
            # Insert user (or update if exists)
            self.db.users.replace_one({"id": self.test_user_id}, test_user, upsert=True)
            
            # Generate JWT token using the same logic as the backend
            jwt_secret = "music_quiz_bot_super_secret_key_2024"
            payload = {
                "user_id": self.test_user_id,
                "spotify_token": "test_spotify_token",
                "exp": datetime.now(timezone.utc) + timedelta(hours=24),
                "iat": datetime.now(timezone.utc)
            }
            self.token = pyjwt.encode(payload, jwt_secret, algorithm="HS256")
            
            print(f"✓ Created test user: {self.test_user_id}")
            print(f"✓ Generated JWT token")
            return True
            
        except Exception as e:
            print(f"❌ Failed to create test user and token: {str(e)}")
            return False

    def cleanup_test_user(self):
        """Clean up test user from database"""
        if self.db is not None and self.test_user_id:
            try:
                self.db.users.delete_one({"id": self.test_user_id})
                self.db.quiz_sessions.delete_many({"user_id": self.test_user_id})
                print(f"✓ Cleaned up test user: {self.test_user_id}")
            except Exception as e:
                print(f"⚠️  Failed to cleanup test user: {str(e)}")
        
        if self.mongo_client:
            self.mongo_client.close()

    def test_protected_endpoint_without_auth(self):
        """Test that protected endpoints return 401 without auth"""
        success, response = self.run_test(
            "Protected Endpoint Without Auth",
            "GET",
            "auth/me",
            401
        )
        if success:
            print(f"   ✓ Protected endpoint correctly returns 401")
        return success

    def test_quiz_start_genre_mode(self):
        """Test quiz start endpoint for genre mode"""
        if not self.token:
            print("❌ No auth token available for quiz testing")
            return False
            
        success, response = self.run_test(
            "Quiz Start - Genre Mode",
            "POST",
            "quiz/start",
            200,
            data={"mode": "genre", "difficulty": "medium"}
        )
        
        if success:
            required_keys = ['session_id', 'questions', 'total_questions', 'difficulty', 'mode']
            missing_keys = [key for key in required_keys if key not in response]
            
            if not missing_keys:
                print(f"   ✓ Quiz start response has all required keys")
                questions = response.get('questions', [])
                if len(questions) > 0:
                    print(f"   ✓ Quiz contains {len(questions)} questions")
                    
                    # Check first question structure
                    first_q = questions[0]
                    q_required_keys = ['track', 'question', 'options', 'mode']
                    q_missing_keys = [key for key in q_required_keys if key not in first_q]
                    
                    if not q_missing_keys:
                        print(f"   ✓ Question structure is valid")
                        
                        # Check track info
                        track = first_q.get('track', {})
                        if track.get('name') and track.get('album'):
                            print(f"   ✓ Track info looks valid: {track['name'][:30]}...")
                            
                            # Check if preview_url is available (Deezer integration)
                            if track.get('preview_url'):
                                print(f"   ✓ Audio preview available via Deezer")
                            else:
                                print(f"   ⚠️  No audio preview available")
                                
                        # Check if question looks AI-generated (not just generic)
                        question_text = first_q.get('question', '')
                        if len(question_text) > 20 and ('genre' in question_text.lower() or 'music' in question_text.lower()):
                            print(f"   ✓ AI-generated question looks valid")
                        else:
                            print(f"   ⚠️  Question might be fallback: {question_text[:50]}...")
                            
                        return True
                    else:
                        print(f"   ⚠️  Question missing keys: {q_missing_keys}")
                else:
                    print(f"   ⚠️  No questions returned")
            else:
                print(f"   ⚠️  Response missing keys: {missing_keys}")
                
        return success

    def test_quiz_start_artist_mode(self):
        """Test quiz start endpoint for artist mode"""
        if not self.token:
            return False
            
        success, response = self.run_test(
            "Quiz Start - Artist Mode",
            "POST", 
            "quiz/start",
            200,
            data={"mode": "artist", "difficulty": "easy"}
        )
        
        if success:
            questions = response.get('questions', [])
            if len(questions) > 0:
                print(f"   ✓ Artist mode quiz contains {len(questions)} questions")
                return True
            else:
                print(f"   ⚠️  No questions returned for artist mode")
                
        return success

    def test_quiz_start_mood_mode(self):
        """Test quiz start endpoint for mood mode"""
        if not self.token:
            return False
            
        success, response = self.run_test(
            "Quiz Start - Mood Mode (Happy)",
            "POST",
            "quiz/start", 
            200,
            data={"mode": "mood", "mood": "happy", "difficulty": "hard"}
        )
        
        if success:
            questions = response.get('questions', [])
            if len(questions) > 0:
                print(f"   ✓ Mood mode quiz contains {len(questions)} questions")
                return True
            else:
                print(f"   ⚠️  No questions returned for mood mode")
                
        return success

    def test_auth_me_with_token(self):
        """Test /auth/me endpoint with valid token"""
        if not self.token:
            return False
            
        success, response = self.run_test(
            "Auth Me - With Valid Token",
            "GET",
            "auth/me",
            200
        )
        
        if success:
            if response.get('id') == self.test_user_id:
                print(f"   ✓ Auth endpoint returns correct user data")
                return True
            else:
                print(f"   ⚠️  Unexpected user ID in response")
                
        return success

    def test_protected_endpoint_without_auth(self):
        """Test that protected endpoints return 401 without auth"""
        # Temporarily remove token for this test
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Protected Endpoint Without Auth",
            "GET",
            "auth/me",
            401
        )
        
        # Restore token
        self.token = original_token
        
        if success:
            print(f"   ✓ Protected endpoint correctly returns 401")
        return success

def main():
    print("🎵 Music Quiz Bot API Testing")
    print("=" * 50)
    
    # Setup
    tester = MusicQuizAPITester()
    
    # Run basic tests first
    basic_tests = [
        tester.test_health_check,
        tester.test_spotify_login_url,
        tester.test_leaderboard_empty,
        tester.test_protected_endpoint_without_auth,
    ]
    
    print("\n🔧 Running Basic API Tests...")
    for test in basic_tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Setup MongoDB and create test user for quiz testing
    print(f"\n🔧 Setting up Quiz Testing (MongoDB + JWT)...")
    if not tester.setup_mongodb_connection():
        print("❌ Cannot proceed with quiz testing - MongoDB connection failed")
        return 1
        
    if not tester.create_test_user_and_token():
        print("❌ Cannot proceed with quiz testing - Test user creation failed")
        tester.cleanup_test_user()
        return 1
    
    # Run quiz-specific tests
    quiz_tests = [
        tester.test_auth_me_with_token,
        tester.test_quiz_start_genre_mode,
        tester.test_quiz_start_artist_mode,
        tester.test_quiz_start_mood_mode,
    ]
    
    print(f"\n🎯 Running Quiz Flow Tests...")
    for test in quiz_tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1

    # Cleanup
    tester.cleanup_test_user()

    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS:")
    print(f"   Tests run: {tester.tests_run}")
    print(f"   Tests passed: {tester.tests_passed}")
    print(f"   Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())