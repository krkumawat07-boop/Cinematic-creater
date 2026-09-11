import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Plus, 
  Play, 
  Trash2, 
  Copy, 
  ArrowLeft, 
  ArrowRight, 
  Edit3, 
  Sliders, 
  Film, 
  Sparkles,
  Camera,
  Sun,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Project, Scene } from '../types/index.js';
import { api } from '../services/api.js';

interface StoryboardPageProps {
  activeProject: Project | null;
  scenes: Scene[];
  onScenesUpdated: () => void;
  onNavigateToTimeline: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const StoryboardPage: React.FC<StoryboardPageProps> = ({
  activeProject,
  scenes,
  onScenesUpdated,
  onNavigateToTimeline,
  onShowToast,
}) => {
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [isAddingScene, setIsAddingScene] = useState(false);
  const [newSceneTitle, setNewSceneTitle] = useState('New Cinematic Shot');
  const [newScenePrompt, setNewScenePrompt] = useState('Hero looking across sweeping mountainous valley at dawn, anamorphic lens flare');
  const [newSceneDuration, setNewSceneDuration] = useState(10);
  const [newSceneCamera, setNewSceneCamera] = useState('Wide Cinematic');

  if (!activeProject) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-8 text-center space-y-3">
        <Film className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-base font-bold text-white">No Film Project Selected</h2>
        <p className="text-xs text-zinc-400">Please select or create a project from the top header.</p>
      </div>
    );
  }

  const handleCreateScene = async () => {
    try {
      await api.addScene(activeProject.id, {
        title: newSceneTitle,
        duration: newSceneDuration,
        visualPrompt: newScenePrompt,
        camera: newSceneCamera,
        lighting: 'Golden Hour Atmospheric',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4',
        status: 'ready'
      });
      onScenesUpdated();
      setIsAddingScene(false);
      onShowToast('Scene added to storyboard!', 'success');
    } catch (err: any) {
      onShowToast('Failed to add scene: ' + err.message, 'error');
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    try {
      await api.deleteScene(activeProject.id, sceneId);
      onScenesUpdated();
      onShowToast('Scene deleted', 'info');
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  const handleDuplicateScene = async (scene: Scene) => {
    try {
      await api.addScene(activeProject.id, {
        title: `${scene.title} (Copy)`,
        duration: scene.duration,
        visualPrompt: scene.visualPrompt,
        camera: scene.camera,
        lighting: scene.lighting,
        videoUrl: scene.videoUrl,
        thumbnailUrl: scene.thumbnailUrl,
        voiceOverText: scene.voiceOverText,
        status: scene.status
      });
      onScenesUpdated();
      onShowToast('Scene duplicated', 'success');
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  const handleMoveScene = async (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= scenes.length) return;

    const reordered = [...scenes];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const sceneIds = reordered.map(s => s.id);
    try {
      await api.reorderScenes(activeProject.id, sceneIds);
      onScenesUpdated();
    } catch (err: any) {
      onShowToast('Reorder failed: ' + err.message, 'error');
    }
  };

  const handleSaveSceneEdit = async () => {
    if (!editingScene) return;
    try {
      await api.updateScene(activeProject.id, editingScene.id, editingScene);
      onScenesUpdated();
      setEditingScene(null);
      onShowToast('Scene updated!', 'success');
    } catch (err: any) {
      onShowToast('Update failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-cinematic">Storyboard Workspace</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
              {scenes.length} Scenes
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Visual beat sheet for <strong className="text-indigo-400">{activeProject.title}</strong>. 
            Organize shot sequences, edit visual prompts, and synchronize with the timeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingScene(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Scene</span>
          </button>

          <button
            onClick={onNavigateToTimeline}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Open Timeline Editor</span>
          </button>
        </div>
      </div>

      {/* Add Scene Inline Modal */}
      {isAddingScene && (
        <div className="p-5 rounded-2xl border border-indigo-500/40 bg-[#141524] space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Add Scene to Storyboard
            </h3>
            <button
              onClick={() => setIsAddingScene(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] text-zinc-400 block mb-1">Scene Title</label>
              <input
                type="text"
                value={newSceneTitle}
                onChange={(e) => setNewSceneTitle(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Duration (Seconds)</label>
              <input
                type="number"
                value={newSceneDuration}
                onChange={(e) => setNewSceneDuration(Number(e.target.value))}
                min={3}
                max={120}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Visual Prompt</label>
            <textarea
              rows={2}
              value={newScenePrompt}
              onChange={(e) => setNewScenePrompt(e.target.value)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={handleCreateScene}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Create Scene
            </button>
          </div>
        </div>
      )}

      {/* Storyboard Grid */}
      {scenes.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-12 text-center space-y-3">
          <LayoutGrid className="w-12 h-12 text-zinc-600 mx-auto" />
          <p className="text-sm text-zinc-300">No scenes in this project yet.</p>
          <button
            onClick={() => setIsAddingScene(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium"
          >
            Add First Scene
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {scenes.map((scene, idx) => (
            <div
              key={scene.id}
              className="rounded-2xl border border-zinc-800 bg-[#11121c] p-4 flex flex-col justify-between space-y-3 hover:border-zinc-700 transition-all group"
            >
              <div>
                {/* Scene Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[11px] font-mono font-bold text-zinc-200">
                      Shot {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {scene.duration}s
                    </span>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => handleMoveScene(idx, 'left')}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20"
                      title="Move backward"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveScene(idx, 'right')}
                      disabled={idx === scenes.length - 1}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20"
                      title="Move forward"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Media Preview Box */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 mb-3">
                  {scene.thumbnailUrl ? (
                    <img
                      src={scene.thumbnailUrl}
                      alt={scene.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <Film className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-mono text-zinc-300">
                    {scene.camera || 'Cinematic Wide'}
                  </span>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-[10px] font-mono text-emerald-300">
                    {scene.status}
                  </span>
                </div>

                {/* Title & Prompts */}
                <h3 className="text-sm font-bold text-white truncate">{scene.title}</h3>
                <p className="text-xs text-zinc-300 line-clamp-2 mt-1 leading-relaxed">
                  {scene.visualPrompt}
                </p>

                {scene.voiceOverText && (
                  <div className="mt-2.5 p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] text-indigo-300 font-hindi italic">
                    "{scene.voiceOverText}"
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingScene(scene)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    title="Edit scene info"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicateScene(scene)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    title="Duplicate scene"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteScene(scene.id)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400"
                    title="Delete scene"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {scene.videoUrl && (
                  <a
                    href={scene.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Watch Clip</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Scene Modal */}
      {editingScene && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-[#141520] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white font-cinematic">
              Edit Scene Details
            </h3>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Scene Title</label>
              <input
                type="text"
                value={editingScene.title}
                onChange={(e) => setEditingScene({ ...editingScene, title: e.target.value })}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Visual Prompt</label>
              <textarea
                rows={3}
                value={editingScene.visualPrompt}
                onChange={(e) => setEditingScene({ ...editingScene, visualPrompt: e.target.value })}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Camera Framing</label>
                <input
                  type="text"
                  value={editingScene.camera || ''}
                  onChange={(e) => setEditingScene({ ...editingScene, camera: e.target.value })}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Duration (s)</label>
                <input
                  type="number"
                  value={editingScene.duration}
                  onChange={(e) => setEditingScene({ ...editingScene, duration: Number(e.target.value) })}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Voiceover Script</label>
              <textarea
                rows={2}
                value={editingScene.voiceOverText || ''}
                onChange={(e) => setEditingScene({ ...editingScene, voiceOverText: e.target.value })}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 p-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setEditingScene(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSceneEdit}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
