import { SERVER_CONFIG } from '../config.js';
import { VideoProvider, VoiceProvider } from './types.js';
import { MockVideoProvider } from './mockVideoProvider.js';
import { GeminiVideoProvider } from './geminiVideoProvider.js';
import { MockVoiceProvider } from './mockVoiceProvider.js';
import { GeminiVoiceProvider } from './geminiVoiceProvider.js';

let activeVideoProvider: VideoProvider;
const geminiVideoProvider = new GeminiVideoProvider();
const mockVideoProvider = new MockVideoProvider();

let activeVoiceProvider: VoiceProvider;
const geminiVoiceProvider = new GeminiVoiceProvider();
const mockVoiceProvider = new MockVoiceProvider();

export function getVideoProvider(): VideoProvider {
  if (!activeVideoProvider) {
    const selected = SERVER_CONFIG.PROVIDERS.video;
    if (selected === 'gemini-veo' && SERVER_CONFIG.GEMINI_API_KEY) {
      activeVideoProvider = geminiVideoProvider;
      console.log('⚡ Active Video Provider: Google Veo AI Video Provider (veo-3.1)');
    } else {
      activeVideoProvider = mockVideoProvider;
      console.log('🎬 Active Video Provider: Mock Cinematic Video Engine (Demo)');
    }
  }
  return activeVideoProvider;
}

export function getVoiceProvider(): VoiceProvider {
  if (!activeVoiceProvider) {
    if (SERVER_CONFIG.GEMINI_API_KEY) {
      activeVoiceProvider = geminiVoiceProvider;
      console.log('🎙️ Active Voice Provider: Google Gemini Neural Speech (Hindi & Multilingual)');
    } else {
      activeVoiceProvider = mockVoiceProvider;
      console.log('🎙️ Active Voice Provider: Mock Cinematic Voice Synthesizer (Demo)');
    }
  }
  return activeVoiceProvider;
}

export function getGeminiVideoProvider(): GeminiVideoProvider {
  return geminiVideoProvider;
}

export function getMockVideoProvider(): MockVideoProvider {
  return mockVideoProvider;
}

export function getGeminiVoiceProvider(): GeminiVoiceProvider {
  return geminiVoiceProvider;
}

export function getMockVoiceProvider(): MockVoiceProvider {
  return mockVoiceProvider;
}
