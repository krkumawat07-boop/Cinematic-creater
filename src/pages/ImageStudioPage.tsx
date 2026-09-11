import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  Copy, 
  Layers, 
  Camera, 
  Sun, 
  Maximize2, 
  CheckCircle2, 
  Loader2,
  Sliders,
  Coins
} from 'lucide-react';
import { api } from '../services/api.js';

interface ImageStudioPageProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ImageStudioPage: React.FC<ImageStudioPageProps> = ({ onShowToast }) => {
  const [subTool, setSubTool] = useState<'text-to-image' | 'character-sheet' | 'thumbnail'>('text-to-image');
  
  // Form State
  const [prompt, setPrompt] = useState('Epic cinematic portrait of an ancient Indian warrior king in golden armor, divine light aura, volumetric mist, hyper-detailed 8k');
  const [negativePrompt, setNegativePrompt] = useState('blurry, distorted, low quality');
  const [style, setStyle] = useState('Cinematic Photorealistic');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3'>('16:9');
  const [variations, setVariations] = useState<number>(2);

  // Thumbnail Specific State
  const [thumbTitle, setThumbTitle] = useState('THE SECRET WEAPON OF KARNA REVEALED');
  const [thumbCharacter, setThumbCharacter] = useState('Maharathi Karna with Kavach Kundal');
  const [thumbMystery, setThumbMystery] = useState<number>(85);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1609605988071-b619d16854d1?w=800&auto=format&fit=crop&q=80'
  ]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (subTool === 'thumbnail') {
        const res = await api.generateThumbnail({
          title: thumbTitle,
          character: thumbCharacter,
          mysteryIntensity: thumbMystery,
          visualStyle: style,
          aspectRatio
        });
        setGeneratedImages(res.thumbnails);
        onShowToast(`Generated 2 YouTube Thumbnails (${res.cost ?? 0} Credits • FREE)`, 'success');
      } else {
        const actualPrompt = subTool === 'character-sheet' 
          ? `Character turnaround sheet, front back side angles, full body: ${prompt}` 
          : prompt;

        const res = await api.generateImage({
          prompt: actualPrompt,
          negativePrompt,
          style,
          aspectRatio,
          variations
        });
        setGeneratedImages(res.images);
        onShowToast(`Generated ${res.images.length} images (${res.cost ?? 0} Credits • FREE)`, 'success');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Image generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast('Prompt copied to clipboard!', 'info');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-cinematic">Image Studio</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
              0 Credits • Free Visual Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Create character sheets, high-CTR YouTube covers, matte backgrounds, and concept art assets.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => setSubTool('text-to-image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subTool === 'text-to-image' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Concept Art
          </button>
          <button
            onClick={() => setSubTool('character-sheet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subTool === 'character-sheet' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Turnaround Sheet
          </button>
          <button
            onClick={() => setSubTool('thumbnail')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subTool === 'thumbnail' ? 'bg-pink-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            YouTube Thumbnail
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-4">
          {subTool === 'thumbnail' ? (
            /* Thumbnail Generator Specific Fields */
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                High-CTR Thumbnail Designer
              </h3>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">YouTube Video Catchy Title</label>
                <input
                  type="text"
                  value={thumbTitle}
                  onChange={(e) => setThumbTitle(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Hero Character / Focal Point</label>
                <input
                  type="text"
                  value={thumbCharacter}
                  onChange={(e) => setThumbCharacter(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Mystery / Curiosity Intensity</span>
                  <span className="font-mono text-pink-400 font-bold">{thumbMystery}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={thumbMystery}
                  onChange={(e) => setThumbMystery(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>
            </div>
          ) : (
            /* Standard Image & Turnaround Generator */
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                  {subTool === 'character-sheet' ? 'Character Details for 7-View Sheet' : 'Image Prompt'}
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Negative Prompt</label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300"
                />
              </div>
            </div>
          )}

          {/* Common Selectors */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Visual Art Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200"
              >
                <option>Cinematic Photorealistic</option>
                <option>Indian Mythological Epic</option>
                <option>Anime Masterpiece</option>
                <option>Unreal Engine 5 Render</option>
                <option>Vintage Bollywood Poster</option>
                <option>Concept Matte Painting</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200"
              >
                <option value="16:9">16:9 (YouTube Standard)</option>
                <option value="9:16">9:16 (Shorts / Reels)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="4:3">4:3 (Classic Cinema)</option>
              </select>
            </div>
          </div>

          {subTool !== 'thumbnail' && (
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Variations Count</label>
              <div className="flex gap-2">
                {[1, 2, 4].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVariations(v)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold ${
                      variations === v ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {v} Image{v > 1 ? 's' : ''} (0 Credits • FREE)
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              id="image-studio-generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-pink-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Visuals...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Generate {subTool === 'thumbnail' ? 'Thumbnails' : 'Images'} (0 Credits • FREE)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between mb-4">
              <span>Rendered Art Gallery</span>
              <span className="text-[10px] text-zinc-500 font-mono">{generatedImages.length} Outputs</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {generatedImages.map((img, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/80 relative group flex flex-col justify-between"
                >
                  <div className="aspect-video w-full overflow-hidden bg-black">
                    <img
                      src={img}
                      alt={`Render ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="p-2.5 flex items-center justify-between bg-zinc-950/90 text-xs border-t border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-mono">Variant #{i + 1}</span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
                        title="Download image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
