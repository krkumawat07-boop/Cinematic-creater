import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  Copy, 
  Film, 
  BookmarkPlus, 
  Coins, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  Users 
} from 'lucide-react';
import { Project, StoryAnalysisResult } from '../types/index.js';
import { api } from '../services/api.js';

interface StoryToVideoPageProps {
  activeProject: Project | null;
  onScenesAdded: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const StoryToVideoPage: React.FC<StoryToVideoPageProps> = ({
  activeProject,
  onScenesAdded,
  onShowToast,
}) => {
  const [story, setStory] = useState(
    'In a world where artificial memories are traded on the black market, a renegade archivist discovers an untampered memory capsule dated 2026. The capsule contains the final transmission of a lost deep-space probe approaching an ancient alien megastructure near Saturn. When an elite syndicate attempts to seize the capsule, the archivist must race through the rainy, neon-lit alleys of Neo-Kashi to beam the signal to the global resistance before his own neural cyberware is wiped clean.'
  );
  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');
  const [durationSeconds, setDurationSeconds] = useState<number>(60);
  const [style, setStyle] = useState<string>('Cinematic Cyberpunk / Film Noir');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StoryAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!story.trim()) {
      onShowToast('Please paste a narrative story', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await api.generateStoryToVideo({
        story,
        language,
        durationSeconds,
        style,
      });

      setAnalysisResult(res.analysis);
      onShowToast(`Story structured into ${res.analysis.scenes.length} cinematic scenes!`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Story breakdown failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddAllScenes = async () => {
    if (!activeProject) {
      onShowToast('Please select or create an active project first', 'error');
      return;
    }
    if (!analysisResult) return;

    try {
      for (const sc of analysisResult.scenes) {
        await api.addScene(activeProject.id, {
          title: `Scene ${sc.sceneNumber}: ${sc.camera || 'Cinematic'}`,
          duration: sc.duration,
          visualPrompt: sc.visualPrompt,
          camera: sc.camera,
          lighting: 'Cinematic Atmosphere Match',
          voiceOverText: sc.voiceOver,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
          status: 'ready'
        });
      }
      onScenesAdded();
      onShowToast(`Added all ${analysisResult.scenes.length} scenes to ${activeProject.title}!`, 'success');
    } catch (err: any) {
      onShowToast('Error adding scenes: ' + err.message, 'error');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`${label} copied to clipboard!`, 'info');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-cinematic">Story to Video Engine</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-700/50">
              AI Storyboarder
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Convert long-form stories into scene breakdowns, character registries, locations, and shot-by-shot visual prompts.
          </p>
        </div>

        <div className="text-xs font-mono text-zinc-400">
          Cost: <strong className="text-amber-400">15 Credits</strong>
        </div>
      </div>

      {/* Input Form */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            Paste Narrative Story / Script
          </label>
          <textarea
            rows={4}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Paste your story here in English or Hindi..."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 leading-relaxed font-sans"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
            >
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Target Total Duration</label>
            <select
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
            >
              <option value={30}>30 Seconds (Shorts / Reels)</option>
              <option value={60}>60 Seconds (1-Minute Story)</option>
              <option value={90}>90 Seconds (Mini Trailer)</option>
              <option value={120}>120 Seconds (2-Minute Episode)</option>
              <option value={180}>180 Seconds (3-Minute Short Film)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Visual Art Direction</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
            >
              <option>Cinematic Cyberpunk / Film Noir</option>
              <option>Indian Mythological Epic</option>
              <option>Photorealistic Cinema (70mm)</option>
              <option>Grim Dark Fantasy</option>
              <option>Anime Masterpiece</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            id="story-to-video-analyze-btn"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Structuring Storyboard with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Deconstruct Story & Generate Storyboard (15 Credits)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Top Banner Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-sky-500/40 bg-sky-950/20">
            <div>
              <h2 className="text-base font-bold text-sky-300 font-cinematic">
                {analysisResult.title}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {analysisResult.scenes.length} Scenes • {analysisResult.characters.length} Key Characters • {analysisResult.locations.length} Locations
              </p>
            </div>

            <button
              onClick={handleAddAllScenes}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Import to Active Film Project</span>
            </button>
          </div>

          {/* Characters & Locations Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Characters */}
            <div className="rounded-xl border border-zinc-800 bg-[#11121c] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 mb-3">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                Detected Characters ({analysisResult.characters.length})
              </h3>
              <div className="space-y-2">
                {analysisResult.characters.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs">
                    <span className="font-bold text-white block">{c.name}</span>
                    <span className="text-[11px] text-zinc-400">{c.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="rounded-xl border border-zinc-800 bg-[#11121c] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 mb-3">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                Cinematic Locations ({analysisResult.locations.length})
              </h3>
              <div className="space-y-2">
                {analysisResult.locations.map((loc, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs">
                    <span className="font-bold text-white block">{loc.name}</span>
                    <span className="text-[11px] text-zinc-400">{loc.environment}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scenes Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Generated Scene Cards ({analysisResult.scenes.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.scenes.map((scene) => (
                <div
                  key={scene.sceneNumber}
                  className="rounded-xl border border-zinc-800 bg-[#11121c] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono text-[11px] font-bold">
                      Scene {scene.sceneNumber} • {scene.duration}s
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">{scene.camera}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                      Voiceover Narration
                    </span>
                    <p className="text-xs text-zinc-200 bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
                      "{scene.voiceOver}"
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold mb-1">
                      <span>AI VIDEO PROMPT</span>
                      <button
                        onClick={() => copyToClipboard(scene.visualPrompt, 'Prompt')}
                        className="hover:text-sky-400 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-900">
                      {scene.visualPrompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
