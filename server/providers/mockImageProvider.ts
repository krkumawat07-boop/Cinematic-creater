import { ImageProvider, ImageGenerationParams } from './types.js';

const CINEMATIC_IMAGES = [
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80'
];

export class MockImageProvider implements ImageProvider {
  name = 'Mock Cinematic Image Engine (Demo)';
  isMock = true;

  async generateImage(params: ImageGenerationParams): Promise<{ images: string[] }> {
    const count = params.variations || 1;
    const results: string[] = [];

    // Select images pseudo-randomly based on prompt length or seed
    const offset = Math.abs(params.prompt.length) % CINEMATIC_IMAGES.length;

    for (let i = 0; i < count; i++) {
      const idx = (offset + i) % CINEMATIC_IMAGES.length;
      results.push(CINEMATIC_IMAGES[idx]);
    }

    return { images: results };
  }
}
