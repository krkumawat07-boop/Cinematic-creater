import { VoiceProvider, VoiceGenerationParams, MusicProvider, MusicGenerationParams } from './types.js';

const SAMPLE_VOICE_TRACKS = [
  'https://actions.google.com/sounds/v1/human_voices/male_heavy_sigh.ogg',
  'https://actions.google.com/sounds/v1/human_voices/applause.ogg',
  'https://actions.google.com/sounds/v1/ambiences/wind_blowing_desert.ogg',
  'https://actions.google.com/sounds/v1/science_fiction/teleport_whoosh.ogg'
];

export class MockVoiceProvider implements VoiceProvider {
  name = 'Mock Cinematic Neural TTS (Demo)';
  isMock = true;

  async generateVoice(params: VoiceGenerationParams): Promise<{ audioUrl: string; duration: number }> {
    // Estimate ~150 words per minute
    const words = params.text.trim().split(/\s+/).length;
    const duration = Math.max(3, Math.round((words / 150) * 60));
    
    // Select sample audio
    const audioUrl = SAMPLE_VOICE_TRACKS[0];

    return {
      audioUrl,
      duration,
    };
  }
}

export class MockMusicProvider implements MusicProvider {
  name = 'Mock Cinematic Score Composer (Demo)';
  isMock = true;

  async generateMusic(params: MusicGenerationParams): Promise<{ audioUrl: string; duration: number }> {
    return {
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/cinematic_orchestral_drone.ogg',
      duration: params.duration || 30,
    };
  }
}
