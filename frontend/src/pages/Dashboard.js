import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { BarChart3, Target, Flame, TrendingUp, Award, Music2, Disc3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function Dashboard() {
  const { authAxios } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authAxios.get('/user/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [authAxios]);

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-ocean pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-end gap-1 h-8">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-1.5 bg-biolum-cyan rounded-full wave-bar" style={{ animationDelay: `${i * 0.15}s`, height: '4px' }} />
            ))}
          </div>
          <p className="text-slate-400 text-sm">Loading your stats...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-deep-ocean pt-20 flex items-center justify-center">
        <p className="text-slate-400">No stats available yet. Play some quizzes first!</p>
      </div>
    );
  }

  const genreChartData = Object.entries(stats.genre_accuracy || {}).map(([genre, data]) => ({
    genre: genre.charAt(0).toUpperCase() + genre.slice(1),
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    total: data.total || 0
  })).filter(d => d.total > 0);

  const scoreHistory = (stats.score_history || []).map((s, i) => ({
    game: `G${i + 1}`,
    score: s.score,
    mode: s.mode
  }));

  return (
    <div className="min-h-screen bg-deep-ocean pt-20 pb-12 px-4" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white mb-2" data-testid="dashboard-title">
            Your Dashboard
          </h1>
          <p className="text-slate-400 text-base md:text-lg">Track your progress and improve your game.</p>
        </motion.div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-4 mb-8">
          {/* Total Score - Large */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="col-span-2 md:col-span-2 lg:col-span-3 glass-card rounded-2xl p-6 hover:border-biolum-cyan/50 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-biolum-cyan" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Total Score</span>
            </div>
            <p className="font-mono text-4xl font-bold text-white" data-testid="stat-total-score">
              {stats.total_score?.toLocaleString() || 0}
            </p>
          </motion.div>

          {/* Accuracy */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-1 lg:col-span-3 glass-card rounded-2xl p-6 hover:border-biolum-cyan/50 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-biolum-purple" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Accuracy</span>
            </div>
            <p className="font-mono text-4xl font-bold text-white" data-testid="stat-accuracy">
              {stats.accuracy || 0}%
            </p>
            <p className="text-xs text-slate-500 mt-1">{stats.total_correct}/{stats.total_questions} correct</p>
          </motion.div>

          {/* Games Played */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="col-span-1 lg:col-span-3 glass-card rounded-2xl p-6 hover:border-biolum-cyan/50 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Games</span>
            </div>
            <p className="font-mono text-4xl font-bold text-white" data-testid="stat-games">
              {stats.total_games || 0}
            </p>
          </motion.div>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-2 md:col-span-1 lg:col-span-3 glass-card rounded-2xl p-6 hover:border-biolum-cyan/50 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Best Streak</span>
            </div>
            <p className="font-mono text-4xl font-bold text-white" data-testid="stat-streak">
              {stats.best_streak || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Current: {stats.streak || 0}</p>
          </motion.div>
        </div>

        {/* Genre Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Best Genre */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-slate-400">Best Genre</span>
            </div>
            <p className="font-heading text-2xl font-medium text-white capitalize" data-testid="best-genre">
              {stats.best_genre || 'N/A'}
            </p>
          </motion.div>

          {/* Worst Genre */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Disc3 className="w-5 h-5 text-red-400" />
              <span className="text-sm text-slate-400">Needs Work</span>
            </div>
            <p className="font-heading text-2xl font-medium text-white capitalize" data-testid="worst-genre">
              {stats.worst_genre || 'N/A'}
            </p>
          </motion.div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="scores" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 mb-6" data-testid="dashboard-tabs">
            <TabsTrigger value="scores" className="data-[state=active]:bg-biolum-cyan/10 data-[state=active]:text-biolum-cyan">
              Score History
            </TabsTrigger>
            <TabsTrigger value="genres" className="data-[state=active]:bg-biolum-cyan/10 data-[state=active]:text-biolum-cyan">
              Genre Accuracy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scores">
            <div className="glass-card rounded-2xl p-6" data-testid="score-chart">
              <h3 className="font-heading text-lg font-medium text-white mb-4">Score History</h3>
              {scoreHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={scoreHistory}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="game" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15,46,46,0.9)',
                        border: '1px solid rgba(34,211,238,0.2)',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        backdropFilter: 'blur(12px)',
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#22d3ee" fill="url(#scoreGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center py-12">No score history yet. Complete some quizzes!</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="genres">
            <div className="glass-card rounded-2xl p-6" data-testid="genre-chart">
              <h3 className="font-heading text-lg font-medium text-white mb-4">Accuracy by Genre</h3>
              {genreChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={genreChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="genre" stroke="#64748b" fontSize={12} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15,46,46,0.9)',
                        border: '1px solid rgba(34,211,238,0.2)',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                      }}
                      formatter={(value) => [`${value}%`, 'Accuracy']}
                    />
                    <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                      {genreChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.accuracy >= 70 ? '#22d3ee' : entry.accuracy >= 40 ? '#a855f7' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center py-12">No genre data yet. Play some quizzes!</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Sessions */}
        {stats.recent_sessions?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6 mt-6"
          >
            <h3 className="font-heading text-lg font-medium text-white mb-4">Recent Games</h3>
            <div className="space-y-3">
              {stats.recent_sessions.slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-biolum-cyan/10 text-biolum-cyan border-biolum-cyan/30 capitalize font-mono text-xs">
                      {s.mode}
                    </Badge>
                    <span className="text-sm text-slate-300">
                      {s.started_at ? new Date(s.started_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-biolum-cyan" data-testid={`session-score-${i}`}>
                      {s.score} pts
                    </span>
                    <span className="text-xs text-slate-500">{s.total_questions}Q</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
