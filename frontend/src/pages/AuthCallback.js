import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { handleCallback } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const err = searchParams.get('error');

    if (err) {
      setError('Spotify authorization was denied.');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (code) {
      handleCallback(code).then(success => {
        if (success) {
          navigate('/hub', { replace: true });
        } else {
          setError('Failed to authenticate. Please try again.');
          setTimeout(() => navigate('/'), 3000);
        }
      });
    } else {
      navigate('/');
    }
  }, [searchParams, handleCallback, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-deep-ocean flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">{error}</p>
          <p className="text-slate-500 text-sm">Redirecting back...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-ocean flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-end gap-1 h-8">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-1.5 bg-biolum-cyan rounded-full wave-bar"
              style={{ animationDelay: `${i * 0.15}s`, height: '4px' }}
            />
          ))}
        </div>
        <p className="text-slate-400 font-body text-sm" data-testid="auth-loading">Connecting to Spotify...</p>
      </div>
    </div>
  );
}
