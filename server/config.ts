import dotenv from 'dotenv';
dotenv.config();

export const SERVER_CONFIG = {
  PORT: 3000,
  HOST: '0.0.0.0',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  DEFAULT_FREE_CREDITS: 100,
  CREDIT_COSTS: {
    IMAGE: 1,
    THUMBNAIL: 2,
    VOICE: 2,
    VIDEO_10_SEC: 10,
    VIDEO_20_SEC: 20,
    VIDEO_30_SEC: 30,
    VIDEO_60_SEC: 60,
    VIDEO_120_SEC: 120,
    VIDEO_10S: 10,
    VIDEO_20S: 20,
    VIDEO_30S: 30,
    VIDEO_60S: 60,
    VIDEO_90S: 90,
    VIDEO_120S: 120,
    MYTHOLOGY_PACK: 25,
    STORY_BREAKDOWN: 15,
  },
  PROVIDERS: {
    // Current active providers: 'gemini-veo' (Google Veo Video AI) or 'mock-cinematic'
    video: process.env.VIDEO_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini-veo' : 'mock-cinematic'),
    image: 'mock-cinematic',
    voice: 'mock-voice',
    music: 'mock-music',
    scriptAi: process.env.GEMINI_API_KEY ? 'gemini-3.6-flash' : 'smart-template-engine',
  }
};
