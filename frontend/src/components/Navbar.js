import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Music2, LayoutDashboard, Trophy, LogOut, BrainCircuit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/hub', label: 'Play', icon: BrainCircuit },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-deep-ocean/80 backdrop-blur-xl border-b border-white/5" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/hub" className="flex items-center gap-2 group" data-testid="nav-logo">
            <div className="w-8 h-8 rounded-lg bg-biolum-cyan/10 border border-biolum-cyan/30 flex items-center justify-center group-hover:border-biolum-cyan/60 transition-colors">
              <Music2 className="w-4 h-4 text-biolum-cyan" />
            </div>
            <span className="font-heading font-bold text-white text-lg hidden sm:block">MusicQuiz</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.label.toLowerCase()}-link`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-biolum-cyan/10 text-biolum-cyan'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                data-testid="user-menu-trigger"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-biolum-cyan/20 flex items-center justify-center text-biolum-cyan font-bold text-sm">
                    {user?.display_name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <span className="text-sm text-slate-300 hidden md:block">{user?.display_name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-deep-ocean/95 backdrop-blur-xl border-white/10"
            >
              <DropdownMenuItem asChild>
                <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer" data-testid="menu-dashboard">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
