export const CREDIT_COSTS = {
  IMAGE: 1,
  THUMBNAIL: 2,
  VOICE: 2,
  VIDEO_10_SEC: 10,
  VIDEO_20_SEC: 20,
  VIDEO_30_SEC: 30,
  VIDEO_60_SEC: 60,
  VIDEO_120_SEC: 120,
  // Backwards-compatible aliases
  VIDEO_10S: 10,
  VIDEO_20S: 20,
  VIDEO_30S: 30,
  VIDEO_60S: 60,
  VIDEO_90S: 90,
  VIDEO_120S: 120,
  MYTHOLOGY_PACK: 25,
  STORY_BREAKDOWN: 15,
} as const;

export function getVideoCreditCost(durationInSeconds: number): number {
  if (durationInSeconds <= 10) return CREDIT_COSTS.VIDEO_10_SEC;
  if (durationInSeconds <= 20) return CREDIT_COSTS.VIDEO_20_SEC;
  if (durationInSeconds <= 30) return CREDIT_COSTS.VIDEO_30_SEC;
  if (durationInSeconds <= 60) return CREDIT_COSTS.VIDEO_60_SEC;
  return CREDIT_COSTS.VIDEO_120_SEC;
}

export interface PlanDetails {
  id: 'free' | 'pro' | 'creator';
  name: string;
  monthlyCredits: number;
  price: string;
  badge?: string;
  features: string[];
  limits: {
    maxDuration: number;
    maxResolution: string;
    storageGb: number;
    priorityQueue: boolean;
    watermark: boolean;
    longScene: boolean;
  };
}

export const PLANS: Record<'free' | 'pro' | 'creator', PlanDetails> = {
  free: {
    id: 'free',
    name: 'Free Starter',
    monthlyCredits: 100,
    price: '$0 / mo',
    features: [
      '100 monthly generation credits',
      'Basic generation pipeline (720p/1080p)',
      'Standard Text to Video & Image Studio',
      'Up to 30-second video clips',
      '5 GB cloud asset storage',
      'Standard community queue'
    ],
    limits: {
      maxDuration: 30,
      maxResolution: '1080p',
      storageGb: 5,
      priorityQueue: false,
      watermark: true,
      longScene: false,
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro Filmmaker',
    monthlyCredits: 1000,
    price: '$29 / mo',
    badge: 'Popular',
    features: [
      '1,000 monthly generation credits',
      'Full Long Scene Generator (up to 120s)',
      'Character Consistency Engine',
      'High-resolution (1080p & 4K ready)',
      '50 GB cloud asset storage',
      'Priority generation queue',
      'No watermark on video outputs'
    ],
    limits: {
      maxDuration: 120,
      maxResolution: '4k',
      storageGb: 50,
      priorityQueue: true,
      watermark: false,
      longScene: true,
    }
  },
  creator: {
    id: 'creator',
    name: 'Studio Creator',
    monthlyCredits: 3500,
    price: '$79 / mo',
    badge: 'Studio',
    features: [
      '3,500 monthly generation credits',
      'Unlimited Long Scene shot expansions',
      '🔱 Hindi Mythology Creator Suite',
      'Full multi-track timeline editing & export',
      '500 GB cloud asset storage',
      'Instant Ultra-Priority queue',
      'Custom Voice Cloning & consistency model',
      'Direct API access integration'
    ],
    limits: {
      maxDuration: 300,
      maxResolution: '4k',
      storageGb: 500,
      priorityQueue: true,
      watermark: false,
      longScene: true,
    }
  }
};
