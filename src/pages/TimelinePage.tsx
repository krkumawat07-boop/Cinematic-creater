import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Download, 
  Film, 
  Mic2, 
  Music, 
  Type, 
  Scissors, 
  Layers, 
  Plus, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Settings, 
  Sliders,
  CheckCircle2,
  Loader2,
  Trash2
} from 'lucide-react';
import { Project, Scene } from '../types/index.js';
import { api } from '../services/api.js';

interface TimelinePageProps {
  activeProject: Project | null;
  scenes: Scene[];
  onScenesUpdated: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({
  activeProject,
  scenes,
  onScenesUpdated,
  onShowToast,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [activeTransition, setActiveTransition] = useState<'Cut' | 'Cross Dissolve' | 'Fade to Black' | 'Zoom In' | 'Whip Pan'>('Cross Dissolve');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  // Compute total duration
  const totalDuration = scenes.reduce((acc, s) => acc + (s.duration || 10), 0) || 30;

  // Playhead timer animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 0.5;
          // compute active scene
          let accum = 0;
          for (let i = 0; i < scenes.length; i++) {
            accum += scenes[i].duration || 10;
            if (next <= accum) {
              setSelectedSceneIndex(i);
              break;
            }
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, scenes]);

  if (!activeProject) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-8 text-center space-y-3">
        <Film className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-base font-bold text-white">No Film Project Selected</h2>
        <p className="text-xs text-zinc-400">Please select or create a project to open the timeline editor.</p>
      </div>
    );
  }

  const currentScene = scenes[selectedSceneIndex] || scenes[0];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await api.exportTimeline({
        projectId: activeProject.id,
        resolution: activeProject.resolution || '1080p',
        format: 'mp4',
        fps: 24
      });
      setExportedUrl(res.export.downloadUrl);
      onShowToast('Timeline assembled & rendered successfully!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleTrimScene = async (sceneId: string, delta: number) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;
    const newDuration = Math.max(3, (scene.duration || 10) + delta);
    try {
      await api.updateScene(activeProject.id, sceneId, { duration: newDuration });
      onScenesUpdated();
      onShowToast(`Scene trimmed to ${newDuration}s`, 'info');
    } catch (err: any) {
      onShowToast('Trim failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Controls & Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Video Playback Monitor (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-[#11121c] p-4 flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-indigo-400" />
                Live Program Monitor
              </span>
              <span className="text-xs font-mono text-indigo-400 font-semibold">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
              {currentScene?.videoUrl ? (
                <video
                  key={currentScene.id}
                  src={currentScene.videoUrl}
                  autoPlay={isPlaying}
                  loop
                  muted
                  className="w-full h-full object-cover"
                />
              ) : currentScene?.thumbnailUrl ? (
                <img
                  src={currentScene.thumbnailUrl}
                  alt={currentScene.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-zinc-600 flex flex-col items-center gap-2">
                  <Film className="w-12 h-12" />
                  <span className="text-xs">No active video clip</span>
                </div>
              )}

              {/* Subtitle / Voiceover Overlay */}
              {currentScene?.voiceOverText && (
                <div className="absolute bottom-4 inset-x-6 text-center">
                  <span className="px-3 py-1 rounded bg-black/80 text-white font-hindi text-xs sm:text-sm font-medium shadow-lg backdrop-blur-sm border border-white/10">
                    {currentScene.voiceOverText}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Transport Controls Bar */}
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTime(0)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                title="Rewind to start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Sequence</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setCurrentTime(Math.min(totalDuration, currentTime + 5))}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                title="Forward 5s"
              >
                <FastForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
              <span>{scenes.length} Scenes</span>
              <span>•</span>
              <span className="text-white font-bold">{activeProject.resolution}</span>
            </div>
          </div>
        </div>

        {/* Right: Scene Inspector & Export Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Scene Inspector */}
          <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                Active Scene Inspector
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Shot {selectedSceneIndex + 1} of {scenes.length}
              </span>
            </div>

            {currentScene ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase font-semibold">Title</span>
                  <p className="font-bold text-white truncate">{currentScene.title}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase font-semibold">Visual Prompt</span>
                  <p className="text-zinc-300 line-clamp-2 text-[11px] leading-relaxed">
                    {currentScene.visualPrompt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-400">Duration: <strong>{currentScene.duration}s</strong></span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTrimScene(currentScene.id, -2)}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[10px]"
                      title="Trim -2 seconds"
                    >
                      -2s
                    </button>
                    <button
                      onClick={() => handleTrimScene(currentScene.id, 2)}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[10px]"
                      title="Extend +2 seconds"
                    >
                      +2s
                    </button>
                  </div>
                </div>

                {/* Transition Selector */}
                <div className="pt-2 border-t border-zinc-800">
                  <label className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1">
                    Transition In
                  </label>
                  <select
                    value={activeTransition}
                    onChange={(e) => setActiveTransition(e.target.value as any)}
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200"
                  >
                    <option>Cut</option>
                    <option>Cross Dissolve</option>
                    <option>Fade to Black</option>
                    <option>Zoom In</option>
                    <option>Whip Pan</option>
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No scene selected</p>
            )}
          </div>

          {/* Export Studio Box */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-[#121422] to-[#0c0d15] p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              Final Master Video Export
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Assemble all video tracks, synchronized voiceovers, and background music into a master MP4.
            </p>

            <button
              id="timeline-export-master-btn"
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Assembling Master Timeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Export Master Film (MP4 1080p)</span>
                </>
              )}
            </button>

            {exportedUrl && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-medium">Export Ready!</span>
                <a
                  href={exportedUrl}
                  target="_blank"
                  rel="noreferrer"
                  download="cinematic_film_master.mp4"
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                >
                  Download Master
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Track Timeline Workspace */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0e0f17] p-4 space-y-3">
        {/* Timeline Header Ruler */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white font-cinematic uppercase tracking-wider text-[11px]">
              Multi-Track Timeline
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Playhead: {currentTime.toFixed(1)}s / {totalDuration}s
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
            <span>00:00</span>
            <span>───────</span>
            <span>00:15</span>
            <span>───────</span>
            <span>00:30</span>
            <span>───────</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Tracks Container */}
        <div className="space-y-2 select-none overflow-x-auto py-1">
          {/* Track 1: Video Track */}
          <div className="flex items-center gap-2">
            <div className="w-24 flex-shrink-0 flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Film className="w-3.5 h-3.5 text-indigo-400" />
              <span>V1 Video</span>
            </div>

            <div className="flex-1 flex gap-1.5 h-16 bg-zinc-950/80 rounded-xl p-1.5 border border-zinc-800/80 overflow-x-auto">
              {scenes.map((scene, idx) => {
                const isSelected = idx === selectedSceneIndex;
                const widthPercent = ((scene.duration || 10) / totalDuration) * 100;
                return (
                  <div
                    key={scene.id}
                    onClick={() => setSelectedSceneIndex(idx)}
                    style={{ minWidth: '110px', width: `${Math.max(15, widthPercent)}%` }}
                    className={`h-full rounded-lg overflow-hidden border cursor-pointer relative group transition-all flex items-center ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/60 ring-1 ring-indigo-400'
                        : 'border-zinc-700/60 bg-zinc-900/90 hover:border-zinc-500'
                    }`}
                  >
                    {scene.thumbnailUrl && (
                      <img
                        src={scene.thumbnailUrl}
                        alt={scene.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="relative z-10 px-2 text-[10px] font-semibold text-white truncate drop-shadow">
                      {scene.title}
                    </div>
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1 rounded bg-black/70 text-zinc-300">
                      {scene.duration}s
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 2: Voice Track */}
          <div className="flex items-center gap-2">
            <div className="w-24 flex-shrink-0 flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Mic2 className="w-3.5 h-3.5 text-teal-400" />
              <span>A1 Voice</span>
            </div>

            <div className="flex-1 flex gap-1.5 h-10 bg-zinc-950/80 rounded-xl p-1.5 border border-zinc-800/80 overflow-x-auto">
              {scenes.map((scene, idx) => (
                <div
                  key={scene.id}
                  style={{ minWidth: '110px', flex: scene.duration || 10 }}
                  className="h-full rounded-lg bg-teal-950/40 border border-teal-700/40 flex items-center px-2 text-[10px] text-teal-200 truncate"
                >
                  <span className="truncate">
                    {scene.voiceOverText ? `🎙️ ${scene.voiceOverText}` : '🎙️ Narration Track'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Track 3: Music Track */}
          <div className="flex items-center gap-2">
            <div className="w-24 flex-shrink-0 flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span>A2 Music</span>
            </div>

            <div className="flex-1 h-10 bg-zinc-950/80 rounded-xl p-1.5 border border-zinc-800/80 flex items-center">
              <div className="w-full h-full rounded-lg bg-amber-950/30 border border-amber-700/40 flex items-center justify-between px-3 text-[10px] text-amber-300 font-medium">
                <span>🎵 Cinematic Orchestral Score & Indian Percussions</span>
                <span className="font-mono text-zinc-400">{totalDuration}s</span>
              </div>
            </div>
          </div>

          {/* Track 4: Captions / Text Track */}
          <div className="flex items-center gap-2">
            <div className="w-24 flex-shrink-0 flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Type className="w-3.5 h-3.5 text-pink-400" />
              <span>T1 Text</span>
            </div>

            <div className="flex-1 h-8 bg-zinc-950/80 rounded-xl p-1 border border-zinc-800/80 flex items-center gap-1.5">
              <div className="w-1/3 h-full rounded bg-pink-950/30 border border-pink-700/40 px-2 flex items-center text-[9px] text-pink-200">
                Subtitles (Auto-Sync)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
