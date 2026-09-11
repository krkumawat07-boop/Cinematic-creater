import { VideoProvider, VideoGenerationParams } from './types.js';

interface SimulatedJob {
  id: string;
  params: VideoGenerationParams;
  createdAt: number;
  status: 'QUEUED' | 'PROCESSING' | 'GENERATING' | 'ASSEMBLING' | 'COMPLETED' | 'FAILED';
  progress: number;
  resultUrl?: string;
  thumbnailUrl?: string;
}

// Curated cinematic royalty-free test video loops that render beautifully in any browser
const SAMPLE_CINEMATIC_VIDEOS = [
  {
    url: 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-deep-space-32008-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    tags: ['space', 'sci-fi', 'stars', 'galaxy']
  },
  {
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-a-flute-in-nature-41581-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1609605988071-b619d16854d1?w=800&auto=format&fit=crop&q=80',
    tags: ['mythology', 'flute', 'divine', 'krishna', 'nature']
  },
  {
    url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-foggy-forest-and-mountains-43093-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    tags: ['aerial', 'mountains', 'cinematic', 'landscape', 'epic']
  },
  {
    url: 'https://assets.mixkit.co/videos/preview/mixkit-flames-of-a-burning-fire-in-slow-motion-42540-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800&auto=format&fit=crop&q=80',
    tags: ['fire', 'battle', 'war', 'lanka', 'shiva', 'energy']
  },
  {
    url: 'https://assets.mixkit.co/videos/preview/mixkit-silhouette-of-a-man-standing-in-front-of-a-giant-moon-42354-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    tags: ['silhouette', 'dramatic', 'moon', 'epic', 'character']
  },
  {
    url: 'https://assets.mixkit.co/videos/preview/mixkit-neon-tunnel-with-glowing-lines-41566-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    tags: ['cyberpunk', 'futuristic', 'neon', 'techno']
  }
];

const jobs = new Map<string, SimulatedJob>();

export class MockVideoProvider implements VideoProvider {
  name = 'Mock Cinematic Video Engine (Demo)';
  isMock = true;

  async generateVideo(params: VideoGenerationParams): Promise<{
    providerJobId: string;
    estimatedSeconds: number;
    initialStatus: 'QUEUED' | 'PROCESSING';
  }> {
    const providerJobId = 'mock_vid_' + Math.random().toString(36).substring(2, 9);
    
    // Pick the most relevant sample video based on prompt keywords
    const lower = (params.prompt + ' ' + (params.style || '')).toLowerCase();
    let selected = SAMPLE_CINEMATIC_VIDEOS[0];
    for (const item of SAMPLE_CINEMATIC_VIDEOS) {
      if (item.tags.some(tag => lower.includes(tag))) {
        selected = item;
        break;
      }
    }

    const job: SimulatedJob = {
      id: providerJobId,
      params,
      createdAt: Date.now(),
      status: 'QUEUED',
      progress: 0,
      resultUrl: selected.url,
      thumbnailUrl: selected.thumbnail,
    };

    jobs.set(providerJobId, job);

    return {
      providerJobId,
      estimatedSeconds: 5,
      initialStatus: 'QUEUED',
    };
  }

  async getJobStatus(providerJobId: string): Promise<{
    status: 'QUEUED' | 'PROCESSING' | 'GENERATING' | 'ASSEMBLING' | 'COMPLETED' | 'FAILED';
    progress: number;
    resultUrl?: string;
    thumbnailUrl?: string;
    error?: string;
  }> {
    const job = jobs.get(providerJobId);
    if (!job) {
      return {
        status: 'FAILED',
        progress: 0,
        error: 'Job not found in Mock Provider memory',
      };
    }

    const elapsedMs = Date.now() - job.createdAt;
    
    // Smooth progression through the requested milestones:
    // 0% (Queued) -> 25% (Processing) -> 50% (Generating) -> 75% (Assembling) -> 100% (Completed)
    if (elapsedMs < 1000) {
      job.status = 'QUEUED';
      job.progress = 5;
    } else if (elapsedMs < 2200) {
      job.status = 'PROCESSING';
      job.progress = 25;
    } else if (elapsedMs < 3600) {
      job.status = 'GENERATING';
      job.progress = 50;
    } else if (elapsedMs < 5000) {
      job.status = 'ASSEMBLING';
      job.progress = 75;
    } else {
      job.status = 'COMPLETED';
      job.progress = 100;
    }

    return {
      status: job.status,
      progress: job.progress,
      resultUrl: job.status === 'COMPLETED' ? job.resultUrl : undefined,
      thumbnailUrl: job.thumbnailUrl,
    };
  }
}
