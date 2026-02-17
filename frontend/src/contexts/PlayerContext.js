import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(new Audio());
  const intervalRef = useRef(null);

  const clearProgressInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const playTrack = useCallback((track) => {
    const audio = audioRef.current;

    if (currentTrack?.preview_url === track.preview_url && !audio.paused) {
      audio.pause();
      setIsPlaying(false);
      clearProgressInterval();
      return;
    }

    audio.pause();
    clearProgressInterval();

    if (!track.preview_url) {
      setCurrentTrack(track);
      setIsPlaying(false);
      return;
    }

    audio.src = track.preview_url;
    audio.volume = 0.7;
    setCurrentTrack(track);
    setProgress(0);

    audio.play().then(() => {
      setIsPlaying(true);
      setDuration(audio.duration || 30);
      intervalRef.current = setInterval(() => {
        if (!audio.paused) {
          setProgress(audio.currentTime);
          setDuration(audio.duration || 30);
        }
      }, 200);
    }).catch(err => {
      console.error('Audio play failed:', err);
      setIsPlaying(false);
    });

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      clearProgressInterval();
    };
  }, [currentTrack]);

  const pauseTrack = useCallback(() => {
    audioRef.current.pause();
    setIsPlaying(false);
    clearProgressInterval();
  }, []);

  const stopTrack = useCallback(() => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setProgress(0);
    setCurrentTrack(null);
    clearProgressInterval();
  }, []);

  const replayTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio.src) {
      audio.currentTime = 0;
      audio.play().then(() => {
        setIsPlaying(true);
        setProgress(0);
        intervalRef.current = setInterval(() => {
          if (!audio.paused) {
            setProgress(audio.currentTime);
          }
        }, 200);
      }).catch(console.error);
    }
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, progress, duration,
      playTrack, pauseTrack, stopTrack, replayTrack
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
