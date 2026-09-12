import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Sparkles, 
  Play, 
  RotateCcw, 
  PlusCircle, 
  Download, 
  Upload, 
  Sliders, 
  Coins, 
  Layers, 
  Camera, 
  Sun, 
  CloudRain, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  BookmarkPlus
} from 'lucide-react';
import { Project, Character, GenerationJob } from '../types/index.js';
import { getVideoCreditCost } from '../config/credits.js';
import { api } from '../services/api.js';

interface TextToVideoPageProps {
  activeProject: Project | null;
  characters: Character[];
  onSceneAdded: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const TextToVideoPage: React.FC<TextToVideoPageProps> = ({
  activeProject,
  characters,
  onSceneAdded,
  onShowToast,
}) => {
  // Form State
  const [prompt, setPrompt] = useState('An ancient Himalayan temple bathed in mystical golden sunrise, swirling celestial mist, cinematic 70mm anamorphic lens, hyper-realistic, volumetric light shafts');
  const [negativePrompt, setNegativePrompt] = useState('blurry, distorted face, low quality, oversaturated, artificial rendering');
  const [style, setStyle] = useState('Cinematic Film');
  const [camera, setCamera] = useState('Wide Cinematic');
  const [cameraMovement, setCameraMovement] = useState('Dolly In/Out');
  const [lighting, setLighting] = useState('Golden Hour');
  const [environment, setEnvironment] = useState('Ancient Temple Mountain');
  const [weather, setWeather] = useState('Foggy/Misty');
  const [timeOfDay, setTimeOfDay] = useState('Dawn');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(10);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '2.39:1'>((activeProject?.aspectRatio as any) || '16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');

  // Cinematic Presets from Stitch Design
  const cinematicPresets = [
    {
      title: '🌆 Neo-Noir Cyberpunk',
      prompt: 'Cinematic movie still, neo-noir cyberpunk city street bathed in wet neon reflections, towering holographic advertisements, steam rising from grates, rainy 35mm anamorphic film look',
      style: 'Cyberpunk Neon',
      lighting: 'Neon Noir Cyberpunk',
      camera: 'Wide Cinematic',
      cameraMovement: 'Smooth Pan Right',
      aspect: '2.39:1' as const
    },
    {
      title: '🚀 Spacecraft Cockpit',
      prompt: 'Cinematic retro-futuristic spacecraft cockpit interior with astronaut staring through panoramic observation window at distant nebula, glowing vintage analog dials and amber CRT monitors, Kodak Vision3 500T',
      style: 'Cinematic Film',
      lighting: 'Volumetric Sun Shafts',
      camera: 'Medium Shot',
      cameraMovement: 'Dolly In/Out',
      aspect: '16:9' as const
    },
    {
      title: '⚡ Cyberpunk Operative',
      prompt: 'Cinematic extreme close-up portrait of a female cyberpunk operative, intense gaze, subtle retinal cyberware glow, neon amber and teal rim lighting, shallow depth of field, 85mm f/1.4 lens',
      style: 'Hyper-Realistic',
      lighting: 'Dramatic Rim Light',
      camera: 'Close-up Portrait',
      cameraMovement: 'Static Locked',
      aspect: '16:9' as const
    },
    {
      title: '🪐 Alien Desert Monolith',
      prompt: 'Cinematic sci-fi desert planet scene, colossal sleek alien structure glowing at twilight, two explorers in high-tech environmental suits standing on sand dunes, IMAX 70mm composition',
      style: 'Cinematic Film',
      lighting: 'Dusk / Twilight',
      camera: 'Extreme Wide Aerial',
      cameraMovement: 'Dynamic Tracking Shot',
      aspect: '2.39:1' as const
    },
    {
      title: '🌲 Bioluminescent Grove',
      prompt: 'Cinematic photorealistic fantasy scene, glowing bioluminescent enchanted ancient forest with towering weeping willow glowing in ethereal cyan and gold spores, mist-shrouded river',
      style: 'Cinematic Film',
      lighting: 'Celestial Divine Glow',
      camera: 'Wide Cinematic',
      cameraMovement: '360 Orbit',
      aspect: '16:9' as const
    },
    {
      title: '🔱 Kurukshetra Awakening',
      prompt: 'Lord Krishna on golden chariot at dawn, celestial radiance expanding in eternal mandala, divine white horses, golden morning mist piercing 70mm lens',
      style: 'Indian Mythological Epic',
      lighting: 'Golden Hour',
      camera: 'Low Angle Hero',
      cameraMovement: 'Dolly In/Out',
      aspect: '16:9' as const
    },
  ];

  const handleEnhancePrompt = () => {
    const enhancements = [
      ', masterfully shot on 35mm anamorphic lens, Panavision C-Series, cinematic depth of field, subtle film grain, natural color timing, 8K resolution, award-winning cinematography',
      ', volumetric lighting rays, photochemical grading, shot on ARRI Alexa 65, photorealistic texture detail, hyper-detailed reflections, octane render clarity',
      ', atmospheric haze, directional rim lighting, cinematic color palette, dynamic range, IMAX 70mm masterwork'
    ];
    const addition = enhancements[Math.floor(Math.random() * enhancements.length)];
    if (!prompt.includes('anamorphic') && !prompt.includes('ARRI')) {
      setPrompt((prev) => prev.trim() + addition);
      onShowToast('Prompt enhanced with cinematic tokens!', 'success');
    } else {
      onShowToast('Prompt already contains high-fidelity cinematography tokens', 'info');
    }
  };

  // Generation Job State
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState<string>('');
  const [providerInfo, setProviderInfo] = useState<string>('AI Video Provider');

  const creditCost = getVideoCreditCost(duration);

  // Check health and provider on mount
  useEffect(() => {
    api.getHealth().then(res => {
      if (res?.providers?.video) {
        setProviderInfo(res.providers.video);
      }
    }).catch(() => {});
  }, []);

  // Poll active generation job
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeJob && activeJob.status !== 'COMPLETED' && activeJob.status !== 'FAILED') {
      timer = setInterval(async () => {
        try {
          const res = await api.getJob(activeJob.id);
          setActiveJob(res.job);
          if (res.job.status === 'COMPLETED' && res.job.resultUrl) {
            setVideoUrl(res.job.resultUrl);
            onShowToast('Video generated successfully!', 'success');
          } else if (res.job.status === 'FAILED') {
            onShowToast(res.job.error || 'Generation failed', 'error');
          }
        } catch (err) {
          console.error('Job polling error:', err);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeJob]);

  const handleRetry = async () => {
    if (!activeJob) return;
    setIsSubmitting(true);
    try {
      const res = await api.retryJob(activeJob.id);
      setActiveJob(res.job);
      onShowToast('Retrying video generation...', 'info');
    } catch (err: any) {
      onShowToast(err.message || 'Retry failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtend = async () => {
    if (!activeJob) return;
    setIsExtending(true);
    try {
      const res = await api.extendVideo(activeJob.id, 'Continue the scene with matching cinematic camera and lighting');
      setActiveJob(res.job);
      setVideoUrl(null);
      onShowToast('Extending video by +7s (10 credits reserved)', 'info');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to extend video', 'error');
    } finally {
      setIsExtending(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onShowToast('Please enter a descriptive cinematic prompt', 'error');
      return;
    }

    setIsSubmitting(true);
    setVideoUrl(null);
    setLastGeneratedPrompt(prompt);

    try {
      const res = await api.generateVideo({
        prompt,
        negativePrompt,
        style,
        camera,
        cameraMovement,
        lighting,
        environment,
        weather,
        timeOfDay,
        characterId: selectedCharacterId || undefined,
        referenceImageUrl: referenceImageUrl || undefined,
        duration,
        aspectRatio,
        resolution,
        projectId: activeProject?.id,
      });

      setActiveJob(res.job);
      onShowToast(`Generation queued (${res.cost} credits reserved)`, 'info');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to start generation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToProject = async () => {
    if (!activeProject) {
      onShowToast('No active film project selected', 'error');
      return;
    }
    if (!videoUrl) {
      onShowToast('Generate a video first before adding to project', 'error');
      return;
    }

    try {
      await api.addScene(activeProject.id, {
        title: `Scene: ${prompt.substring(0, 24)}...`,
        duration,
        visualPrompt: prompt,
        camera,
        lighting,
        videoUrl,
        thumbnailUrl: activeJob?.resultUrl ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80' : undefined,
        status: 'ready'
      });
      onSceneAdded();
      onShowToast('Added scene to current project timeline!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to add scene', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-cinematic">Text to Video Studio</h1>
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
              providerInfo.includes('Veo') || providerInfo.includes('AI Engine')
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                : 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50'
            }`}>
              {providerInfo}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Transform text directives into high-resolution cinematic video with shot, lens, and lighting controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-mono">
            Target Project: <span className="text-indigo-400 font-bold">{activeProject?.title || 'None Selected'}</span>
          </span>
        </div>
      </div>

      {/* Main Studio Grid: Left Form Controls, Right Cinematic Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 7 Cols */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Prompt Input */}
          <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Cinematic Prompt
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-medium border border-indigo-500/30 transition-colors"
                  title="Enhance prompt with 35mm lens and volumetric lighting directives"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>AI Enhance</span>
                </button>
                <span className="text-[11px] text-zinc-500">{prompt.length} chars</span>
              </div>
            </div>

            <textarea
              id="t2v-prompt-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe scene action, camera placement, atmospheric lighting, mood..."
              className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
            />

            {/* Quick Presets from Stitch Designs */}
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Stitch Cinematic Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {cinematicPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(preset.prompt);
                      setStyle(preset.style);
                      setLighting(preset.lighting);
                      setCamera(preset.camera);
                      setCameraMovement(preset.cameraMovement);
                      setAspectRatio(preset.aspect);
                      onShowToast(`Applied "${preset.title}" preset!`, 'info');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-[11px] text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all font-sans"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Prompt */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Negative Prompt (Elements to avoid)
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="blurry, distorted, artifacts, low quality..."
                className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          {/* Camera, Style & Lighting Selectors */}
          <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              Cinematography Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Style */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Visual Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option>Cinematic Film</option>
                  <option>Hyper-Realistic</option>
                  <option>Indian Mythological Epic</option>
                  <option>Anime / Manga</option>
                  <option>3D Render (Unreal 5)</option>
                  <option>Film Noir</option>
                  <option>Cyberpunk Neon</option>
                  <option>Devotional Divine</option>
                </select>
              </div>

              {/* Camera Angle */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Camera Framing</label>
                <select
                  value={camera}
                  onChange={(e) => setCamera(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option>Wide Cinematic</option>
                  <option>Extreme Wide Aerial</option>
                  <option>Medium Shot</option>
                  <option>Close-up Portrait</option>
                  <option>Low Angle Hero</option>
                  <option>Over-the-Shoulder</option>
                  <option>Macro Details</option>
                </select>
              </div>

              {/* Camera Movement */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Camera Movement</label>
                <select
                  value={cameraMovement}
                  onChange={(e) => setCameraMovement(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option>Dolly In/Out</option>
                  <option>Static Locked</option>
                  <option>Smooth Pan Left</option>
                  <option>Smooth Pan Right</option>
                  <option>Tilt Up/Down</option>
                  <option>360 Orbit</option>
                  <option>Crane Jib Rise</option>
                  <option>Dynamic Tracking Shot</option>
                </select>
              </div>
            </div>

            {/* Lighting, Environment, Time of Day */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Lighting</label>
                <select
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option>Golden Hour</option>
                  <option>Dramatic Rim Light</option>
                  <option>Volumetric Sun Shafts</option>
                  <option>Moody Chiaroscuro</option>
                  <option>Neon Noir Cyberpunk</option>
                  <option>Celestial Divine Glow</option>
                  <option>Soft Studio Diffused</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Weather</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option>Foggy/Misty</option>
                  <option>Clear Blue</option>
                  <option>Heavy Rain</option>
                  <option>Thunderstorm</option>
                  <option>Floating Embers</option>
                  <option>Snow Dust</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Time of Day</label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option>Dawn</option>
                  <option>High Noon</option>
                  <option>Golden Hour</option>
                  <option>Dusk / Twilight</option>
                  <option>Midnight</option>
                  <option>Cosmic Astral Night</option>
                </select>
              </div>
            </div>
          </div>

          {/* Character, Reference Image & Output Settings */}
          <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-pink-400" />
              Character & Output Specs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Character Selector */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Assign Character</label>
                <select
                  value={selectedCharacterId}
                  onChange={(e) => setSelectedCharacterId(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">None (Environment / General)</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.visualStyle})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Image Input */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Reference Image URL (Optional)</label>
                <input
                  type="text"
                  value={referenceImageUrl}
                  onChange={(e) => setReferenceImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Duration, Aspect Ratio, Resolution */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Duration</label>
                <div className="flex flex-wrap gap-1.5">
                  {[10, 20, 30, 60, 120].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                        duration === d
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Aspect Ratio</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['16:9', '9:16', '1:1', '2.39:1'] as const).map((ar) => (
                    <button
                      key={ar}
                      type="button"
                      onClick={() => setAspectRatio(ar)}
                      className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                        aspectRatio === ar
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Resolution</label>
                <div className="flex gap-1.5">
                  {(['720p', '1080p', '4k'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setResolution(r)}
                      className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                        resolution === r
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="t2v-generate-btn"
              onClick={handleGenerate}
              disabled={isSubmitting || (activeJob && activeJob.status !== 'COMPLETED' && activeJob.status !== 'FAILED')}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reserving Credits...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Generate Video ({creditCost} Credits)</span>
                </>
              )}
            </button>

            {videoUrl && (
              <>
                <button
                  id="t2v-add-to-project-btn"
                  onClick={handleAddToProject}
                  className="inline-flex items-center gap-2 py-3 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-medium text-xs transition-colors"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Add to Project</span>
                </button>

                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                  title="Regenerate scene"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Regenerate</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Cinematic Media Preview: 5 Cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-4 sm:p-5 flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Video className="w-3.5 h-3.5 text-indigo-400" />
                  Cinematic Monitor
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {aspectRatio} • {resolution}
                </span>
              </div>

              {/* Video Player or Progress State */}
              <div
                className={`relative w-full rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center ${
                  aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[480px]' : aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video'
                }`}
              >
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : activeJob && activeJob.status === 'FAILED' ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 max-w-md">
                    <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-600/40 flex items-center justify-center text-rose-400">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                        Generation Failed
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-3">
                        {activeJob.error || 'The video engine encountered an error.'}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-mono mt-1">
                        ✓ Credits automatically refunded
                      </p>
                    </div>

                    <button
                      onClick={handleRetry}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-colors"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      <span>Retry Generation</span>
                    </button>
                  </div>
                ) : activeJob && activeJob.status !== 'COMPLETED' ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    <div>
                      <p className="text-xs font-semibold text-white uppercase tracking-wider">
                        {activeJob.status} ({activeJob.progress}%)
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        {activeJob.status === 'QUEUED' && 'Establishing neural rendering pipeline...'}
                        {activeJob.status === 'PROCESSING' && 'Synthesizing scene cinematography and lighting...'}
                        {activeJob.status === 'GENERATING' && 'Generating high-fidelity frames with Veo model...'}
                        {activeJob.status === 'ASSEMBLING' && 'Encoding final cinematic MP4 video stream...'}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-48 h-2 rounded-full bg-zinc-800 overflow-hidden mt-2">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${activeJob.progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-500 space-y-2">
                    <Video className="w-12 h-12 stroke-[1.2] text-zinc-600" />
                    <p className="text-xs">Click "Generate Video" to begin AI rendering</p>
                    <span className="text-[10px] text-zinc-600 font-mono">
                      {providerInfo.includes('Veo') ? 'High Quality Google Veo AI Engine' : 'Fast Demo Mode Active'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Output Meta, Extend & Download Bar */}
            {videoUrl && (
              <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-zinc-400 font-mono truncate max-w-[200px]">
                  {duration}s • {resolution}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExtend}
                    disabled={isExtending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/50 text-xs font-medium transition-colors disabled:opacity-50"
                    title="Extend scene by +7 seconds using video continuation"
                  >
                    {isExtending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Extend (+7s)</span>
                  </button>

                  <a
                    href={videoUrl}
                    download="cinematic_clip.mp4"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
