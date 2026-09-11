import React from 'react';
import { 
  Plus, 
  Video, 
  Image as ImageIcon, 
  Clock, 
  BookOpen, 
  Users, 
  Mic2, 
  Sparkles, 
  Play, 
  Coins, 
  Film, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Copy,
  Trash2
} from 'lucide-react';
import { Project, GenerationJob, UserProfile } from '../types/index.js';
import { NavTab } from '../components/Sidebar.js';

interface DashboardPageProps {
  user: UserProfile | null;
  projects: Project[];
  activeProject: Project | null;
  recentJobs: GenerationJob[];
  onSelectProject: (p: Project) => void;
  onNavigate: (tab: NavTab) => void;
  onNewProject: () => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  projects,
  activeProject,
  recentJobs,
  onSelectProject,
  onNavigate,
  onNewProject,
  onDuplicateProject,
  onDeleteProject,
}) => {
  const quickActions = [
    {
      id: 'create',
      title: 'Text to Video',
      description: 'Generate high-fidelity cinematic video clips from text descriptions',
      icon: <Video className="w-5 h-5 text-indigo-400" />,
      tag: 'From 10 Credits',
      color: 'from-indigo-600/20 to-indigo-900/10 border-indigo-500/30'
    },
    {
      id: 'long-scene',
      title: 'Long Scene Generator',
      description: 'Generate 30s-120s multi-shot cinematic sequences with character consistency',
      icon: <Clock className="w-5 h-5 text-purple-400" />,
      tag: 'Multi-Shot AI',
      color: 'from-purple-600/20 to-purple-900/10 border-purple-500/30'
    },
    {
      id: 'mythology',
      title: '🔱 Mythology Creator',
      description: 'Dedicated Indian epic workflow: Hindi narration, divine character sheets, and Sanskrit cues',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      tag: 'Hindi Mythology',
      color: 'from-amber-600/20 to-amber-900/10 border-amber-500/30'
    },
    {
      id: 'story-to-video',
      title: 'Story to Video',
      description: 'Turn complete written narratives into full scene-by-scene storyboards automatically',
      icon: <BookOpen className="w-5 h-5 text-sky-400" />,
      tag: 'Auto-Storyboard',
      color: 'from-sky-600/20 to-sky-900/10 border-sky-500/30'
    },
    {
      id: 'characters',
      title: 'Character Studio',
      description: 'Create reusable characters with 7 turnaround reference views and consistency locking',
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      tag: 'Consistency Engine',
      color: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30'
    },
    {
      id: 'image-studio',
      title: 'Image Studio',
      description: 'Text-to-Image, Variations, Character sheets, Backgrounds & Thumbnail generator',
      icon: <ImageIcon className="w-5 h-5 text-pink-400" />,
      tag: '0 Credits (FREE)',
      color: 'from-pink-600/20 to-pink-900/10 border-pink-500/30'
    },
    {
      id: 'voice-studio',
      title: 'Voice Studio',
      description: 'Cinematic Hindi & English neural narration with emotion, pitch, and consistency controls',
      icon: <Mic2 className="w-5 h-5 text-teal-400" />,
      tag: '2 Credits / Voice',
      color: 'from-teal-600/20 to-teal-900/10 border-teal-500/30'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome & Hero Section */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-gradient-to-br from-[#121422] via-[#0d0e17] to-[#090a10] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen AI Filmmaking Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 font-cinematic">
            Create Cinematic Stories with AI.
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-6">
            Direct Hollywood & Indian epic productions with precision prompt controls, multi-shot long scenes, 
            consistent characters, and a professional multi-track timeline workspace.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dashboard-new-project-btn"
              onClick={onNewProject}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>New Film Project</span>
            </button>

            <button
              id="dashboard-explore-mythology-btn"
              onClick={() => onNavigate('mythology')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium text-xs sm:text-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>🔱 Mythology Studio</span>
            </button>

            <button
              id="dashboard-quick-create-btn"
              onClick={() => onNavigate('create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700 font-medium text-xs sm:text-sm transition-all"
            >
              <Video className="w-4 h-4 text-zinc-300" />
              <span>Text to Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Continue Editing Section (If an active project exists) */}
      {activeProject && (
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-zinc-900/40 to-zinc-950/60 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                {activeProject.thumbnailUrl ? (
                  <img
                    src={activeProject.thumbnailUrl}
                    alt={activeProject.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <Film className="w-8 h-8 opacity-40" />
                  </div>
                )}
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-zinc-300 font-mono">
                  {activeProject.aspectRatio}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Continue Editing
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                  {activeProject.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                  {activeProject.description || 'Custom Cinematic Film'}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400 font-mono">
                  <span>{activeProject.scenesCount} Scenes</span>
                  <span>•</span>
                  <span>{activeProject.duration}s Duration</span>
                  <span>•</span>
                  <span>{activeProject.resolution}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={() => onNavigate('storyboard')}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700 transition-colors"
              >
                Storyboard
              </button>
              <button
                onClick={() => onNavigate('timeline')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Open Timeline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Create Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-cinematic">
            Quick Create Workflows
          </h2>
          <span className="text-xs text-zinc-500">Pick an AI filmmaker studio</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <div
              key={action.id}
              onClick={() => onNavigate(action.id as NavTab)}
              className={`p-4 rounded-xl border bg-gradient-to-br ${action.color} hover:border-white/30 transition-all cursor-pointer group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/10 group-hover:scale-110 transition-transform">
                    {action.icon}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                    {action.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-medium text-zinc-300 group-hover:text-white">
                <span>Launch Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column: Recent Projects & Recent Generations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-cinematic">
              <Film className="w-4 h-4 text-indigo-400" />
              Recent Film Projects
            </h2>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.slice(0, 4).map((proj) => (
              <div
                key={proj.id}
                className="group relative rounded-xl border border-zinc-800 bg-[#11121c] p-4 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900 mb-3">
                    {proj.thumbnailUrl ? (
                      <img
                        src={proj.thumbnailUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Film className="w-8 h-8" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-zinc-200">
                      {proj.aspectRatio}
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-zinc-200">
                      {proj.duration}s
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white truncate">{proj.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                    {proj.description || 'No description provided'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {proj.scenesCount} Scenes
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateProject(proj.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      title="Duplicate project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(proj.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectProject(proj);
                        onNavigate('timeline');
                      }}
                      className="ml-2 px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-medium"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Credit Balance & Recent Generations */}
        <div className="space-y-6">
          {/* Credit Balance Card */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#1b1916] via-[#14131b] to-[#0f0e15] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4" />
                Ledger Balance
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                {user?.plan || 'Free'} Plan
              </span>
            </div>

            <div className="text-3xl font-bold text-white font-mono mt-1 mb-1">
              {user?.credits ?? 100} <span className="text-sm font-normal text-zinc-400">Credits</span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Credits are consumed server-side per generation. Video clips from 10 credits, image creation is 0 credits (FREE).
            </p>

            <button
              id="dashboard-upgrade-plan-btn"
              onClick={() => onNavigate('credits')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs transition-all shadow-md hover:scale-[1.01]"
            >
              Manage Credits & Plans
            </button>
          </div>

          {/* Recent Generations Queue */}
          <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>Recent Generation Jobs</span>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Live Tracking</span>
            </h3>

            {recentJobs.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-3 text-center">
                No active or recent generations. Start a new video or image!
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {job.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : job.status === 'FAILED' ? (
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      ) : (
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate capitalize">
                          {job.type.replace(/-/g, ' ')}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          {job.status} • {job.progress}%
                        </p>
                      </div>
                    </div>

                    {job.resultUrl && (
                      <a
                        href={job.resultUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded bg-indigo-600/30 text-indigo-300 text-[10px] hover:bg-indigo-600/50"
                      >
                        Preview
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
