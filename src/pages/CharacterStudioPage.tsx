import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Sparkles, 
  Upload, 
  Sliders, 
  Check, 
  Trash2, 
  Layers, 
  Eye, 
  Camera, 
  Image as ImageIcon,
  Save,
  CheckCircle2,
  X,
  Copy,
  Download,
  Shield
} from 'lucide-react';
import { Character, Project, CharacterReferenceViews } from '../types/index.js';
import { api } from '../services/api.js';

interface CharacterStudioPageProps {
  characters: Character[];
  activeProject: Project | null;
  onCharacterCreated: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const CharacterStudioPage: React.FC<CharacterStudioPageProps> = ({
  characters,
  activeProject,
  onCharacterCreated,
  onShowToast,
}) => {
  // Form State
  const [name, setName] = useState('Lord Shiva (Cosmic Form)');
  const [appearance, setAppearance] = useState('Divine blue complexion, crescent moon, matted locks, sacred ash');
  const [age, setAge] = useState('Ageless Divine');
  const [hair, setHair] = useState('Matted locks with river Ganga flowing');
  const [clothing, setClothing] = useState('Tiger skin silken drape with rudraksha garlands');
  const [accessories, setAccessories] = useState('Trident (Trishul), Damru, Vasuki snake garland');
  const [visualStyle, setVisualStyle] = useState('Cinematic Indian Epic');
  const [description, setDescription] = useState('The supreme yogi and cosmic dancer of eternity.');
  const [referenceImageUrl, setReferenceImageUrl] = useState('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80');
  const [consistencyStrength, setConsistencyStrength] = useState<number>(90);

  // 7 Turnaround reference views
  const [views, setViews] = useState<CharacterReferenceViews>({
    front: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    faceCloseUp: 'https://images.unsplash.com/photo-1609605988071-b619d16854d1?w=800&auto=format&fit=crop&q=80',
    threeQuarter: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    fullBody: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
  });

  const [activeTab, setActiveTab] = useState<'create' | 'gallery'>('gallery');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCharForTurnaround, setSelectedCharForTurnaround] = useState<Character | null>(null);

  const characterPresets = [
    {
      label: '🔱 Karna (Mythological Hero)',
      name: 'Maharathi Karna',
      style: 'Cinematic Indian Epic',
      age: '32',
      hair: 'Shoulder-length black wavy hair tied in warrior knot',
      clothing: 'Kavacha golden armor fused with skin, crimson silk angavastra',
      accessories: 'Kundala glowing golden earrings, Vijaya bow glyph',
      appearance: 'Tall, sun-kissed warrior complexion, resolute eyes, radiant divine aura',
      description: 'The invincible son of Surya with impenetrable golden armor and immortal loyalty.',
      referenceImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
      consistencyStrength: 95
    },
    {
      label: '⚡ Maya Vance (Cyberpunk)',
      name: 'Commander Maya Vance',
      style: 'Cyberpunk 2099',
      age: '28',
      hair: 'Asymmetrical neon purple bob cut with shaved cyber-temples',
      clothing: 'Matte-black ballistic trench coat with high luminescent collar and carbon-fiber plates',
      accessories: 'Sub-dermal neural jack behind left ear, holographic ocular HUD',
      appearance: 'Sharp angular jawline, cybernetic right eye glowing faint cyan, resolute gaze',
      description: 'Elite net-runner and vanguard operative in the rain-slicked towers of Neo-Tokyo.',
      referenceImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      consistencyStrength: 92
    },
    {
      label: '🚀 Cole Vance (Deep Space)',
      name: 'Astronaut Cole Vance',
      style: 'Photorealistic Cinema',
      age: '40',
      hair: 'Buzz cut dark brown with silver temples',
      clothing: 'Off-white heat-resistant Kevlar spacesuit with mission patch and analog gauges',
      accessories: 'Gold panoramic visor helmet, emergency tether, quantum telemetry beacon',
      appearance: 'Weathered deep-space explorer, calm analytical eyes',
      description: 'Deep-space navigator charting anomalous planetary monoliths at the galactic rim.',
      referenceImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      consistencyStrength: 90
    }
  ];

  const applyPreset = (preset: typeof characterPresets[0]) => {
    setName(preset.name);
    setVisualStyle(preset.style);
    setAge(preset.age);
    setHair(preset.hair);
    setClothing(preset.clothing);
    setAccessories(preset.accessories);
    setAppearance(preset.appearance);
    setDescription(preset.description);
    setReferenceImageUrl(preset.referenceImageUrl);
    setConsistencyStrength(preset.consistencyStrength);
    setViews({
      front: preset.referenceImageUrl,
      faceCloseUp: preset.referenceImageUrl
    });
    onShowToast(`Loaded preset "${preset.name}"!`, 'info');
  };

  const viewSlots: { key: keyof CharacterReferenceViews; label: string }[] = [
    { key: 'front', label: 'Front View' },
    { key: 'back', label: 'Back View' },
    { key: 'left', label: 'Left Profile' },
    { key: 'right', label: 'Right Profile' },
    { key: 'threeQuarter', label: '3/4 Angle' },
    { key: 'fullBody', label: 'Full Body' },
    { key: 'faceCloseUp', label: 'Face Close-up' },
  ];

  const handleSaveCharacter = async () => {
    if (!name.trim()) {
      onShowToast('Character name is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await api.createCharacter({
        name,
        appearance,
        age,
        hair,
        clothing,
        accessories,
        visualStyle,
        description,
        referenceImageUrl,
        consistencyStrength,
        referenceViews: views,
      });

      onShowToast(`Character "${name}" saved to library!`, 'success');
      onCharacterCreated();
      setActiveTab('gallery');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save character', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseInProject = (char: Character) => {
    onShowToast(`Character "${char.name}" locked for project "${activeProject?.title || 'Current'}"`, 'success');
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteCharacter(id);
      onShowToast('Character removed', 'info');
      onCharacterCreated();
    } catch (err: any) {
      onShowToast('Delete failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-cinematic">Character Studio</h1>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
              Consistency Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Build reusable cinematic character models with multi-angle turnaround references for consistent AI rendering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Character Library ({characters.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Character</span>
          </button>
        </div>
      </div>

      {activeTab === 'gallery' ? (
        /* Characters Gallery View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {characters.map((char) => (
              <div
                key={char.id}
                className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5 flex flex-col justify-between hover:border-zinc-700 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                        {char.referenceImageUrl ? (
                          <img
                            src={char.referenceImageUrl}
                            alt={char.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Users className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{char.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {char.visualStyle}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(char.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg"
                      title="Delete character"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {char.description || char.appearance}
                  </p>

                  <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-1.5 text-[11px] text-zinc-400">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Clothing:</span>
                      <span className="text-zinc-300 truncate max-w-[160px]">{char.clothing}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Consistency Strength:</span>
                      <span className="text-emerald-400 font-mono font-bold">{char.consistencyStrength}%</span>
                    </div>
                  </div>

                  {/* Reference Views Mini strip */}
                  <div className="mt-3 pt-2 border-t border-zinc-800/60">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
                      Reference Views ({Object.keys(char.referenceViews || {}).length}/7)
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {viewSlots.map((slot) => {
                        const img = char.referenceViews?.[slot.key];
                        return (
                          <div
                            key={slot.key}
                            className={`w-9 h-9 rounded-lg overflow-hidden border flex-shrink-0 flex items-center justify-center text-[9px] ${
                              img ? 'border-zinc-700 bg-zinc-900' : 'border-dashed border-zinc-800 bg-zinc-900/40 text-zinc-600'
                            }`}
                            title={slot.label}
                          >
                            {img ? (
                              <img src={img} alt={slot.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              slot.label.charAt(0)
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedCharForTurnaround(char)}
                    className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    title="View complete 7-angle turnaround sheet"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Turnaround</span>
                  </button>
                  <button
                    onClick={() => handleUseInProject(char)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors"
                  >
                    Use in Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Create Character Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Character Identity & Traits
              </h2>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Quick Character Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {characterPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Character Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maharathi Karna"
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Visual Style</label>
                <select
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option>Cinematic Indian Epic</option>
                  <option>Photorealistic Cinema</option>
                  <option>Cyberpunk 2099</option>
                  <option>Anime Masterpiece</option>
                  <option>3D Stylized Pixar/Unreal</option>
                  <option>Grim Dark Fantasy</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Appearance & Facial Features</label>
              <textarea
                rows={2}
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                placeholder="Facial structure, skin tone, distinctive marks, divine aura..."
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Age</label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Hair & Beard</label>
                <input
                  type="text"
                  value={hair}
                  onChange={(e) => setHair(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Accessories</label>
                <input
                  type="text"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Clothing / Costume</label>
              <input
                type="text"
                value={clothing}
                onChange={(e) => setClothing(e.target.value)}
                placeholder="Traditional royal armor, silk dhoti, cybernetic combat coat..."
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Biography & Cinematic Role</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Background story, motivation, personality..."
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white"
              />
            </div>

            {/* Consistency Strength Slider */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-zinc-300">
                  Character Consistency Strength
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {consistencyStrength}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={consistencyStrength}
                onChange={(e) => setConsistencyStrength(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 block mt-1">
                Higher strength locks facial landmarks and clothing geometry across video generations.
              </span>
            </div>

            <div className="pt-3">
              <button
                id="save-character-btn"
                onClick={handleSaveCharacter}
                disabled={isSaving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Character to Firestore</span>
              </button>
            </div>
          </div>

          {/* Right Column: 7 Reference Turnaround Views */}
          <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span>7 Reference Turnaround Views</span>
              <span className="text-[10px] text-zinc-500">AI Consistency Anchor</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {viewSlots.map((slot) => {
                const currentImg = views[slot.key];
                return (
                  <div
                    key={slot.key}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5 flex flex-col space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-zinc-300">{slot.label}</span>
                      {currentImg && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>

                    <div className="aspect-square rounded-lg overflow-hidden bg-black/60 border border-zinc-800 flex items-center justify-center">
                      {currentImg ? (
                        <img
                          src={currentImg}
                          alt={slot.label}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-600 italic">No image</span>
                      )}
                    </div>

                    <input
                      type="text"
                      value={currentImg || ''}
                      onChange={(e) => setViews({ ...views, [slot.key]: e.target.value })}
                      placeholder="Image URL..."
                      className="w-full rounded bg-zinc-950 border border-zinc-800 px-2 py-1 text-[10px] text-zinc-300"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Turnaround Sheet Inspection Modal */}
      {selectedCharForTurnaround && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#10111a] border border-zinc-700/80 rounded-2xl max-w-4xl w-full p-5 sm:p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                  <img
                    src={selectedCharForTurnaround.referenceImageUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'}
                    alt={selectedCharForTurnaround.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white font-cinematic">{selectedCharForTurnaround.name}</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {selectedCharForTurnaround.visualStyle}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Consistency Lock: <span className="text-emerald-400 font-mono font-semibold">{selectedCharForTurnaround.consistencyStrength}%</span> • 7-Angle Production Model Sheet
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCharForTurnaround(null)}
                className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Turnaround Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center justify-between">
                <span>Multi-Angle Turnaround Views</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {Object.keys(selectedCharForTurnaround.referenceViews || {}).length} Angles Verified
                </span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {viewSlots.map((slot) => {
                  const angleImg = selectedCharForTurnaround.referenceViews?.[slot.key] || selectedCharForTurnaround.referenceImageUrl;
                  return (
                    <div key={slot.key} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 text-center space-y-1.5">
                      <span className="text-[10px] font-semibold text-zinc-400 block truncate">{slot.label}</span>
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-black/40 border border-zinc-800/80">
                        {angleImg ? (
                          <img
                            src={angleImg}
                            alt={slot.label}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px] italic">
                            Pending
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Character Specs & Directives */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Costume / Armor</span>
                <p className="text-zinc-200 mt-0.5">{selectedCharForTurnaround.clothing || 'Standard Production Costume'}</p>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Accessories / Weaponry</span>
                <p className="text-zinc-200 mt-0.5">{selectedCharForTurnaround.accessories || 'Hero Props & Identifiers'}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Visual Directives</span>
                <p className="text-zinc-300 mt-0.5">{selectedCharForTurnaround.appearance || selectedCharForTurnaround.description}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Character "${selectedCharForTurnaround.name}", ${selectedCharForTurnaround.appearance}, wearing ${selectedCharForTurnaround.clothing}, ${selectedCharForTurnaround.visualStyle}`);
                  onShowToast('Copied character prompt tokens to clipboard!', 'success');
                }}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Character Tokens</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleUseInProject(selectedCharForTurnaround);
                    setSelectedCharForTurnaround(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors"
                >
                  Apply to Active Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
