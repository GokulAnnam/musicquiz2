import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Trophy, Medal, Target, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api`;

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${API}/leaderboard`);
        setLeaderboard(res.data.leaderboard || []);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 text-center font-mono text-sm text-slate-500">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-ocean pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-end gap-1 h-8">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-1.5 bg-biolum-cyan rounded-full wave-bar" style={{ animationDelay: `${i * 0.15}s`, height: '4px' }} />
            ))}
          </div>
          <p className="text-slate-400 text-sm">Loading rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-ocean pt-20 pb-12 px-4" data-testid="leaderboard-page">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1770737639812-bd3c709da73b?crop=entropy&cs=srgb&fm=jpg&q=85')` }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-7 h-7 text-biolum-cyan" />
            <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white" data-testid="leaderboard-title">
              Leaderboard
            </h1>
          </div>
          <p className="text-slate-400 text-base md:text-lg">Top music quiz champions.</p>
        </motion.div>

        {leaderboard.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">No players yet</p>
            <p className="text-slate-500 text-sm">Be the first to complete a quiz and claim the top spot!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((player, i) => {
              const isCurrentUser = player.id === user?.id;
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-testid={`leaderboard-row-${i}`}
                  className={`glass-card rounded-xl p-4 flex items-center gap-4 transition-all duration-200 ${isCurrentUser ? 'border-biolum-cyan/40 bg-biolum-cyan/5' : ''
                    } ${player.rank <= 3 ? 'border-white/15' : ''}`}
                >
                  {/* Rank */}
                  <div className="w-8 flex items-center justify-center">
                    {getRankIcon(player.rank)}
                  </div>

                  {/* Avatar */}
                  {player.avatar ? (
                    <img src={player.avatar} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-biolum-cyan/20 flex items-center justify-center text-biolum-cyan font-bold">
                      {player.display_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {player.display_name}
                      {isCurrentUser && <span className="text-xs text-biolum-cyan ml-2">(You)</span>}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-500">{player.total_games} games</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Target className="w-3 h-3" /> {player.accuracy}%
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-biolum-cyan">{player.total_score.toLocaleString()}</p>
                    {player.best_streak > 0 && (
                      <div className="flex items-center gap-1 justify-end">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span className="text-xs text-slate-400 font-mono">{player.best_streak}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
