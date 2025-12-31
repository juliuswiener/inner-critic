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
  role: 'user' | 'critic' | 'healthy-adult';
  content: string;
  timestamp: Date;
  // For critic messages, track if healthy adult response was requested
  healthyAdultResponse?: string;
  // Reference to which critic message this healthy adult response is for
  criticMessageId?: string;
}
