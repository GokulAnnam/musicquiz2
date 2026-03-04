import React from 'react';
import { motion } from 'framer-motion';
import { Smile, CloudSun, Zap, CloudRain, Target } from 'lucide-react';

const MOODS = [
  {
    id: 'happy',
    label: 'Happy',
    description: 'Upbeat, feel-good vibes',
    icon: Smile,
    color: 'from-yellow-500/20 to-orange-500/10',
    borderColor: 'hover:border-yellow-400/50',
    iconColor: 'text-yellow-400',
  },
  {
    id: 'chill',
    label: 'Chill',
    description: 'Relaxed, laid-back tunes',
    icon: CloudSun,
    color: 'from-sky-500/20 to-blue-500/10',
    borderColor: 'hover:border-sky-400/50',
    iconColor: 'text-sky-400',
  },
  {
    id: 'energetic',
    label: 'Energetic',
    description: 'High energy bangers',
    icon: Zap,
    color: 'from-biolum-cyan/20 to-emerald-500/10',
    borderColor: 'hover:border-biolum-cyan/50',
    iconColor: 'text-biolum-cyan',
  },
  {
    id: 'sad',
    label: 'Sad',
    description: 'Emotional, introspective',
    icon: CloudRain,
    color: 'from-indigo-500/20 to-purple-500/10',
    borderColor: 'hover:border-indigo-400/50',
    iconColor: 'text-indigo-400',
  },
  {
    id: 'focus',
    label: 'Focus',
    description: 'Concentration & clarity',
    icon: Target,
    color: 'from-biolum-purple/20 to-pink-500/10',
    borderColor: 'hover:border-biolum-purple/50',
    iconColor: 'text-biolum-purple',
  },
];

export default function MoodSelector({ onSelect }) {
  return (
    <div data-testid="mood-selector">
      <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
        How are you feeling?
      </h2>
      <p className="text-slate-400 text-base md:text-lg mb-8">
        Pick your mood and we will match you with tracks that fit.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOODS.map((mood, i) => (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(mood.id)}
            data-testid={`mood-${mood.id}-btn`}
            className={`text-left glass-card rounded-2xl p-6 border border-white/10 ${mood.borderColor} transition-all duration-300 relative overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-50`} />
            <div className="relative z-10">
              <mood.icon className={`w-8 h-8 ${mood.iconColor} mb-3`} />
              <h3 className="font-heading text-xl font-medium text-white mb-1">{mood.label}</h3>
              <p className="text-sm text-slate-400">{mood.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
