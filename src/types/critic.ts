export interface CriticBelief {
  id: string;
  belief: string;
  origin?: string; // Where this belief might come from
  intensity: 1 | 2 | 3 | 4 | 5; // How strongly held
}

export interface CriticTrigger {
  id: string;
  situation: string;
  typicalResponse: string;
}

export interface CriticAppearance {
  imageUrl?: string;
  imagePrompt?: string;
  physicalDescription?: string;
}

export interface CriticPersonality {
  name: string;
  voice: string; // How they speak (e.g., "cold and distant", "anxious and rushed")
  primaryEmotion: string; // What emotion do they primarily express
  communicationStyle: string; // e.g., "uses absolute statements", "asks rhetorical questions"
}

export interface InnerCritic {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Core identity
  personality: CriticPersonality;
  appearance: CriticAppearance;

  // Belief system
  beliefs: CriticBelief[];
  triggers: CriticTrigger[];

  // Common phrases the critic uses
  catchphrases: string[];

  // What the critic claims to protect you from
  protectiveIntent?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // Analysis data if deconstruction was performed on this message
  analysis?: DeconstructionAnalysis;
}

// Critic pattern types for deconstruction
export type CriticPatternType =
  | 'labeling' // "ich bin faul/dumm/wertlos"
  | 'comparison' // "alle anderen schaffen das"
  | 'catastrophizing' // "das wird nie funktionieren"
  | 'should-tyranny' // "ich sollte/müsste"
  | 'mind-reading' // "die denken sicher..."
  | 'overgeneralization' // "immer", "nie"
  | 'discounting-positives' // dismissing achievements
  | 'emotional-reasoning' // "I feel bad, so I must be bad"
  | 'personalization'; // blaming self for external events

export interface CriticSegment {
  id: string;
  text: string; // The exact quoted text
  startIndex: number;
  endIndex: number;
  patternType: CriticPatternType;
  explanation: string; // Why this is critic voice
}

export interface DeconstructionAnalysis {
  id: string;
  messageId: string;
  criticSegments: CriticSegment[];
  healthyAdultResponse: string; // I-form response
  createdAt: Date;
}

// Memory system types (for future backend integration)
export interface Topic {
  name: string;
  firstMentioned: Date;
  lastMentioned: Date;
  frequency: number;
  relatedEmotions: string[];
}

export interface Pattern {
  type: string;
  description: string;
  evidence: string[];
  frequency: 'new' | 'occasional' | 'recurring';
  contexts: string[];
}

export interface Insight {
  content: string;
  source: 'user' | 'ai';
  resonance?: 'high' | 'medium' | 'low';
  date: Date;
  relatedTopics: string[];
}

export interface CriticVoice {
  voice: string;
  frequency: number;
  firstAppeared: Date;
  lastAppeared: Date;
  contexts: string[];
  typicalTriggers: string[];
  deconstructions: string[];
}

export interface UserMemory {
  id: string;
  topics: Topic[];
  patterns: Pattern[];
  insights: Insight[];
  criticVoices: CriticVoice[];
  emotionalThemes: string[];
}
