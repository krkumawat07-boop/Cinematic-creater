import React, { useState } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Trash2, 
  Video, 
  Image as ImageIcon, 
  Music, 
  Users, 
  Search, 
  Download, 
  BookmarkPlus 
} from 'lucide-react';
import { Asset, Project } from '../types/index.js';
import { api } from '../services/api.js';

interface AssetsPageProps {
  assets: Asset[];
  activeProject: Project | null;
  onAssetsUpdated: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const AssetsPage: React.FC<AssetsPageProps> = ({
  assets,
  activeProject,
  onAssetsUpdated,
  onShowToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('Atmospheric Fog Particle Plate');
  const [url, setUrl] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80');
  const [category, setCategory] = useState<'video' | 'image' | 'audio' | 'character-ref'>('image');

  const categories = [
    { id: 'all', label: 'All Assets', icon: <FolderGit2 className="w-3.5 h-3.5" /> },
    { id: 'video', label: 'Videos', icon: <Video className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'image', label: 'Images', icon: <ImageIcon className="w-3.5 h-3.5 text-pink-400" /> },
    { id: 'audio', label: 'Audio & Music', icon: <Music className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'character-ref', label: 'Character Refs', icon: <Users className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  const filteredAssets = assets.filter((a) => {
    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesQuery = a.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleCreateAsset = async () => {
    if (!title.trim() || !url.trim()) {
      onShowToast('Name and URL are required', 'error');
      return;
    }

    try {
      await api.createAsset({
        name: title,
        url,
        category,
        fileType: category === 'video' ? 'video/mp4' : category === 'audio' ? 'audio/mp3' : 'image/jpeg',
        metadata: { tags: ['cinematic', 'hd'] }
      });
      onAssetsUpdated();
      setIsAdding(false);
      onShowToast('Asset added to library!', 'success');
    } catch (err: any) {
      onShowToast('Failed to add: ' + err.message, 'error');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await api.deleteAsset(id);
      onAssetsUpdated();
      onShowToast('Asset deleted', 'info');
    } catch (err: any) {
      onShowToast('Delete failed: ' + err.message, 'error');
    }
  };

  const handleAddAsScene = async (asset: Asset) => {
    if (!activeProject) {
      onShowToast('Select a film project first', 'error');
      return;
    }

    try {
      await api.addScene(activeProject.id, {
        title: `Scene from: ${asset.name}`,
        duration: 10,
        visualPrompt: `Asset usage: ${asset.name}`,
        videoUrl: asset.category === 'video' ? asset.url : 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4',
        thumbnailUrl: asset.category === 'image' ? asset.url : undefined,
        status: 'ready'
      });
      onShowToast(`Added asset as scene to "${activeProject.title}"!`, 'success');
    } catch (err: any) {
      onShowToast('Failed to add scene: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-cinematic">Assets Library</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
              {assets.length} Assets
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Central repository for generated videos, background plates, audio cues, and character reference sheets.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Register Asset</span>
        </button>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {c.icon}
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Add Asset Inline Form */}
      {isAdding && (
        <div className="p-5 rounded-2xl border border-indigo-500/40 bg-[#141524] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-cinematic">
              Register New Asset to Library
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-xs text-zinc-400 hover:text-white">
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Asset Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
              >
                <option value="image">Image / Concept</option>
                <option value="video">Video Clip</option>
                <option value="audio">Audio / Music</option>
                <option value="character-ref">Character Reference</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Asset URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-zinc-800">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAsset}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Save Asset
            </button>
          </div>
        </div>
      )}

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="rounded-xl border border-zinc-800 bg-[#11121c] p-3 flex flex-col justify-between hover:border-zinc-700 transition-all space-y-3"
          >
            <div>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-2 border border-zinc-800">
                {asset.category === 'video' ? (
                  <video src={asset.url} className="w-full h-full object-cover" muted />
                ) : (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-zinc-300 uppercase">
                  {asset.category}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white truncate">{asset.name}</h4>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                {asset.fileType}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
              <button
                onClick={() => handleDeleteAsset(asset.id)}
                className="p-1 rounded text-zinc-500 hover:text-red-400"
                title="Delete asset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleAddAsScene(asset)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-medium"
              >
                <BookmarkPlus className="w-3 h-3" />
                <span>Use as Scene</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
