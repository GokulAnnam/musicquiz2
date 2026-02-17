import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  }
];

export default function QuizHub() {
  const navigate = useNavigate();

  const handleModeSelect = (modeId) => {
    navigate(`/quiz/${modeId}`);
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
    </div>
  );
}
