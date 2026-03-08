import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Music2, UserCircle, Zap, Sparkles, Timer, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const MODES = [
  {
    id: 'genre',
    title: 'Genre Guess',
    description: 'Listen to a track preview and identify the genre. Test your ear across pop, rock, jazz, and more.',
    icon: Music2,
    color: 'biolum-cyan',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1768937719089-857e18c38cf5?crop=entropy&cs=srgb&fm=jpg&q=85&w=400'
  },
  {
    id: 'artist',
    title: 'Artist Guess',
    description: 'Can you name the artist behind the track? Use hints if you get stuck. Adaptive difficulty.',
    icon: UserCircle,
    color: 'biolum-purple',
    gradient: 'from-purple-500/20 to-purple-500/5',
    badge: 'Challenge',
    image: 'https://images.unsplash.com/photo-1758179762756-7ad05acc2e33?crop=entropy&cs=srgb&fm=jpg&q=85&w=400'
  },
  {
    id: 'mood',
    title: 'Mood Quiz',
    description: 'Select your current mood and get matched with tracks that fit your vibe. Quiz your way through.',
    icon: Sparkles,
    color: 'biolum-cyan',
    gradient: 'from-teal-500/20 to-teal-500/5',
    badge: 'Personalized',
    image: 'https://images.unsplash.com/photo-1759269834861-db6fddb17db3?crop=entropy&cs=srgb&fm=jpg&q=85&w=400'
  },
  {
    id: 'timed',
    title: 'Timed Challenge',
    description: '60 seconds on the clock. Answer as many questions as you can. Points multiplier for streaks.',
    icon: Timer,
    color: 'biolum-purple',
    gradient: 'from-orange-500/20 to-orange-500/5',
    badge: 'Speed',
    image: 'https://images.unsplash.com/photo-1770737639812-bd3c709da73b?crop=entropy&cs=srgb&fm=jpg&q=85&w=400'
  },
  {
    id: 'educationalQuiz',
    title: 'Educational Quiz',
    description: 'Answer random cultural music questions from our database. No audio, just learning!',
    icon: BrainCircuit,
    color: 'biolum-green',
    gradient: 'from-green-500/20 to-green-500/5',
    badge: 'Learn',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=srgb&fm=jpg&q=85&w=400'
  }
];

export default function QuizHub() {
  const navigate = useNavigate();
  const { user, loginGuest } = useAuth();
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const [playerName, setPlayerName] = useState('');

  const handleModeSelect = (modeId) => {
    // always request/confirm player name before starting
    setPendingMode(modeId);
    setPlayerName(user?.display_name || '');
    setNameModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-deep-ocean pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <BrainCircuit className="w-7 h-7 text-biolum-cyan" />
            <h1
              className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white"
              data-testid="quiz-hub-title"
            >
              Choose Your Game
            </h1>
          </div>
          <p className="text-slate-400 text-base md:text-lg max-w-xl">
            Pick a mode and start testing your music knowledge. Each mode offers a unique challenge.
          </p>
          {user && (
            <p className="text-slate-400 text-sm mt-1">Playing as <span className="font-medium text-white">{user.display_name}</span>.</p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODES.map((mode, i) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4, borderColor: 'rgba(34,211,238,0.5)' }}
              onClick={() => handleModeSelect(mode.id)}
              data-testid={`mode-${mode.id}-btn`}
              className="text-left glass-card rounded-2xl overflow-hidden transition-all duration-300 group relative"
            >
              {/* Background image */}
              <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-500">
                <img
                  src={mode.image}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient}`} />

              <div className="relative z-10 p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-${mode.color}/10 border border-${mode.color}/30`}>
                    <mode.icon className={`w-7 h-7 text-${mode.color}`} />
                  </div>
                  <Badge
                    className={`bg-${mode.color}/10 text-${mode.color} border-${mode.color}/30 font-mono text-xs`}
                  >
                    {mode.badge}
                  </Badge>
                </div>

                <h2 className="font-heading text-2xl font-medium text-white mb-2 tracking-tight">
                  {mode.title}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {mode.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-biolum-cyan text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Zap className="w-4 h-4" />
                  <span>Start Playing</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Name prompt modal */}
      {nameModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-deep-ocean rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-white text-xl mb-4">Enter your name</h2>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-2 rounded border border-white/30 bg-white/5 text-white mb-4"
              placeholder="Your name"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNameModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={!playerName.trim()}
                onClick={async () => {
                  const name = playerName.trim();
                  let success = true;
                  // if no user or name changed, create/lookup guest record
                  if (!user || user.display_name !== name || user.guest) {
                    success = await loginGuest(name);
                  }
                  if (success) {
                    setNameModalOpen(false);
                    navigate(`/quiz/${pendingMode}`);
                  } else {
                    alert('new player added');
                  }
                }}
                className="px-4 py-2 bg-biolum-cyan text-deep-ocean font-bold rounded disabled:opacity-50"
              >
                Play
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
