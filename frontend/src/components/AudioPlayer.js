import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { PlayCircle, PauseCircle, RotateCcw, ExternalLink, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AudioPlayer({ track }) {
  const { currentTrack, isPlaying, progress, duration, playTrack, pauseTrack, replayTrack } = usePlayer();

  const isThisTrack = currentTrack?.preview_url === track?.preview_url && track?.preview_url;
  const isThisPlaying = isThisTrack && isPlaying;
  const progressPercent = isThisTrack && duration > 0 ? (progress / duration) * 100 : 0;

  const hasPreview = !!track?.preview_url;

  return (
    <div className="glass-card rounded-xl p-4" data-testid="audio-player">
      <div className="flex items-center gap-3">
        {/* Album art */}
        {track?.album_art ? (
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
            <img src={track.album_art} alt="" className="w-full h-full object-cover" />
            {isThisPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex items-end gap-[2px] h-4">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="w-1 bg-biolum-cyan rounded-full wave-bar" style={{ animationDelay: `${i*0.1}s`, height: '3px' }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <Volume2 className="w-6 h-6 text-slate-500" />
          </div>
        )}

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate font-medium">{track?.name || 'Track'}</p>
          {track?.album && (
            <p className="text-xs text-slate-500 truncate">{track.album}</p>
          )}

          {/* Progress bar */}
          {hasPreview && (
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-biolum-cyan rounded-full"
                style={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}

          {!hasPreview && track?.spotify_url && (
            <a
              href={track.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 text-xs text-[#1DB954] hover:text-[#1ed760] transition-colors"
              data-testid="spotify-link"
            >
              <ExternalLink className="w-3 h-3" /> Listen on Spotify
            </a>
          )}
        </div>

        {/* Controls */}
        {hasPreview ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => replayTrack()}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              data-testid="audio-replay-btn"
              title="Replay"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => isThisPlaying ? pauseTrack() : playTrack(track)}
              className={`p-2 transition-all duration-200 ${isThisPlaying ? 'text-biolum-cyan' : 'text-slate-300 hover:text-biolum-cyan'}`}
              data-testid="audio-play-btn"
              title={isThisPlaying ? 'Pause' : 'Play'}
            >
              {isThisPlaying ? <PauseCircle className="w-8 h-8" /> : <PlayCircle className="w-8 h-8" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 px-2">No preview</span>
          </div>
        )}
      </div>
    </div>
  );
}
