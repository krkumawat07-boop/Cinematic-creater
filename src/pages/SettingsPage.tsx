import React from 'react';
import { 
  Settings, 
  User, 
  Film, 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  LogOut, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types/index.js';

interface SettingsPageProps {
  user: UserProfile | null;
  onResetDemo: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onResetDemo,
  onShowToast,
}) => {
  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-2xl font-bold text-white font-cinematic">Settings & Preferences</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure production defaults, user account settings, and AI engine abstractions.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-indigo-400" />
          Filmmaker Account Profile
        </h2>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="User avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">
                {user?.displayName?.charAt(0) || 'K'}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">{user?.displayName || 'Creator K.R.'}</h3>
            <p className="text-xs text-zinc-400">{user?.email || 'krkumawat07@gmail.com'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Plan: {user?.plan || 'Free'}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                Role: {user?.role || 'Admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Provider Architecture Status */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          AI Provider Engine Status
        </h2>
        <p className="text-xs text-zinc-400">
          The application uses modular provider interfaces for video, image, voice, and script generation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <div className="flex items-center justify-between font-semibold text-white">
              <span>Video Provider</span>
              <span className="text-indigo-400 font-mono text-[11px]">MockVideoProvider</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Simulates video synthesis with sample renders & pipeline</p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <div className="flex items-center justify-between font-semibold text-white">
              <span>Image Provider</span>
              <span className="text-pink-400 font-mono text-[11px]">MockImageProvider</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Generates character sheets, thumbnails, and concept art</p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <div className="flex items-center justify-between font-semibold text-white">
              <span>Voice / Audio Provider</span>
              <span className="text-teal-400 font-mono text-[11px]">MockVoiceProvider</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Hindi, Sanskrit, and English neural audio streams</p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <div className="flex items-center justify-between font-semibold text-white">
              <span>Story & Mythology Engine</span>
              <span className="text-amber-400 font-mono text-[11px]">Gemini 2.5 Flash / Fallback</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Deconstructs story narratives into scenes & dialogue</p>
          </div>
        </div>
      </div>

      {/* Demo Reset */}
      <div className="rounded-2xl border border-red-500/30 bg-red-950/10 p-5 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-red-300 uppercase tracking-wider">
            Reset Demo Environment
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Reset sample film projects, test characters, and refresh credits balance to default.
          </p>
        </div>

        <button
          onClick={onResetDemo}
          className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-semibold"
        >
          Reset Demo
        </button>
      </div>
    </div>
  );
};
