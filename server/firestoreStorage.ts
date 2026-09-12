import { adminDb, hasAdminCredentials } from './firebaseAdmin.js';
import { 
  Project, 
  Scene, 
  Character, 
  Asset, 
  GenerationJob, 
  UserProfile 
} from '../src/types/index.js';

export class FirestoreStorage {
  private useFirestore: boolean = hasAdminCredentials;
  // In-memory cache & fallback layer to guarantee uninterrupted uptime
  private usersCache: Map<string, UserProfile> = new Map();
  private projectsCache: Map<string, Project> = new Map();
  private scenesCache: Map<string, Scene[]> = new Map(); // projectId -> Scene[]
  private charactersCache: Map<string, Character> = new Map();
  private assetsCache: Map<string, Asset> = new Map();
  private jobsCache: Map<string, GenerationJob> = new Map();

  private async safeDb<T>(op: () => Promise<T>): Promise<T | null> {
    if (!this.useFirestore) return null;
    try {
      return await op();
    } catch (err: any) {
      this.useFirestore = false;
      return null;
    }
  }

  // ==========================================
  // USERS
  // ==========================================
  async getOrCreateUser(
    uid: string, 
    email: string, 
    displayName?: string, 
    photoURL?: string
  ): Promise<UserProfile> {
    const now = new Date().toISOString();

    const fromDb = await this.safeDb(async () => {
      const userRef = adminDb.collection('users').doc(uid);
      const doc = await userRef.get();

      if (doc.exists) {
        const existing = doc.data() as any;
        return {
          id: uid,
          uid,
          email: existing.email || email,
          displayName: existing.displayName || displayName || 'Cinematic Creator',
          photoUrl: existing.photoUrl || existing.photoURL || photoURL || '',
          photoURL: existing.photoURL || existing.photoUrl || photoURL || '',
          plan: existing.plan || 'free',
          credits: typeof existing.credits === 'number' ? existing.credits : 100,
          role: existing.role || 'user',
          createdAt: existing.createdAt || now,
          updatedAt: now,
        } as UserProfile;
      }

      const newProfile: UserProfile = {
        id: uid,
        uid,
        email,
        displayName: displayName || (email ? email.split('@')[0] : 'Cinematic Creator'),
        photoUrl: photoURL || '',
        photoURL: photoURL || '',
        plan: 'free',
        credits: 100,
        role: 'user',
        createdAt: now,
        updatedAt: now,
      };

      await userRef.set(newProfile);
      return newProfile;
    });

    if (fromDb) {
      this.usersCache.set(uid, fromDb);
      this.seedStarterContent(uid);
      return fromDb;
    }

    let cached = this.usersCache.get(uid);
    if (!cached) {
      cached = {
        id: uid,
        uid,
        email,
        displayName: displayName || (email ? email.split('@')[0] : 'Cinematic Creator'),
        photoUrl: photoURL || '',
        photoURL: photoURL || '',
        plan: 'free',
        credits: 100,
        role: 'user',
        createdAt: now,
        updatedAt: now,
      };
      this.usersCache.set(uid, cached);
      this.seedStarterContent(uid);
    }
    return cached;
  }

  async getUser(uid: string): Promise<UserProfile | null> {
    const fromDb = await this.safeDb(async () => {
      const doc = await adminDb.collection('users').doc(uid).get();
      if (doc.exists) {
        const data = doc.data() as any;
        return {
          id: uid,
          uid,
          email: data.email,
          displayName: data.displayName || 'Cinematic Creator',
          photoUrl: data.photoUrl || data.photoURL,
          photoURL: data.photoURL || data.photoUrl,
          plan: data.plan || 'free',
          credits: typeof data.credits === 'number' ? data.credits : 100,
          role: data.role || 'user',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as UserProfile;
      }
      return null;
    });

    if (fromDb) {
      this.usersCache.set(uid, fromDb);
      return fromDb;
    }

    let cached = this.usersCache.get(uid);
    if (!cached) {
      cached = {
        id: uid,
        uid,
        email: '',
        displayName: 'Cinematic Creator',
        photoUrl: '',
        photoURL: '',
        plan: 'free',
        credits: 100,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.usersCache.set(uid, cached);
      this.seedStarterContent(uid);
    }
    return cached;
  }

  async updateUserPlan(uid: string, plan: 'free' | 'pro' | 'creator'): Promise<UserProfile | null> {
    const now = new Date().toISOString();
    await this.safeDb(async () => {
      const userRef = adminDb.collection('users').doc(uid);
      await userRef.update({ plan, updatedAt: now });
    });

    const user = this.usersCache.get(uid);
    if (user) {
      user.plan = plan;
      user.updatedAt = now;
      return user;
    }
    return this.getUser(uid);
  }

  // ==========================================
  // PROJECTS
  // ==========================================
  async getProjects(ownerId: string): Promise<Project[]> {
    const fromDb = await this.safeDb(async () => {
      const snapshot = await adminDb
        .collection('projects')
        .where('ownerId', '==', ownerId)
        .orderBy('updatedAt', 'desc')
        .get();

      if (!snapshot.empty) {
        return snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            userId: data.ownerId || data.userId || ownerId,
            ownerId: data.ownerId || data.userId || ownerId,
            title: data.name || data.title || 'Untitled Project',
            name: data.name || data.title || 'Untitled Project',
            description: data.description || '',
            aspectRatio: data.aspectRatio || '16:9',
            resolution: data.resolution || '1080p',
            fps: data.fps || 24,
            duration: data.duration || 10,
            thumbnailUrl: data.thumbnailUrl,
            scenesCount: data.scenesCount || 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as Project;
        });
      }
      return null;
    });

    if (fromDb && fromDb.length > 0) {
      fromDb.forEach((p) => this.projectsCache.set(p.id, p));
      return fromDb;
    }

    let list = Array.from(this.projectsCache.values()).filter(
      (p) => (p.ownerId === ownerId || p.userId === ownerId)
    );
    if (list.length === 0) {
      this.seedStarterContent(ownerId);
      list = Array.from(this.projectsCache.values()).filter(
        (p) => (p.ownerId === ownerId || p.userId === ownerId)
      );
    }
    return list;
  }

  async getProject(projectId: string, ownerId?: string): Promise<Project | null> {
    const fromDb = await this.safeDb(async () => {
      const doc = await adminDb.collection('projects').doc(projectId).get();
      if (doc.exists) {
        const data = doc.data() as any;
        if (ownerId && data.ownerId !== ownerId && data.userId !== ownerId) {
          return null; // Enforce owner access
        }
        return {
          id: doc.id,
          userId: data.ownerId || data.userId,
          ownerId: data.ownerId || data.userId,
          title: data.name || data.title,
          name: data.name || data.title,
          description: data.description || '',
          aspectRatio: data.aspectRatio || '16:9',
          resolution: data.resolution || '1080p',
          fps: data.fps || 24,
          duration: data.duration || 10,
          thumbnailUrl: data.thumbnailUrl,
          scenesCount: data.scenesCount || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as Project;
      }
      return null;
    });

    if (fromDb) {
      this.projectsCache.set(projectId, fromDb);
      return fromDb;
    }

    const p = this.projectsCache.get(projectId);
    if (!p) return null;
    if (ownerId && p.ownerId !== ownerId && p.userId !== ownerId) return null;
    return p;
  }

  async createProject(ownerId: string, data: Partial<Project>): Promise<Project> {
    const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const title = data.name || data.title || 'New Film Project';

    const project: Project = {
      id,
      userId: ownerId,
      ownerId,
      title,
      name: title,
      description: data.description || 'Cinematic visual production',
      aspectRatio: data.aspectRatio || '16:9',
      resolution: data.resolution || '1080p',
      fps: data.fps || 24,
      duration: data.duration || 10,
      thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
      scenesCount: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.projectsCache.set(id, project);

    // Create initial default scene
    const initialScene: Scene = {
      id: `scene_${Date.now()}_1`,
      projectId: id,
      userId: ownerId,
      ownerId,
      sceneNumber: 1,
      title: 'Scene 1: Establishing Vista',
      duration: 10,
      visualPrompt: 'Wide cinematic establishing shot, photorealistic, dramatic lighting, 8k',
      characters: [],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    this.scenesCache.set(id, [initialScene]);

    await this.safeDb(async () => {
      await adminDb.collection('projects').doc(id).set(project);
      await adminDb.collection('scenes').doc(initialScene.id).set(initialScene);
    });

    return project;
  }

  async updateProject(projectId: string, ownerId: string, data: Partial<Project>): Promise<Project | null> {
    const existing = await this.getProject(projectId, ownerId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const title = data.name || data.title || existing.title;
    const updated: Project = {
      ...existing,
      ...data,
      title,
      name: title,
      updatedAt: now,
    };

    this.projectsCache.set(projectId, updated);

    await this.safeDb(async () => {
      await adminDb.collection('projects').doc(projectId).update(updated);
    });

    return updated;
  }

  async deleteProject(projectId: string, ownerId: string): Promise<boolean> {
    const existing = await this.getProject(projectId, ownerId);
    if (!existing) return false;

    this.projectsCache.delete(projectId);
    this.scenesCache.delete(projectId);

    await this.safeDb(async () => {
      await adminDb.collection('projects').doc(projectId).delete();
    });

    return true;
  }

  async duplicateProject(projectId: string, ownerId: string): Promise<Project | null> {
    const original = await this.getProject(projectId, ownerId);
    if (!original) return null;

    const copy = await this.createProject(ownerId, {
      ...original,
      title: `${original.title} (Copy)`,
      name: `${original.title} (Copy)`,
    });

    const scenes = await this.getScenes(projectId, ownerId);
    for (const sc of scenes) {
      await this.addScene(copy.id, ownerId, {
        ...sc,
        title: `${sc.title} (Copy)`,
      });
    }

    return copy;
  }

  // ==========================================
  // SCENES
  // ==========================================
  async getScenes(projectId: string, ownerId?: string): Promise<Scene[]> {
    const fromDb = await this.safeDb(async () => {
      const snapshot = await adminDb
        .collection('scenes')
        .where('projectId', '==', projectId)
        .orderBy('sceneNumber', 'asc')
        .get();

      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as Scene);
      }
      return null;
    });

    if (fromDb && fromDb.length > 0) {
      this.scenesCache.set(projectId, fromDb);
      return fromDb;
    }

    return this.scenesCache.get(projectId) || [];
  }

  async addScene(projectId: string, ownerId: string, data: Partial<Scene>): Promise<Scene> {
    const scenes = await this.getScenes(projectId, ownerId);
    const sceneNumber = scenes.length + 1;
    const id = `scene_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newScene: Scene = {
      id,
      projectId,
      userId: ownerId,
      ownerId,
      sceneNumber: data.sceneNumber || sceneNumber,
      title: data.title || `Scene ${sceneNumber}`,
      duration: data.duration || 10,
      visualPrompt: data.visualPrompt || data.prompt || 'Cinematic composition, hyper-detailed, 8k',
      prompt: data.visualPrompt || data.prompt,
      voiceOver: data.voiceOver,
      voiceOverText: data.voiceOverText,
      characters: data.characters || [],
      location: data.location || 'Studio Environment',
      camera: data.camera || 'Eye Level Medium Shot',
      lighting: data.lighting || 'Cinematic Volumetric',
      status: data.status || 'draft',
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl,
      createdAt: now,
      updatedAt: now,
    };

    const currentList = this.scenesCache.get(projectId) || [];
    currentList.push(newScene);
    this.scenesCache.set(projectId, currentList);

    await this.safeDb(async () => {
      await adminDb.collection('scenes').doc(id).set(newScene);
      await adminDb.collection('projects').doc(projectId).update({
        scenesCount: currentList.length,
        updatedAt: now,
      });
    });

    return newScene;
  }

  async updateScene(
    projectId: string, 
    sceneId: string, 
    ownerId: string, 
    data: Partial<Scene>
  ): Promise<Scene | null> {
    const scenes = await this.getScenes(projectId, ownerId);
    const idx = scenes.findIndex((s) => s.id === sceneId);
    if (idx === -1) return null;

    const updated: Scene = {
      ...scenes[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    scenes[idx] = updated;
    this.scenesCache.set(projectId, scenes);

    await this.safeDb(async () => {
      await adminDb.collection('scenes').doc(sceneId).update(updated);
    });

    return updated;
  }

  async deleteScene(projectId: string, sceneId: string, ownerId: string): Promise<boolean> {
    const scenes = await this.getScenes(projectId, ownerId);
    const filtered = scenes.filter((s) => s.id !== sceneId);
    if (filtered.length === scenes.length) return false;

    this.scenesCache.set(projectId, filtered);

    await this.safeDb(async () => {
      await adminDb.collection('scenes').doc(sceneId).delete();
    });

    return true;
  }

  async reorderScenes(projectId: string, ownerId: string, sceneIds: string[]): Promise<Scene[]> {
    const scenes = await this.getScenes(projectId, ownerId);
    const reordered: Scene[] = [];

    sceneIds.forEach((id, index) => {
      const found = scenes.find((s) => s.id === id);
      if (found) {
        const updated = { ...found, sceneNumber: index + 1, updatedAt: new Date().toISOString() };
        reordered.push(updated);
      }
    });

    this.scenesCache.set(projectId, reordered);

    await this.safeDb(async () => {
      for (let i = 0; i < reordered.length; i++) {
        await adminDb.collection('scenes').doc(reordered[i].id).update({ sceneNumber: i + 1 });
      }
    });

    return reordered;
  }

  // ==========================================
  // CHARACTERS
  // ==========================================
  async getCharacters(ownerId: string): Promise<Character[]> {
    const fromDb = await this.safeDb(async () => {
      const snapshot = await adminDb
        .collection('characters')
        .where('ownerId', '==', ownerId)
        .orderBy('createdAt', 'desc')
        .get();

      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as Character);
      }
      return null;
    });

    if (fromDb && fromDb.length > 0) {
      fromDb.forEach((c) => this.charactersCache.set(c.id, c));
      return fromDb;
    }

    let list = Array.from(this.charactersCache.values()).filter(
      (c) => c.ownerId === ownerId || c.userId === ownerId
    );
    if (list.length === 0) {
      this.seedStarterContent(ownerId);
      list = Array.from(this.charactersCache.values()).filter(
        (c) => c.ownerId === ownerId || c.userId === ownerId
      );
    }
    return list;
  }

  async getCharacter(characterId: string, ownerId?: string): Promise<Character | null> {
    const fromDb = await this.safeDb(async () => {
      const doc = await adminDb.collection('characters').doc(characterId).get();
      if (doc.exists) {
        const data = doc.data() as Character;
        if (ownerId && data.ownerId !== ownerId && data.userId !== ownerId) {
          return null;
        }
        return data;
      }
      return null;
    });

    if (fromDb) {
      this.charactersCache.set(characterId, fromDb);
      return fromDb;
    }

    const cached = this.charactersCache.get(characterId);
    if (!cached) return null;
    if (ownerId && cached.ownerId !== ownerId && cached.userId !== ownerId) return null;
    return cached;
  }

  async createCharacter(ownerId: string, data: Partial<Character>): Promise<Character> {
    const id = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const character: Character = {
      id,
      userId: ownerId,
      ownerId,
      name: data.name || 'Hero Prototype',
      appearance: data.appearance || 'Cinematic costume, high texture fidelity',
      age: data.age || 'Ageless',
      hair: data.hair || 'Dark natural',
      clothing: data.clothing || 'Cinematic attire',
      accessories: data.accessories || 'Minimalist props',
      visualStyle: data.visualStyle || 'Cinematic Photorealism',
      description: data.description || '',
      referenceImageUrl: data.referenceImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      consistencyStrength: data.consistencyStrength ?? 90,
      referenceViews: data.referenceViews || {},
      createdAt: now,
      updatedAt: now,
    };

    this.charactersCache.set(id, character);

    await this.safeDb(async () => {
      await adminDb.collection('characters').doc(id).set(character);
    });

    return character;
  }

  async updateCharacter(
    characterId: string, 
    ownerId: string, 
    data: Partial<Character>
  ): Promise<Character | null> {
    const existing = this.charactersCache.get(characterId);
    if (!existing || (existing.ownerId !== ownerId && existing.userId !== ownerId)) return null;

    const updated: Character = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.charactersCache.set(characterId, updated);

    await this.safeDb(async () => {
      await adminDb.collection('characters').doc(characterId).update(updated);
    });

    return updated;
  }

  async deleteCharacter(characterId: string, ownerId: string): Promise<boolean> {
    const existing = this.charactersCache.get(characterId);
    if (!existing || (existing.ownerId !== ownerId && existing.userId !== ownerId)) return false;

    this.charactersCache.delete(characterId);

    await this.safeDb(async () => {
      await adminDb.collection('characters').doc(characterId).delete();
    });

    return true;
  }

  // ==========================================
  // ASSETS
  // ==========================================
  async getAssets(ownerId: string, category?: string): Promise<Asset[]> {
    const fromDb = await this.safeDb(async () => {
      let query = adminDb.collection('assets').where('ownerId', '==', ownerId);
      if (category) {
        query = query.where('category', '==', category);
      }
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as Asset);
      }
      return null;
    });

    if (fromDb && fromDb.length > 0) {
      fromDb.forEach((a) => this.assetsCache.set(a.id, a));
      return fromDb;
    }

    return Array.from(this.assetsCache.values()).filter((a) => {
      const matchesOwner = a.ownerId === ownerId || a.userId === ownerId;
      if (!matchesOwner) return false;
      if (category) return a.category === category;
      return true;
    });
  }

  async createAsset(ownerId: string, data: Partial<Asset>): Promise<Asset> {
    const id = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const asset: Asset = {
      id,
      userId: ownerId,
      ownerId,
      projectId: data.projectId,
      name: data.name || 'Rendered Media Asset',
      category: data.category || 'videos',
      url: data.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      size: data.size || 1024 * 1024 * 5,
      createdAt: now,
    };

    this.assetsCache.set(id, asset);

    await this.safeDb(async () => {
      await adminDb.collection('assets').doc(id).set(asset);
    });

    return asset;
  }

  async deleteAsset(assetId: string, ownerId: string): Promise<boolean> {
    const existing = this.assetsCache.get(assetId);
    if (!existing || (existing.ownerId !== ownerId && existing.userId !== ownerId)) return false;

    this.assetsCache.delete(assetId);

    await this.safeDb(async () => {
      await adminDb.collection('assets').doc(assetId).delete();
    });

    return true;
  }

  // ==========================================
  // GENERATIONS
  // ==========================================
  async createJob(jobData: Partial<GenerationJob>): Promise<GenerationJob> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const job: GenerationJob = {
      id,
      userId: jobData.userId || jobData.ownerId || 'user',
      ownerId: jobData.userId || jobData.ownerId || 'user',
      projectId: jobData.projectId,
      sceneId: jobData.sceneId,
      type: jobData.type || 'text-to-video',
      status: jobData.status || 'QUEUED',
      progress: jobData.progress || 0,
      provider: jobData.provider || 'mock-cinematic',
      providerJobId: jobData.providerJobId || `p_${Date.now()}`,
      creditsReserved: jobData.creditsReserved || 0,
      resultUrl: jobData.resultUrl,
      resultData: jobData.resultData,
      shots: jobData.shots,
      error: jobData.error,
      metadata: jobData.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.jobsCache.set(id, job);

    await this.safeDb(async () => {
      await adminDb.collection('generations').doc(id).set(job);
    });

    return job;
  }

  async updateJob(id: string, updates: Partial<GenerationJob>, ownerId?: string): Promise<GenerationJob | null> {
    let job = this.jobsCache.get(id);
    if (!job) {
      const fromDb = await this.safeDb(async () => {
        const doc = await adminDb.collection('generations').doc(id).get();
        if (doc.exists) {
          return doc.data() as GenerationJob;
        }
        return null;
      });
      if (fromDb) {
        job = fromDb;
      }
    }
    if (!job) return null;
    if (ownerId && job.ownerId !== ownerId && job.userId !== ownerId) return null;

    const updated: GenerationJob = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.jobsCache.set(id, updated);

    await this.safeDb(async () => {
      await adminDb.collection('generations').doc(id).update(updated);
    });

    return updated;
  }

  async getJob(id: string, ownerId?: string): Promise<GenerationJob | null> {
    const fromDb = await this.safeDb(async () => {
      const doc = await adminDb.collection('generations').doc(id).get();
      if (doc.exists) {
        const data = doc.data() as GenerationJob;
        if (ownerId && data.ownerId !== ownerId && data.userId !== ownerId) return null;
        return data;
      }
      return null;
    });

    if (fromDb) {
      this.jobsCache.set(id, fromDb);
      return fromDb;
    }

    const job = this.jobsCache.get(id);
    if (!job) return null;
    if (ownerId && job.ownerId !== ownerId && job.userId !== ownerId) return null;
    return job;
  }

  async getRecentGenerations(ownerId: string): Promise<GenerationJob[]> {
    const fromDb = await this.safeDb(async () => {
      const snapshot = await adminDb
        .collection('generations')
        .where('ownerId', '==', ownerId)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as GenerationJob);
      }
      return null;
    });

    if (fromDb && fromDb.length > 0) {
      fromDb.forEach((j) => this.jobsCache.set(j.id, j));
      return fromDb;
    }

    return Array.from(this.jobsCache.values())
      .filter((j) => j.ownerId === ownerId || j.userId === ownerId)
      .slice(0, 20);
  }

  // ==========================================
  // SEED CONTENT FOR NEW USERS
  // ==========================================
  private seedStarterContent(userId: string) {
    const now = new Date().toISOString();
    // Default starter project
    const pId = `proj_starter_${userId.substring(0, 6)}`;
    const starterProject: Project = {
      id: pId,
      userId,
      ownerId: userId,
      title: 'Echoes of the Odyssey',
      name: 'Echoes of the Odyssey',
      description: 'An AI-directed cinematic journey through mythical cosmic realms.',
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 24,
      duration: 30,
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      scenesCount: 2,
      createdAt: now,
      updatedAt: now,
    };
    this.projectsCache.set(pId, starterProject);

    const s1: Scene = {
      id: `scene_s1_${pId}`,
      projectId: pId,
      userId,
      ownerId: userId,
      sceneNumber: 1,
      title: 'Celestial Awakening',
      duration: 10,
      visualPrompt: 'Golden cosmic stardust descending on marble temple pillars, hyper-realistic, 8k photorealistic lighting',
      characters: ['char_krishna_01'],
      status: 'ready',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1609605988071-b619d16854d1?w=800&auto=format&fit=crop&q=80',
      createdAt: now,
      updatedAt: now,
    };

    const s2: Scene = {
      id: `scene_s2_${pId}`,
      projectId: pId,
      userId,
      ownerId: userId,
      sceneNumber: 2,
      title: 'The Prophetic Vow',
      duration: 10,
      visualPrompt: 'Close up cinematic shot of protagonist warrior reflecting beside glowing sacred altar, anamorphic lenses',
      characters: ['char_maya_02'],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    this.scenesCache.set(pId, [s1, s2]);

    // Starter characters
    const char1: Character = {
      id: `char_divine_${userId.substring(0, 6)}`,
      userId,
      ownerId: userId,
      name: 'भगवान श्रीकृष्ण (Shri Krishna)',
      appearance: 'Dark blue celestial radiance, golden pitambar, peacock feather crown, serene aura',
      age: 'Ageless Divine',
      hair: 'Lustrous matted curls adorned with peacock feather',
      clothing: 'Silken golden pitambar with pearl garlands',
      accessories: 'Golden Bansuri, Kaustubha gem aura',
      visualStyle: 'Cinematic Indian Epic / Divine Realism',
      description: 'The supreme embodiment of divine wisdom and compassion.',
      referenceImageUrl: 'https://images.unsplash.com/photo-1609605988071-b619d16854d1?w=800&auto=format&fit=crop&q=80',
      consistencyStrength: 95,
      referenceViews: {
        front: 'https://images.unsplash.com/photo-1609605988071-b619d16854d1?w=800&auto=format&fit=crop&q=80',
        faceCloseUp: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
      },
      createdAt: now,
      updatedAt: now,
    };
    this.charactersCache.set(char1.id, char1);

    const char2: Character = {
      id: `char_maya_${userId.substring(0, 6)}`,
      userId,
      ownerId: userId,
      name: 'Commander Maya Vance',
      appearance: 'Cybernetic ocular implant, titanium weave combat suit',
      age: '32',
      hair: 'Asymmetrical cropped silver hair',
      clothing: 'Matte black carbon tactical suit with cyan illumination',
      accessories: 'Holographic wrist interface',
      visualStyle: 'Cyberpunk Sci-Fi 2099',
      description: 'Veteran vanguard pilot navigating the subterranean levels of Neo-Tokyo.',
      referenceImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      consistencyStrength: 92,
      referenceViews: {
        front: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      },
      createdAt: now,
      updatedAt: now,
    };
    this.charactersCache.set(char2.id, char2);
  }
}

export const firestoreStorage = new FirestoreStorage();
