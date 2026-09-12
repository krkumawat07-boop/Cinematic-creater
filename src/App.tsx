import React, { useState, useEffect } from 'react';
import { Clapperboard } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { AuthPage } from './pages/AuthPage.js';
import { Header } from './components/Header.js';
import { Sidebar, NavTab } from './components/Sidebar.js';
import { ToastContainer, ToastItem } from './components/Toast.js';

// Pages
import { DashboardPage } from './pages/DashboardPage.js';
import { ProjectsPage } from './pages/ProjectsPage.js';
import { TextToVideoPage } from './pages/TextToVideoPage.js';
import { LongScenePage } from './pages/LongScenePage.js';
import { MythologyCreatorPage } from './pages/MythologyCreatorPage.js';
import { StoryToVideoPage } from './pages/StoryToVideoPage.js';
import { CharacterStudioPage } from './pages/CharacterStudioPage.js';
import { StoryboardPage } from './pages/StoryboardPage.js';
import { TimelinePage } from './pages/TimelinePage.js';
import { VoiceStudioPage } from './pages/VoiceStudioPage.js';
import { ImageStudioPage } from './pages/ImageStudioPage.js';
import { AssetsPage } from './pages/AssetsPage.js';
import { CreditsPage } from './pages/CreditsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { AdminHubPage } from './pages/AdminHubPage.js';

// Types & Services
import { Project, Scene, Character, Asset, GenerationJob, UserProfile } from './types/index.js';
import { api } from './services/api.js';

function MainStudioApp() {
  const { firebaseUser, user: authUser, loading: authLoading, logout, refreshProfile } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // App Data State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeScenes, setActiveScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [recentJobs, setRecentJobs] = useState<GenerationJob[]>([]);

  // Modals & Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('New Epic Film');
  const [newProjectAspect, setNewProjectAspect] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync authUser to user state
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  // Initial Data Fetching
  const loadInitialData = async () => {
    try {
      const [profileRes, projectsRes, charsRes, assetsRes, jobsRes] = await Promise.all([
        api.getProfile(),
        api.getProjects(),
        api.getCharacters(),
        api.getAssets(),
        api.getRecentGenerations(),
      ]);

      setUser(profileRes.user);
      setProjects(projectsRes.projects);
      setCharacters(charsRes.characters);
      setAssets(assetsRes.assets);
      setRecentJobs(jobsRes.jobs);

      if (projectsRes.projects.length > 0) {
        const first = projectsRes.projects[0];
        setActiveProject(first);
        loadProjectScenes(first.id);
      }
    } catch (err: any) {
      console.error('Initialization error:', err);
      showToast('Error loading user studio data: ' + err.message, 'error');
    }
  };

  const loadProjectScenes = async (projectId: string) => {
    try {
      const res = await api.getScenes(projectId);
      setActiveScenes(res.scenes);
    } catch (err) {
      console.error('Failed to load scenes:', err);
    }
  };

  const refreshProjects = async () => {
    try {
      const res = await api.getProjects();
      setProjects(res.projects);
      if (activeProject) {
        const updated = res.projects.find((p) => p.id === activeProject.id);
        if (updated) setActiveProject(updated);
      }
    } catch (err) {
      console.error('Failed to refresh projects', err);
    }
  };

  const refreshCharacters = async () => {
    try {
      const res = await api.getCharacters();
      setCharacters(res.characters);
    } catch (err) {
      console.error('Failed to refresh characters', err);
    }
  };

  const refreshAssets = async () => {
    try {
      const res = await api.getAssets();
      setAssets(res.assets);
    } catch (err) {
      console.error('Failed to refresh assets', err);
    }
  };

  const refreshUser = async () => {
    try {
      await refreshProfile();
      const res = await api.getProfile();
      setUser(res.user);
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  useEffect(() => {
    if (firebaseUser) {
      loadInitialData();
    }
  }, [firebaseUser?.uid]);

  // When activeProject changes, load its scenes
  const handleSelectProject = (proj: Project) => {
    setActiveProject(proj);
    loadProjectScenes(proj.id);
  };

  const handleCreateNewProject = async () => {
    if (!newProjectTitle.trim()) {
      showToast('Please enter a project title', 'error');
      return;
    }

    try {
      const res = await api.createProject({
        title: newProjectTitle,
        aspectRatio: newProjectAspect,
        thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        duration: 30,
        scenesCount: 1,
      });

      await api.addScene(res.project.id, {
        title: 'Scene 01: Establishing Shot',
        duration: 10,
        visualPrompt: `Grand establishing cinematic frame for ${newProjectTitle}`,
        camera: 'Wide Cinematic',
        lighting: 'Golden Hour Atmospheric',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        status: 'ready'
      });

      await refreshProjects();
      handleSelectProject(res.project);
      setShowNewProjectModal(false);
      showToast(`Film project "${newProjectTitle}" initialized!`, 'success');
    } catch (err: any) {
      showToast('Create failed: ' + err.message, 'error');
    }
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      const res = await api.duplicateProject(id);
      await refreshProjects();
      showToast(`Duplicated to "${res.project.title}"!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Duplicate failed', 'error');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await api.deleteProject(id);
      await refreshProjects();
      if (activeProject?.id === id) {
        setActiveProject(projects.find((p) => p.id !== id) || null);
      }
      showToast('Project removed', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // If waiting for Firebase authentication state
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#08090f] flex flex-col items-center justify-center text-zinc-300">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-pulse mb-4 shadow-xl shadow-indigo-600/20">
          <Clapperboard className="w-7 h-7 text-indigo-400" />
        </div>
        <p className="text-sm font-semibold font-cinematic tracking-wider text-zinc-300">
          CineForge AI Studio
        </p>
        <p className="text-xs text-zinc-500 mt-1">Connecting to Firebase & Cloud Firestore...</p>
      </div>
    );
  }

  // Enforce authentication gate
  if (!firebaseUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Top Header */}
      <Header
        user={user}
        projects={projects}
        activeProject={activeProject}
        onSelectProject={handleSelectProject}
        onOpenCredits={() => setActiveTab('credits')}
        onOpenNewProject={() => setShowNewProjectModal(true)}
        onSwitchUser={() => setShowSwitchUserModal(true)}
        onLogout={logout}
      />

      {/* Main Studio Frame */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          isAdmin={user?.role === 'admin'}
        />

        {/* Dynamic Studio Page Canvas */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
          {activeTab === 'home' && (
            <DashboardPage
              user={user}
              projects={projects}
              activeProject={activeProject}
              recentJobs={recentJobs}
              onSelectProject={handleSelectProject}
              onNavigate={setActiveTab}
              onNewProject={() => setShowNewProjectModal(true)}
              onDuplicateProject={handleDuplicateProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsPage
              projects={projects}
              activeProject={activeProject}
              onSelectProject={handleSelectProject}
              onProjectsUpdated={refreshProjects}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'create' && (
            <TextToVideoPage
              activeProject={activeProject}
              characters={characters}
              onSceneAdded={() => {
                if (activeProject) loadProjectScenes(activeProject.id);
                refreshProjects();
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'long-scene' && (
            <LongScenePage
              activeProject={activeProject}
              characters={characters}
              onSceneAdded={() => {
                if (activeProject) loadProjectScenes(activeProject.id);
                refreshProjects();
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'mythology' && (
            <MythologyCreatorPage
              activeProject={activeProject}
              onScenesAdded={() => {
                if (activeProject) loadProjectScenes(activeProject.id);
                refreshProjects();
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'story-to-video' && (
            <StoryToVideoPage
              activeProject={activeProject}
              characters={characters}
              onScenesAdded={() => {
                if (activeProject) loadProjectScenes(activeProject.id);
                refreshProjects();
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'characters' && (
            <CharacterStudioPage
              characters={characters}
              activeProject={activeProject}
              onCharacterCreated={refreshCharacters}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'storyboard' && (
            <StoryboardPage
              activeProject={activeProject}
              scenes={activeScenes}
              onScenesUpdated={() => {
                if (activeProject) loadProjectScenes(activeProject.id);
                refreshProjects();
              }}
              onNavigateToTimeline={() => setActiveTab('timeline')}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelinePage
              activeProject={activeProject}
              scenes={activeScenes}
              onScenesUpdated={() => {
                if (activeProject) loadProjectScenes(activeProject.id);
                refreshProjects();
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'voice-studio' && (
            <VoiceStudioPage 
              activeProject={activeProject}
              onVoiceAddedToTimeline={() => {
                if (activeProject) loadProjectScenes(activeProject.id);
                refreshProjects();
              }}
              onShowToast={showToast} 
            />
          )}

          {activeTab === 'image-studio' && (
            <ImageStudioPage onShowToast={showToast} />
          )}

          {activeTab === 'assets' && (
            <AssetsPage
              assets={assets}
              activeProject={activeProject}
              onAssetsUpdated={refreshAssets}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'credits' && (
            <CreditsPage
              user={user}
              onUserDataUpdated={refreshUser}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              user={user}
              onResetDemo={() => {
                loadInitialData();
                showToast('Studio environment refreshed!', 'success');
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'admin' && (
            <AdminHubPage onShowToast={showToast} />
          )}
        </main>
      </div>

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* New Project Dialog */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-[#141520] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white font-cinematic">
              Initialize New Film Project
            </h3>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Film Title</label>
              <input
                id="new-film-title-input"
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="e.g. Echoes of Kurukshetra"
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Aspect Ratio</label>
              <select
                id="new-film-aspect-select"
                value={newProjectAspect}
                onChange={(e) => setNewProjectAspect(e.target.value as any)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="16:9">16:9 Cinema / YouTube</option>
                <option value="9:16">9:16 Vertical (Shorts / Reels)</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                id="new-film-cancel-btn"
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                id="new-film-create-btn"
                onClick={handleCreateNewProject}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Account / Sign Out Modal */}
      {showSwitchUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-[#141520] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white font-cinematic">
              Creator Account
            </h3>
            <p className="text-xs text-zinc-400">
              Current authenticated session via Firebase Authentication.
            </p>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Email:</span>
                <span className="font-semibold text-white">{firebaseUser.email || 'Anonymous'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">UID:</span>
                <span className="font-mono text-zinc-400 text-[11px]">{firebaseUser.uid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Plan:</span>
                <span className="uppercase text-indigo-400 font-semibold">{user?.plan || 'free'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Credits:</span>
                <span className="text-amber-400 font-bold">{user?.credits ?? 100}</span>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-2 border-t border-zinc-800">
              <button
                id="switch-modal-signout-btn"
                onClick={async () => {
                  setShowSwitchUserModal(false);
                  await logout();
                }}
                className="px-4 py-2 rounded-xl bg-red-950/70 hover:bg-red-900/80 border border-red-800/80 text-red-300 text-xs font-semibold"
              >
                Sign Out
              </button>
              <button
                id="switch-modal-close-btn"
                onClick={() => setShowSwitchUserModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainStudioApp />
    </AuthProvider>
  );
}
