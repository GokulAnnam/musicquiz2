import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import AuthCallback from "@/pages/AuthCallback";
import QuizHub from "@/pages/QuizHub";
import QuizGame from "@/pages/QuizGame";
import Dashboard from "@/pages/Dashboard";
import Leaderboard from "@/pages/Leaderboard";
import Navbar from "@/components/Navbar";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-ocean">
        <div className="flex flex-col items-center gap-4">
          <WaveLoader />
          <p className="text-slate-400 font-body text-sm">Tuning instruments...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function WaveLoader() {
  return (
    <div className="flex items-end gap-1 h-8" data-testid="wave-loader">
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="w-1.5 bg-biolum-cyan rounded-full wave-bar"
          style={{ animationDelay: `${i * 0.15}s`, height: '4px' }}
        />
      ))}
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-ocean">
        <div className="flex flex-col items-center gap-4">
          <WaveLoader />
          <p className="text-slate-400 font-body text-sm">Digging through crates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-ocean">
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/hub" replace /> : <LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/hub" element={<ProtectedRoute><QuizHub /></ProtectedRoute>} />
        <Route path="/quiz/:mode" element={<ProtectedRoute><QuizGame /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <AppRoutes />
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(15, 46, 46, 0.9)',
                border: '1px solid rgba(34, 211, 238, 0.2)',
                color: '#e2e8f0',
                backdropFilter: 'blur(12px)',
              }
            }}
          />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
