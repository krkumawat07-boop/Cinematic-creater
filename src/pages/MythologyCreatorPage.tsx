import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Volume2, 
  Layers, 
  Image as ImageIcon, 
  Music, 
  Film, 
  Copy, 
  BookmarkPlus, 
  Coins, 
  Loader2, 
  CheckCircle2,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Project, MythologyGenerationResult } from '../types/index.js';
import { api } from '../services/api.js';

interface MythologyCreatorPageProps {
  activeProject: Project | null;
  onScenesAdded: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const MythologyCreatorPage: React.FC<MythologyCreatorPageProps> = ({
  activeProject,
  onScenesAdded,
  onShowToast,
}) => {
  const [topic, setTopic] = useState('Maharathi Karna vs Arjuna on the 17th Day of Kurukshetra: The clash of Brahmashira Astra and celestial destiny');
  const [preset, setPreset] = useState<'YouTube Shorts (45s)' | '1-minute video' | '3-minute epic story'>('1-minute video');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [mythologyResult, setMythologyResult] = useState<MythologyGenerationResult | null>(null);

  const presetTopics = [
    'Maharathi Karna vs Arjuna: Day 17 Divine Clash',
    'Lord Shiva performing the Cosmic Rudra Tandava',
    'Kalki Avatar awakening in Kaliyuga on Devadatta horse',
    'Hanuman leaping across the ocean with Sanjeevani mountain',
    'Birth of Lord Ganesha and Parvati creating the divine guardian',
    'Bhishma Pitamah on the bed of arrows (Shara-Shayya)',
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      onShowToast('Please enter a mythology topic or select a preset', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.generateMythology({ topic, preset });
      setMythologyResult(res.result);
      onShowToast(`Mythology Suite generated! (${res.cost} credits deducted)`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddScenesToProject = async () => {
    if (!activeProject) {
      onShowToast('Please select or create an active project first', 'error');
      return;
    }
    if (!mythologyResult || !mythologyResult.scenes) {
      onShowToast('No mythology scenes to add', 'error');
      return;
    }

    try {
      for (const scene of mythologyResult.scenes) {
        await api.addScene(activeProject.id, {
          title: `Scene ${scene.sceneNumber}: ${scene.cameraAngle}`,
          duration: scene.duration,
          visualPrompt: scene.visualPrompt,
          camera: scene.cameraAngle,
          lighting: 'Divine Golden Hour / Volumetric Astral',
          voiceOverText: scene.hindiVoiceover,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
          status: 'ready'
        });
      }
      onScenesAdded();
      onShowToast(`Added all ${mythologyResult.scenes.length} mythology scenes to "${activeProject.title}"!`, 'success');
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
            <span className="text-2xl">🔱</span>
            <h1 className="text-2xl font-bold text-amber-300 font-cinematic">Hindi Mythology Creator</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/50">
              Indian Epic Suite
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Tailor-made for creators of YouTube Shorts, Reels, and documentaries covering Mahabharata, Ramayana, Puranas, and Vedic legends.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span>Cost: <strong className="text-amber-400">25 Credits</strong> / Complete Suite</span>
        </div>
      </div>

      {/* Input Box */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#1b1916] via-[#121118] to-[#0c0b12] p-5 space-y-4 shadow-xl">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2 mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Mythology Epic Topic / Legend
          </label>
          <textarea
            rows={2}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Kalki avatar weapon manifestation, Lord Krishna revealing Vishwaroopam..."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
            Quick Epic Legends (Click to Load):
          </span>
          <div className="flex flex-wrap gap-2">
            {presetTopics.map((pt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTopic(pt)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-amber-950/40 text-[11px] text-zinc-300 hover:text-amber-300 border border-zinc-800 transition-colors"
              >
                {pt}
              </button>
            ))}
          </div>
        </div>

        {/* Format & Generate CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-[11px] text-zinc-400">Target Format:</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as any)}
              className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
            >
              <option>YouTube Shorts (45s)</option>
              <option>1-minute video</option>
              <option>3-minute epic story</option>
            </select>
          </div>

          <button
            id="mythology-generate-suite-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Invoking Gemini Myth Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Generate Complete Mythology Suite (25 Credits)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Mythology Results Suite */}
      {mythologyResult && (
        <div className="space-y-6">
          {/* Top Banner Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/40 bg-amber-950/20">
            <div>
              <h2 className="text-base font-bold text-amber-300 font-cinematic">
                {mythologyResult.title}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {mythologyResult.scenes.length} Scenes Generated • Sanskrit / Hindi Sound Cues Ready
              </p>
            </div>

            <button
              onClick={handleAddScenesToProject}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Add All Scenes to Current Film</span>
            </button>
          </div>

          {/* Grid: Left Scenes breakdown, Right Audio, Music & Thumbnail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Scenes List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Scene Breakdown & Visual Prompts
              </h3>

              <div className="space-y-3">
                {mythologyResult.scenes.map((sc) => (
                  <div
                    key={sc.sceneNumber}
                    className="rounded-xl border border-zinc-800 bg-[#11121c] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-mono text-[11px] font-bold">
                        Scene {sc.sceneNumber} ({sc.duration}s)
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {sc.cameraAngle}
                      </span>
                    </div>

                    {/* Hindi Voiceover */}
                    <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold mb-1">
                        <span>HINDI VOICEOVER NARRATION</span>
                        <button
                          onClick={() => copyToClipboard(sc.hindiVoiceover, 'Hindi Voiceover')}
                          className="hover:text-amber-400 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <p className="text-xs font-hindi text-amber-100/90 leading-relaxed">
                        {sc.hindiVoiceover}
                      </p>
                    </div>

                    {/* Visual Prompt */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold mb-1">
                        <span>AI VISUAL PROMPT</span>
                        <button
                          onClick={() => copyToClipboard(sc.visualPrompt, 'Visual Prompt')}
                          className="hover:text-amber-400 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <p className="text-xs text-zinc-300 bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-900 font-mono text-[11px]">
                        {sc.visualPrompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Sound, Music, SFX & Thumbnail (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Music & Sound Effects */}
              <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                  Mythological Soundscape
                </h3>

                <div>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    BGM & Rhythmic Instrument Score
                  </span>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                    {mythologyResult.musicSuggestion}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Divine SFX & Weapon Cues
                  </span>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                    {mythologyResult.soundEffects}
                  </div>
                </div>
              </div>

              {/* High CTR Thumbnail */}
              <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                    High-CTR YouTube Cover
                  </h3>
                  <button
                    onClick={() => copyToClipboard(mythologyResult.thumbnailPrompt, 'Thumbnail Prompt')}
                    className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Prompt</span>
                  </button>
                </div>

                <div className="aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80"
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center">
                    <span className="text-xs text-white font-medium">
                      {mythologyResult.thumbnailPrompt}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 italic">
                  Prompt: {mythologyResult.thumbnailPrompt}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
