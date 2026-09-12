import React, { useState } from 'react';
import { 
  Clapperboard, 
  Coins, 
  Sparkles, 
  ChevronDown, 
  Film, 
  ShieldCheck, 
  LogOut, 
  User, 
  Zap,
  Info
} from 'lucide-react';
import { UserProfile, Project } from '../types/index.js';

interface HeaderProps {
  user: UserProfile | null;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project) => void;
  onOpenCredits: () => void;
  onOpenNewProject: () => void;
  onSwitchUser: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  projects,
  activeProject,
  onSelectProject,
  onOpenCredits,
  onOpenNewProject,
  onSwitchUser,
  onLogout,
}) => {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#0d0e15]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: App Identity & Active Project */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectProject(projects[0] || activeProject)}>
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 group">
            <Clapperboard className="w-5 h-5 text-white transition-transform group-hover:scale-110" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-[#0d0e15] flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-black" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinematic text-base sm:text-lg font-bold tracking-wider text-white">
                CineForge
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-700/40">
                <Sparkles className="w-2.5 h-2.5" /> AI Suite
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono hidden sm:block">Cinematic Creator Studio</p>
          </div>
        </div>

        {/* Project Selector & Specs */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              id="active-project-dropdown-btn"
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all max-w-[180px] sm:max-w-[240px]"
            >
              <Film className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span className="truncate font-medium">
                {activeProject ? activeProject.title : 'Select Project'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 ml-auto" />
            </button>

            {showProjectDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-[#141520] border border-zinc-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 flex items-center justify-between">
                  <span>Current Productions</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{projects.length} Total</span>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        onSelectProject(proj);
                        setShowProjectDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-600/10 transition-colors ${
                        activeProject?.id === proj.id ? 'text-indigo-400 bg-indigo-500/10 font-semibold' : 'text-zinc-300'
                      }`}
                    >
                      <span className="truncate max-w-[180px]">{proj.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono px-1.5 py-0.5 rounded bg-black/40 border border-zinc-800">
                        {proj.resolution || '1080p'} • {proj.aspectRatio}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-zinc-800 p-1.5">
                  <button
                    id="header-create-project-btn"
                    onClick={() => {
                      setShowProjectDropdown(false);
                      onOpenNewProject();
                    }}
                    className="w-full text-center px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>+ New Film Project</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {activeProject && (
            <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <span className="text-indigo-400 font-semibold">{activeProject.resolution || '4K'}</span>
              <span>•</span>
              <span>{activeProject.fps || 24}fps</span>
              <span>•</span>
              <span className="text-zinc-300">{activeProject.aspectRatio || '16:9'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Credits, Demo Mode notice, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Credits Badge with quick Top Up */}
        <div className="flex items-center gap-1.5">
          <button
            id="credits-balance-header-btn"
            onClick={onOpenCredits}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
            title="View credit balance and transactions"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{user?.credits ?? 100}</span>
            <span className="hidden sm:inline text-zinc-400 font-normal text-[11px]">Credits</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-200 px-1.5 py-0.2 rounded uppercase ml-1">
              {user?.plan || 'Free'}
            </span>
          </button>

          <button
            onClick={onOpenCredits}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-700 transition-colors"
            title="Add more credits or change plan"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Top up</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            id="user-profile-menu-btn"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/40 transition-all"
          >
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.displayName}
                className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-medium text-xs">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[#141520] border border-zinc-700/80 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3.5 py-2 border-b border-zinc-800">
                <p className="text-xs font-semibold text-white truncate">{user?.displayName || 'Cinematic Creator'}</p>
                <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-700/50 text-indigo-300">
                    Plan: {user?.plan || 'free'}
                  </span>
                  <span className="inline-block text-[10px] font-mono text-zinc-500">
                    ID: {user?.id ? `${user.id.substring(0, 6)}...` : ''}
                  </span>
                </div>
              </div>
              
              <div className="py-1">
                <button
                  id="header-credit-ledger-btn"
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenCredits();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 flex items-center gap-2"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Credit Ledger & Plans</span>
                </button>
                {onLogout && (
                  <button
                    id="header-logout-btn"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center gap-2 border-t border-zinc-800/80 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
