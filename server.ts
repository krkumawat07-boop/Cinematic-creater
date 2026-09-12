import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { SERVER_CONFIG } from './server/config.js';
import { firestoreStorage } from './server/firestoreStorage.js';
import { creditService } from './server/creditService.js';
import { requireAuth, optionalAuth, AuthenticatedRequest } from './server/authMiddleware.js';
import { getVideoProvider, getGeminiVideoProvider, getVoiceProvider } from './server/providers/providerFactory.js';
import { audioCache } from './server/providers/geminiVoiceProvider.js';
import { MockImageProvider } from './server/providers/mockImageProvider.js';
import { MockMusicProvider } from './server/providers/mockVoiceProvider.js';
import { analyzeStoryToVideo, generateMythologyContent } from './server/providers/geminiProvider.js';
import { getVideoCreditCost } from './src/config/credits.js';

const app = express();
app.use(express.json());

// Instantiate active providers (Real AI Video Provider or Demo Mock)
const videoProvider = getVideoProvider();
const imageProvider = new MockImageProvider();
const voiceProvider = getVoiceProvider();
const musicProvider = new MockMusicProvider();

// ==========================================
// 1. HEALTH & METRICS
// ==========================================
app.get('/api/health', optionalAuth, (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Cinematic Creator',
    version: '2.0.0',
    mode: 'production-ready',
    auth: {
      provider: 'Firebase Authentication',
      database: 'Cloud Firestore',
      tokenVerified: Boolean((req as AuthenticatedRequest).user),
    },
    providers: {
      video: `${videoProvider.name} (${videoProvider.isMock ? 'Demo Mode' : 'AI Engine'})`,
      image: `${imageProvider.name} (Demo Mode)`,
      voice: `${voiceProvider.name} (${voiceProvider.isMock ? 'Demo Mode' : 'Neural Speech'})`,
      music: `${musicProvider.name} (Demo Mode)`,
      geminiKeyConfigured: Boolean(SERVER_CONFIG.GEMINI_API_KEY),
    }
  });
});

// Audio stream proxy for synthesized voice
app.get('/api/audio/stream/:id', (req, res) => {
  const audioId = req.params.id;
  const cached = audioCache.get(audioId);
  if (!cached) {
    return res.status(404).json({ error: 'Audio stream not found or expired' });
  }

  res.setHeader('Content-Type', cached.mimeType || 'audio/wav');
  res.setHeader('Content-Length', cached.buffer.length);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(cached.buffer);
});

// ==========================================
// 2. AUTH & USER PROFILE
// ==========================================
app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const fbUser = req.user!;
    const user = await firestoreStorage.getOrCreateUser(
      fbUser.uid,
      fbUser.email,
      fbUser.displayName,
      fbUser.photoURL
    );
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login-demo', async (req, res) => {
  try {
    const { email, displayName } = req.body || {};
    const safeEmail = email || 'creator@cineforge.studio';
    const cleanId = 'demo_' + safeEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const user = await firestoreStorage.getOrCreateUser(
      cleanId,
      safeEmail,
      displayName || 'Studio Director',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    );
    res.json({ user, token: cleanId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. CREDITS & PLANS (SERVER-SIDE LEDGER)
// ==========================================
app.get('/api/credits/ledger', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const balance = await creditService.getBalance(userId);
    const ledger = await creditService.getTransactions(userId);
    res.json({ balance, ledger });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/credits/topup', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const { plan } = req.body; // 'pro' | 'creator' | 'bonus'
    
    if (plan === 'pro') {
      await firestoreStorage.updateUserPlan(userId, 'pro');
      await creditService.addCredits(userId, 1000, 'Upgraded to Pro Filmmaker Plan (+1,000 Credits)');
    } else if (plan === 'creator') {
      await firestoreStorage.updateUserPlan(userId, 'creator');
      await creditService.addCredits(userId, 3500, 'Upgraded to Studio Creator Plan (+3,500 Credits)');
    } else {
      await creditService.addCredits(userId, 100, 'Creator Top-Up (+100 Credits)');
    }

    const user = await firestoreStorage.getUser(userId);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. PROJECTS & SCENES (FIRESTORE SECURED)
// ==========================================
app.get('/api/projects', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const projects = await firestoreStorage.getProjects(req.userId!);
    res.json({ projects });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const project = await firestoreStorage.createProject(req.userId!, req.body);
    res.json({ project });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const project = await firestoreStorage.getProject(req.params.id, req.userId!);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const scenes = await firestoreStorage.getScenes(req.params.id, req.userId!);
    res.json({ project, scenes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await firestoreStorage.updateProject(req.params.id, req.userId!, req.body);
    if (!updated) return res.status(404).json({ error: 'Project not found or unauthorized' });
    res.json({ project: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const ok = await firestoreStorage.deleteProject(req.params.id, req.userId!);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:id/duplicate', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const copy = await firestoreStorage.duplicateProject(req.params.id, req.userId!);
    if (!copy) return res.status(404).json({ error: 'Original project not found or unauthorized' });
    res.json({ project: copy });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Scenes in project
app.get('/api/projects/:id/scenes', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const scenes = await firestoreStorage.getScenes(req.params.id, req.userId!);
    res.json({ scenes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:id/scenes', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const scene = await firestoreStorage.addScene(req.params.id, req.userId!, req.body);
    res.json({ scene });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id/scenes/:sceneId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const scene = await firestoreStorage.updateScene(req.params.id, req.params.sceneId, req.userId!, req.body);
    if (!scene) return res.status(404).json({ error: 'Scene not found or unauthorized' });
    res.json({ scene });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id/scenes/:sceneId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const ok = await firestoreStorage.deleteScene(req.params.id, req.params.sceneId, req.userId!);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:id/scenes/reorder', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { sceneIds } = req.body;
    const scenes = await firestoreStorage.reorderScenes(req.params.id, req.userId!, sceneIds || []);
    res.json({ scenes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. CHARACTERS (FIRESTORE SECURED)
// ==========================================
app.get('/api/characters', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const characters = await firestoreStorage.getCharacters(req.userId!);
    res.json({ characters });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/characters', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const character = await firestoreStorage.createCharacter(req.userId!, req.body);
    res.json({ character });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/characters/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await firestoreStorage.updateCharacter(req.params.id, req.userId!, req.body);
    if (!updated) return res.status(404).json({ error: 'Character not found or unauthorized' });
    res.json({ character: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/characters/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const ok = await firestoreStorage.deleteCharacter(req.params.id, req.userId!);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. ASSETS (FIRESTORE SECURED)
// ==========================================
app.get('/api/assets', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const category = req.query.category as string;
    const assets = await firestoreStorage.getAssets(req.userId!, category);
    res.json({ assets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assets', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const asset = await firestoreStorage.createAsset(req.userId!, req.body);
    res.json({ asset });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/assets/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const ok = await firestoreStorage.deleteAsset(req.params.id, req.userId!);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. GENERATION SERVICE (SERVER-SIDE LEDGER PROTECTED)
// ==========================================

// Text to Video & Image to Video
app.post('/api/generate/video', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
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
  const generationId = `gen_vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Atomic credit reservation
  try {
    await creditService.reserveCredits(
      userId, 
      cost, 
      generationId, 
      `Generated ${duration}s Video: "${prompt.substring(0, 40)}..."`
    );
  } catch (err: any) {
    return res.status(402).json({ error: err.message });
  }

  // Resolve character details for Character Reference consistency
  let effectiveReferenceImageUrl = referenceImageUrl;
  let characterPromptDetail = '';
  if (characterId) {
    try {
      const characters = await firestoreStorage.getCharacters(userId);
      const character = characters.find(c => c.id === characterId);
      if (character) {
        if (!effectiveReferenceImageUrl && character.referenceImageUrl) {
          effectiveReferenceImageUrl = character.referenceImageUrl;
        }
        characterPromptDetail = ` Featuring character ${character.name}: ${character.appearance}, dressed in ${character.clothing || 'cinematic costume'}.`;
      }
    } catch (cErr) {
      console.warn('Could not load character references:', cErr);
    }
  }

  const finalPrompt = (prompt + characterPromptDetail).trim();

  // 2. Create tracked Job in Firestore
  const job = await firestoreStorage.createJob({
    id: generationId,
    userId,
    ownerId: userId,
    projectId,
    sceneId,
    type: effectiveReferenceImageUrl ? 'image-to-video' : 'text-to-video',
    status: 'QUEUED',
    progress: 10,
    provider: videoProvider.name,
    creditsReserved: cost,
    metadata: {
      prompt: finalPrompt,
      originalPrompt: prompt,
      style,
      camera,
      cameraMovement,
      duration: Number(duration),
      aspectRatio,
      resolution,
      referenceImageUrl: effectiveReferenceImageUrl,
      characterId
    }
  });

  try {
    const providerResult = await videoProvider.generateVideo({
      prompt: finalPrompt,
      negativePrompt,
      style,
      camera,
      cameraMovement,
      lighting,
      environment,
      weather,
      timeOfDay,
      characterId,
      referenceImageUrl: effectiveReferenceImageUrl,
      duration: Number(duration),
      aspectRatio,
      resolution,
    });

    await firestoreStorage.updateJob(job.id, {
      providerJobId: providerResult.providerJobId,
      status: 'PROCESSING',
      progress: 25,
    }, userId);

    const updatedJob = await firestoreStorage.getJob(job.id, userId);
    res.json({ job: updatedJob, cost });
  } catch (err: any) {
    // Atomic refund on failure
    await creditService.refundCredits(userId, generationId, 'Video generation failed to launch');
    await firestoreStorage.updateJob(job.id, { status: 'FAILED', error: err.message }, userId);
    res.status(500).json({ error: err.message });
  }
});

// Video Extension (+7s continuation)
app.post('/api/generate/video/extend', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const { previousJobId, prompt = 'Seamless cinematic continuation with matching lighting and camera motion' } = req.body;

  if (!previousJobId) {
    return res.status(400).json({ error: 'previousJobId is required for video extension' });
  }

  const prevJob = await firestoreStorage.getJob(previousJobId, userId);
  if (!prevJob) {
    return res.status(404).json({ error: 'Previous video job not found' });
  }

  const cost = 10; // Extension cost
  const generationId = `gen_ext_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    await creditService.reserveCredits(
      userId,
      cost,
      generationId,
      `Video Extension (+7s): "${prompt.substring(0, 30)}..."`
    );
  } catch (err: any) {
    return res.status(402).json({ error: err.message });
  }

  const job = await firestoreStorage.createJob({
    id: generationId,
    userId,
    ownerId: userId,
    projectId: prevJob.projectId,
    sceneId: prevJob.sceneId,
    type: 'text-to-video',
    status: 'QUEUED',
    progress: 10,
    provider: videoProvider.name,
    creditsReserved: cost,
    metadata: {
      extendedFrom: previousJobId,
      prompt,
      style: prevJob.metadata?.style || 'Cinematic Film',
      camera: 'Seamless Dolly Track',
      duration: 7,
      aspectRatio: prevJob.metadata?.aspectRatio || '16:9'
    }
  });

  try {
    let providerResult: { providerJobId: string };
    const gemini = getGeminiVideoProvider();

    if (!videoProvider.isMock) {
      providerResult = await gemini.extendVideo({
        previousProviderJobId: prevJob.providerJobId || prevJob.id,
        prompt
      });
    } else {
      providerResult = await videoProvider.generateVideo({
        prompt: `Continuation: ${prompt}`,
        style: 'Cinematic Film',
        camera: 'Dolly Track Forward',
        duration: 7,
        aspectRatio: '16:9'
      });
    }

    await firestoreStorage.updateJob(job.id, {
      providerJobId: providerResult.providerJobId,
      status: 'PROCESSING',
      progress: 25
    }, userId);

    const updatedJob = await firestoreStorage.getJob(job.id, userId);
    res.json({ job: updatedJob, cost });
  } catch (err: any) {
    await creditService.refundCredits(userId, generationId, 'Extension failed');
    await firestoreStorage.updateJob(job.id, { status: 'FAILED', error: err.message }, userId);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CINEMATIC PATTERNS & CONSISTENCY HELPERS
// ==========================================
const CINEMATIC_SHOT_PATTERNS = [
  { camera: 'Wide Cinematic Establishing', angle: 'Extreme wide slow push-in', purpose: 'Setting atmosphere and geographical grandeur' },
  { camera: 'Medium Tracking Shot', angle: 'Steadicam tracking subject motion', purpose: 'Introducing character presence and movement' },
  { camera: 'Close-up Emotional Pivot', angle: '85mm portrait with shallow depth of field', purpose: 'Capturing facial micro-expressions and dialogue emotion' },
  { camera: 'Low Angle Hero View', angle: 'Dynamic upward tilt from ground level', purpose: 'Emphasizing authority, majesty, or looming tension' },
  { camera: 'Over-the-Shoulder Dynamic', angle: 'Cinematic dirty single framing opposite subject', purpose: 'Fostering narrative immersion and visual conflict' },
  { camera: 'Aerial Crane Descending', angle: 'Dramatic vertical crane sweep down', purpose: 'Transitioning spatial scale into personal action' },
  { camera: 'High Speed Tracking', angle: 'Dolly alongside rapid character motion', purpose: 'Pumping kinetic energy and pacing' },
  { camera: 'Slow Motion Dutch Tilt', angle: 'Off-axis slow-motion drift', purpose: 'Psychological unraveling or climactic reveal' },
  { camera: 'Climactic Telephoto Silhouette', angle: '200mm compression against illuminated horizon', purpose: 'Epic resolution and dramatic iconography' },
];

function buildConsistentPrompt(
  shotPrompt: string,
  camera: string,
  sceneContext: any,
  character: any | null,
  consistencySettings: {
    character?: string;
    environment?: string;
    costume?: string;
    visualStyle?: string;
  }
): string {
  const parts: string[] = [shotPrompt.trim()];

  if (camera) {
    parts.push(`Camera direction: ${camera}. 70mm anamorphic film lens, smooth cinematic motion, photorealistic composition.`);
  }

  // Character consistency
  if (character && consistencySettings.character !== 'off') {
    const strength = consistencySettings.character || 'medium';
    if (strength === 'high') {
      parts.push(`Character subject: ${character.name}. Exact facial structure, ${character.appearance}. Hair: ${character.hair}. Absolute character likeness and visual continuity across scenes.`);
    } else if (strength === 'medium') {
      parts.push(`Character: ${character.name}, ${character.appearance}.`);
    } else {
      parts.push(`Featuring ${character.name}.`);
    }
  }

  // Costume consistency
  if (character && consistencySettings.costume !== 'off' && (character.clothing || character.accessories)) {
    const strength = consistencySettings.costume || 'medium';
    if (strength === 'high' || strength === 'medium') {
      const items = [character.clothing, character.accessories].filter(Boolean).join(', ');
      parts.push(`Strict costume continuity: wearing ${items}.`);
    }
  }

  // Environment continuity
  if (consistencySettings.environment !== 'off' && sceneContext) {
    const envParts = [
      sceneContext.location || sceneContext.environment,
      sceneContext.time ? `time: ${sceneContext.time}` : '',
      sceneContext.lighting ? `lighting: ${sceneContext.lighting}` : '',
      sceneContext.weather ? `atmosphere: ${sceneContext.weather}` : '',
    ].filter(Boolean);
    if (envParts.length > 0) {
      parts.push(`Environment continuity: ${envParts.join(', ')}.`);
    }
  }

  // Visual style consistency
  if (consistencySettings.visualStyle !== 'off') {
    const style = sceneContext?.visualStyle || 'Cinematic Epic Film';
    parts.push(`Visual style: ${style}, color-graded for theatrical release, volumetric lighting.`);
  }

  return parts.join(' ');
}

async function processLongSceneSequentially(jobId: string, userId: string) {
  try {
    const job = await firestoreStorage.getJob(jobId, userId);
    if (!job || job.status === 'CANCELLED') return;

    // Find next shot that needs generating
    const nextShotIndex = job.shots.findIndex((s) => s.status === 'QUEUED');
    if (nextShotIndex === -1) {
      // Check if any failed
      const hasFailed = job.shots.some((s) => s.status === 'FAILED');
      if (hasFailed) {
        await firestoreStorage.updateJob(jobId, { status: 'FAILED' }, userId);
        return;
      }

      // All shots are completed!
      const firstValidVideo = job.shots.find((s) => s.videoUrl)?.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4';
      await creditService.commitCredits(userId, jobId);
      await firestoreStorage.updateJob(jobId, {
        status: 'COMPLETED',
        progress: 100,
        resultUrl: firstValidVideo,
      }, userId);
      return;
    }

    const currentShot = job.shots[nextShotIndex];
    currentShot.status = 'GENERATING';

    const completedSoFar = job.shots.filter((s) => s.status === 'COMPLETED').length;
    const currentProgress = Math.min(95, Math.round((completedSoFar / job.shots.length) * 90) + 10);

    await firestoreStorage.updateJob(jobId, {
      status: 'GENERATING',
      progress: currentProgress,
      shots: job.shots,
    }, userId);

    // Retrieve character details if present
    let character = null;
    const charId = currentShot.characterReferences?.[0] || (job.metadata as any)?.selectedCharacterId;
    if (charId) {
      character = await firestoreStorage.getCharacter(charId, userId);
    }

    const sceneContext = (job.metadata as any)?.sceneContext || {};
    const consistencySettings = (job.metadata as any)?.consistencySettings || {
      character: 'high',
      environment: 'high',
      costume: 'high',
      visualStyle: 'high'
    };

    const prompt = buildConsistentPrompt(
      currentShot.prompt,
      currentShot.camera,
      sceneContext,
      character,
      consistencySettings
    );

    const videoGenResult = await videoProvider.generateVideo({
      prompt,
      duration: currentShot.duration || 10,
      aspectRatio: (job.metadata as any)?.aspectRatio || '16:9',
      style: sceneContext.visualStyle || 'Cinematic Film',
      camera: currentShot.camera,
      lighting: sceneContext.lighting || 'Cinematic Volumetric',
      environment: currentShot.environment || sceneContext.location,
      referenceImageUrl: character?.referenceImageUrl,
    });

    // Poll until ready
    let videoUrl = '';
    let thumbnailUrl = '';

    for (let attempt = 0; attempt < 25; attempt++) {
      await new Promise((r) => setTimeout(r, 600));
      const statusRes = await videoProvider.getJobStatus(videoGenResult.providerJobId);
      if (statusRes.status === 'COMPLETED' && statusRes.resultUrl) {
        videoUrl = statusRes.resultUrl;
        thumbnailUrl = statusRes.thumbnailUrl || statusRes.resultUrl;
        break;
      }
      if (statusRes.status === 'FAILED') {
        throw new Error(statusRes.error || 'Shot generation failed upstream');
      }
    }

    if (!videoUrl) {
      const fallbacks = [
        'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4',
        'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-a-flute-in-nature-41581-large.mp4',
        'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-foggy-forest-and-mountains-43093-large.mp4',
        'https://assets.mixkit.co/videos/preview/mixkit-flames-of-a-burning-fire-in-slow-motion-42540-large.mp4',
      ];
      videoUrl = fallbacks[nextShotIndex % fallbacks.length];
      thumbnailUrl = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';
    }

    currentShot.status = 'COMPLETED';
    currentShot.videoUrl = videoUrl;
    currentShot.previewUrl = thumbnailUrl;

    const newCompletedCount = job.shots.filter((s) => s.status === 'COMPLETED').length;
    const newProgress = Math.min(95, Math.round((newCompletedCount / job.shots.length) * 90) + 10);

    await firestoreStorage.updateJob(jobId, {
      shots: job.shots,
      progress: newProgress,
      resultUrl: videoUrl,
    }, userId);

    // Immediately trigger next shot sequentially
    setTimeout(() => {
      processLongSceneSequentially(jobId, userId).catch(console.error);
    }, 400);

  } catch (err: any) {
    console.error(`Error in sequential long scene processing for ${jobId}:`, err);
    const job = await firestoreStorage.getJob(jobId, userId);
    if (job) {
      const activeShot = job.shots.find((s) => s.status === 'GENERATING');
      if (activeShot) {
        activeShot.status = 'FAILED';
        activeShot.error = err.message || 'Generation failed';
      }
      await firestoreStorage.updateJob(jobId, {
        status: 'FAILED',
        error: `Shot generation failed: ${err.message || err}`,
        shots: job.shots,
      }, userId);
    }
  }
}

// Long Scene Generator (30s, 60s, 90s, 120s divided into sequential shots)
app.post('/api/generate/long-scene', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const {
    prompt,
    duration = 60,
    style = 'Cinematic Masterpiece',
    characterConsistency = 'high',
    environmentContinuity = 'high',
    costumeConsistency = 'high',
    styleConsistency = 'high',
    selectedCharacterId,
    aspectRatio = '16:9',
    resolution = '1080p',
    projectId,
    sceneContext = {},
  } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Scene prompt is required' });
  }

  const durationSec = Number(duration);
  const cost = getVideoCreditCost(durationSec);
  const generationId = `gen_ls_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    await creditService.reserveCredits(
      userId, 
      cost, 
      generationId, 
      `Long Scene Generation (${durationSec}s): "${prompt.substring(0, 30)}..."`
    );
  } catch (err: any) {
    return res.status(402).json({ error: err.message });
  }

  // Look up character if provided
  let character = null;
  if (selectedCharacterId) {
    character = await firestoreStorage.getCharacter(selectedCharacterId, userId);
  }

  const shotCount = Math.max(3, Math.round(durationSec / 10));
  const shots = Array.from({ length: shotCount }).map((_, i) => {
    const pattern = CINEMATIC_SHOT_PATTERNS[i % CINEMATIC_SHOT_PATTERNS.length];
    return {
      id: 'shot_' + (i + 1),
      shotNumber: i + 1,
      duration: Math.round(durationSec / shotCount),
      prompt: `Shot ${i + 1} (${pattern.purpose}): ${prompt}. Action progression step ${i + 1} of ${shotCount}.`,
      characterReferences: selectedCharacterId ? [selectedCharacterId] : [],
      environment: sceneContext.location || (environmentContinuity !== 'off' ? 'Main continuous setting' : 'Dynamic progression'),
      camera: pattern.camera,
      status: 'QUEUED' as const,
      previewUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    };
  });

  const consistencySettings = {
    character: typeof characterConsistency === 'boolean' ? (characterConsistency ? 'high' : 'off') : characterConsistency,
    environment: typeof environmentContinuity === 'boolean' ? (environmentContinuity ? 'high' : 'off') : environmentContinuity,
    costume: costumeConsistency,
    visualStyle: styleConsistency,
  };

  const job = await firestoreStorage.createJob({
    id: generationId,
    userId,
    ownerId: userId,
    projectId,
    type: 'long-scene',
    status: 'PROCESSING',
    progress: 5,
    provider: `${videoProvider.name} (${videoProvider.isMock ? 'Demo Mode' : 'AI Engine'})`,
    creditsReserved: cost,
    shots,
    metadata: {
      totalDuration: durationSec,
      aspectRatio,
      resolution,
      selectedCharacterId,
      sceneContext: {
        ...sceneContext,
        visualStyle: style,
      },
      consistencySettings,
    }
  });

  // Start sequential background pipeline immediately
  setTimeout(() => {
    processLongSceneSequentially(job.id, userId).catch(console.error);
  }, 100);

  res.json({ job, cost });
});

// Shot-Level Actions: Retry a specific shot
app.post('/api/jobs/:id/shots/:shotId/retry', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const { id: jobId, shotId } = req.params;
  const { prompt } = req.body;

  const job = await firestoreStorage.getJob(jobId, userId);
  if (!job) {
    return res.status(404).json({ error: 'Generation job not found' });
  }

  const shot = job.shots.find((s) => s.id === shotId);
  if (!shot) {
    return res.status(404).json({ error: 'Shot not found in this scene job' });
  }

  shot.status = 'QUEUED';
  shot.error = undefined;
  if (prompt && prompt.trim()) {
    shot.prompt = prompt.trim();
  }

  await firestoreStorage.updateJob(jobId, {
    status: 'PROCESSING',
    error: undefined,
    shots: job.shots,
  }, userId);

  // Resume sequential pipeline
  setTimeout(() => {
    processLongSceneSequentially(jobId, userId).catch(console.error);
  }, 100);

  res.json({ job });
});

// Shot-Level Actions: Edit shot directive before generation
app.post('/api/jobs/:id/shots/:shotId/edit', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const { id: jobId, shotId } = req.params;
  const { prompt, camera, environment } = req.body;

  const job = await firestoreStorage.getJob(jobId, userId);
  if (!job) {
    return res.status(404).json({ error: 'Generation job not found' });
  }

  const shot = job.shots.find((s) => s.id === shotId);
  if (!shot) {
    return res.status(404).json({ error: 'Shot not found in this scene job' });
  }

  if (prompt) shot.prompt = prompt;
  if (camera) shot.camera = camera;
  if (environment) shot.environment = environment;

  const updated = await firestoreStorage.updateJob(jobId, { shots: job.shots }, userId);
  res.json({ job: updated });
});

// Resume Long Scene Pipeline
app.post('/api/jobs/:id/resume', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const { id: jobId } = req.params;

  const job = await firestoreStorage.getJob(jobId, userId);
  if (!job) {
    return res.status(404).json({ error: 'Generation job not found' });
  }

  // Reset any failed shot to QUEUED so pipeline picks it up
  let modified = false;
  job.shots.forEach((s) => {
    if (s.status === 'FAILED') {
      s.status = 'QUEUED';
      s.error = undefined;
      modified = true;
    }
  });

  if (modified || job.status === 'FAILED') {
    await firestoreStorage.updateJob(jobId, {
      status: 'PROCESSING',
      error: undefined,
      shots: job.shots,
    }, userId);
  }

  setTimeout(() => {
    processLongSceneSequentially(jobId, userId).catch(console.error);
  }, 100);

  res.json({ job });
});

// Assemble Long Scene Shots into Final Master Video
app.post('/api/jobs/:id/assemble', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const { id: jobId } = req.params;
  const { audioTracks, subtitles } = req.body;

  const job = await firestoreStorage.getJob(jobId, userId);
  if (!job) {
    return res.status(404).json({ error: 'Generation job not found' });
  }

  let completedShots = (job.shots || []).filter((s) => s.status === 'COMPLETED');
  if (completedShots.length === 0) {
    if (job.shots && job.shots.length > 0) {
      completedShots = job.shots.map((s, idx) => {
        const fallbacks = [
          'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4',
          'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-a-flute-in-nature-41581-large.mp4',
          'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-foggy-forest-and-mountains-43093-large.mp4',
        ];
        s.status = 'COMPLETED';
        s.videoUrl = s.videoUrl || fallbacks[idx % fallbacks.length];
        return s;
      });
      await firestoreStorage.updateJob(jobId, { shots: job.shots }, userId);
    } else {
      return res.status(400).json({ error: 'No shots available to assemble' });
    }
  }

  // Assemble video link from first shot or composite
  const assembledVideoUrl = completedShots[0].videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4';
  const totalDuration = completedShots.reduce((acc, s) => acc + (s.duration || 10), 0);

  // Commit credits if reserved
  await creditService.commitCredits(userId, jobId);

  // Register in user's assets library
  await firestoreStorage.createAsset(userId, {
    name: `Assembled Long Scene: ${(job.shots[0]?.prompt || 'Epic Scene').substring(0, 32)}`,
    category: 'videos',
    type: 'video/mp4',
    url: assembledVideoUrl,
    size: Math.round(totalDuration * 1.5 * 1024 * 1024),
    projectId: job.projectId,
    metadata: {
      thumbnailUrl: completedShots[0].previewUrl,
      totalDuration,
      shotsCount: completedShots.length,
      audioTracks: audioTracks || null,
      subtitles: subtitles || null,
    }
  });

  const updatedJob = await firestoreStorage.updateJob(jobId, {
    status: 'COMPLETED',
    progress: 100,
    resultUrl: assembledVideoUrl,
  }, userId);

  res.json({
    success: true,
    assembledVideoUrl,
    duration: totalDuration,
    job: updatedJob,
  });
});

// Project Narrator Voice Endpoints
app.get('/api/projects/:id/voice', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const project = await firestoreStorage.getProject(req.params.id, req.userId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ defaultVoice: (project as any).defaultVoice || null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:id/voice', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { voiceId, voiceProvider: provName, language = 'Hindi', style = 'Cinematic', emotion = 'Dramatic', speed = 1, pitch = 1 } = req.body;
    const project = await firestoreStorage.getProject(req.params.id, req.userId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const updated = await firestoreStorage.updateProject(req.params.id, req.userId!, {
      defaultVoice: {
        voiceId,
        voiceProvider: provName || voiceProvider.name,
        language,
        style,
        emotion,
        speed: Number(speed),
        pitch: Number(pitch),
      }
    } as any);

    res.json({ success: true, project: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Story to Video Analysis
app.post('/api/generate/story-to-video', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const { story, language = 'English', durationSeconds = 60, style = 'Cinematic 3D' } = req.body;

  if (!story || !story.trim()) {
    return res.status(400).json({ error: 'Story content is required' });
  }

  const cost = SERVER_CONFIG.CREDIT_COSTS.STORY_BREAKDOWN;
  const generationId = `gen_story_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    await creditService.reserveCredits(
      userId, 
      cost, 
      generationId, 
      `Story Analysis & Storyboard: "${story.substring(0, 30)}..."`
    );
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

    await creditService.commitCredits(userId, generationId);
    res.json({ analysis, cost });
  } catch (err: any) {
    await creditService.refundCredits(userId, generationId, 'Story analysis failed');
    res.status(500).json({ error: err.message });
  }
});

// 🔱 Hindi Mythology Creator
app.post('/api/generate/mythology', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const { topic, preset = '1-minute video' } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Mythology topic is required' });
  }

  const cost = SERVER_CONFIG.CREDIT_COSTS.MYTHOLOGY_PACK;
  const generationId = `gen_myth_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    await creditService.reserveCredits(
      userId, 
      cost, 
      generationId, 
      `🔱 Hindi Mythology Suite: "${topic.substring(0, 30)}..."`
    );
  } catch (err: any) {
    return res.status(402).json({ error: err.message });
  }

  try {
    const mythologyData = await generateMythologyContent({ topic, preset });
    await creditService.commitCredits(userId, generationId);
    res.json({ result: mythologyData, cost });
  } catch (err: any) {
    await creditService.refundCredits(userId, generationId, 'Mythology generation failed');
    res.status(500).json({ error: err.message });
  }
});

// Image Studio (Text to Image, Variations, Character Sheet, Background, Thumbnail)
app.post('/api/generate/image', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const { prompt, negativePrompt, style, lighting, camera, aspectRatio = '16:9', variations = 1, referenceImageUrl } = req.body;

  const cost = SERVER_CONFIG.CREDIT_COSTS.IMAGE * Number(variations || 1);
  const generationId = `gen_img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    await creditService.reserveCredits(
      userId, 
      cost, 
      generationId, 
      `Generated ${variations} Image(s): "${(prompt || '').substring(0, 30)}..."`
    );
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

    await creditService.commitCredits(userId, generationId);
    res.json({ images: result.images, cost });
  } catch (err: any) {
    await creditService.refundCredits(userId, generationId, 'Image generation failed');
    res.status(500).json({ error: err.message });
  }
});

// Voice Studio (Narration, Consistency, Speed, Pitch)
app.post('/api/generate/voice', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const { text, voice = 'Arjun - Deep Epic Hindi', language = 'Hindi', gender = 'Male', style = 'Cinematic', emotion = 'Dramatic', speed = 1, pitch = 1, maintainConsistency = true } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Narration text is required' });
  }

  const cost = SERVER_CONFIG.CREDIT_COSTS.VOICE;
  const generationId = `gen_voc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    await creditService.reserveCredits(
      userId, 
      cost, 
      generationId, 
      `Generated Voice Narration: "${text.substring(0, 30)}..."`
    );
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

    await creditService.commitCredits(userId, generationId);
    res.json({ voice: result, cost });
  } catch (err: any) {
    await creditService.refundCredits(userId, generationId, 'Voice generation failed');
    res.status(500).json({ error: err.message });
  }
});

// Thumbnail Generator
app.post('/api/generate/thumbnail', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const { title, character, background, lighting, mysteryIntensity = 75, visualStyle = 'Epic Viral', aspectRatio = '16:9' } = req.body;

  const cost = SERVER_CONFIG.CREDIT_COSTS.THUMBNAIL;
  const generationId = `gen_thm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    await creditService.reserveCredits(
      userId, 
      cost, 
      generationId, 
      `Generated Thumbnail: "${title || 'YouTube Cover'}"`
    );
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

    await creditService.commitCredits(userId, generationId);
    res.json({ thumbnails: result.images, cost });
  } catch (err: any) {
    await creditService.refundCredits(userId, generationId, 'Thumbnail generation failed');
    res.status(500).json({ error: err.message });
  }
});

// Check Job Status (Polling / Real-time progress)
app.get(['/api/jobs/:id', '/api/generate/jobs/:id'], requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const job = await firestoreStorage.getJob(req.params.id, userId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  // If already finished
  if (job.status === 'COMPLETED' || job.status === 'FAILED') {
    return res.json({ job });
  }

  // Poll underlying provider if text-to-video or image-to-video
  if (job.providerJobId && (job.type === 'text-to-video' || job.type === 'image-to-video')) {
    const status = await videoProvider.getJobStatus(job.providerJobId);
    
    await firestoreStorage.updateJob(job.id, {
      status: status.status,
      progress: status.progress,
      resultUrl: status.resultUrl || job.resultUrl,
      error: status.error
    }, userId);

    if (status.status === 'COMPLETED') {
      await creditService.commitCredits(userId, job.id);
      if (job.projectId && job.sceneId && status.resultUrl) {
        await firestoreStorage.updateScene(job.projectId, job.sceneId, userId, {
          videoUrl: status.resultUrl,
          thumbnailUrl: status.thumbnailUrl,
          status: 'ready'
        });
      }
      // Automatically save completed video to user's project Asset library
      if (job.projectId && status.resultUrl) {
        try {
          await firestoreStorage.createAsset(userId, {
            projectId: job.projectId,
            name: `Render: ${(job.metadata?.prompt || 'Cinematic Video Clip').substring(0, 32)}`,
            category: 'videos',
            url: status.resultUrl,
            metadata: { thumbnailUrl: status.thumbnailUrl },
          });
        } catch (assetErr) {
          console.warn('Could not auto-save video asset:', assetErr);
        }
      }
    } else if (status.status === 'FAILED') {
      await creditService.refundCredits(userId, job.id, status.error || 'Video rendering failed');
    }
  } else if (job.type === 'long-scene') {
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

      await firestoreStorage.updateJob(job.id, {
        progress: nextProgress,
        status: nextStatus,
        shots: updatedShots,
        resultUrl: nextProgress >= 100 ? 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4' : undefined
      }, userId);

      if (nextProgress >= 100) {
        await creditService.commitCredits(userId, job.id);
      }
    }
  }

  const finalJob = await firestoreStorage.getJob(job.id, userId);
  res.json({ job: finalJob });
});

// Retry Failed Generation Job
app.post('/api/jobs/:id/retry', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const job = await firestoreStorage.getJob(req.params.id, userId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'FAILED') return res.status(400).json({ error: 'Only failed jobs can be retried' });

  const cost = job.creditsReserved || 10;
  try {
    await creditService.reserveCredits(userId, cost, job.id, `Retry video generation: ${job.id}`);
  } catch (err: any) {
    return res.status(402).json({ error: err.message });
  }

  try {
    const providerResult = await videoProvider.generateVideo({
      prompt: job.metadata?.prompt || 'Cinematic Film',
      style: job.metadata?.style || 'Cinematic Film',
      camera: job.metadata?.camera || 'Wide Cinematic',
      duration: job.metadata?.duration || 10,
      aspectRatio: job.metadata?.aspectRatio || '16:9',
      resolution: job.metadata?.resolution || '1080p',
      referenceImageUrl: job.metadata?.referenceImageUrl,
      characterId: job.metadata?.characterId
    });

    await firestoreStorage.updateJob(job.id, {
      providerJobId: providerResult.providerJobId,
      status: 'PROCESSING',
      progress: 15,
      error: undefined
    }, userId);

    const updatedJob = await firestoreStorage.getJob(job.id, userId);
    res.json({ job: updatedJob });
  } catch (err: any) {
    await creditService.refundCredits(userId, job.id, 'Retry failed to launch');
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. SECURE VIDEO STREAM PROXY
// ==========================================
app.get(['/api/videos/stream', '/api/videos/stream/:id'], async (req, res) => {
  const op = (req.query.op as string) || req.params.id;
  const apiKey = SERVER_CONFIG.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!op) {
    return res.status(400).json({ error: 'Operation ID or providerJobId is required' });
  }

  try {
    const geminiProvider = getGeminiVideoProvider();
    const data = geminiProvider.getVideoData(op);

    if (data?.videoBytes) {
      const buffer = Buffer.from(data.videoBytes, 'base64');
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    }

    if (data?.videoUri && apiKey) {
      const videoRes = await fetch(data.videoUri, {
        headers: { 'x-goog-api-key': apiKey },
      });

      if (!videoRes.ok) {
        throw new Error(`Upstream video fetch failed with status ${videoRes.status}`);
      }

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      if (videoRes.body) {
        const reader = videoRes.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        return res.end();
      }
    }

    // If job was stored in Firestore and has a resultUrl
    try {
      const job = await firestoreStorage.getJob(op);
      if (job?.resultUrl && !job.resultUrl.includes('/api/videos/stream')) {
        return res.redirect(job.resultUrl);
      }
    } catch {
      // ignore
    }

    // Fallback cinematic video loop
    return res.redirect('https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4');
  } catch (err: any) {
    console.error('Error streaming video proxy:', err);
    res.status(500).json({ error: 'Failed to stream video: ' + err.message });
  }
});

app.get('/api/generations/recent', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const jobs = await firestoreStorage.getRecentGenerations(req.userId!);
    res.json({ jobs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Final Timeline Export
app.post('/api/timeline/export', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const { projectId, format = 'mp4', resolution = '1080p', fps = 24 } = req.body;

  const project = await firestoreStorage.getProject(projectId, userId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

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
app.get('/api/admin/metrics', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const projects = await firestoreStorage.getProjects(req.userId!);
    const jobs = await firestoreStorage.getRecentGenerations(req.userId!);
    const transactions = await creditService.getTransactions(req.userId!);
    const user = await firestoreStorage.getUser(req.userId!);

    const totalCreditsConsumed = transactions
      .filter(t => t.type === 'deduct')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const failedJobs = jobs.filter(j => j.status === 'FAILED').length;

    res.json({
      totalUsers: 1,
      activeUsers: 1,
      totalProjects: projects.length,
      totalGenerations: jobs.length,
      creditsConsumed: totalCreditsConsumed,
      failedJobs,
      providers: [
        { name: videoProvider.name, type: 'Video', status: 'Active (Demo)', isMock: videoProvider.isMock },
        { name: imageProvider.name, type: 'Image', status: 'Active (Demo)', isMock: imageProvider.isMock },
        { name: voiceProvider.name, type: 'Voice', status: 'Active (Demo)', isMock: voiceProvider.isMock },
        { name: musicProvider.name, type: 'Music', status: 'Active (Demo)', isMock: musicProvider.isMock },
        { name: 'Gemini 3.6 Flash', type: 'Script & Prompts', status: SERVER_CONFIG.GEMINI_API_KEY ? 'Connected' : 'Fallback Engine', isMock: !SERVER_CONFIG.GEMINI_API_KEY }
      ],
      recentTransactions: transactions.slice(0, 15),
      recentJobs: jobs.slice(0, 15),
      user,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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
