import React, { useState } from 'react';
import { 
  Mic2, 
  Play, 
  Pause, 
  Download, 
  Sparkles, 
  Coins, 
  Sliders, 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { api } from '../services/api.js';

interface VoiceStudioPageProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const VoiceStudioPage: React.FC<VoiceStudioPageProps> = ({ onShowToast }) => {
  const [text, setText] = useState('जब धर्म की हानि होती है और अधर्म का उत्थान होता है, तब-तब मैं धर्म की रक्षा के लिए अवतार लेता हूँ।');
  const [voice, setVoice] = useState('Arjun - Deep Epic Hindi');
  const [language, setLanguage] = useState('Hindi');
  const [style, setStyle] = useState('Cinematic Dramatic');
  const [emotion, setEmotion] = useState('Deep Epic');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [maintainConsistency, setMaintainConsistency] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const voiceTalents = [
    { name: 'Arjun - Deep Epic Hindi', lang: 'Hindi', type: 'Devotional / War Epic' },
    { name: 'Priya - Emotional & Mystic', lang: 'Hindi/Sanskrit', type: 'Mythological Narrative' },
    { name: 'Kabir - Dramatic Storyteller', lang: 'Hindi', type: 'Documentary & Shorts' },
    { name: 'Marcus - Deep Hollywood Trailer', lang: 'English', type: 'Movie Trailer Voice' },
    { name: 'Sarah - Sophisticated Cinema', lang: 'English', type: 'Narrative Audio' },
  ];

  const handleGenerateVoice = async () => {
    if (!text.trim()) {
      onShowToast('Please enter narration text', 'error');
      return;
    }

    setIsGenerating(true);
    setGeneratedAudioUrl(null);
    try {
      const res = await api.generateVoice({
        text,
        voice,
        language,
        style,
        emotion,
        speed,
        pitch,
        maintainConsistency
      });

      setGeneratedAudioUrl(res.voice.audioUrl);
      onShowToast(`Narration synthesized! (${res.cost} credits deducted)`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Voice synthesis failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-cinematic">Voice Studio</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700/50">
              Neural Speech Synthesis
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Studio-quality Hindi, Sanskrit, and English neural narration with emotion modulation and voice-actor consistency.
          </p>
        </div>

        <div className="text-xs font-mono text-zinc-400">
          Cost: <strong className="text-amber-400">2 Credits</strong> / Generation
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 mb-2">
              <Mic2 className="w-3.5 h-3.5 text-teal-400" />
              Narration Script
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter Hindi or English narration text..."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 leading-relaxed font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Voice Talent</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
              >
                {voiceTalents.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Emotion & Mood</label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
              >
                <option>Deep Epic & Resonant</option>
                <option>Mystical & Devotional</option>
                <option>Intense & Dramatic</option>
                <option>Warm & Inspiring</option>
                <option>Calm Narrative</option>
              </select>
            </div>
          </div>

          {/* Speed & Pitch Sliders */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span>Speed Rate</span>
                <span className="font-mono text-teal-400 font-bold">{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span>Pitch Modulation</span>
                <span className="font-mono text-teal-400 font-bold">{pitch.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={maintainConsistency}
                onChange={(e) => setMaintainConsistency(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-700 text-teal-600 focus:ring-0 w-4 h-4"
              />
              <span className="text-xs text-zinc-200 font-semibold">
                Lock Voice Consistency across all scenes
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              id="voice-generate-btn"
              onClick={handleGenerateVoice}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Voice Narration...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Generate Voiceover (2 Credits)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Audio Waveform & Preview (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-[#11121c] p-5 flex flex-col justify-between min-h-[340px]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 mb-3">
              <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              Audio Playback Deck
            </h3>

            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center space-y-4">
              {/* Simulated Waveform Visual */}
              <div className="flex items-center gap-1.5 h-16">
                {[40, 60, 25, 80, 95, 45, 70, 85, 30, 90, 65, 40, 75, 100, 50, 30, 80].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${generatedAudioUrl ? h : 15}%` }}
                    className={`w-1.5 rounded-full transition-all duration-300 ${
                      generatedAudioUrl ? 'bg-teal-400 animate-pulse' : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>

              {generatedAudioUrl ? (
                <div className="w-full space-y-3">
                  <audio
                    src={generatedAudioUrl}
                    controls
                    className="w-full h-8"
                  />
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>Talent: {voice}</span>
                    <span>10.5s</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  Generate narration to preview speech and waveform.
                </p>
              )}
            </div>
          </div>

          {generatedAudioUrl && (
            <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-end">
              <a
                href={generatedAudioUrl}
                download="narration_voice.mp3"
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Audio</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
