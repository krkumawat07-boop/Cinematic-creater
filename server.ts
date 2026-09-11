import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { SERVER_CONFIG } from './server/config.js';
import { serverStorage } from './server/storage.js';
import { creditService } from './server/credits.js';
import { MockVideoProvider } from './server/providers/mockVideoProvider.js';
import { MockImageProvider } from './server/providers/mockImageProvider.js';
import { MockVoiceProvider, MockMusicProvider } from './server/providers/mockVoiceProvider.js';
import { analyzeStoryToVideo, generateMythologyContent } from './server/providers/geminiProvider.js';
import { getVideoCreditCost } from './src/config/credits.js';

const app = express();
app.use(express.json());

// Instantiate providers
const videoProvider = new MockVideoProvider();
const imageProvider = new MockImageProvider();
const voiceProvider = new MockVoiceProvider();
const musicProvider = new MockMusicProvider();

// Helper to extract or default active user
function getActiveUserId(req: express.Request): string {
  return (req.headers['x-user-id'] as string) || 'user_krkumawat';
}

// ==========================================
// 1. HEALTH & METRICS
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Cinematic Creator',
    version: '1.0.0',
    mode: 'development_demo',
    providers: {
      video: videoProvider.name,
      image: imageProvider.name,
      voice: voiceProvider.name,
      music: musicProvider.name,
      geminiKeyConfigured: Boolean(SERVER_CONFIG.GEMINI_API_KEY),
    }
  });
});

// ==========================================
// 2. AUTH & USER PROFILE
// ==========================================
app.get('/api/auth/me', (req, res) => {
  const userId = getActiveUserId(req);
  let user = serverStorage.getUser(userId);
  if (!user) {
    user = serverStorage.getOrCreateUser('krkumawat07@gmail.com', 'Creator K.R.');
  }
  res.json({ user });
});

app.post('/api/auth/login-demo', (req, res) => {
  const { email, displayName } = req.body;
  const user = serverStorage.getOrCreateUser(email || 'krkumawat07@gmail.com', displayName || 'Creator K.R.');
  res.json({ user });
});

// ==========================================
// 3. CREDITS & PLANS
// ==========================================
app.get('/api/credits/ledger', (req, res) => {
  const userId = getActiveUserId(req);
  const ledger = creditService.getLedger(userId);
  const balance = creditService.getUserBalance(userId);
  res.json({ balance, ledger });
});

app.post('/api/credits/topup', (req, res) => {
  const userId = getActiveUserId(req);
  const { plan } = req.body; // 'pro' | 'creator' | 'bonus'
  
  if (plan === 'pro') {
    serverStorage.updateUserPlan(userId, 'pro');
    creditService.grantCredits(userId, 1000, 'Upgraded to Pro Filmmaker Plan (+1,000 Credits)');
  } else if (plan === 'creator') {
    serverStorage.updateUserPlan(userId, 'creator');
    creditService.grantCredits(userId, 3500, 'Upgraded to Studio Creator Plan (+3,500 Credits)');
  } else {
    creditService.grantCredits(userId, 100, 'Demo Top-Up (+100 Credits)');
  }

  const user = serverStorage.getUser(userId);
  res.json({ success: true, user });
});

// ==========================================
// 4. PROJECTS & SCENES
// ==========================================
app.get('/api/projects', (req, res) => {
  const userId = getActiveUserId(req);
  const projects = serverStorage.getProjects(userId);
  res.json({ projects });
});

app.post('/api/projects', (req, res) => {
  const userId = getActiveUserId(req);
  const project = serverStorage.createProject(userId, req.body);
  res.json({ project });
});

app.get('/api/projects/:id', (req, res) => {
  const project = serverStorage.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const scenes = serverStorage.getScenes(req.params.id);
  res.json({ project, scenes });
});

app.put('/api/projects/:id', (req, res) => {
  const updated = serverStorage.updateProject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Project not found' });
  res.json({ project: updated });
});

app.delete('/api/projects/:id', (req, res) => {
  const ok = serverStorage.deleteProject(req.params.id);
  res.json({ success: ok });
});

app.post('/api/projects/:id/duplicate', (req, res) => {
  const copy = serverStorage.duplicateProject(req.params.id);
  if (!copy) return res.status(404).json({ error: 'Original project not found' });
  res.json({ project: copy });
});

// Scenes in project
app.get('/api/projects/:id/scenes', (req, res) => {
  const scenes = serverStorage.getScenes(req.params.id);
  res.json({ scenes });
});

app.post('/api/projects/:id/scenes', (req, res) => {
  const userId = getActiveUserId(req);
  const scene = serverStorage.addScene(req.params.id, { ...req.body, userId });
  res.json({ scene });
});

app.put('/api/projects/:id/scenes/:sceneId', (req, res) => {
  const scene = serverStorage.updateScene(req.params.id, req.params.sceneId, req.body);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });
  res.json({ scene });
});

app.delete('/api/projects/:id/scenes/:sceneId', (req, res) => {
  const ok = serverStorage.deleteScene(req.params.id, req.params.sceneId);
  res.json({ success: ok });
});

app.post('/api/projects/:id/scenes/reorder', (req, res) => {
  const { sceneIds } = req.body;
  const scenes = serverStorage.reorderScenes(req.params.id, sceneIds || []);
  res.json({ scenes });
});

// ==========================================
// 5. CHARACTERS
// ==========================================
app.get('/api/characters', (req, res) => {
  const userId = getActiveUserId(req);
  const characters = serverStorage.getCharacters(userId);
  res.json({ characters });
});

app.post('/api/characters', (req, res) => {
  const userId = getActiveUserId(req);
  const character = serverStorage.createCharacter(userId, req.body);
  res.json({ character });
});

app.put('/api/characters/:id', (req, res) => {
  const updated = serverStorage.updateCharacter(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Character not found' });
  res.json({ character: updated });
});

app.delete('/api/characters/:id', (req, res) => {
  const ok = serverStorage.deleteCharacter(req.params.id);
  res.json({ success: ok });
});

// ==========================================
// 6. ASSETS
// ==========================================
app.get('/api/assets', (req, res) => {
  const userId = getActiveUserId(req);
  const category = req.query.category as string;
  const assets = serverStorage.getAssets(userId, category);
  res.json({ assets });
});

app.post('/api/assets', (req, res) => {
  const userId = getActiveUserId(req);
  const asset = serverStorage.createAsset(userId, req.body);
  res.json({ asset });
});

app.delete('/api/assets/:id', (req, res) => {
  const ok = serverStorage.deleteAsset(req.params.id);
  res.json({ success: ok });
});

// ==========================================
// 7. GENERATION SERVICE (SERVER-SIDE LEDGER PROTECTED)
// ==========================================

// Text to Video & Image to Video
app.post('/api/generate/video', async (req, res) => {
  const userId = getActiveUserId(req);
  const { 
    prompt, 
    negativePrompt, 
    style, 
    camera, 
    cameraMovement, 
    lighting, 
    environment, 
    weather, 
    timeOfDay, 
    characterId, 
    referenceImageUrl, 
    duration = 10, 
    aspectRatio = '16:9', 
    resolution = '1080p',
    projectId,
    sceneId 
  } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required for video generation' });
  }

  const cost = getVideoCreditCost(Number(duration));

  // Server-side credit check & reservation
  try {
    creditService.reserveCredits(userId, cost, `Generated ${duration}s Video: "${prompt.substring(0, 40)}..."`);
  } catch (err: any) {
    return res.status(402).json({ error: err.message });
  }

  // Create tracked Job
  const job = serverStorage.createJob({
    userId,
    projectId,
    sceneId,
    type: referenceImageUrl ? 'image-to-video' : 'text-to-video',
    status: 'QUEUED',
    progress: 5,
    provider: videoProvider.name,
  });

  try {
    const providerResult = await videoProvider.generateVideo({
      prompt,
      negativePrompt,
      style,
      camera,
      cameraMovement,
      lighting,
      environment,
      weather,
      timeOfDay,
      characterId,
      referenceImageUrl,
      duration: Number(duration),
      aspectRatio,
      resolution,
    });

    serverStorage.updateJob(job.id, {
      providerJobId: providerResult.providerJobId,
      status: 'PROCESSING',
      progress: 25,
    });

    res.json({ job: serverStorage.getJob(job.id), cost });
  } catch (err: any) {
    // Refund credits on failure
    creditService.refundCredits(userId, cost, 'Video generation failed to launch', job.id);
    serverStorage.updateJob(job.id, { status: 'FAILED', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// Long Scene Generator (30s, 60s, 90s, 120s divided into shots)
app.post('/api/generate/long-scene', async (req, res) => {
  const userId = getActiveUserId(req);
  const {
    prompt,
    duration = 60, // 30, 60, 90, 120
    style = 'Cinematic Masterpiece',
    characterConsistency = true,
    environmentContinuity = true,
    selectedCharacterId,
    aspectRatio = '16:9',
    projectId
  } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Scene prompt is required' });
  }

  const durationSec = Number(duration);
  const cost = getVideoCreditCost(durationSec);

  try {
    creditService.reserveCredits(userId, cost, `Long Scene Generation (${durationSec}s): "${prompt.substring(0, 30)}..."`);
  } catch (err: any) {
    return res.status(402).json({ error: err.message });
  }

  // Divide into shots internally (e.g. 120s -> 12 shots, 60s -> 6 shots, 30s -> 3 shots)
  const shotCount = Math.max(3, Math.round(durationSec / 10));
  const shots = Array.from({ length: shotCount }).map((_, i) => ({
    id: 'shot_' + (i + 1),
    shotNumber: i + 1,
    duration: Math.round(durationSec / shotCount),
    prompt: `Shot ${i + 1} of ${shotCount}: ${prompt} (Camera angle ${i + 1}, continuity locked)`,
    characterReferences: selectedCharacterId ? [selectedCharacterId] : [],
    environment: environmentContinuity ? 'Main continuous setting' : 'Dynamic progression',
    camera: i % 2 === 0 ? 'Wide Cinematic Establishing' : 'Close-up on Emotional Pivot',
    status: 'QUEUED' as const,
    previewUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
  }));

  const job = serverStorage.createJob({
    userId,
    projectId,
    type: 'long-scene',
    status: 'QUEUED',
    progress: 10,
    provider: videoProvider.name,
    shots,
    metadata: {
      totalDuration: durationSec,
      characterConsistency,
      environmentContinuity
    }
  });

  res.json({ job, cost });
});

// Story to Video Analysis
app.post('/api/generate/story-to-video', async (req, res) => {
  const userId = getActiveUserId(req);
  const { story, language = 'English', durationSeconds = 60, style = 'Cinematic 3D' } = req.body;

  if (!story || !story.trim()) {
    return res.status(400).json({ error: 'Story content is required' });
  }

  const cost = SERVER_CONFIG.CREDIT_COSTS.STORY_BREAKDOWN;
  try {
    creditService.reserveCredits(userId, cost, `Story Analysis & Storyboard: "${story.substring(0, 30)}..."`);
  } catch (err: any) {
    return res.status(402).json({ error: err.message });
  }

  try {
    const analysis = await analyzeStoryToVideo({
      story,
      language: language === 'Hindi' ? 'Hindi' : 'English',
      durationSeconds: Number(durationSeconds),
      style
    });

    res.json({ analysis, cost });
  } catch (err: any) {
    creditService.refundCredits(userId, cost, 'Story analysis failed');
    res.status(500).json({ error: err.message });
  }
});

// 🔱 Mythology Creator
app.post('/api/generate/mythology', async (req, res) => {
  const userId = getActiveUserId(req);
  const { topic, preset = '1-minute video' } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Mythology topic is required' });
  }

  const cost = SERVER_CONFIG.CREDIT_COSTS.MYTHOLOGY_PACK;
  try {
    creditService.reserveCredits(userId, cost, `🔱 Hindi Mythology Suite: "${topic.substring(0, 30)}..."`);
  } catch (err: any) {
    return res.status(402).json({ error: err.message });
  }

  try {
    const mythologyData = await generateMythologyContent({ topic, preset });
    res.json({ result: mythologyData, cost });
  } catch (err: any) {
    creditService.refundCredits(userId, cost, 'Mythology generation failed');
    res.status(500).json({ error: err.message });
  }
});

// Image Studio (Text to Image, Variations, Character Sheet, Background, Thumbnail)
app.post('/api/generate/image', async (req, res) => {
  const userId = getActiveUserId(req);
  const { prompt, negativePrompt, style, lighting, camera, aspectRatio = '16:9', variations = 1, referenceImageUrl } = req.body;

  const cost = SERVER_CONFIG.CREDIT_COSTS.IMAGE * Number(variations || 1);
  try {
    creditService.reserveCredits(userId, cost, `Generated ${variations} Image(s): "${(prompt || '').substring(0, 30)}..."`);
  } catch (err: any) {
    return res.status(402).json({ error: err.message });
  }

  try {
    const result = await imageProvider.generateImage({
      prompt: prompt || 'Cinematic portrait',
      negativePrompt,
      style: style || 'Photorealistic',
      lighting,
      camera,
      aspectRatio,
      variations: Number(variations),
      referenceImageUrl
    });

    res.json({ images: result.images, cost });
  } catch (err: any) {
    creditService.refundCredits(userId, cost, 'Image generation failed');
    res.status(500).json({ error: err.message });
  }
});

// Voice Studio (Narration, Consistency, Speed, Pitch)
app.post('/api/generate/voice', async (req, res) => {
  const userId = getActiveUserId(req);
  const { text, voice = 'Arjun - Deep Epic Hindi', language = 'Hindi', gender = 'Male', style = 'Cinematic', emotion = 'Dramatic', speed = 1, pitch = 1, maintainConsistency = true } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Narration text is required' });
  }

  const cost = SERVER_CONFIG.CREDIT_COSTS.VOICE;
  try {
    creditService.reserveCredits(userId, cost, `Generated Voice Narration: "${text.substring(0, 30)}..."`);
  } catch (err: any) {
    return res.status(402).json({ error: err.message });
  }

  try {
    const result = await voiceProvider.generateVoice({
      text,
      voice,
      language,
      gender,
      style,
      emotion,
      speed: Number(speed),
      pitch: Number(pitch),
      maintainConsistency
    });

    res.json({ voice: result, cost });
  } catch (err: any) {
    creditService.refundCredits(userId, cost, 'Voice generation failed');
    res.status(500).json({ error: err.message });
  }
});

// Thumbnail Generator
app.post('/api/generate/thumbnail', async (req, res) => {
  const userId = getActiveUserId(req);
  const { title, character, background, lighting, mysteryIntensity = 75, visualStyle = 'Epic Viral', aspectRatio = '16:9' } = req.body;

  const cost = SERVER_CONFIG.CREDIT_COSTS.THUMBNAIL;
  try {
    creditService.reserveCredits(userId, cost, `Generated Thumbnail: "${title || 'YouTube Cover'}"`);
  } catch (err: any) {
    return res.status(402).json({ error: err.message });
  }

  try {
    const prompt = `YouTube high-CTR thumbnail, title: ${title}, character: ${character}, lighting: ${lighting}, visual style: ${visualStyle}, mystery intensity: ${mysteryIntensity}%`;
    const result = await imageProvider.generateImage({
      prompt,
      style: visualStyle,
      aspectRatio,
      variations: 2
    });

    res.json({ thumbnails: result.images, cost });
  } catch (err: any) {
    creditService.refundCredits(userId, cost, 'Thumbnail generation failed');
    res.status(500).json({ error: err.message });
  }
});

// Check Job Status (Polling / Real-time progress)
app.get(['/api/jobs/:id', '/api/generate/jobs/:id'], async (req, res) => {
  const job = serverStorage.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  // If already finished
  if (job.status === 'COMPLETED' || job.status === 'FAILED') {
    return res.json({ job });
  }

  // Poll underlying provider if text-to-video or long-scene
  if (job.providerJobId && (job.type === 'text-to-video' || job.type === 'image-to-video')) {
    const status = await videoProvider.getJobStatus(job.providerJobId);
    
    serverStorage.updateJob(job.id, {
      status: status.status,
      progress: status.progress,
      resultUrl: status.resultUrl || job.resultUrl,
      error: status.error
    });

    // If completed and tied to a scene, update that scene with the videoUrl!
    if (status.status === 'COMPLETED' && job.projectId && job.sceneId && status.resultUrl) {
      serverStorage.updateScene(job.projectId, job.sceneId, {
        videoUrl: status.resultUrl,
        thumbnailUrl: status.thumbnailUrl,
        status: 'ready'
      });
    }
  } else if (job.type === 'long-scene') {
    // Advance long scene progress smoothly
    const currentProgress = job.progress || 0;
    if (currentProgress < 100) {
      const nextProgress = Math.min(100, currentProgress + 25);
      const nextStatus = nextProgress >= 100 
        ? 'COMPLETED' 
        : nextProgress >= 75 
          ? 'ASSEMBLING' 
          : nextProgress >= 50 
            ? 'GENERATING' 
            : 'PROCESSING';
      
      const updatedShots = (job.shots || []).map(shot => {
        if (nextProgress >= 100) return { ...shot, status: 'COMPLETED' as const };
        if (nextProgress >= 50) return { ...shot, status: 'GENERATING' as const };
        return { ...shot, status: 'PROCESSING' as const };
      });

      serverStorage.updateJob(job.id, {
        progress: nextProgress,
        status: nextStatus,
        shots: updatedShots,
        resultUrl: nextProgress >= 100 ? 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4' : undefined
      });
    }
  }

  res.json({ job: serverStorage.getJob(job.id) });
});

app.get('/api/generations/recent', (req, res) => {
  const userId = getActiveUserId(req);
  const jobs = serverStorage.getUserJobs(userId);
  res.json({ jobs: jobs.slice(0, 10) });
});

// Final Timeline Export
app.post('/api/timeline/export', (req, res) => {
  const userId = getActiveUserId(req);
  const { projectId, format = 'mp4', resolution = '1080p', fps = 24 } = req.body;

  const project = serverStorage.getProject(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Simulate video assembly
  const exportUrl = 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4';

  res.json({
    success: true,
    export: {
      projectId,
      format,
      resolution,
      fps,
      duration: project.duration || 30,
      downloadUrl: exportUrl,
      createdAt: new Date().toISOString()
    }
  });
});

// ==========================================
// 8. ADMIN DASHBOARD
// ==========================================
app.get('/api/admin/metrics', (req, res) => {
  const users = serverStorage.getAllUsers();
  const projects = serverStorage.getAllProjects();
  const jobs = serverStorage.getAllJobs();
  const transactions = serverStorage.getAllTransactions();

  const totalCreditsConsumed = transactions
    .filter(t => t.type === 'deduct')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const failedJobs = jobs.filter(j => j.status === 'FAILED').length;

  res.json({
    totalUsers: users.length,
    activeUsers: users.length,
    totalProjects: projects.length,
    totalGenerations: jobs.length,
    creditsConsumed: totalCreditsConsumed,
    failedJobs,
    providers: [
      { name: videoProvider.name, type: 'Video', status: 'Active (Demo)', isMock: videoProvider.isMock },
      { name: imageProvider.name, type: 'Image', status: 'Active (Demo)', isMock: imageProvider.isMock },
      { name: voiceProvider.name, type: 'Voice', status: 'Active (Demo)', isMock: voiceProvider.isMock },
      { name: musicProvider.name, type: 'Music', status: 'Active (Demo)', isMock: musicProvider.isMock },
      { name: 'Gemini 2.5 Flash', type: 'Script & Prompts', status: SERVER_CONFIG.GEMINI_API_KEY ? 'Connected' : 'Fallback Template Engine', isMock: !SERVER_CONFIG.GEMINI_API_KEY }
    ],
    recentTransactions: transactions.slice(0, 15),
    recentJobs: jobs.slice(0, 15),
    users
  });
});

// ==========================================
// 9. VITE DEV OR PROD STATIC MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(SERVER_CONFIG.PORT, SERVER_CONFIG.HOST, () => {
    console.log(`Cinematic Creator server running on http://${SERVER_CONFIG.HOST}:${SERVER_CONFIG.PORT}`);
  });
}

startServer();
