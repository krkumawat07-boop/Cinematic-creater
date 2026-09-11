import React from 'react';
import { 
  Home, 
  Film, 
  Video, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Users, 
  FolderGit2, 
  LayoutGrid, 
  Sliders, 
  Mic2, 
  Image as ImageIcon, 
  Coins, 
  Settings,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export type NavTab = 
  | 'home' 
  | 'projects' 
  | 'create' 
  | 'long-scene' 
  | 'mythology' 
  | 'story-to-video' 
  | 'characters' 
  | 'assets' 
  | 'storyboard' 
  | 'timeline' 
  | 'voice-studio' 
  | 'image-studio' 
  | 'credits' 
  | 'settings'
  | 'admin';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  isAdmin = true,
}) => {
  const primaryNavItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string; special?: boolean }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', icon: <Film className="w-4 h-4" /> },
    { id: 'create', label: 'Text to Video', icon: <Video className="w-4 h-4" /> },
    { id: 'long-scene', label: 'Long Scene', icon: <Clock className="w-4 h-4" />, badge: 'Multi-Shot' },
    { id: 'mythology', label: '🔱 Mythology Creator', icon: <Sparkles className="w-4 h-4 text-amber-400" />, special: true, badge: 'Hindi Epic' },
    { id: 'story-to-video', label: 'Story to Video', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'characters', label: 'Characters', icon: <Users className="w-4 h-4" /> },
    { id: 'assets', label: 'Assets', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'storyboard', label: 'Storyboard', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Sliders className="w-4 h-4" /> },
    { id: 'voice-studio', label: 'Voice Studio', icon: <Mic2 className="w-4 h-4" /> },
    { id: 'image-studio', label: 'Image Studio', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'credits', label: 'Credits & Ledger', icon: <Coins className="w-4 h-4 text-amber-400" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  if (isAdmin) {
    primaryNavItems.push({
      id: 'admin',
      label: 'Admin Hub',
      icon: <ShieldCheck className="w-4 h-4 text-indigo-400" />,
      badge: 'Admin'
    });
  }

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-800/80 bg-[#0d0e15] h-[calc(100vh-4rem)] sticky top-16 select-none flex-shrink-0 z-20">
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Filmmaking Studio
          </div>
          {primaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-white/20'
                    : item.special
                      ? 'text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.special
                          ? 'bg-amber-400/20 text-amber-200'
                          : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Tagline / Status */}
        <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-900/30 text-center">
          <p className="text-[11px] font-cinematic text-zinc-300 font-semibold tracking-wide">
            CineForge AI Filmmaking Suite
          </p>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cinematic AI Engines Ready</span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative w-72 max-w-[80vw] bg-[#0d0e15] border-r border-zinc-800 h-full flex flex-col z-10 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <span className="font-cinematic text-sm font-bold text-white">Cinematic Studio</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-1">
              {primaryNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                    activeTab === item.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Responsive Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0d0e15]/95 backdrop-blur-md border-t border-zinc-800 flex items-center justify-around px-2 z-40">
        <button
          onClick={() => handleNavClick('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors ${
            activeTab === 'home' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleNavClick('create')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors ${
            activeTab === 'create' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Create</span>
        </button>

        <button
          onClick={() => handleNavClick('mythology')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors ${
            activeTab === 'mythology' ? 'text-amber-400 font-bold' : 'text-amber-400/80 hover:text-amber-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Mythology</span>
        </button>

        <button
          onClick={() => handleNavClick('timeline')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors ${
            activeTab === 'timeline' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Timeline</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium text-zinc-400 hover:text-zinc-200"
        >
          <Menu className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
