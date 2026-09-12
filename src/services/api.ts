import { 
  Project, 
  Scene, 
  Character, 
  Asset, 
  CreditTransaction, 
  GenerationJob, 
  UserProfile, 
  MythologyGenerationResult, 
  StoryAnalysisResult 
} from '../types/index.js';

class ApiService {
  private userId: string = 'user';
  private authToken: string | null = null;

  setUserId(id: string) {
    this.userId = id;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const res = await fetch(endpoint, { ...options, headers });
    
    if (!res.ok) {
      let errorMsg = `Server error (${res.status})`;
      try {
        const errorJson = await res.json();
        if (errorJson.error) errorMsg = errorJson.error;
      } catch (e) {
        // ignore
      }
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // Health
  async getHealth() {
    return this.request<{ status: string; mode: string; providers: any }>('/api/health');
  }

  // Auth & Profile
  async getProfile(): Promise<{ user: UserProfile }> {
    return this.request<{ user: UserProfile }>('/api/auth/me');
  }

  async loginDemo(email: string, displayName?: string): Promise<{ user: UserProfile }> {
    return this.request<{ user: UserProfile }>('/api/auth/login-demo', {
      method: 'POST',
      body: JSON.stringify({ email, displayName })
    });
  }

  // Credits & Plans
  async getLedger(): Promise<{ balance: number; ledger: CreditTransaction[] }> {
    return this.request<{ balance: number; ledger: CreditTransaction[] }>('/api/credits/ledger');
  }

  async topUpCredits(plan: 'pro' | 'creator' | 'bonus'): Promise<{ success: boolean; user: UserProfile }> {
    return this.request<{ success: boolean; user: UserProfile }>('/api/credits/topup', {
      method: 'POST',
      body: JSON.stringify({ plan })
    });
  }

  // Projects
  async getProjects(): Promise<{ projects: Project[] }> {
    return this.request<{ projects: Project[] }>('/api/projects');
  }

  async getProject(id: string): Promise<{ project: Project; scenes: Scene[] }> {
    return this.request<{ project: Project; scenes: Scene[] }>(`/api/projects/${id}`);
  }

  async createProject(data: Partial<Project>): Promise<{ project: Project }> {
    return this.request<{ project: Project }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProject(id: string, data: Partial<Project>): Promise<{ project: Project }> {
    return this.request<{ project: Project }>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProject(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/projects/${id}`, {
      method: 'DELETE'
    });
  }

  async duplicateProject(id: string): Promise<{ project: Project }> {
    return this.request<{ project: Project }>(`/api/projects/${id}/duplicate`, {
      method: 'POST'
    });
  }

  // Scenes
  async getScenes(projectId: string): Promise<{ scenes: Scene[] }> {
    return this.request<{ scenes: Scene[] }>(`/api/projects/${projectId}/scenes`);
  }

  async addScene(projectId: string, data: Partial<Scene>): Promise<{ scene: Scene }> {
    return this.request<{ scene: Scene }>(`/api/projects/${projectId}/scenes`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateScene(projectId: string, sceneId: string, data: Partial<Scene>): Promise<{ scene: Scene }> {
    return this.request<{ scene: Scene }>(`/api/projects/${projectId}/scenes/${sceneId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteScene(projectId: string, sceneId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/projects/${projectId}/scenes/${sceneId}`, {
      method: 'DELETE'
    });
  }

  async reorderScenes(projectId: string, sceneIds: string[]): Promise<{ scenes: Scene[] }> {
    return this.request<{ scenes: Scene[] }>(`/api/projects/${projectId}/scenes/reorder`, {
      method: 'POST',
      body: JSON.stringify({ sceneIds })
    });
  }

  // Characters
  async getCharacters(): Promise<{ characters: Character[] }> {
    return this.request<{ characters: Character[] }>('/api/characters');
  }

  async createCharacter(data: Partial<Character>): Promise<{ character: Character }> {
    return this.request<{ character: Character }>('/api/characters', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCharacter(id: string, data: Partial<Character>): Promise<{ character: Character }> {
    return this.request<{ character: Character }>(`/api/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCharacter(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/characters/${id}`, {
      method: 'DELETE'
    });
  }

  // Assets
  async getAssets(category?: string): Promise<{ assets: Asset[] }> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<{ assets: Asset[] }>(`/api/assets${query}`);
  }

  async createAsset(data: Partial<Asset>): Promise<{ asset: Asset }> {
    return this.request<{ asset: Asset }>('/api/assets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteAsset(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/assets/${id}`, {
      method: 'DELETE'
    });
  }

  // Generations
  async generateVideo(params: any): Promise<{ job: GenerationJob; cost: number }> {
    return this.request<{ job: GenerationJob; cost: number }>('/api/generate/video', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async generateLongScene(params: any): Promise<{ job: GenerationJob; cost: number }> {
    return this.request<{ job: GenerationJob; cost: number }>('/api/generate/long-scene', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async generateStoryToVideo(params: any): Promise<{ analysis: StoryAnalysisResult; cost: number }> {
    return this.request<{ analysis: StoryAnalysisResult; cost: number }>('/api/generate/story-to-video', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async generateMythology(params: any): Promise<{ result: MythologyGenerationResult; cost: number }> {
    return this.request<{ result: MythologyGenerationResult; cost: number }>('/api/generate/mythology', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async generateImage(params: any): Promise<{ images: string[]; cost: number }> {
    return this.request<{ images: string[]; cost: number }>('/api/generate/image', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async generateVoice(params: any): Promise<{ voice: { audioUrl: string; duration: number }; cost: number }> {
    return this.request<{ voice: { audioUrl: string; duration: number }; cost: number }>('/api/generate/voice', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async generateThumbnail(params: any): Promise<{ thumbnails: string[]; cost: number }> {
    return this.request<{ thumbnails: string[]; cost: number }>('/api/generate/thumbnail', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async getJob(id: string): Promise<{ job: GenerationJob }> {
    return this.request<{ job: GenerationJob }>(`/api/jobs/${id}`);
  }

  async retryJob(id: string): Promise<{ job: GenerationJob }> {
    return this.request<{ job: GenerationJob }>(`/api/jobs/${id}/retry`, {
      method: 'POST'
    });
  }

  async extendVideo(previousJobId: string, prompt?: string): Promise<{ job: GenerationJob; cost: number }> {
    return this.request<{ job: GenerationJob; cost: number }>('/api/generate/video/extend', {
      method: 'POST',
      body: JSON.stringify({ previousJobId, prompt })
    });
  }

  async getRecentGenerations(): Promise<{ jobs: GenerationJob[] }> {
    return this.request<{ jobs: GenerationJob[] }>('/api/generations/recent');
  }

  // Phase 3: Shot level controls & Long Scene orchestration
  async generateShot(jobId: string, shotId: string): Promise<{ job: GenerationJob }> {
    return this.request<{ job: GenerationJob }>(`/api/jobs/${jobId}/shots/${shotId}/generate`, {
      method: 'POST'
    });
  }

  async retryShot(jobId: string, shotId: string, prompt?: string): Promise<{ job: GenerationJob }> {
    return this.request<{ job: GenerationJob }>(`/api/jobs/${jobId}/shots/${shotId}/retry`, {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
  }

  async editShot(jobId: string, shotId: string, updates: { prompt?: string; camera?: string; environment?: string }): Promise<{ job: GenerationJob }> {
    return this.request<{ job: GenerationJob }>(`/api/jobs/${jobId}/shots/${shotId}/edit`, {
      method: 'POST',
      body: JSON.stringify(updates)
    });
  }

  async resumeLongScene(jobId: string): Promise<{ job: GenerationJob }> {
    return this.request<{ job: GenerationJob }>(`/api/jobs/${jobId}/resume`, {
      method: 'POST'
    });
  }

  async assembleLongScene(jobId: string, options?: { audioTracks?: any; subtitles?: any }): Promise<{ assembledVideoUrl: string; duration: number; job: GenerationJob }> {
    return this.request<{ assembledVideoUrl: string; duration: number; job: GenerationJob }>(`/api/jobs/${jobId}/assemble`, {
      method: 'POST',
      body: JSON.stringify(options || {})
    });
  }

  // Voice Consistency & Project Voice
  async getProjectVoice(projectId: string): Promise<{ defaultVoice: any }> {
    return this.request<{ defaultVoice: any }>(`/api/projects/${projectId}/voice`);
  }

  async setProjectVoice(projectId: string, voiceSettings: any): Promise<{ success: boolean; project: any }> {
    return this.request<{ success: boolean; project: any }>(`/api/projects/${projectId}/voice`, {
      method: 'POST',
      body: JSON.stringify(voiceSettings)
    });
  }

  // Timeline & Export
  async exportTimeline(data: any): Promise<{ success: boolean; export: any }> {
    return this.request<{ success: boolean; export: any }>('/api/timeline/export', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Admin
  async getAdminMetrics(): Promise<any> {
    return this.request<any>('/api/admin/metrics');
  }
}

export const api = new ApiService();
