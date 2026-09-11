import React, { useState } from 'react';
import { 
  Film, 
  Plus, 
  Copy, 
  Trash2, 
  Play, 
  Search, 
  Sliders, 
  Clock, 
  Layers, 
  LayoutGrid, 
  Sparkles,
  Check
} from 'lucide-react';
import { Project } from '../types/index.js';
import { api } from '../services/api.js';

interface ProjectsPageProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (p: Project) => void;
  onProjectsUpdated: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onProjectsUpdated,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [aspectFilter, setAspectFilter] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('New Epic Film Project');
  const [newDesc, setNewDesc] = useState('An epic cinematic story created with AI');
  const [newAspectRatio, setNewAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [newResolution, setNewResolution] = useState<'720p' | '1080p' | '4k'>('1080p');

  const filteredProjects = projects.filter((p) => {
    const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAspect = aspectFilter === 'all' || p.aspectRatio === aspectFilter;
    return matchesQuery && matchesAspect;
  });

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      onShowToast('Project title is required', 'error');
      return;
    }

    try {
      const res = await api.createProject({
        title: newTitle,
        description: newDesc,
        aspectRatio: newAspectRatio,
        resolution: newResolution,
        thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        duration: 30,
        scenesCount: 1,
      });

      // Also auto-add an initial establishing scene
      await api.addScene(res.project.id, {
        title: 'Scene 01: Establishing Shot',
        duration: 10,
        visualPrompt: `Grand cinematic establishing view for ${newTitle}`,
        camera: 'Wide Cinematic',
        lighting: 'Golden Hour',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        status: 'ready'
      });

      onProjectsUpdated();
      onSelectProject(res.project);
      setIsCreating(false);
      onShowToast(`Created film project "${newTitle}"!`, 'success');
    } catch (err: any) {
      onShowToast('Failed to create: ' + err.message, 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await api.duplicateProject(id);
      onProjectsUpdated();
      onShowToast(`Duplicated into "${res.project.title}"!`, 'success');
    } catch (err: any) {
      onShowToast('Duplicate failed: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProject(id);
      onProjectsUpdated();
      onShowToast('Project deleted', 'info');
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-cinematic">Film Projects</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
              {projects.length} Total
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your AI productions, duplicate versions for A/B testing, and organize multi-scene sequences.
          </p>
        </div>

        <button
          id="projects-create-new-btn"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>New Film Project</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-500">Aspect:</span>
          {['all', '16:9', '9:16', '1:1'].map((ar) => (
            <button
              key={ar}
              onClick={() => setAspectFilter(ar)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                aspectFilter === ar
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {ar.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Create Project Modal */}
      {isCreating && (
        <div className="p-5 rounded-2xl border border-indigo-500/40 bg-[#141524] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-cinematic flex items-center gap-2">
              <Film className="w-4 h-4 text-indigo-400" />
              Configure New Film Project
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Project Title *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Mahayuga 2026: Awakening"
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Aspect Ratio</label>
              <select
                value={newAspectRatio}
                onChange={(e) => setNewAspectRatio(e.target.value as any)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-200"
              >
                <option value="16:9">16:9 Widescreen Cinema (YouTube / TV)</option>
                <option value="9:16">9:16 Vertical Story (Shorts / Reels)</option>
                <option value="1:1">1:1 Square (Instagram / Social)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Logline / Synopsis</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Brief description of the film's premise..."
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-zinc-800">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Initialize Project
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((p) => {
          const isActive = activeProject?.id === p.id;
          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all group ${
                isActive
                  ? 'border-indigo-500/80 bg-[#141525] ring-1 ring-indigo-500/50 shadow-xl'
                  : 'border-zinc-800 bg-[#11121c] hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-3 border border-zinc-800">
                  {p.thumbnailUrl ? (
                    <img
                      src={p.thumbnailUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <Film className="w-10 h-10" />
                    </div>
                  )}

                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-zinc-200">
                    {p.aspectRatio}
                  </span>

                  {isActive && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                      Active
                    </span>
                  )}

                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-zinc-300">
                    {p.duration}s
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white truncate">{p.title}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                  {p.description || 'No description'}
                </p>

                <div className="mt-3 flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                  <span>{p.scenesCount} Scenes</span>
                  <span>•</span>
                  <span>{p.resolution}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(p.id)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    title="Duplicate project"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    onSelectProject(p);
                    onShowToast(`Activated project "${p.title}"`, 'success');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  {isActive ? 'Active Project' : 'Select Project'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
