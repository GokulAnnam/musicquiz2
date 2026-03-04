import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Music2, Headphones, Disc3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { loginWithSpotify } = useAuth();

  return (
    <div className="min-h-screen bg-deep-ocean relative overflow-hidden">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1617994452722-4145e196248b?crop=entropy&cs=srgb&fm=jpg&q=85')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-deep-ocean/80 via-deep-ocean/60 to-deep-ocean" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-biolum-cyan/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-biolum-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl"
        >
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-biolum-cyan/10 border border-biolum-cyan/30 mb-8"
          >
            <Disc3 className="w-10 h-10 text-biolum-cyan" />
          </motion.div>

          <h1
            className="font-heading text-5xl md:text-7xl font-bold tracking-tighter leading-none text-white mb-6"
            data-testid="landing-title"
          >
            Music Quiz
            <span className="block text-biolum-cyan">Bot</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-4 max-w-xl mx-auto leading-relaxed">
            Test your music knowledge across genres, artists, and moods.
            Powered by AI-generated trivia and real Spotify tracks.
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-slate-400 mb-10">
            <span className="flex items-center gap-2">
              <Music2 className="w-4 h-4 text-biolum-cyan" /> 4 Game Modes
            </span>
            <span className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-biolum-purple" /> Real Previews
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(34,211,238,0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={loginWithSpotify}
            data-testid="spotify-login-btn"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#1DB954] hover:bg-[#1ed760] text-white font-heading font-bold text-lg rounded-full transition-all duration-300 shadow-lg shadow-[#1DB954]/20"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Continue with Spotify
          </motion.button>

          <p className="text-xs text-slate-500 mt-6">
            Sign in with your Spotify account to start playing
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-4xl w-full px-4"
        >
          {[
            { title: 'Genre Guess', desc: 'Identify genres from song previews', icon: Music2 },
            { title: 'Artist Guess', desc: 'Name the artist behind the track', icon: Headphones },
            { title: 'Mood Quiz', desc: 'Match songs to your current vibe', icon: Disc3 },
          ].map((f, i) => (
            <div
              key={f.title}
              className="glass-card rounded-2xl p-6 transition-all duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <f.icon className="w-8 h-8 text-biolum-cyan mb-3" />
              <h3 className="font-heading font-medium text-white text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
