export interface VideoGenerationParams {
  prompt: string;
  negativePrompt?: string;
  style: string;
  camera: string;
  cameraMovement?: string;
  lighting?: string;
  environment?: string;
  weather?: string;
  timeOfDay?: string;
  characterId?: string;
  referenceImageUrl?: string;
  duration: number; // in seconds: 10, 20, 30, 60, 120
  aspectRatio: '16:9' | '9:16' | '1:1';
  resolution?: '720p' | '1080p' | '4k';
}

export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  style: string;
  lighting?: string;
  camera?: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  variations?: number;
  referenceImageUrl?: string;
}

export interface VoiceGenerationParams {
  text: string;
  voice: string;
  language: string;
  gender: string;
  style: string;
  emotion: string;
  speed: number;
  pitch: number;
  maintainConsistency: boolean;
}

export interface MusicGenerationParams {
  genre: string;
  mood: string;
  duration: number;
  tempo: string;
}

export interface VideoProvider {
  name: string;
  isMock: boolean;
  generateVideo(params: VideoGenerationParams): Promise<{
    providerJobId: string;
    estimatedSeconds: number;
    initialStatus: 'QUEUED' | 'PROCESSING';
  }>;
  getJobStatus(providerJobId: string): Promise<{
    status: 'QUEUED' | 'PROCESSING' | 'GENERATING' | 'ASSEMBLING' | 'COMPLETED' | 'FAILED';
    progress: number;
    resultUrl?: string;
    thumbnailUrl?: string;
    error?: string;
  }>;
}

export interface ImageProvider {
  name: string;
  isMock: boolean;
  generateImage(params: ImageGenerationParams): Promise<{
    images: string[];
  }>;
}

export interface VoiceProvider {
  name: string;
  isMock: boolean;
  generateVoice(params: VoiceGenerationParams): Promise<{
    audioUrl: string;
    duration: number;
  }>;
}

export interface MusicProvider {
  name: string;
  isMock: boolean;
  generateMusic(params: MusicGenerationParams): Promise<{
    audioUrl: string;
    duration: number;
  }>;
}
