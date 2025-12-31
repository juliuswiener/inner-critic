import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  JournalEntry,
  TrackableItem,
  TrackingEntry,
  ReflectionEntry,
  RelativeRating,
} from '../types/journal';
import { DEFAULT_TRACKABLE_ITEMS, DEFAULT_REFLECTION_PROMPTS } from '../types/journal';

interface ReflectionPrompt {
  id: string;
  prompt: string;
  enabled: boolean;
}

interface JournalState {
  // All journal entries
  entries: JournalEntry[];

  // User's customized trackable items
  trackableItems: TrackableItem[];

  // User's customized reflection prompts
  reflectionPrompts: ReflectionPrompt[];

  // Actions
  getEntryByDate: (date: string) => JournalEntry | undefined;
  getTodayEntry: () => JournalEntry | undefined;
  createOrUpdateEntry: (date: string, updates: Partial<JournalEntry>) => void;
  setTracking: (date: string, itemId: string, rating: RelativeRating) => void;
  setReflection: (date: string, promptId: string, response: string) => void;
  setNotes: (date: string, notes: string) => void;

  // Settings
  toggleTrackableItem: (itemId: string) => void;
  addCustomTrackableItem: (item: Omit<TrackableItem, 'id' | 'enabled'>) => void;
  removeTrackableItem: (itemId: string) => void;
  toggleReflectionPrompt: (promptId: string) => void;
  addCustomReflectionPrompt: (prompt: string) => void;
  removeReflectionPrompt: (promptId: string) => void;

  // Stats helpers
  getEntriesInRange: (startDate: string, endDate: string) => JournalEntry[];
  getStreakDays: () => number;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const getDateString = (date: Date = new Date()) => {
  return date.toISOString().split('T')[0];
};

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      trackableItems: DEFAULT_TRACKABLE_ITEMS,
      reflectionPrompts: DEFAULT_REFLECTION_PROMPTS,

      getEntryByDate: (date: string) => {
        return get().entries.find((e) => e.date === date);
      },

      getTodayEntry: () => {
        const today = getDateString();
        return get().entries.find((e) => e.date === today);
      },

      createOrUpdateEntry: (date: string, updates: Partial<JournalEntry>) => {
        set((state) => {
          const existingIndex = state.entries.findIndex((e) => e.date === date);

          if (existingIndex >= 0) {
            const updatedEntries = [...state.entries];
            updatedEntries[existingIndex] = {
              ...updatedEntries[existingIndex],
              ...updates,
              updatedAt: new Date(),
            };
            return { entries: updatedEntries };
          } else {
            const newEntry: JournalEntry = {
              id: generateId(),
              date,
              createdAt: new Date(),
              updatedAt: new Date(),
              trackings: [],
              reflections: [],
              ...updates,
            };
            return { entries: [...state.entries, newEntry] };
          }
        });
      },

      setTracking: (date: string, itemId: string, rating: RelativeRating) => {
        set((state) => {
          const existingEntry = state.entries.find((e) => e.date === date);
          const trackings: TrackingEntry[] = existingEntry?.trackings || [];

          const existingTrackingIndex = trackings.findIndex((t) => t.itemId === itemId);
          const newTrackings = [...trackings];

          if (existingTrackingIndex >= 0) {
            newTrackings[existingTrackingIndex] = { itemId, rating };
          } else {
            newTrackings.push({ itemId, rating });
          }

          if (existingEntry) {
            const updatedEntries = state.entries.map((e) =>
              e.date === date ? { ...e, trackings: newTrackings, updatedAt: new Date() } : e
            );
            return { entries: updatedEntries };
          } else {
            const newEntry: JournalEntry = {
              id: generateId(),
              date,
              createdAt: new Date(),
              updatedAt: new Date(),
              trackings: newTrackings,
              reflections: [],
            };
            return { entries: [...state.entries, newEntry] };
          }
        });
      },

      setReflection: (date: string, promptId: string, response: string) => {
        set((state) => {
          const existingEntry = state.entries.find((e) => e.date === date);
          const prompt = state.reflectionPrompts.find((p) => p.id === promptId);
          if (!prompt) return state;

          const reflections: ReflectionEntry[] = existingEntry?.reflections || [];
          const existingIndex = reflections.findIndex((r) => r.id === promptId);
          const newReflections = [...reflections];

          if (existingIndex >= 0) {
            newReflections[existingIndex] = { id: promptId, prompt: prompt.prompt, response };
          } else {
            newReflections.push({ id: promptId, prompt: prompt.prompt, response });
          }

          if (existingEntry) {
            const updatedEntries = state.entries.map((e) =>
              e.date === date ? { ...e, reflections: newReflections, updatedAt: new Date() } : e
            );
            return { entries: updatedEntries };
          } else {
            const newEntry: JournalEntry = {
              id: generateId(),
              date,
              createdAt: new Date(),
              updatedAt: new Date(),
              trackings: [],
              reflections: newReflections,
            };
            return { entries: [...state.entries, newEntry] };
          }
        });
      },

      setNotes: (date: string, notes: string) => {
        const { createOrUpdateEntry } = get();
        createOrUpdateEntry(date, { notes });
      },

      toggleTrackableItem: (itemId: string) => {
        set((state) => ({
          trackableItems: state.trackableItems.map((item) =>
            item.id === itemId ? { ...item, enabled: !item.enabled } : item
          ),
        }));
      },

      addCustomTrackableItem: (item) => {
        set((state) => ({
          trackableItems: [
            ...state.trackableItems,
            { ...item, id: generateId(), enabled: true },
          ],
        }));
      },

      removeTrackableItem: (itemId: string) => {
        set((state) => ({
          trackableItems: state.trackableItems.filter((item) => item.id !== itemId),
        }));
      },

      toggleReflectionPrompt: (promptId: string) => {
        set((state) => ({
          reflectionPrompts: state.reflectionPrompts.map((prompt) =>
            prompt.id === promptId ? { ...prompt, enabled: !prompt.enabled } : prompt
          ),
        }));
      },

      addCustomReflectionPrompt: (prompt: string) => {
        set((state) => ({
          reflectionPrompts: [
            ...state.reflectionPrompts,
            { id: generateId(), prompt, enabled: true },
          ],
        }));
      },

      removeReflectionPrompt: (promptId: string) => {
        set((state) => ({
          reflectionPrompts: state.reflectionPrompts.filter((p) => p.id !== promptId),
        }));
      },

      getEntriesInRange: (startDate: string, endDate: string) => {
        return get().entries.filter((e) => e.date >= startDate && e.date <= endDate);
      },

      getStreakDays: () => {
        const entries = get().entries;
        if (entries.length === 0) return 0;

        const sortedDates = entries
          .map((e) => e.date)
          .sort()
          .reverse();

        const today = getDateString();
        const yesterday = getDateString(new Date(Date.now() - 86400000));

        // Check if streak is current (today or yesterday has entry)
        if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
          return 0;
        }

        let streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          const diffDays = Math.floor(
            (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }

        return streak;
      },
    }),
    {
      name: 'journal-storage',
    }
  )
);
