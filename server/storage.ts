import { 
  Project, 
  Scene, 
  Character, 
  Asset, 
  CreditTransaction, 
  GenerationJob, 
  UserProfile 
} from '../src/types/index.js';

// In-memory data store mimicking Firestore collections with persistent structure
export class ServerStorage {
  private users: Map<string, UserProfile> = new Map();
  private projects: Map<string, Project> = new Map();
  private scenes: Map<string, Scene[]> = new Map(); // projectId -> Scene[]
  private characters: Map<string, Character> = new Map();
  private assets: Map<string, Asset> = new Map();
  private jobs: Map<string, GenerationJob> = new Map();
  private transactions: Map<string, CreditTransaction[]> = new Map(); // userId -> CreditTransaction[]

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed default user
    const defaultUserId = 'user_krkumawat';
    const defaultUser: UserProfile = {
      id: defaultUserId,
      email: 'krkumawat07@gmail.com',
      displayName: 'Creator K.R.',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      plan: 'free',
      credits: 100,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(defaultUserId, defaultUser);

    // Initial starter credit transaction
    this.transactions.set(defaultUserId, [
      {
        id: 'tx_welcome_bonus',
        userId: defaultUserId,
        amount: 100,
        type: 'grant',
        description: 'Welcome Bonus: 100 Free Generation Credits',
        createdAt: new Date().toISOString(),
      }
    ]);

    // Seed Characters
    const char1: Character = {
      id: 'char_krishna_01',
      userId: defaultUserId,
      name: 'भगवान श्रीकृष्ण (Shri Krishna)',
      appearance: 'Dark blue celestial skin, golden pitambar robes, peacock feather crown, flute, serene smile',
      age: 'Ageless Divine',
      hair: 'Lustrous matted curls adorned with peacock feather',
      clothing: 'Silken golden pitambar with pearl garlands and lotus ornaments',
      accessories: 'Golden Bansuri (flute), Kaustubha gem, Sudarshana aura',
      visualStyle: 'Cinematic Indian Epic / Divine Realism',
      description: 'The supreme embodiment of divine love, universal wisdom, and warrior philosopher of the Gita.',
      referenceImageUrl: 'https://images.unsplash.com/photo-1609605988071-b619d16854d1?w=800&auto=format&fit=crop&q=80',
      consistencyStrength: 95,
      referenceViews: {
        front: 'https://images.unsplash.com/photo-1609605988071-b619d16854d1?w=800&auto=format&fit=crop&q=80',
        faceCloseUp: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        threeQuarter: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
      },
      createdAt: new Date().toISOString(),
    };
    this.characters.set(char1.id, char1);

    const char2: Character = {
      id: 'char_maya_02',
      userId: defaultUserId,
      name: 'Commander Maya Vance',
      appearance: 'Cybernetic left ocular implant, titanium weave combat jacket, athletic build',
      age: '32',
      hair: 'Asymmetrical cropped silver-white hair',
      clothing: 'Matte black carbon fiber tactical suit with neon cyan conduits',
      accessories: 'Holographic wrist interface, energy sidearm holster',
      visualStyle: 'Blade Runner Cyberpunk 2099',
      description: 'Veteran vanguard pilot navigating the subterranean levels of Neo-Tokyo.',
      referenceImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      consistencyStrength: 95,
      referenceViews: {
        front: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        back: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
        left: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
        right: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
        threeQuarter: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        fullBody: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        faceCloseUp: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
      },
      createdAt: new Date().toISOString(),
    };
    this.characters.set(char2.id, char2);

    const char3: Character = {
      id: 'char_vance_03',
      userId: defaultUserId,
      name: 'Astronaut Cole Vance',
      appearance: 'Retro-futuristic Apollo-style pressurized environmental suit with illuminated gold visor',
      age: '40',
      hair: 'Buzz cut dark brown',
      clothing: 'Off-white heat-resistant Kevlar spacesuit with mission patch and analog pressure gauges',
      accessories: 'Panoramic gold visor helmet, emergency tether, quantum telemetry beacon',
      visualStyle: 'Retro-Futuristic Spacecraft / 70mm Panavision',
      description: 'Veteran deep-space navigator charting unexplored stellar anomalies on the edge of known space.',
      referenceImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      consistencyStrength: 90,
      referenceViews: {
        front: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        back: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        left: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
        right: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&auto=format&fit=crop&q=80',
        threeQuarter: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80',
        fullBody: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        faceCloseUp: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80'
      },
      createdAt: new Date().toISOString(),
    };
    this.characters.set(char3.id, char3);

    // Seed Project 1: Mythology Epic
    const p1Id = 'proj_mythology_01';
    const proj1: Project = {
      id: p1Id,
      userId: defaultUserId,
      title: '🔱 कुरुक्षेत्र: The Cosmic Awakening',
      description: 'A cinematic Indian mythology masterwork exploring the timeless battlefield of Kurukshetra.',
      aspectRatio: '16:9',
      resolution: '4k',
      fps: 24,
      duration: 30,
      thumbnailUrl: 'https://images.unsplash.com/photo-1609605988071-b619d16854d1?w=800&auto=format&fit=crop&q=80',
      scenesCount: 3,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(p1Id, proj1);

    this.scenes.set(p1Id, [
      {
        id: 'scene_01',
        projectId: p1Id,
        userId: defaultUserId,
        sceneNumber: 1,
        title: 'The Great Battlefield',
        duration: 10,
        visualPrompt: 'Wide panoramic view of Kurukshetra at sunrise, thousands of chariots, golden sun piercing mystical morning mist, 8k cinematic masterpiece',
        voiceOver: 'कुरुक्षेत्र की पावन भूमि पर जब दो महाशक्तियां आमने-सामने खड़ी हुईं, तब केवल युद्ध नहीं, धर्म का निर्णय होना था।',
        characters: ['भगवान श्रीकृष्ण (Shri Krishna)'],
        location: 'Kurukshetra Battlefield',
        camera: 'Aerial Drone Slow Push-in',
        lighting: 'Golden hour dramatic sunburst',
        status: 'ready',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-foggy-forest-and-mountains-43093-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'scene_02',
        projectId: p1Id,
        userId: defaultUserId,
        sceneNumber: 2,
        title: 'The Charioteer',
        duration: 10,
        visualPrompt: 'Lord Krishna holding the reins of four white horses, cosmic aura radiating, divine smile, eyes reflecting eternal cosmos',
        voiceOver: 'हे पार्थ! कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मोह को त्याग और सत्य के पथ पर अग्रसर हो।',
        characters: ['भगवान श्रीकृष्ण (Shri Krishna)'],
        location: 'Golden Chariot',
        camera: 'Dramatic Low Angle tracking with chariot motion',
        lighting: 'Divine celestial blue and gold rim light',
        status: 'ready',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-a-flute-in-nature-41581-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1609605988071-b619d16854d1?w=800&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'scene_03',
        projectId: p1Id,
        userId: defaultUserId,
        sceneNumber: 3,
        title: 'The Cosmic Viswaroopa Vision',
        duration: 10,
        visualPrompt: 'The universe expanding inside the divine manifestation, stars, nebulas and galaxies orbiting in transcendental rhythm',
        voiceOver: 'कालोऽस्मि लोकक्षयकृत्प्रवृद्धो... मैं ही काल हूँ, समस्त लोकों का नियंता और संहारक।',
        characters: ['भगवान श्रीकृष्ण (Shri Krishna)'],
        location: 'Celestial Dimension',
        camera: 'Macro Orbit 360 into Cosmic Eye',
        lighting: 'Cosmic nebula prismatic bursts',
        status: 'ready',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      }
    ]);

    // Seed Project 2: Sci-Fi Short
    const p2Id = 'proj_cyberpunk_02';
    const proj2: Project = {
      id: p2Id,
      userId: defaultUserId,
      title: 'Neon Odyssey: Sub-Level 9',
      description: 'Fast-paced vertical mobile thriller set in the rain-slicked towers of 2099.',
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      duration: 20,
      thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      scenesCount: 2,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(p2Id, proj2);

    this.scenes.set(p2Id, [
      {
        id: 'scene_cyber_01',
        projectId: p2Id,
        userId: defaultUserId,
        sceneNumber: 1,
        title: 'Neon Infiltration',
        duration: 10,
        visualPrompt: 'Vertical 9:16 shot of Commander Maya leaping between futuristic skyscrapers in heavy rain, neon pink and turquoise signs',
        voiceOver: 'In the underworld of Neo-Tokyo, shadows are the only currency that matters.',
        characters: ['Commander Maya Vance'],
        location: 'Sub-Level 9 Rooftops',
        camera: 'High Velocity Dutch Angle Dolly',
        lighting: 'Rain-drenched neon reflections',
        status: 'ready',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-neon-tunnel-with-glowing-lines-41566-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'scene_cyber_02',
        projectId: p2Id,
        userId: defaultUserId,
        sceneNumber: 2,
        title: 'The Holo-Decryption',
        duration: 10,
        visualPrompt: 'Commander Maya decrypting an alien data monolith with holographic runes floating around her fingers',
        voiceOver: 'The signal is alive. And it is calling someone.',
        characters: ['Commander Maya Vance'],
        location: 'Data Core Sanctum',
        camera: 'Extreme Macro on Iris and Hologram',
        lighting: 'Pulsing violet and cyan volumetric beams',
        status: 'ready',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-flames-of-a-burning-fire-in-slow-motion-42540-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      }
    ]);

    // Seed Project 3: Sci-Fi Desert Planet
    const p3Id = 'proj_monolith_03';
    const proj3: Project = {
      id: p3Id,
      userId: defaultUserId,
      title: 'Titan Dawn: The Colossal Monolith',
      description: 'IMAX 70mm sci-fi exploration of a colossal glowing alien monolith on an ancient desert world.',
      aspectRatio: '16:9',
      resolution: '4k',
      fps: 24,
      duration: 30,
      thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
      scenesCount: 2,
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(p3Id, proj3);

    this.scenes.set(p3Id, [
      {
        id: 'scene_mono_01',
        projectId: p3Id,
        userId: defaultUserId,
        sceneNumber: 1,
        title: 'Approach to the Monolith',
        duration: 15,
        visualPrompt: 'Cinematic sci-fi desert planet scene, colossal sleek alien structure glowing at twilight, two explorers in high-tech environmental suits standing on sand dunes, IMAX 70mm composition',
        voiceOver: 'They crossed four parsecs of silent desert to find what humanity left behind before the first stars.',
        characters: ['Astronaut Cole Vance'],
        location: 'Dune Sea of Kepler-186f',
        camera: 'Wide Angle Drone Tracking Sweep',
        lighting: 'Twilight violet and golden amber rim light',
        status: 'ready',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-flying-over-sand-dunes-in-a-desert-41551-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'scene_mono_02',
        projectId: p3Id,
        userId: defaultUserId,
        sceneNumber: 2,
        title: 'The Resonating Core',
        duration: 15,
        visualPrompt: 'Retro-futuristic cockpit looking into the glowing geometric aperture of the alien structure, volumetric amber radiation',
        voiceOver: 'Telemetry is spiking. The monolith is not dormant—it is listening.',
        characters: ['Astronaut Cole Vance'],
        location: 'Kepler Monolith Threshold',
        camera: 'Slow Push In 85mm Anamorphic',
        lighting: 'Deep amber and turquoise bioluminescence',
        status: 'ready',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      }
    ]);

    // Seed Assets
    const a1: Asset = {
      id: 'asset_01',
      userId: defaultUserId,
      projectId: p1Id,
      name: 'Kurukshetra War Theme.mp3',
      category: 'music',
      url: 'https://actions.google.com/sounds/v1/ambiences/cinematic_orchestral_drone.ogg',
      size: 4200000,
      duration: 90,
      createdAt: new Date().toISOString(),
    };
    this.assets.set(a1.id, a1);

    const a2: Asset = {
      id: 'asset_02',
      userId: defaultUserId,
      projectId: p1Id,
      name: 'Divine Shankh Resonance.wav',
      category: 'sfx',
      url: 'https://actions.google.com/sounds/v1/science_fiction/teleport_whoosh.ogg',
      size: 1100000,
      duration: 5,
      createdAt: new Date().toISOString(),
    };
    this.assets.set(a2.id, a2);
  }

  // Users
  getUser(userId: string): UserProfile | undefined {
    return this.users.get(userId);
  }

  getOrCreateUser(email: string, displayName?: string, photoUrl?: string): UserProfile {
    for (const u of this.users.values()) {
      if (u.email === email) return u;
    }
    const id = 'user_' + Math.random().toString(36).substring(2, 9);
    const user: UserProfile = {
      id,
      email,
      displayName: displayName || email.split('@')[0],
      photoUrl,
      plan: 'free',
      credits: 100,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.set(id, user);
    
    // Add welcome transaction
    this.addTransaction(id, {
      amount: 100,
      type: 'grant',
      description: 'Welcome Bonus: 100 Free Generation Credits'
    });

    return user;
  }

  getAllUsers(): UserProfile[] {
    return Array.from(this.users.values());
  }

  updateUserPlan(userId: string, plan: 'free' | 'pro' | 'creator'): UserProfile | undefined {
    const user = this.users.get(userId);
    if (!user) return undefined;
    user.plan = plan;
    if (plan === 'pro') user.credits += 1000;
    if (plan === 'creator') user.credits += 3500;
    user.updatedAt = new Date().toISOString();
    return user;
  }

  // Projects
  getProjects(userId: string): Project[] {
    return Array.from(this.projects.values()).filter(p => p.userId === userId);
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  createProject(userId: string, data: Partial<Project>): Project {
    const id = 'proj_' + Math.random().toString(36).substring(2, 9);
    const project: Project = {
      id,
      userId,
      title: data.title || 'Untitled Film',
      description: data.description || '',
      aspectRatio: data.aspectRatio || '16:9',
      resolution: data.resolution || '1080p',
      fps: data.fps || 24,
      duration: data.duration || 10,
      thumbnailUrl: data.thumbnailUrl,
      scenesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.projects.set(id, project);
    this.scenes.set(id, []);
    return project;
  }

  updateProject(id: string, data: Partial<Project>): Project | undefined {
    const p = this.projects.get(id);
    if (!p) return undefined;
    Object.assign(p, data, { updatedAt: new Date().toISOString() });
    return p;
  }

  deleteProject(id: string): boolean {
    this.scenes.delete(id);
    return this.projects.delete(id);
  }

  duplicateProject(id: string): Project | undefined {
    const original = this.projects.get(id);
    if (!original) return undefined;
    const copyId = 'proj_' + Math.random().toString(36).substring(2, 9);
    const copy: Project = {
      ...original,
      id: copyId,
      title: `${original.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.projects.set(copyId, copy);

    // Duplicate scenes
    const existingScenes = this.scenes.get(id) || [];
    const copiedScenes = existingScenes.map(s => ({
      ...s,
      id: 'scene_' + Math.random().toString(36).substring(2, 9),
      projectId: copyId,
      createdAt: new Date().toISOString()
    }));
    this.scenes.set(copyId, copiedScenes);

    return copy;
  }

  // Scenes
  getScenes(projectId: string): Scene[] {
    return this.scenes.get(projectId) || [];
  }

  addScene(projectId: string, sceneData: Partial<Scene>): Scene {
    const current = this.scenes.get(projectId) || [];
    const scene: Scene = {
      id: 'scene_' + Math.random().toString(36).substring(2, 9),
      projectId,
      userId: sceneData.userId || 'user_krkumawat',
      sceneNumber: current.length + 1,
      title: sceneData.title || `Scene ${current.length + 1}`,
      duration: sceneData.duration || 10,
      visualPrompt: sceneData.visualPrompt || '',
      voiceOver: sceneData.voiceOver || '',
      characters: sceneData.characters || [],
      location: sceneData.location || 'Studio Set',
      camera: sceneData.camera || 'Cinematic Medium Shot',
      lighting: sceneData.lighting || 'Cinematic Warm',
      status: sceneData.status || 'draft',
      videoUrl: sceneData.videoUrl,
      thumbnailUrl: sceneData.thumbnailUrl,
      createdAt: new Date().toISOString()
    };
    current.push(scene);
    this.scenes.set(projectId, current);

    // update project scenesCount
    const p = this.projects.get(projectId);
    if (p) {
      p.scenesCount = current.length;
      p.duration = current.reduce((sum, s) => sum + s.duration, 0);
      if (scene.thumbnailUrl && !p.thumbnailUrl) {
        p.thumbnailUrl = scene.thumbnailUrl;
      }
    }

    return scene;
  }

  updateScene(projectId: string, sceneId: string, data: Partial<Scene>): Scene | undefined {
    const current = this.scenes.get(projectId) || [];
    const scene = current.find(s => s.id === sceneId);
    if (!scene) return undefined;
    Object.assign(scene, data);
    return scene;
  }

  deleteScene(projectId: string, sceneId: string): boolean {
    const current = this.scenes.get(projectId) || [];
    const filtered = current.filter(s => s.id !== sceneId);
    // renumber
    filtered.forEach((s, idx) => { s.sceneNumber = idx + 1; });
    this.scenes.set(projectId, filtered);
    const p = this.projects.get(projectId);
    if (p) {
      p.scenesCount = filtered.length;
      p.duration = filtered.reduce((sum, s) => sum + s.duration, 0);
    }
    return true;
  }

  reorderScenes(projectId: string, sceneIds: string[]): Scene[] {
    const current = this.scenes.get(projectId) || [];
    const ordered: Scene[] = [];
    sceneIds.forEach((id, idx) => {
      const match = current.find(s => s.id === id);
      if (match) {
        match.sceneNumber = idx + 1;
        ordered.push(match);
      }
    });
    this.scenes.set(projectId, ordered);
    return ordered;
  }

  // Characters
  getCharacters(userId: string): Character[] {
    return Array.from(this.characters.values()).filter(c => c.userId === userId);
  }

  getCharacter(id: string): Character | undefined {
    return this.characters.get(id);
  }

  createCharacter(userId: string, data: Partial<Character>): Character {
    const id = 'char_' + Math.random().toString(36).substring(2, 9);
    const char: Character = {
      id,
      userId,
      name: data.name || 'New Character',
      appearance: data.appearance || '',
      age: data.age || '25',
      hair: data.hair || 'Dark',
      clothing: data.clothing || 'Cinematic costume',
      accessories: data.accessories || '',
      visualStyle: data.visualStyle || 'Photorealistic',
      description: data.description || '',
      referenceImageUrl: data.referenceImageUrl,
      consistencyStrength: data.consistencyStrength ?? 80,
      referenceViews: data.referenceViews || {},
      createdAt: new Date().toISOString()
    };
    this.characters.set(id, char);
    return char;
  }

  updateCharacter(id: string, data: Partial<Character>): Character | undefined {
    const c = this.characters.get(id);
    if (!c) return undefined;
    Object.assign(c, data);
    return c;
  }

  deleteCharacter(id: string): boolean {
    return this.characters.delete(id);
  }

  // Assets
  getAssets(userId: string, category?: string): Asset[] {
    const all = Array.from(this.assets.values()).filter(a => a.userId === userId);
    if (category && category !== 'all') {
      return all.filter(a => a.category === category);
    }
    return all;
  }

  createAsset(userId: string, data: Partial<Asset>): Asset {
    const id = 'asset_' + Math.random().toString(36).substring(2, 9);
    const asset: Asset = {
      id,
      userId,
      projectId: data.projectId,
      name: data.name || 'Asset',
      category: data.category || 'images',
      url: data.url || '',
      size: data.size || 1024 * 500,
      duration: data.duration,
      createdAt: new Date().toISOString()
    };
    this.assets.set(id, asset);
    return asset;
  }

  deleteAsset(id: string): boolean {
    return this.assets.delete(id);
  }

  // Jobs
  createJob(jobData: Partial<GenerationJob>): GenerationJob {
    const id = 'job_' + Math.random().toString(36).substring(2, 9);
    const job: GenerationJob = {
      id,
      userId: jobData.userId || 'user_krkumawat',
      projectId: jobData.projectId,
      sceneId: jobData.sceneId,
      type: jobData.type || 'text-to-video',
      status: jobData.status || 'QUEUED',
      progress: jobData.progress || 0,
      provider: jobData.provider || 'mock-cinematic',
      providerJobId: jobData.providerJobId || ('pjob_' + Math.random().toString(36).substring(2, 8)),
      resultUrl: jobData.resultUrl,
      resultData: jobData.resultData,
      shots: jobData.shots,
      error: jobData.error,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.jobs.set(id, job);
    return job;
  }

  getJob(id: string): GenerationJob | undefined {
    return this.jobs.get(id);
  }

  updateJob(id: string, data: Partial<GenerationJob>): GenerationJob | undefined {
    const j = this.jobs.get(id);
    if (!j) return undefined;
    Object.assign(j, data, { updatedAt: new Date().toISOString() });
    return j;
  }

  getUserJobs(userId: string): GenerationJob[] {
    return Array.from(this.jobs.values())
      .filter(j => j.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllJobs(): GenerationJob[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Transactions & Ledger
  getTransactions(userId: string): CreditTransaction[] {
    const txs = this.transactions.get(userId) || [];
    return [...txs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllTransactions(): CreditTransaction[] {
    const all: CreditTransaction[] = [];
    for (const list of this.transactions.values()) {
      all.push(...list);
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addTransaction(userId: string, data: {
    amount: number;
    type: 'deduct' | 'grant' | 'refund' | 'bonus';
    description: string;
    generationId?: string;
  }): CreditTransaction {
    const id = 'tx_' + Math.random().toString(36).substring(2, 9);
    const tx: CreditTransaction = {
      id,
      userId,
      amount: data.amount,
      type: data.type,
      description: data.description,
      generationId: data.generationId,
      createdAt: new Date().toISOString()
    };
    const list = this.transactions.get(userId) || [];
    list.push(tx);
    this.transactions.set(userId, list);

    // Update user balance
    const u = this.users.get(userId);
    if (u) {
      u.credits += data.amount;
      u.updatedAt = new Date().toISOString();
    }

    return tx;
  }
}

export const serverStorage = new ServerStorage();
