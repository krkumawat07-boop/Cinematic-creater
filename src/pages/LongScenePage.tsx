import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Sparkles, 
  Layers, 
  Play, 
  RotateCcw, 
  Maximize2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Film, 
  ChevronRight, 
  Sliders, 
  Coins, 
  BookmarkPlus,
  RefreshCw,
  Shuffle
} from 'lucide-react';
import { Project, Character, GenerationJob, Shot } from '../types/index.js';
import { getVideoCreditCost } from '../config/credits.js';
import { api } from '../services/api.js';

interface LongScenePageProps {
  activeProject: Project | null;
  characters: Character[];
  onSceneAdded: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const LongScenePage: React.FC<LongScenePageProps> = ({
  activeProject,
  characters,
  onSceneAdded,
  onShowToast,
}) => {
  const [mainPrompt, setMainPrompt] = useState(
    'An epic showdown at twilight on a misty cliffside: The ancient warrior draws a flaming blade as the thunder clouds gather and dragons circle overhead.'
  );
  const [duration, setDuration] = useState<30 | 60 | 90 | 120>(60);
  const [characterConsistency, setCharacterConsistency] = useState(true);
  const [environmentContinuity, setEnvironmentContinuity] = useState(true);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  
  // Pipeline Job State
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);

  const cost = getVideoCreditCost(duration);

  // Poll Long Scene Job Pipeline
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeJob && activeJob.status !== 'COMPLETED' && activeJob.status !== 'FAILED') {
      timer = setInterval(async () => {
        try {
          const res = await api.getJob(activeJob.id);
          setActiveJob(res.job);
          if (res.job.shots) {
            setShots(res.job.shots);
          }
          if (res.job.status === 'COMPLETED') {
            onShowToast('Long Scene sequence assembled successfully!', 'success');
          }
        } catch (err) {
          console.error('Long scene polling error:', err);
        }
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [activeJob]);

  const handleLaunchPipeline = async () => {
    if (!mainPrompt.trim()) {
      onShowToast('Please enter the main cinematic scene prompt', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.generateLongScene({
        prompt: mainPrompt,
        duration,
        characterConsistency,
        environmentContinuity,
        selectedCharacterId: selectedCharacterId || undefined,
        projectId: activeProject?.id,
      });

      setActiveJob(res.job);
      if (res.job.shots) {
        setShots(res.job.shots);
      }
      onShowToast(`Long Scene Job launched (${res.cost} credits reserved)`, 'info');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to start long scene pipeline', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShotAction = (shotId: string, action: 'regenerate' | 'extend' | 'remix' | 'replace') => {
    onShowToast(`${action.toUpperCase()} queued for ${shotId} (Mock Engine)`, 'info');
    setShots(prev => prev.map(s => {
      if (s.id === shotId) {
        return { ...s, status: 'GENERATING' };
      }
      return s;
    }));

    setTimeout(() => {
      setShots(prev => prev.map(s => {
        if (s.id === shotId) {
          return { ...s, status: 'COMPLETED' };
        }
        return s;
      }));
      onShowToast(`${shotId} updated!`, 'success');
    }, 1500);
  };

  const handleAddAllToProject = async () => {
    if (!activeProject) {
      onShowToast('Select a film project first', 'error');
      return;
    }

    try {
      // Add as scenes
      for (const shot of shots) {
        await api.addScene(activeProject.id, {
          title: `Shot ${shot.shotNumber}: ${shot.camera}`,
          duration: shot.duration,
          visualPrompt: shot.prompt,
          camera: shot.camera,
          lighting: 'Cinematic Continuity Match',
          videoUrl: activeJob?.resultUrl || 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4',
          thumbnailUrl: shot.previewUrl,
          status: 'ready'
        });
      }
      onSceneAdded();
      onShowToast(`Added all ${shots.length} shots to current project!`, 'success');
    } catch (err: any) {
      onShowToast('Failed to add shots: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="border-b border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-cinematic">Long Scene Generator</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700/50">
              Multi-Shot Pipeline
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Generate continuous 30s to 120s scenes broken automatically into coherent, continuity-locked shots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">
            Cost: <span className="text-amber-400 font-bold">{cost} Credits</span>
          </span>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-2">
            Main Cinematic Scene Prompt
          </label>
          <textarea
            rows={3}
            value={mainPrompt}
            onChange={(e) => setMainPrompt(e.target.value)}
            placeholder="Describe the entire arc of the long scene..."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Duration & Continuity Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Duration Selector */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Target Duration</label>
            <div className="flex gap-2">
              {([30, 60, 90, 120] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                    duration === d
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              Auto-divides into ~{Math.round(duration / 10)} shots
            </span>
          </div>

          {/* Character Continuity Toggle */}
          <div className="flex flex-col justify-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={characterConsistency}
                onChange={(e) => setCharacterConsistency(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-700 text-purple-600 focus:ring-0 w-4 h-4"
              />
              <span className="text-xs font-semibold text-zinc-200">
                Maintain Character Consistency
              </span>
            </label>
            <p className="text-[10px] text-zinc-500 ml-6 mt-0.5">
              Locks facial features & attire across all shots
            </p>
          </div>

          {/* Environment Continuity Toggle */}
          <div className="flex flex-col justify-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={environmentContinuity}
                onChange={(e) => setEnvironmentContinuity(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-700 text-purple-600 focus:ring-0 w-4 h-4"
              />
              <span className="text-xs font-semibold text-zinc-200">
                Maintain Environment Continuity
              </span>
            </label>
            <p className="text-[10px] text-zinc-500 ml-6 mt-0.5">
              Preserves lighting direction, weather & set layout
            </p>
          </div>
        </div>

        {/* Character Assignment */}
        <div className="pt-2">
          <label className="text-[11px] text-zinc-400 block mb-1">Select Anchor Character (Optional)</label>
          <select
            value={selectedCharacterId}
            onChange={(e) => setSelectedCharacterId(e.target.value)}
            className="w-full sm:w-80 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">No specific character (General ensemble)</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.visualStyle})
              </option>
            ))}
          </select>
        </div>

        {/* Launch Button */}
        <div className="pt-2">
          <button
            id="long-scene-generate-btn"
            onClick={handleLaunchPipeline}
            disabled={isSubmitting || (activeJob && activeJob.status !== 'COMPLETED' && activeJob.status !== 'FAILED')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  Start Long Scene Pipeline ({duration}s • {cost} Credits)
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generation Pipeline Progress Bar */}
      {activeJob && (
        <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              Pipeline: {activeJob.status} ({activeJob.progress}%)
            </span>
            <span className="text-zinc-500 font-mono">
              Job: {activeJob.id}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 transition-all duration-500"
              style={{ width: `${activeJob.progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
            <span>Stage 1: Job Queued</span>
            <span>Stage 2: Generate Shots</span>
            <span>Stage 3: Continuity Check</span>
            <span>Stage 4: Final Assembly</span>
          </div>
        </div>
      )}

      {/* Shots List & Editor */}
      {shots.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-cinematic">
              <Layers className="w-4 h-4 text-purple-400" />
              Deconstructed Shots Sequence ({shots.length} Shots)
            </h2>

            {activeJob?.status === 'COMPLETED' && (
              <button
                onClick={handleAddAllToProject}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Add All Shots to Project</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {shots.map((shot) => (
              <div
                key={shot.id}
                className="rounded-xl border border-zinc-800 bg-[#121320] p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[11px] font-mono text-zinc-300 font-bold">
                      Shot {shot.shotNumber < 10 ? `0${shot.shotNumber}` : shot.shotNumber}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {shot.duration}s • {shot.camera}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      shot.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {shot.status}
                    </span>
                  </div>

                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-2 border border-zinc-800">
                    <img
                      src={shot.previewUrl}
                      alt={`Shot ${shot.shotNumber}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {shot.prompt}
                  </p>
                </div>

                {/* Shot Actions: Regenerate, Extend, Remix, Replace */}
                <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleShotAction(shot.id, 'regenerate')}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 hover:text-white"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={() => handleShotAction(shot.id, 'extend')}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 hover:text-white"
                  >
                    Extend
                  </button>
                  <button
                    onClick={() => handleShotAction(shot.id, 'remix')}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 hover:text-white"
                  >
                    Remix
                  </button>
                  <button
                    onClick={() => handleShotAction(shot.id, 'replace')}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 hover:text-white"
                  >
                    Replace
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
