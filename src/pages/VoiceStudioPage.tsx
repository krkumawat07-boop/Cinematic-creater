import React, { useState, useEffect, useRef } from 'react';
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
  Loader2,
  BookmarkPlus,
  Radio,
  FileText
} from 'lucide-react';
import { Project } from '../types/index.js';
import { api } from '../services/api.js';

interface VoiceStudioPageProps {
  activeProject?: Project | null;
  onVoiceAddedToTimeline?: (voiceAsset: any) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const HINDI_SAMPLE_SCRIPTS = [
  {
    title: 'Gita Epic Narration (Battlefield)',
    text: 'जब-जब धर्म की हानि होती है और अधर्म का उत्थान होता है, तब-तब मैं धर्म की स्थापना के लिए साकार रूप में अवतरित होता हूँ। हे अर्जुन! अपने भय को त्याग कर रणभूमि में उठो।'
  },
  {
    title: 'Cosmic Sci-Fi Revelation',
    text: 'वर्ष 2026 के अंतिम सिग्नल में, शनि के वलयों के बीच एक प्राचीन एलियन संरचना जाग्रत हुई। ब्रह्मांड के इस छोर पर, मानवता का भाग्य एक नया मोड़ लेने वाला था।'
  },
  {
    title: 'Ancient Temple Mystery',
    text: 'हिमालय के घने कोहरे में छिपे इस मंदिर के कपाट सहस्राब्दियों से बंद थे। जैसे ही स्वर्ण धूप की पहली किरण गर्भगृह पर पड़ी, दीवारों पर उत्कीर्ण मंत्र दैवीय प्रकाश से चमक उठे।'
  }
];

export const VoiceStudioPage: React.FC<VoiceStudioPageProps> = ({ 
  activeProject, 
  onVoiceAddedToTimeline,
  onShowToast 
}) => {
  const [text, setText] = useState(HINDI_SAMPLE_SCRIPTS[0].text);
  const [voice, setVoice] = useState('Arjun - Deep Epic Hindi');
  const [language, setLanguage] = useState<'Hindi' | 'English'>('Hindi');
  const [style, setStyle] = useState('Cinematic Movie Narration');
  const [emotion, setEmotion] = useState('Deep Epic & Resonant');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [maintainConsistency, setMaintainConsistency] = useState(true);

  // Project Voice consistency state
  const [isSavingProjectVoice, setIsSavingProjectVoice] = useState(false);
  const [useProjectVoice, setUseProjectVoice] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voiceTalents = [
    { name: 'Arjun - Deep Epic Hindi', lang: 'Hindi', gender: 'Male', type: 'Mythological / War Epic' },
    { name: 'Priya - Emotional & Mystic', lang: 'Hindi/Sanskrit', gender: 'Female', type: 'Devotional & Melodic' },
    { name: 'Kabir - Dramatic Storyteller', lang: 'Hindi', gender: 'Male', type: 'Intense Narrative & Doc' },
    { name: 'Ananya - Warm & Inspiring', lang: 'Hindi/English', gender: 'Female', type: 'Serene & Commercial' },
    { name: 'Vikram - Authoritative Baritone', lang: 'Hindi', gender: 'Male', type: 'Movie Trailer Voice' },
    { name: 'Marcus - Deep Hollywood Trailer', lang: 'English', gender: 'Male', type: 'Theatrical Cinema' },
    { name: 'Sarah - Sophisticated Cinema', lang: 'English', gender: 'Female', type: 'Refined Audio' },
  ];

  // Load project default voice if exists
  useEffect(() => {
    if (activeProject?.id) {
      api.getProjectVoice(activeProject.id)
        .then((res) => {
          if (res?.defaultVoice) {
            setVoice(res.defaultVoice.voiceId || 'Arjun - Deep Epic Hindi');
            if (res.defaultVoice.speed) setSpeed(res.defaultVoice.speed);
            if (res.defaultVoice.emotion) setEmotion(res.defaultVoice.emotion);
            setUseProjectVoice(true);
          }
        })
        .catch(() => {});
    }
  }, [activeProject?.id]);

  const handleSaveAsProjectVoice = async () => {
    if (!activeProject) {
      onShowToast('Select a film project to set its default voice', 'error');
      return;
    }

    setIsSavingProjectVoice(true);
    try {
      await api.setProjectVoice(activeProject.id, {
        voiceId: voice,
        voiceProvider: 'Google Gemini Neural Speech',
        language,
        style,
        emotion,
        speed,
        pitch,
      });
      onShowToast(`Locked "${voice}" as default narrator for "${activeProject.title}"!`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save project default voice', 'error');
    } finally {
      setIsSavingProjectVoice(false);
    }
  };

  const handleGenerateVoice = async () => {
    if (!text.trim()) {
      onShowToast('Please enter narration text', 'error');
      return;
    }

    setIsGenerating(true);
    setGeneratedAudioUrl(null);
    try {
      const selectedTalent = voiceTalents.find((v) => v.name === voice);
      const res = await api.generateVoice({
        text,
        voice,
        language,
        gender: selectedTalent?.gender || 'Male',
        style,
        emotion,
        speed,
        pitch,
        maintainConsistency
      });

      setGeneratedAudioUrl(res.voice.audioUrl);
      setAudioDuration(res.voice.duration || 10);
      onShowToast(`Hindi Voiceover synthesized (${res.cost} credits deducted)`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Voice synthesis failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToTimeline = async () => {
    if (!activeProject) {
      onShowToast('Select an active film project first', 'error');
      return;
    }
    if (!generatedAudioUrl) {
      onShowToast('Generate an audio clip first', 'error');
      return;
    }

    try {
      await api.addScene(activeProject.id, {
        title: `Voiceover: ${voice.split(' - ')[0]}`,
        duration: audioDuration,
        visualPrompt: `Narration audio clip: "${text.substring(0, 36)}..."`,
        voiceOver: generatedAudioUrl,
        voiceOverText: text,
        status: 'ready'
      });
      if (onVoiceAddedToTimeline) {
        onVoiceAddedToTimeline({ url: generatedAudioUrl, duration: audioDuration, text });
      }
      onShowToast(`Voiceover clip added to "${activeProject.title}" timeline!`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to add voice to timeline', 'error');
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-cinematic">Hindi Voice Studio</h1>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700/50 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 animate-pulse text-teal-400" />
              Neural Speech Synthesizer
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Produce studio-grade Hindi, Sanskrit, and multilingual narration with vocal continuity across scenes.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-zinc-400">
            Target Project: <strong className="text-teal-400">{activeProject?.title || 'None Selected'}</strong>
          </span>
          <span className="px-2 py-1 rounded bg-zinc-800 text-amber-400 font-bold border border-zinc-700">
            2 Credits
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sample Scripts Bar */}
          <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Mic2 className="w-3.5 h-3.5 text-teal-400" />
                Hindi Narration Script
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">
                {text.trim().split(/\s+/).filter(Boolean).length} words • ~{Math.max(3, Math.round(text.length / 14))}s
              </span>
            </div>

            {/* Preset Script Chips */}
            <div className="flex flex-wrap gap-1.5">
              {HINDI_SAMPLE_SCRIPTS.map((script, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setText(script.text)}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors flex items-center gap-1"
                >
                  <FileText className="w-2.5 h-2.5 text-teal-400" />
                  <span>{script.title}</span>
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter Hindi, Sanskrit, or English narration text..."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 leading-relaxed font-sans"
            />
          </div>

          {/* Voice Talent & Emotion */}
          <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1 font-medium">Voice Talent</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-teal-500"
                >
                  {voiceTalents.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1 font-medium">Emotion & Mood</label>
                <select
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-teal-500"
                >
                  <option>Deep Epic & Resonant</option>
                  <option>Mystical & Devotional</option>
                  <option>Intense & Dramatic War</option>
                  <option>Warm & Inspiring</option>
                  <option>Calm Narrative Documentary</option>
                  <option>Whispered Cosmic Mystery</option>
                </select>
              </div>
            </div>

            {/* Modulation Sliders */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Pacing / Speed</span>
                  <span className="font-mono text-teal-400 font-bold">{speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Pitch Tone</span>
                  <span className="font-mono text-teal-400 font-bold">{pitch.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.4"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Voice Continuity & Project Voice Binding */}
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={maintainConsistency}
                  onChange={(e) => setMaintainConsistency(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-teal-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-xs text-zinc-200 font-semibold">
                  Voice Consistency Locking
                </span>
              </label>
              <p className="text-[11px] text-zinc-400 ml-6">
                Preserves vocal timbre, resonance, and microphone acoustics across multiple video scenes.
              </p>

              {activeProject && (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span className="text-[11px] text-zinc-400">
                    Project Default Narrator: <strong className="text-teal-400">{voice.split(' - ')[0]}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveAsProjectVoice}
                    disabled={isSavingProjectVoice}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-teal-300 border border-teal-800/50"
                  >
                    {isSavingProjectVoice ? 'Saving...' : 'Set as Project Default'}
                  </button>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              id="voice-generate-btn"
              onClick={handleGenerateVoice}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Hindi Speech with Neural Engine...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Generate Hindi Voiceover (2 Credits)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Audio Waveform & Preview (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-[#11121c] p-5 flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 mb-3">
              <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              Audio Playback Deck
            </h3>

            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center space-y-4">
              {/* Simulated Waveform Visual */}
              <div className="flex items-center gap-1.5 h-16 w-full justify-center">
                {[35, 65, 20, 85, 95, 40, 75, 90, 25, 95, 60, 45, 80, 100, 50, 25, 85, 40, 60, 75].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${generatedAudioUrl ? (isPlaying ? (h * (0.6 + Math.random() * 0.4)) : h) : 15}%` }}
                    className={`w-1.5 rounded-full transition-all duration-200 ${
                      generatedAudioUrl 
                        ? (isPlaying ? 'bg-teal-400 shadow-sm shadow-teal-500/50' : 'bg-teal-600') 
                        : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>

              {generatedAudioUrl ? (
                <div className="w-full space-y-3">
                  <audio
                    ref={audioRef}
                    src={generatedAudioUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    controls
                    className="w-full h-9"
                  />
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>Talent: <strong className="text-zinc-200">{voice}</strong></span>
                    <span>~{audioDuration}s</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  Generate narration script to test neural pronunciation and acoustic waveform.
                </p>
              )}
            </div>
          </div>

          {generatedAudioUrl && (
            <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2">
              <a
                href={generatedAudioUrl}
                download={`hindi_narration_${Date.now()}.wav`}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Audio</span>
              </a>

              <button
                type="button"
                onClick={handleAddToTimeline}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Add to Project Timeline</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
