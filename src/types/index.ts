export type AspectRatio = '16:9' | '9:16' | '1:1' | '2.39:1';
export type Resolution = '720p' | '1080p' | '4k';
export type PlanType = 'free' | 'pro' | 'creator';
export type RoleType = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  plan: PlanType;
  credits: number;
  role: RoleType;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  fps: number;
  duration: number; // total in seconds
  thumbnailUrl?: string;
  scenesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  projectId: string;
  userId: string;
  sceneNumber: number;
  title: string;
  duration: number; // in seconds (e.g. 5, 10)
  visualPrompt: string;
  voiceOver?: string;
  voiceOverText?: string;
  characters: string[];
  location?: string;
  camera?: string;
  lighting?: string;
  status: 'draft' | 'generating' | 'ready' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt?: string;
}

export interface Shot {
  id: string;
  shotNumber: number;
  duration: number;
  prompt: string;
  characterReferences: string[];
  environment: string;
  camera: string;
  status: 'QUEUED' | 'PROCESSING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  previewUrl?: string;
}

export interface CharacterReferenceViews {
  front?: string;
  back?: string;
  left?: string;
  right?: string;
  threeQuarter?: string;
  fullBody?: string;
  faceCloseUp?: string;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  appearance: string;
  age: string;
  hair: string;
  clothing: string;
  accessories: string;
  visualStyle: string;
  description: string;
  referenceImageUrl?: string;
  consistencyStrength: number; // 0 to 100
  referenceViews: CharacterReferenceViews;
  createdAt: string;
}

export interface Asset {
  id: string;
  userId: string;
  projectId?: string;
  name: string;
  category: 'characters' | 'images' | 'videos' | 'audio' | 'music' | 'sfx' | 'voice' | 'thumbnails' | 'video' | 'image' | 'character-ref';
  url: string;
  size?: number; // in bytes
  fileType?: string;
  metadata?: any;
  duration?: number;
  createdAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // negative for deduction, positive for grant
  type: 'deduct' | 'grant' | 'refund' | 'bonus';
  description: string;
  generationId?: string;
  createdAt: string;
}

export type JobType = 
  | 'text-to-video' 
  | 'image-to-video' 
  | 'long-scene' 
  | 'story-to-video' 
  | 'voice' 
  | 'image' 
  | 'thumbnail' 
  | 'mythology';

export type JobStatus = 
  | 'QUEUED' 
  | 'PROCESSING' 
  | 'GENERATING' 
  | 'ASSEMBLING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED';

export interface GenerationJob {
  id: string;
  userId: string;
  projectId?: string;
  sceneId?: string;
  type: JobType;
  status: JobStatus;
  progress: number; // 0 to 100
  provider: string;
  providerJobId: string;
  resultUrl?: string;
  resultData?: any;
  shots?: Shot[];
  error?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export type TimelineTrackType = 'VIDEO' | 'VOICE' | 'MUSIC' | 'SFX' | 'SUBTITLES';

export interface TimelineClip {
  id: string;
  trackId: TimelineTrackType;
  title: string;
  startTime: number; // in seconds
  duration: number; // in seconds
  mediaUrl?: string;
  volume: number; // 0 to 100
  muted: boolean;
  fadeIn?: number;
  fadeOut?: number;
  prompt?: string;
  color?: string;
}

export interface MythologyGenerationResult {
  title: string;
  story: string;
  characters: {
    name: string;
    role: string;
    appearance: string;
    visualPrompt: string;
    referenceUrl?: string;
  }[];
  characterSheets: {
    characterName: string;
    traits: string;
    promptSheet: string;
  }[];
  cinematicPrompts: string[];
  hindiVoiceover: string;
  sceneStructure: {
    sceneNumber: number;
    title: string;
    duration: number;
    visualPrompt: string;
    hindiNarration: string;
    camera: string;
    lighting: string;
    musicSuggestion: string;
    sfxSuggestion: string;
    videoUrl?: string;
  }[];
  musicSuggestions: string[];
  sfxSuggestions: string[];
  thumbnailPrompt: string;
  thumbnailUrl?: string;
}

export interface StoryAnalysisResult {
  title: string;
  storyStructure: {
    act1: string;
    act2: string;
    act3: string;
  };
  characters: {
    name: string;
    description: string;
    appearance: string;
  }[];
  locations: string[];
  scenes: {
    sceneNumber: number;
    title: string;
    duration: number;
    visualPrompt: string;
    voiceOver: string;
    characters: string[];
    location: string;
    camera: string;
    lighting: string;
    videoUrl?: string;
  }[];
}
