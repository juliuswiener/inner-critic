import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InnerCritic, ChatMessage, CriticBelief, CriticTrigger, DeconstructionAnalysis } from '../types/critic';

interface CriticState {
  // Current critic being created/edited
  critic: InnerCritic | null;

  // Chat history with the critic
  chatHistory: ChatMessage[];

  // Creation wizard step
  currentStep: 'welcome' | 'appearance' | 'personality' | 'beliefs' | 'triggers' | 'chat';

  // Actions
  initializeCritic: () => void;
  updateAppearance: (appearance: Partial<InnerCritic['appearance']>) => void;
  updatePersonality: (personality: Partial<InnerCritic['personality']>) => void;
  addBelief: (belief: Omit<CriticBelief, 'id'>) => void;
  removeBelief: (id: string) => void;
  addTrigger: (trigger: Omit<CriticTrigger, 'id'>) => void;
  removeTrigger: (id: string) => void;
  addCatchphrase: (phrase: string) => void;
  removeCatchphrase: (phrase: string) => void;
  setProtectiveIntent: (intent: string) => void;
  setStep: (step: CriticState['currentStep']) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  updateMessageContent: (messageId: string, content: string) => void;
  updateMessageAnalysis: (messageId: string, analysis: DeconstructionAnalysis) => void;
  clearChat: () => void;
  resetCritic: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const createEmptyCritic = (): InnerCritic => ({
  id: generateId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  personality: {
    name: '',
    voice: '',
    primaryEmotion: '',
    communicationStyle: '',
  },
  appearance: {},
  beliefs: [],
  triggers: [],
  catchphrases: [],
});

export const useCriticStore = create<CriticState>()(
  persist(
    (set) => ({
      critic: null,
      chatHistory: [],
      currentStep: 'welcome',

      initializeCritic: () =>
        set({
          critic: createEmptyCritic(),
          chatHistory: [],
        }),

      updateAppearance: (appearance) =>
        set((state) => ({
          critic: state.critic
            ? {
                ...state.critic,
                appearance: { ...state.critic.appearance, ...appearance },
                updatedAt: new Date(),
              }
            : null,
        })),

      updatePersonality: (personality) =>
        set((state) => ({
          critic: state.critic
            ? {
                ...state.critic,
                personality: { ...state.critic.personality, ...personality },
                updatedAt: new Date(),
              }
            : null,
        })),

      addBelief: (belief) =>
        set((state) => ({
          critic: state.critic
            ? {
                ...state.critic,
                beliefs: [...state.critic.beliefs, { ...belief, id: generateId() }],
                updatedAt: new Date(),
              }
            : null,
        })),

      removeBelief: (id) =>
        set((state) => ({
          critic: state.critic
            ? {
                ...state.critic,
                beliefs: state.critic.beliefs.filter((b) => b.id !== id),
                updatedAt: new Date(),
              }
            : null,
        })),

      addTrigger: (trigger) =>
        set((state) => ({
          critic: state.critic
            ? {
                ...state.critic,
                triggers: [...state.critic.triggers, { ...trigger, id: generateId() }],
                updatedAt: new Date(),
              }
            : null,
        })),

      removeTrigger: (id) =>
        set((state) => ({
          critic: state.critic
            ? {
                ...state.critic,
                triggers: state.critic.triggers.filter((t) => t.id !== id),
                updatedAt: new Date(),
              }
            : null,
        })),

      addCatchphrase: (phrase) =>
        set((state) => ({
          critic: state.critic
            ? {
                ...state.critic,
                catchphrases: [...state.critic.catchphrases, phrase],
                updatedAt: new Date(),
              }
            : null,
        })),

      removeCatchphrase: (phrase) =>
        set((state) => ({
          critic: state.critic
            ? {
                ...state.critic,
                catchphrases: state.critic.catchphrases.filter((p) => p !== phrase),
                updatedAt: new Date(),
              }
            : null,
        })),

      setProtectiveIntent: (intent) =>
        set((state) => ({
          critic: state.critic
            ? {
                ...state.critic,
                protectiveIntent: intent,
                updatedAt: new Date(),
              }
            : null,
        })),

      setStep: (step) => set({ currentStep: step }),

      addChatMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date(),
        };
        set((state) => ({
          chatHistory: [...state.chatHistory, newMessage],
        }));
        return newMessage;
      },

      updateMessageContent: (messageId, content) =>
        set((state) => ({
          chatHistory: state.chatHistory.map((msg) =>
            msg.id === messageId ? { ...msg, content } : msg
          ),
        })),

      updateMessageAnalysis: (messageId, analysis) =>
        set((state) => ({
          chatHistory: state.chatHistory.map((msg) =>
            msg.id === messageId ? { ...msg, analysis } : msg
          ),
        })),

      clearChat: () => set({ chatHistory: [] }),

      resetCritic: () =>
        set({
          critic: null,
          chatHistory: [],
          currentStep: 'welcome',
        }),
    }),
    {
      name: 'inner-critic-storage',
      partialize: (state) => ({
        critic: state.critic,
        chatHistory: state.chatHistory,
        currentStep: state.currentStep,
      }),
    }
  )
);
