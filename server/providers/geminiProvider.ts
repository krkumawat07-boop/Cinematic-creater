import { GoogleGenAI } from '@google/genai';
import { SERVER_CONFIG } from '../config.js';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!aiClient && SERVER_CONFIG.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: SERVER_CONFIG.GEMINI_API_KEY });
  }
  return aiClient;
}

export async function analyzeStoryToVideo(params: {
  story: string;
  language: 'English' | 'Hindi';
  durationSeconds: number;
  style: string;
}) {
  const ai = getGenAI();

  // Target scene count based on duration (approx 8-10 seconds per scene)
  const targetScenes = Math.max(3, Math.round(params.durationSeconds / 10));

  if (ai) {
    try {
      const prompt = `You are an elite Hollywood & Bollywood director and cinematographer.
Analyze the following story and convert it into a professional filmmaking storyboard specification for an AI video generation pipeline.

Story text:
"""${params.story}"""

Language: ${params.language}
Target Total Duration: ${params.durationSeconds} seconds
Visual Style: ${params.style}
Target Scene Count: ${targetScenes} scenes

Return STRICTLY valid JSON with no markdown backticks, conforming to:
{
  "title": "Short cinematic title",
  "storyStructure": {
    "act1": "Setup description",
    "act2": "Confrontation/Climax description",
    "act3": "Resolution description"
  },
  "characters": [
    {
      "name": "Character Name",
      "description": "Personality and role",
      "appearance": "Visual attire, face, distinctive features for AI visual consistency"
    }
  ],
  "locations": ["List of distinct filming locations"],
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene title",
      "duration": 10,
      "visualPrompt": "Detailed cinematic visual prompt describing camera shot, lighting, environment, action, and high aesthetic details",
      "voiceOver": "Narration text in ${params.language}",
      "characters": ["Names of characters in scene"],
      "location": "Location name",
      "camera": "Camera shot (e.g. Extreme Close-up, Wide Crane, Low Angle Tracking)",
      "lighting": "Cinematic lighting (e.g. Dramatic Rim Light, Golden Hour, Chiaroscuro)"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return parsed;
    } catch (err) {
      console.warn('Gemini story analysis failed, using fallback engine:', err);
    }
  }

  // Fallback intelligent generator
  const isHindi = params.language === 'Hindi';
  return {
    title: isHindi ? 'महागाथा: एक नई यात्रा' : 'Echoes of Destiny',
    storyStructure: {
      act1: isHindi ? 'आरंभ: शांत वातावरण में एक रहस्यमयी शक्ति का उदय।' : 'The Awakening: An ancient force stirs from forgotten depths.',
      act2: isHindi ? 'संघर्ष: नायक का अपनी नियति और महासंकट से आमना-सामना।' : 'The Crucible: The protagonist confronts overwhelming forces.',
      act3: isHindi ? 'समाधान: विजय और एक नए युग की शुरुआत।' : 'The Triumph: Harmony restored, a legendary dawn arrives.'
    },
    characters: [
      {
        name: isHindi ? 'अर्जुन / वीर' : 'Aiden Vance',
        description: isHindi ? 'एक दृढ़ निश्चयी योद्धा' : 'Resolute seeker carrying ancient knowledge',
        appearance: isHindi ? 'सुनहरे कवच, तेजस्वी आंखें, सिर पर मुकुट' : 'Weathered leather duster, cybernetic eye, silver hair'
      },
      {
        name: isHindi ? 'माया / मार्गदर्शिका' : 'Dr. Lyra Cross',
        description: isHindi ? 'रहस्यों की ज्ञाता' : 'Astrophysicist who decoded the anomaly',
        appearance: isHindi ? 'पारंपरिक वस्त्र, आभायुक्त व्यक्तित्व' : 'Tactical flight suit, holographic pendant'
      }
    ],
    locations: [
      isHindi ? 'पवित्र पर्वत शिखर' : 'Obsidian Spire of New Avalon',
      isHindi ? 'प्राचीन मंदिर का गर्भगृह' : 'The Subterranean Vault'
    ],
    scenes: Array.from({ length: targetScenes }).map((_, i) => ({
      sceneNumber: i + 1,
      title: `${isHindi ? 'दृश्य' : 'Shot'} ${i + 1}`,
      duration: Math.round(params.durationSeconds / targetScenes),
      visualPrompt: `${params.style}, shot ${i + 1}: Atmospheric wide angle cinematic composition, volumetric dust particles, anamorphic lens flare, high visual fidelity, 8k render, masterpiece.`,
      voiceOver: isHindi 
        ? `समय के पहिए कभी नहीं रुकते... जब संकट बढ़ता है, तब एक सच्चा नायक जन्म लेता है।`
        : `Through shadows of forgotten epochs, destiny writes its eternal decree.`,
      characters: [isHindi ? 'वीर' : 'Aiden Vance'],
      location: isHindi ? 'पवित्र पर्वत' : 'Obsidian Spire',
      camera: i % 2 === 0 ? 'Wide Cinematic Aerial Drone' : 'Dramatic Close-up with shallow depth of field',
      lighting: i % 2 === 0 ? 'Golden Hour Rim Lighting' : 'Moody Volumetric Neon Chiaroscuro'
    }))
  };
}

export async function generateMythologyContent(params: {
  topic: string;
  preset: string; // e.g. '7 × 10-second Short' | '1-minute video' | '2-minute video' | '5-minute video'
}) {
  const ai = getGenAI();

  let sceneCount = 7;
  let sceneDuration = 10;
  if (params.preset.includes('1-minute')) {
    sceneCount = 6;
    sceneDuration = 10;
  } else if (params.preset.includes('2-minute')) {
    sceneCount = 8;
    sceneDuration = 15;
  } else if (params.preset.includes('5-minute')) {
    sceneCount = 10;
    sceneDuration = 30;
  }

  if (ai) {
    try {
      const prompt = `You are a legendary Indian mythology filmmaker and Sanskrit scholar.
Create an epic cinematic video production package for Hindi mythology content creators based on the following topic.
Topic: "${params.topic}"
Format preset: "${params.preset}" (${sceneCount} scenes, approx ${sceneDuration}s each)

IMPORTANT: Do not copy copyrighted television serial dialogues. Create original, grand, devotional and philosophical Hindi narration with Sanskrit aesthetic flourishes.

Return STRICTLY valid JSON with no markdown formatting:
{
  "title": "Epic Hindi title (e.g. भगवान शिव का दिव्य तांडव)",
  "story": "Detailed overview of the mythological moment and spiritual significance in Hindi",
  "characters": [
    {
      "name": "Character Name (e.g. Mahadev Shiva, Shri Krishna, Hanuman Ji)",
      "role": "Divine role",
      "appearance": "Traditional iconography, ornaments, weapons, divine glow aura",
      "visualPrompt": "Cinematic AI image prompt for consistency"
    }
  ],
  "characterSheets": [
    {
      "characterName": "Name",
      "traits": "Key physical traits and spiritual energy",
      "promptSheet": "Multi-angle visual character sheet prompt"
    }
  ],
  "cinematicPrompts": [
    "Detailed English image/video generation prompt with camera, lighting, 8k epic fantasy Hindu mythology aesthetic"
  ],
  "hindiVoiceover": "Full dramatic, thunderous, and goosebumps-inducing Hindi narration script",
  "sceneStructure": [
    {
      "sceneNumber": 1,
      "title": "Scene name in Hindi",
      "duration": ${sceneDuration},
      "visualPrompt": "Cinematic prompt in English with camera lens, lighting, divine aura, particles, IMAX 70mm aesthetic",
      "hindiNarration": "Poetic Hindi voiceover line for this scene",
      "camera": "Camera shot and motion",
      "lighting": "Celestial golden glow, divine lightning, deep celestial blue",
      "musicSuggestion": "Thunderous damru rhythms, ancient Sanskrit chant chorus, resonant shankh",
      "sfxSuggestion": "Cosmic rumble, divine bell resonance, crackling celestial energy"
    }
  ],
  "musicSuggestions": ["List of Indian classical and cinematic soundtrack directions"],
  "sfxSuggestions": ["List of holy sound effects"],
  "thumbnailPrompt": "Viral YouTube thumbnail prompt in English with high contrast, glowing divine eyes, bold composition"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '{}';
      return JSON.parse(text);
    } catch (err) {
      console.warn('Gemini mythology generation failed, using curated generator:', err);
    }
  }

  // Curated epic Indian Mythology generation
  const topic = params.topic || 'भगवान शिव का दिव्य तांडव';
  return {
    title: `🔱 ${topic}: ब्रह्मांडीय गाथा`,
    story: `यह कथा सनातन धर्म के अनंत सत्य और ब्रह्मांडीय शक्तियों के संतुलन को दर्शाती है। जब अंधकार का विस्तार होता है, तब दिव्य चेतना सत्य की पुनर्स्थापना के लिए प्रकट होती है।`,
    characters: [
      {
        name: 'महादेव शिव',
        role: 'सृष्टि, स्थिति और संहार के अधिपति',
        appearance: 'जटाओं में बहती गंगा, मस्तक पर बालचंद्र, नीलकंठ, त्रिशूल और डमरू धारण किए हुए, भस्म रमित शरीर, अलौकिक नीली कांति',
        visualPrompt: 'Lord Shiva in deep cosmic meditation, glowing blue divine aura, sacred ashes bhasma, trident trishul, crescent moon in matted locks, Himalayan snow peaks background, cinematic 8k, photorealistic spiritual aesthetic'
      },
      {
        name: 'नंदी',
        role: 'महादेव के अनन्य भक्त और वाहन',
        appearance: 'श्वेत दिव्य वृषभ, स्वर्ण घंटियों से सुशोभित',
        visualPrompt: 'Divine white bull Nandi, adorned with golden ornaments and bells, seated reverently before Mount Kailash, cinematic volumetric light'
      }
    ],
    characterSheets: [
      {
        characterName: 'महादेव शिव',
        traits: 'तृतीय नेत्र की ज्वाला, शांत मुखमंडल, अनंत करुणा और संहारक शक्ति',
        promptSheet: 'Character turnaround sheet: Lord Shiva, front view, 3/4 view, side profile, close-up of third eye emitting soft divine glow, sacred rudraksha beads, ultra detailed 3D render'
      }
    ],
    cinematicPrompts: [
      'Epic Hindu mythology cinematic shot: Mount Kailash shrouded in swirling cosmic galaxies, Lord Shiva standing with Trishul, thunder and divine light rays, 8k resolution, IMAX ratio',
      'Macro close-up: Damru vibrating with cosmic vibrations creating ripples across the fabric of spacetime, glowing Sanskrit mantras floating, hyper-detailed'
    ],
    hindiVoiceover: `न आदि, न अंत... जो शून्य भी है और अनंत भी! जब काल की गति थम जाती है, तब गूंजती है डमरू की वो नाद, जो पूरे ब्रह्मांड को जीवन और संहार का सत्य सिखाती है। हर हर महादेव!`,
    sceneStructure: Array.from({ length: sceneCount }).map((_, idx) => ({
      sceneNumber: idx + 1,
      title: `चरण ${idx + 1}: दिव्य अनुभूति`,
      duration: sceneDuration,
      visualPrompt: `Cinematic Indian mythology scene ${idx + 1}: Divine atmosphere, ancient temple pillars, swirling celestial nebula, golden volumetric light shafts, anamorphic 70mm, transcendent realism, masterwork.`,
      hindiNarration: `दृश्य ${idx + 1}: ब्रह्मांड की गहराइयों से एक अलौकिक शक्ति का संचार होता है।`,
      camera: idx === 0 ? 'Slow Majestic Dolly-In towards Kailash' : 'Orbital 360 degree tracking shot with rising embers',
      lighting: 'Celestial golden light piercing dark storm clouds, ethereal cyan rim light',
      musicSuggestion: 'Deep meditative tanpura drone transitioning into thunderous pakhavaj and resonant conch (shankh)',
      sfxSuggestion: 'Distant cosmic rumble, wind whispering Vedic hymns, sacred bell reverberation'
    })),
    musicSuggestions: [
      'Traditional Rudra Veena with resonant cinematic sub-bass',
      'War Shankh (conch) blast combined with tribal dhak and damru',
      'Ethereal Sanskrit choir chanting Shiva Tandava Stotram'
    ],
    sfxSuggestions: [
      'Cosmic energy hum (Om frequency 432Hz)',
      'Thunderous Trishul strike reverberating through valleys',
      'Sacred river Ganga cascading down heavenly realm'
    ],
    thumbnailPrompt: 'YouTube thumbnail 16:9: Glowing blue divine face of Lord Shiva with blazing third eye, glowing gold trishul, dramatic contrast, fiery sparks, bold cinematic title space, ultra high clickthrough rate style'
  };
}
