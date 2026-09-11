import dotenv from 'dotenv';
dotenv.config();

export const SERVER_CONFIG = {
  PORT: 3000,
  HOST: '0.0.0.0',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  DEFAULT_FREE_CREDITS: 100,
  CREDIT_COSTS: {
    IMAGE: 0,
    THUMBNAIL: 0,
    VOICE: 2,
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
    // Current active providers (Mock by default, replaceable with real API providers)
    video: 'mock-cinematic',
    image: 'mock-cinematic',
    voice: 'mock-voice',
    music: 'mock-music',
    scriptAi: process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : 'smart-template-engine',
  }
};
