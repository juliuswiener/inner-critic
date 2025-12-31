// Relative tracking: compared to yesterday
export type RelativeRating = 'better' | 'same' | 'worse' | null;

// Pre-defined trackable items based on psychology/mindfulness research
export interface TrackableItem {
  id: string;
  name: string;
  description: string;
  category: 'wellness' | 'emotional' | 'social' | 'growth' | 'physical';
  icon: string; // emoji for soft friendly feel
  enabled: boolean;
}

// A single tracking entry for one item
export interface TrackingEntry {
  itemId: string;
  rating: RelativeRating;
}

// Free text reflection
export interface ReflectionEntry {
  id: string;
  prompt: string;
  response: string;
}

// A complete daily journal entry
export interface JournalEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;

  // Relative ratings for each enabled item
  trackings: TrackingEntry[];

  // Free text reflections
  reflections: ReflectionEntry[];

  // Optional overall notes
  notes?: string;
}

// Default trackable items
export const DEFAULT_TRACKABLE_ITEMS: TrackableItem[] = [
  // Wellness
  {
    id: 'sleep',
    name: 'Sleep Quality',
    description: 'How restful was your sleep?',
    category: 'wellness',
    icon: '😴',
    enabled: true,
  },
  {
    id: 'energy',
    name: 'Energy Levels',
    description: 'How energized did you feel today?',
    category: 'wellness',
    icon: '⚡',
    enabled: true,
  },
  {
    id: 'self-care',
    name: 'Self-Care',
    description: 'Did you take time for yourself?',
    category: 'wellness',
    icon: '🛁',
    enabled: true,
  },

  // Emotional
  {
    id: 'mood',
    name: 'Overall Mood',
    description: 'How was your emotional state?',
    category: 'emotional',
    icon: '🌤️',
    enabled: true,
  },
  {
    id: 'anxiety',
    name: 'Anxiety Levels',
    description: 'How calm or anxious did you feel?',
    category: 'emotional',
    icon: '🌊',
    enabled: true,
  },
  {
    id: 'self-compassion',
    name: 'Self-Compassion',
    description: 'Were you kind to yourself today?',
    category: 'emotional',
    icon: '💝',
    enabled: true,
  },
  {
    id: 'stress',
    name: 'Stress Levels',
    description: 'How stressed did you feel?',
    category: 'emotional',
    icon: '🧘',
    enabled: true,
  },
  {
    id: 'joy',
    name: 'Joy & Pleasure',
    description: 'Did you experience moments of joy?',
    category: 'emotional',
    icon: '✨',
    enabled: false,
  },

  // Social
  {
    id: 'connection',
    name: 'Social Connection',
    description: 'Did you feel connected to others?',
    category: 'social',
    icon: '🤝',
    enabled: true,
  },
  {
    id: 'boundaries',
    name: 'Boundaries',
    description: 'Did you respect your own boundaries?',
    category: 'social',
    icon: '🛡️',
    enabled: false,
  },

  // Growth
  {
    id: 'learning',
    name: 'Learning & Growth',
    description: 'Did you learn something new?',
    category: 'growth',
    icon: '🌱',
    enabled: true,
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    description: 'Did you practice gratitude?',
    category: 'growth',
    icon: '🙏',
    enabled: true,
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Were you present in the moment?',
    category: 'growth',
    icon: '🧠',
    enabled: true,
  },
  {
    id: 'accomplishment',
    name: 'Accomplishment',
    description: 'Did you accomplish what you set out to do?',
    category: 'growth',
    icon: '🎯',
    enabled: false,
  },

  // Physical
  {
    id: 'movement',
    name: 'Physical Activity',
    description: 'Did you move your body?',
    category: 'physical',
    icon: '🏃',
    enabled: true,
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    description: 'Did you nourish your body well?',
    category: 'physical',
    icon: '🥗',
    enabled: false,
  },
];

// Default reflection prompts
export const DEFAULT_REFLECTION_PROMPTS = [
  { id: 'learned', prompt: 'What did I learn today?', enabled: true },
  { id: 'grateful', prompt: 'What am I grateful for?', enabled: true },
  { id: 'proud', prompt: 'What am I proud of today?', enabled: false },
  { id: 'challenge', prompt: 'What challenged me today?', enabled: false },
  { id: 'tomorrow', prompt: 'What do I want to focus on tomorrow?', enabled: false },
];
