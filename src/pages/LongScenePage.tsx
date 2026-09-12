import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Sparkles, 
  Layers, 
  Play, 
  Pause,
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
  Shuffle,
  Volume2,
  Music,
  Download,
  Edit3,
  User,
  Image as ImageIcon,
  Check,
  Subtitles,
  Eye
} from 'lucide-react';
import { Project, Character, GenerationJob, Shot, ConsistencyLevel } from '../types/index.js';
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
  // Main Directive
  const [mainPrompt, setMainPrompt] = useState(
    'An epic showdown at twilight on a misty cliffside: The ancient warrior draws a flaming blade as the thunder clouds gather and dragons circle overhead.'
  );
  const [duration, setDuration] = useState<30 | 60 | 90 | 120>(60);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '2.39:1'>((activeProject?.aspectRatio as any) || '16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');

  // Character Selection & Consistency
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [charConsistency, setCharConsistency] = useState<ConsistencyLevel>('high');
  const [envContinuity, setEnvContinuity] = useState<ConsistencyLevel>('high');
  const [costumeConsistency, setCostumeConsistency] = useState<ConsistencyLevel>('high');
  const [styleConsistency, setStyleConsistency] = useState<ConsistencyLevel>('high');

  // Scene Context State
  const [sceneLocation, setSceneLocation] = useState('Ancient Cliffside Mountain Sanctum');
  const [sceneTime, setSceneTime] = useState('Twilight / Dusk');
  const [sceneLighting, setSceneLighting] = useState('Dramatic Rim Light with Volumetric Mist');
  const [sceneWeather, setSceneWeather] = useState('Foggy with Floating Embers');
  const [sceneVisualStyle, setSceneVisualStyle] = useState('Indian Mythological Epic');
  const [sceneCameraStyle, setSceneCameraStyle] = useState('70mm Anamorphic Film');

  // Pipeline Job State
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);

  // Editing Shot Modal State
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editCamera, setEditCamera] = useState('');

  // Continuous Video Player Deck State
  const [activePreviewShotIndex, setActivePreviewShotIndex] = useState(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  // Audio Assembly Controls
  const [voiceVolume, setVoiceVolume] = useState<number>(85);
  const [musicVolume, setMusicVolume] = useState<number>(60);
  const [sfxVolume, setSfxVolume] = useState<number>(45);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [isAssembling, setIsAssembling] = useState<boolean>(false);
  const [assembledVideoUrl, setAssembledVideoUrl] = useState<string | null>(null);

  const cost = getVideoCreditCost(duration);
  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId);

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
            setAssembledVideoUrl(res.job.resultUrl || null);
            onShowToast('Long Scene multi-shot sequence fully generated!', 'success');
          }
        } catch (err) {
          console.error('Long scene polling error:', err);
        }
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [activeJob?.id, activeJob?.status]);

  // Handle Launching the Sequential Pipeline
  const handleLaunchPipeline = async () => {
    if (!mainPrompt.trim()) {
      onShowToast('Please enter the main cinematic scene prompt', 'error');
      return;
    }

    setIsSubmitting(true);
    setAssembledVideoUrl(null);
    try {
      const res = await api.generateLongScene({
        prompt: mainPrompt,
        duration,
        characterConsistency: charConsistency,
        environmentContinuity: envContinuity,
        costumeConsistency,
        styleConsistency,
        selectedCharacterId: selectedCharacterId || undefined,
        aspectRatio,
        resolution,
        projectId: activeProject?.id,
        sceneContext: {
          location: sceneLocation,
          time: sceneTime,
          lighting: sceneLighting,
          weather: sceneWeather,
          visualStyle: sceneVisualStyle,
          cameraStyle: sceneCameraStyle,
        }
      });

      setActiveJob(res.job);
      if (res.job.shots) {
        setShots(res.job.shots);
      }
      onShowToast(`Long Scene Pipeline launched with ${res.job.shots?.length || Math.round(duration/10)} sequential shots!`, 'info');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to start long scene pipeline', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retry Shot Handler
  const handleRetryShot = async (shotId: string) => {
    if (!activeJob) return;
    try {
      const res = await api.retryShot(activeJob.id, shotId);
      setActiveJob(res.job);
      if (res.job.shots) setShots(res.job.shots);
      onShowToast(`Retrying Shot ${shotId}...`, 'info');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to retry shot', 'error');
    }
  };

  // Resume Pipeline Handler
  const handleResumePipeline = async () => {
    if (!activeJob) return;
    try {
      const res = await api.resumeLongScene(activeJob.id);
      setActiveJob(res.job);
      if (res.job.shots) setShots(res.job.shots);
      onShowToast('Resumed long scene sequential generation', 'info');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to resume pipeline', 'error');
    }
  };

  // Save Edited Shot
  const handleSaveEditedShot = async () => {
    if (!activeJob || !editingShot) return;
    try {
      const res = await api.editShot(activeJob.id, editingShot.id, {
        prompt: editPrompt,
        camera: editCamera,
      });
      setActiveJob(res.job);
      if (res.job.shots) setShots(res.job.shots);
      setEditingShot(null);
      onShowToast(`Updated directive for Shot ${editingShot.shotNumber}`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to edit shot', 'error');
    }
  };

  // Final Assembly & MP4 Export
  const handleAssembleFinalVideo = async () => {
    if (!activeJob) {
      onShowToast('Launch a long scene pipeline first', 'error');
      return;
    }

    const completed = shots.filter((s) => s.status === 'COMPLETED');
    if (completed.length === 0) {
      onShowToast('No completed shots ready to assemble', 'error');
      return;
    }

    setIsAssembling(true);
    try {
      const res = await api.assembleLongScene(activeJob.id, {
        audioTracks: {
          voiceVolume,
          musicVolume,
          sfxVolume,
        },
        subtitles: {
          enabled: showSubtitles,
          language: 'Hindi / English',
        }
      });

      setAssembledVideoUrl(res.assembledVideoUrl);
      setActiveJob(res.job);
      onShowToast(`Successfully assembled final ${res.duration}s multi-shot scene!`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Assembly failed', 'error');
    } finally {
      setIsAssembling(false);
    }
  };

  // Add all completed shots to the active project's timeline
  const handleAddAllToProject = async () => {
    if (!activeProject) {
      onShowToast('Select a film project first', 'error');
      return;
    }

    const completedShots = shots.filter((s) => s.status === 'COMPLETED');
    if (completedShots.length === 0) {
      onShowToast('No completed shots available to add', 'error');
      return;
    }

    try {
      for (const shot of completedShots) {
        await api.addScene(activeProject.id, {
          title: `Shot ${shot.shotNumber}: ${shot.camera}`,
          duration: shot.duration,
          visualPrompt: shot.prompt,
          camera: shot.camera,
          lighting: sceneLighting,
          location: sceneLocation,
          videoUrl: shot.videoUrl || assembledVideoUrl || undefined,
          thumbnailUrl: shot.previewUrl,
          status: 'ready',
        });
      }
      onSceneAdded();
      onShowToast(`Added all ${completedShots.length} completed shots to "${activeProject.title}"!`, 'success');
    } catch (err: any) {
      onShowToast('Failed to add shots: ' + err.message, 'error');
    }
  };

  const completedShotsCount = shots.filter((s) => s.status === 'COMPLETED').length;
  const currentVideoToPlay = shots[activePreviewShotIndex]?.videoUrl || assembledVideoUrl || (shots.find((s) => s.videoUrl)?.videoUrl);

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="border-b border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-cinematic">Long Scene Orchestrator</h1>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700/50 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-purple-400" />
              Multi-Shot Sequential Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Build cohesive 30s to 120s scenes through character-locked multi-shot generation, audio synchronization, and final master export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-mono">
            Project: <strong className="text-purple-400">{activeProject?.title || 'None Selected'}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs font-mono text-amber-400 font-bold">
            {cost} Credits
          </span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Directive & Continuity Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Cinematic Prompt */}
          <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Main Cinematic Scene Arc
              </label>
              <span className="text-[10px] font-mono text-zinc-500">
                Duration: {duration}s (~{Math.round(duration / 10)} shots)
              </span>
            </div>

            <textarea
              rows={3}
              value={mainPrompt}
              onChange={(e) => setMainPrompt(e.target.value)}
              placeholder="Describe the entire narrative arc, character struggle, environmental action, and emotional peak..."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 leading-relaxed"
            />

            {/* Target Duration Selector */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-zinc-400 w-24">Target Runtime:</span>
              <div className="flex gap-2 flex-1">
                {([30, 60, 90, 120] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      duration === d
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {d}s ({Math.round(d / 10)} Shots)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Character Anchor & Consistency Controls */}
          <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-pink-400" />
                Character Anchor & Consistency
              </h3>
              <span className="text-[10px] text-zinc-500">
                Loaded from Firestore Character Studio
              </span>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Select Anchor Character</label>
              <select
                value={selectedCharacterId}
                onChange={(e) => setSelectedCharacterId(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
              >
                <option value="">None (Ensemble / Setting Focus)</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.visualStyle})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Character Quick-Inspect Card */}
            {selectedCharacter && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-purple-900/40 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-700">
                  <img
                    src={selectedCharacter.referenceImageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80'}
                    alt={selectedCharacter.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{selectedCharacter.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono">
                      {selectedCharacter.visualStyle}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">
                    <strong>Appearance:</strong> {selectedCharacter.appearance}
                  </p>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">
                    <strong>Costume & Hair:</strong> {selectedCharacter.clothing} • {selectedCharacter.hair}
                  </p>
                </div>
              </div>
            )}

            {/* 4 Granular Consistency Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Character Continuity</label>
                <select
                  value={charConsistency}
                  onChange={(e) => setCharConsistency(e.target.value as any)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-200"
                >
                  <option value="high">High (Strict)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="off">Off</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Environment Continuity</label>
                <select
                  value={envContinuity}
                  onChange={(e) => setEnvContinuity(e.target.value as any)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-200"
                >
                  <option value="high">High (Strict)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="off">Off</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Costume Continuity</label>
                <select
                  value={costumeConsistency}
                  onChange={(e) => setCostumeConsistency(e.target.value as any)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-200"
                >
                  <option value="high">High (Strict)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="off">Off</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Visual Style Continuity</label>
                <select
                  value={styleConsistency}
                  onChange={(e) => setStyleConsistency(e.target.value as any)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-200"
                >
                  <option value="high">High (Strict)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="off">Off</option>
                </select>
              </div>
            </div>
          </div>

          {/* Scene Context & Setting Details */}
          <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Cinematography Setting & Environment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Location / Set</label>
                <input
                  type="text"
                  value={sceneLocation}
                  onChange={(e) => setSceneLocation(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Time of Day</label>
                <select
                  value={sceneTime}
                  onChange={(e) => setSceneTime(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
                >
                  <option>Twilight / Dusk</option>
                  <option>Dawn / Sunrise</option>
                  <option>Golden Hour</option>
                  <option>High Noon Harsh</option>
                  <option>Midnight Cosmic</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Lighting Atmosphere</label>
                <input
                  type="text"
                  value={sceneLighting}
                  onChange={(e) => setSceneLighting(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Atmosphere / Weather</label>
                <input
                  type="text"
                  value={sceneWeather}
                  onChange={(e) => setSceneWeather(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
                />
              </div>
            </div>

            {/* Launch Pipeline Button */}
            <div className="pt-2">
              <button
                id="long-scene-generate-btn"
                onClick={handleLaunchPipeline}
                disabled={isSubmitting || (activeJob && activeJob.status === 'PROCESSING' && activeJob.status !== 'COMPLETED' && activeJob.status !== 'FAILED')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Planning Sequential Shot Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      Start Multi-Shot Scene Pipeline ({duration}s • {cost} Credits)
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Multi-Shot Continuous Preview & Assembly (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Video Continuous Player Deck */}
          <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-purple-400" />
                Scene Playback & Assembly
              </h3>
              {activeJob && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeJob.status === 'COMPLETED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                    : activeJob.status === 'FAILED'
                    ? 'bg-red-950 text-red-300 border border-red-700/50'
                    : 'bg-purple-950 text-purple-300 border border-purple-700/50'
                }`}>
                  {activeJob.status} ({activeJob.progress}%)
                </span>
              )}
            </div>

            {/* Video Player Display */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 group">
              {currentVideoToPlay ? (
                <video
                  ref={previewVideoRef}
                  src={currentVideoToPlay}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                  <Film className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs">
                    {activeJob ? 'Generating sequential shots...' : 'Launch pipeline to preview multi-shot scene'}
                  </p>
                </div>
              )}

              {/* Subtitles Overlay Preview */}
              {showSubtitles && (currentVideoToPlay || activeJob) && (
                <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none px-4">
                  <span className="bg-black/80 text-white font-medium text-[11px] sm:text-xs px-3 py-1 rounded shadow-lg backdrop-blur-sm border border-zinc-700/50">
                    {shots[activePreviewShotIndex]?.prompt 
                      ? `[Shot ${shots[activePreviewShotIndex]?.shotNumber}] ${shots[activePreviewShotIndex]?.prompt.substring(0, 70)}...`
                      : 'धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः...'}
                  </span>
                </div>
              )}
            </div>

            {/* Shot Navigation Scrubber */}
            {shots.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Shot Timeline:</span>
                  <span>{completedShotsCount} of {shots.length} Ready</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {shots.map((shot, idx) => (
                    <button
                      key={shot.id}
                      type="button"
                      onClick={() => setActivePreviewShotIndex(idx)}
                      className={`h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-all ${
                        activePreviewShotIndex === idx
                          ? 'ring-2 ring-purple-400 bg-purple-900 text-white'
                          : shot.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          : shot.status === 'GENERATING'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700/60 animate-pulse'
                          : shot.status === 'FAILED'
                          ? 'bg-red-950 text-red-300 border border-red-700/60'
                          : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Track Mix Controls */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                  Audio Mix & Subtitles
                </span>
                <button
                  type="button"
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    showSubtitles 
                      ? 'bg-teal-950 text-teal-300 border-teal-700/50' 
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}
                >
                  <Subtitles className="w-2.5 h-2.5 inline mr-1" />
                  Subtitles: {showSubtitles ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                    <span>Voice</span>
                    <span className="font-mono text-teal-400">{voiceVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={voiceVolume}
                    onChange={(e) => setVoiceVolume(Number(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                    <span>Music</span>
                    <span className="font-mono text-purple-400">{musicVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                    <span>SFX</span>
                    <span className="font-mono text-pink-400">{sfxVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sfxVolume}
                    onChange={(e) => setSfxVolume(Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Assemble & Export MP4 */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleAssembleFinalVideo}
                disabled={isAssembling || completedShotsCount === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isAssembling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synchronizing Audio & Assembling MP4 Master...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    <span>Assemble & Export Final Scene MP4</span>
                  </>
                )}
              </button>

              {assembledVideoUrl && (
                <div className="flex gap-2">
                  <a
                    href={assembledVideoUrl}
                    download={`long_scene_${Date.now()}.mp4`}
                    className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Master</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleAddAllToProject}
                    className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Add to Timeline</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sequential Pipeline Progress Banner */}
      {activeJob && (
        <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Loader2 className={`w-3.5 h-3.5 ${activeJob.status === 'COMPLETED' ? 'text-emerald-400' : 'animate-spin text-purple-400'}`} />
              Pipeline: {activeJob.status} ({activeJob.progress}%)
            </span>
            <div className="flex items-center gap-2">
              {activeJob.status === 'FAILED' && (
                <button
                  type="button"
                  onClick={handleResumePipeline}
                  className="px-3 py-1 rounded-lg bg-red-900/80 hover:bg-red-800 text-red-200 text-xs font-semibold border border-red-700"
                >
                  Resume Pipeline
                </button>
              )}
              <span className="text-zinc-500 font-mono text-[11px]">
                Job ID: {activeJob.id}
              </span>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${activeJob.progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
            <span>Stage 1: Continuity Plan</span>
            <span>Stage 2: Sequential Shot Generation</span>
            <span>Stage 3: Audio Sync & Assemble</span>
            <span>Stage 4: Master Delivery</span>
          </div>
        </div>
      )}

      {/* Deconstructed Sequential Shots Grid */}
      {shots.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-cinematic">
              <Layers className="w-4 h-4 text-purple-400" />
              Deconstructed Sequential Shots ({completedShotsCount}/{shots.length} Completed)
            </h2>

            <button
              onClick={handleAddAllToProject}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Add All Shots to Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {shots.map((shot, idx) => (
              <div
                key={shot.id}
                className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                  shot.status === 'COMPLETED'
                    ? 'border-emerald-800/40 bg-[#121420]'
                    : shot.status === 'GENERATING'
                    ? 'border-purple-600/60 bg-[#161328] ring-1 ring-purple-500/40'
                    : shot.status === 'FAILED'
                    ? 'border-red-800/60 bg-[#1d1215]'
                    : 'border-zinc-800 bg-[#121320]'
                }`}
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
                      shot.status === 'COMPLETED' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : shot.status === 'GENERATING'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                        : shot.status === 'FAILED'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {shot.status}
                    </span>
                  </div>

                  {/* Thumbnail / Video Preview */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-2 border border-zinc-800">
                    {shot.videoUrl ? (
                      <video
                        src={shot.videoUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={shot.previewUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'}
                        alt={`Shot ${shot.shotNumber}`}
                        className="w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {shot.prompt}
                  </p>

                  {shot.error && (
                    <p className="text-[11px] text-red-400 mt-1 font-mono">
                      Error: {shot.error}
                    </p>
                  )}
                </div>

                {/* Shot Level Control Buttons */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1.5">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRetryShot(shot.id)}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 hover:text-white flex items-center gap-1"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>{shot.status === 'FAILED' ? 'Retry' : 'Regenerate'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingShot(shot);
                        setEditPrompt(shot.prompt);
                        setEditCamera(shot.camera);
                      }}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 hover:text-white flex items-center gap-1"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>Edit Directive</span>
                    </button>
                  </div>

                  {shot.videoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setActivePreviewShotIndex(idx);
                        if (previewVideoRef.current) {
                          previewVideoRef.current.currentTime = 0;
                          previewVideoRef.current.play().catch(() => {});
                        }
                      }}
                      className="px-2 py-1 rounded bg-purple-950 hover:bg-purple-900 text-[10px] text-purple-300 border border-purple-700/50 flex items-center gap-1"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>Preview</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Shot Directive Modal */}
      {editingShot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-[#141520] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white font-cinematic">
              Edit Shot {editingShot.shotNumber} Directive
            </h3>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Camera Direction</label>
              <input
                type="text"
                value={editCamera}
                onChange={(e) => setEditCamera(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Visual Action Directive</label>
              <textarea
                rows={4}
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 p-3 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingShot(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedShot}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md"
              >
                Save & Update Shot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
