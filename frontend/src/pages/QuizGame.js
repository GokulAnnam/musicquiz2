import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, SkipForward, PlayCircle, PauseCircle, RotateCcw, Trophy, Timer, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import MoodSelector from '@/components/MoodSelector';
import AudioPlayer from '@/components/AudioPlayer';

export default function QuizGame() {
  const { mode: rawMode } = useParams();
  // normalize mode to lowercase for consistent checks
  const mode = rawMode?.toLowerCase() || 'genre';
  const navigate = useNavigate();
  const { authAxios, user } = useAuth();
  const { playTrack, stopTrack } = usePlayer();

  // modes requiring user options before starting quiz
  const initialPhase = ['mood', 'educationalquiz', 'educational'].includes(mode)
    ? 'options'
    : 'loading';
  const [phase, setPhase] = useState(initialPhase);
  const [selectedMood, setSelectedMood] = useState(null);
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timedActive, setTimedActive] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [educationalLevel, setEducationalLevel] = useState('easy');

  const chatEndRef = useRef(null);
  const timerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Redirect to hub if not authenticated (shouldn't happen when entering via proper flow)
  useEffect(() => {
    if (!user) {
      navigate('/hub');
    }
  }, [user, navigate]);

  // Start quiz
  // Accept optional parameters to avoid async state closure issues
  const startQuiz = useCallback(async (mood = null, numQs = null, eduLvl = null) => {
    setPhase('loading');
    try {
      // Use passed values or fall back to state
      const numQuestionsToUse = numQs !== null ? numQs : numQuestions;
      const eduLevelToUse = eduLvl !== null ? eduLvl : educationalLevel;

      const payload = { mode, difficulty: 'medium' };
      if (mood) payload.mood = mood;
      if (mode === 'educationalquiz' || mode === 'educational') {
        payload.num_questions = numQuestionsToUse;
        payload.edu_level = eduLevelToUse;
      }
      const res = await authAxios.post('/quiz/start', payload);
      setSession(res.data);
      setCurrentIndex(0);
      setScore(0);
      setMessages([]);
      setShowHint(false);
      setShowHintModal(false);
      setAnswered(false);

      const questionsData = res.data.questions;
      if (questionsData && questionsData.length > 0) {
        const firstQ = questionsData[0];
        setMessages([{ 
          type: 'bot',
          content: firstQ.question,
          track: firstQ.track || null,
          options: firstQ.options,
          mode: firstQ.mode,
          level: firstQ.level || null
        }]);
      }

      setPhase('playing');

      if (mode === 'timed') {
        setTimeLeft(60);
        setTimedActive(true);
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
      toast.error('Failed to start quiz. Try again.');
      const needsOptions = ['mood', 'educationalquiz', 'educational'].includes(mode);
      setPhase(needsOptions ? 'options' : 'error');
    }
  }, [authAxios, mode]);

  // Auto-start for non-mood modes
  useEffect(() => {
    // auto-start unless we're in a mode that needs options selected first
    if (!['mood', 'educationalquiz', 'educational'].includes(mode)) {
      startQuiz();
    }
  }, [mode, startQuiz]);

  // Timed mode countdown
  useEffect(() => {
    if (timedActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimedActive(false);
            setPhase('complete');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [timedActive, timeLeft]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    startQuiz(mood);
  };

  const handleAnswer = async (answer) => {
    if (answered || !session) return;
    setAnswered(true);

    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: answer }]);

    try {
      const res = await authAxios.post('/quiz/answer', {
        session_id: session.session_id,
        question_index: currentIndex,
        answer,
        used_hint: showHint
      });

      const { is_correct, correct_answer, points, total_score, bot_response, fun_fact, topic, is_last_question, track_info } = res.data;

      setScore(total_score);

      // Add bot response
      setMessages(prev => [...prev, {
        type: 'bot',
        content: bot_response,
        isCorrect: is_correct,
        correctAnswer: correct_answer,
        funFact: fun_fact,
        topic: topic,
        trackInfo: track_info || null,
        points
      }]);

      if (is_last_question || (mode === 'timed' && timeLeft <= 0)) {
        setTimeout(() => setPhase('complete'), 2000);
      } else {
        // Load next question after delay
        setTimeout(() => {
          const nextIdx = currentIndex + 1;
          setCurrentIndex(nextIdx);
          setAnswered(false);
          setShowHint(false);

          if (nextIdx < session.questions.length) {
            const nextQ = session.questions[nextIdx];
            setMessages(prev => [...prev, {
              type: 'bot',
              content: nextQ.question,
              track: nextQ.track,
              options: nextQ.options,
              mode: nextQ.mode,
              level: nextQ.level || null
            }]);
          }
        }, 2500);
      }
    } catch (err) {
      console.error('Answer error:', err);
      toast.error('Failed to submit answer');
      setAnswered(false);
    }
  };

  const handleHint = () => {
    if (!session || showHint) return;
    setShowHint(true);
    const q = session.questions[currentIndex];
    setMessages(prev => [...prev, {
      type: 'bot',
      content: `Hint: ${q.hint || 'Listen carefully to the instruments and rhythm.'}`,
      isHint: true
    }]);
  };

  const handleHintClick = () => {
    if (['educational', 'educationalquiz'].includes(mode)) {
      setShowHintModal(true);
    } else {
      handleHint();
    }
  };

  // Options selection phase (mood or educational settings)
  if (phase === 'options') {
    return (
      <div className="min-h-screen bg-deep-ocean pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/hub')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            data-testid="back-to-hub-btn"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hub
          </button>
          {mode === 'educationalquiz' || mode === 'educational' ? (
            <div className="glass-card rounded-2xl p-8 max-w-md mx-auto space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white mb-4">Select Level</h2>
                <div className="flex flex-wrap gap-2">
                  {['easy', 'moderate', 'difficult', 'hybrid'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setEducationalLevel(lvl)}
                      className={`py-2 px-4 rounded-xl border transition-all ${
                        educationalLevel === lvl
                          ? 'bg-biolum-cyan border-biolum-cyan text-deep-ocean font-bold'
                          : 'border-white/20 bg-white/5 text-white hover:bg-biolum-cyan/10 hover:border-biolum-cyan'
                      }`}
                      data-testid={`level-${lvl}-btn`}
                    >
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  {educationalLevel === 'hybrid'
                    ? 'Easy questions = 10 pts, Moderate = 15 pts, Difficult = 20 pts'
                    : educationalLevel === 'easy'
                    ? 'Each correct answer gives 10 points.'
                    : educationalLevel === 'moderate'
                    ? 'Each correct answer gives 15 points.'
                    : 'Each correct answer gives 20 points.'}
                </p>
              </div>

              <div>
                <h2 className="font-heading text-2xl font-bold text-white mb-6">Select Number of Questions</h2>
                <div className="space-y-3">
                  {[5, 10, 20].map(num => (
                    <button
                      key={num}
                      onClick={() => startQuiz(null, num, educationalLevel)}
                      className={`w-full py-3 px-4 rounded-xl border transition-all ${
                        numQuestions === num
                          ? 'bg-biolum-cyan border-biolum-cyan text-deep-ocean font-bold'
                          : 'border-white/20 bg-white/5 text-white hover:bg-biolum-cyan/10 hover:border-biolum-cyan'
                      }`}
                      data-testid={`questions-${num}-btn`}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <MoodSelector onSelect={handleMoodSelect} />
          )}
        </div>
      </div>
    );
  }

  // Loading phase
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-deep-ocean flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-end gap-1 h-8">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-1.5 bg-biolum-cyan rounded-full wave-bar" style={{ animationDelay: `${i * 0.15}s`, height: '4px' }} />
            ))}
          </div>
          <p className="text-slate-400 text-sm">Preparing quiz content...</p>
        </div>
      </div>
    );
  }

  // Error phase
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-deep-ocean flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Could not load quiz content.</p>
          <button
            onClick={() => startQuiz()}
            className="px-6 py-2 bg-biolum-cyan text-deep-ocean font-bold rounded-full"
            data-testid="retry-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Complete phase
  if (phase === 'complete') {
    stopTrack();
    const totalQ = session?.total_questions || 0;
    const answeredQ = session?.questions?.length || 0;
    return (
      <div className="min-h-screen bg-deep-ocean pt-20 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 text-center"
          >
            <Trophy className="w-16 h-16 text-biolum-cyan mx-auto mb-4" />
            <h2 className="font-heading text-3xl font-bold text-white mb-2" data-testid="quiz-complete-title">
              Quiz Complete!
            </h2>
            <p className="text-slate-400 mb-6">Great job on this round</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="glass-card rounded-xl p-4">
                <p className="font-mono text-3xl font-bold text-biolum-cyan" data-testid="final-score">{score}</p>
                <p className="text-xs text-slate-400 mt-1">Total Score</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="font-mono text-3xl font-bold text-biolum-purple" data-testid="final-questions">{answeredQ}</p>
                <p className="text-xs text-slate-400 mt-1">Questions</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  const needsOptions = ['mood', 'educationalquiz', 'educational'].includes(mode);
                  setPhase(needsOptions ? 'options' : 'loading');
                  if (!needsOptions) startQuiz();
                }}
                className="px-6 py-3 bg-biolum-cyan text-deep-ocean font-heading font-bold rounded-full hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all"
                data-testid="play-again-btn"
              >
                Play Again
              </button>
              <button
                onClick={() => navigate('/hub')}
                className="px-6 py-3 border border-biolum-cyan/30 text-biolum-cyan font-heading rounded-full hover:bg-biolum-cyan/10 transition-all"
                data-testid="back-hub-btn"
              >
                Back to Hub
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-slate-400 hover:text-white transition-colors"
                data-testid="view-stats-btn"
              >
                View Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Playing phase - Chat UI
  const currentQuestion = session?.questions?.[currentIndex];
  const progressPercent = session ? ((currentIndex) / session.total_questions) * 100 : 0;

  return (
    <div className="min-h-screen bg-deep-ocean flex flex-col pt-16">
      {/* Top bar */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-deep-ocean/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => { stopTrack(); navigate('/hub'); }}
              className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors"
              data-testid="quit-quiz-btn"
            >
              <ArrowLeft className="w-4 h-4" /> Quit
            </button>
            <div className="flex items-center gap-4">
              {mode === 'timed' && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 font-mono">
                  <Timer className="w-3 h-3 mr-1" /> {timeLeft}s
                </Badge>
              )}
              <Badge className="bg-biolum-cyan/10 text-biolum-cyan border-biolum-cyan/30 font-mono" data-testid="score-badge">
                {score} pts
              </Badge>
              <span className="text-xs text-slate-500 font-mono">
                {currentIndex + 1}/{session?.total_questions}
              </span>
              {user && (
                <span className="text-xs text-slate-400 truncate max-w-xs">
                  {user.display_name}
                </span>
              )}
            </div>
          </div>
          <Progress value={progressPercent} className="h-1 bg-white/5" />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto pt-28 pb-8 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'bot' ? (
                  <div className="max-w-[85%] space-y-3">
                      {/* Bot bubble */}
                      <div className={`rounded-2xl rounded-tl-sm p-5 border ${
                        msg.isHint
                          ? 'bg-yellow-500/10 border-yellow-500/20'
                          : msg.isCorrect === true
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : msg.isCorrect === false
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-white/5 border-white/5'
                      }`}>
                        <p className="text-slate-200 leading-relaxed">{msg.content}</p>
                        {msg.level && (
                          <Badge className="ml-2 capitalize text-xs bg-white/10 text-white">
                            {msg.level}
                          </Badge>
                        )}

                        {msg.isCorrect !== undefined && (
                          <div className="mt-2 flex items-center gap-2">
                            <Badge className={msg.isCorrect
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }>
                              {msg.isCorrect ? 'Correct!' : 'Incorrect'}
                            </Badge>
                            {msg.points > 0 && (
                              <span className="text-xs text-biolum-cyan font-mono">+{msg.points} pts</span>
                            )}
                          </div>
                        )}

                        {msg.funFact && (
                          <p className="mt-3 text-xs text-slate-400 italic border-t border-white/5 pt-3">
                            {msg.funFact}
                          </p>
                        )}

                        {msg.topic && (
                          <div className="mt-3 p-3 rounded-lg bg-biolum-cyan/10 border border-biolum-cyan/30">
                            <p className="text-xs text-biolum-cyan font-semibold mb-1">📚 Learn More</p>
                            <p className="text-sm text-slate-200 leading-relaxed">
                              {msg.topic}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Audio player for question messages */}
                      {msg.track && (
                        <AudioPlayer track={msg.track} />
                      )}

                      {/* Options for question messages */}
                      {msg.options && !answered && (
                        (i === messages.length - 1) ||
                        (i === messages.length - 2 && messages[messages.length - 1].isHint)
                      ) && (
                        <div className="space-y-2 mt-3">
                          {msg.options.map((opt, oi) => (
                            <motion.button
                              key={oi}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAnswer(opt)}
                              data-testid={`quiz-option-${oi}`}
                              className="w-full text-left px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-biolum-cyan/10 hover:border-biolum-cyan/30 text-slate-200 transition-all duration-200 flex items-center justify-between group"
                            >
                              <span className="capitalize">{opt}</span>
                              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-biolum-cyan transition-colors" />
                            </motion.button>
                          ))}

                          {/* Hint button */}
                          {!showHint && (
                            <button
                              onClick={handleHintClick}
                              className="flex items-center gap-2 text-xs text-slate-500 hover:text-yellow-400 transition-colors mt-2"
                              data-testid="hint-btn"
                            >
                              <Lightbulb className="w-3 h-3" /> Need a hint?
                            </button>
                          )}
                        </div>
                      )}
                  </div>
                ) : (
                    <div className="w-4/5 bg-biolum-cyan text-deep-ocean font-bold rounded-2xl rounded-tr-sm px-5 py-3 shadow-md">
                      <p className="capitalize">{msg.content}</p>
                    </div>
                  )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Hint Confirmation Modal */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-deep-ocean rounded-xl p-6 w-full max-w-sm text-center border border-white/10">
            <h2 className="text-white text-xl mb-4 font-heading font-medium">Use a Hint?</h2>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
              Using a hint will reduce the score for this question by 50%.<br/>
              Do you want to continue?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowHintModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowHintModal(false);
                  handleHint();
                }}
                className="px-4 py-2 bg-biolum-cyan text-deep-ocean font-bold rounded"
              >
                Show Hint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
