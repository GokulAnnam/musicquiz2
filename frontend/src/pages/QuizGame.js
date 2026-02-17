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
  const { mode } = useParams();
  const navigate = useNavigate();
  const { authAxios } = useAuth();
  const { playTrack, stopTrack } = usePlayer();

  const [phase, setPhase] = useState(mode === 'mood' ? 'mood-select' : 'loading');
  const [selectedMood, setSelectedMood] = useState(null);
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timedActive, setTimedActive] = useState(false);

  const chatEndRef = useRef(null);
  const timerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Start quiz
  const startQuiz = useCallback(async (mood = null) => {
    setPhase('loading');
    try {
      const payload = { mode, difficulty: 'medium' };
      if (mood) payload.mood = mood;
      const res = await authAxios.post('/quiz/start', payload);
      setSession(res.data);
      setCurrentIndex(0);
      setScore(0);
      setMessages([]);
      setShowHint(false);
      setAnswered(false);

      const firstQ = res.data.questions[0];
      setMessages([{
        type: 'bot',
        content: firstQ.question,
        track: firstQ.track,
        options: firstQ.options,
        mode: firstQ.mode
      }]);

      setPhase('playing');

      if (mode === 'timed') {
        setTimeLeft(60);
        setTimedActive(true);
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
      toast.error('Failed to start quiz. Try again.');
      setPhase(mode === 'mood' ? 'mood-select' : 'error');
    }
  }, [authAxios, mode]);

  // Auto-start for non-mood modes
  useEffect(() => {
    if (mode !== 'mood') {
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
        answer
      });

      const { is_correct, correct_answer, points, total_score, bot_response, fun_fact, is_last_question, track_info } = res.data;

      setScore(total_score);

      // Add bot response
      setMessages(prev => [...prev, {
        type: 'bot',
        content: bot_response,
        isCorrect: is_correct,
        correctAnswer: correct_answer,
        funFact: fun_fact,
        trackInfo: track_info,
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
              mode: nextQ.mode
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

  // Mood select phase
  if (phase === 'mood-select') {
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
          <MoodSelector onSelect={handleMoodSelect} />
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
          <p className="text-slate-400 text-sm">Finding the perfect tracks...</p>
        </div>
      </div>
    );
  }

  // Error phase
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-deep-ocean flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Could not load quiz tracks.</p>
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
                  setPhase(mode === 'mood' ? 'mood-select' : 'loading');
                  if (mode !== 'mood') startQuiz();
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
                    </div>

                    {/* Audio player for question messages */}
                    {msg.track && (
                      <AudioPlayer track={msg.track} />
                    )}

                    {/* Options for question messages */}
                    {msg.options && !answered && i === messages.length - 1 && (
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
                            onClick={handleHint}
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
                  <div className="max-w-[80%] bg-biolum-cyan text-deep-ocean font-bold rounded-2xl rounded-tr-sm px-5 py-3 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    <p className="capitalize">{msg.content}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}
