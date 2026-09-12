export type AspectRatio = '16:9' | '9:16' | '1:1' | '2.39:1';
export type Resolution = '720p' | '1080p' | '4k';
export type PlanType = 'free' | 'pro' | 'creator';
export type RoleType = 'user' | 'admin';
export type ConsistencyLevel = 'off' | 'low' | 'medium' | 'high';

export interface ProjectVoiceSettings {
  voiceId: string;
  voiceProvider: string;
  language: string;
  style: string;
  emotion: string;
  speed: number;
  pitch: number;
}

export interface UserProfile {
  id: string;
  uid?: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  photoURL?: string;
  plan: PlanType;
  credits: number;
  role: RoleType;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  ownerId?: string;
  title: string;
  name?: string;
  description: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  fps: number;
  duration: number; // total in seconds
  thumbnailUrl?: string;
  scenesCount: number;
  defaultVoice?: ProjectVoiceSettings;
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  projectId: string;
  userId: string;
  ownerId?: string;
  sceneNumber: number;
  title: string;
  prompt?: string;
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
  updatedAt?: string;
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
  videoUrl?: string;
  videoAssetId?: string;
  error?: string;
}

export interface SceneContext {
  characters?: string[];
  environment?: string;
  location?: string;
  time?: string;
  lighting?: string;
  weather?: string;
  costumes?: string;
  visualStyle?: string;
  cameraStyle?: string;
  consistencySettings?: {
    character: ConsistencyLevel;
    environment: ConsistencyLevel;
    costume: ConsistencyLevel;
    visualStyle: ConsistencyLevel;
  };
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
  ownerId?: string;
  name: string;
  appearance: string;
  age: string;
  hair: string;
  clothing: string;
  accessories: string;
  visualStyle: string;
  description: string;
  referenceImageUrl?: string;
  referenceImages?: string[];
  consistencyStrength: number; // 0 to 100
  consistencySettings?: any;
  referenceViews: CharacterReferenceViews;
  createdAt: string;
  updatedAt?: string;
}

export interface Asset {
  id: string;
  userId: string;
  ownerId?: string;
  projectId?: string;
  name: string;
  category: 'characters' | 'images' | 'videos' | 'audio' | 'music' | 'sfx' | 'voice' | 'thumbnails' | 'video' | 'image' | 'character-ref';
  type?: string;
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
  ownerId?: string;
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
  ownerId?: string;
  projectId?: string;
  sceneId?: string;
  type: JobType;
  status: JobStatus;
  progress: number; // 0 to 100
  provider: string;
  providerJobId: string;
  creditsReserved?: number;
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

export interface MythologyScene {
  sceneNumber: number;
  title: string;
  duration: number;
  visualPrompt: string;
  hindiNarration: string;
  hindiVoiceover?: string;
  camera: string;
  cameraAngle?: string;
  lighting: string;
  musicSuggestion: string;
  sfxSuggestion: string;
  videoUrl?: string;
  thumbnailUrl?: string;
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
  sceneStructure: MythologyScene[];
  scenes?: MythologyScene[];
  musicSuggestions: string[];
  musicSuggestion?: string;
  sfxSuggestions: string[];
  soundEffects?: string;
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
