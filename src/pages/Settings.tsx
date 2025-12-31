import { useCriticStore } from '../store/criticStore';
import { Trash2 } from 'lucide-react';

export function Settings() {
  const { resetCritic, critic } = useCriticStore();

  const handleResetCritic = () => {
    if (confirm('Are you sure you want to delete your inner critic? This cannot be undone.')) {
      resetCritic();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-black uppercase mb-8">Settings</h1>

      {/* Reset Critic Section */}
      {critic && (
        <div className="brutal-card bg-brutal-red text-brutal-white mb-6">
          <h2 className="text-xl font-black uppercase mb-2">Danger Zone</h2>
          <p className="font-medium mb-4">
            Delete your inner critic and start fresh. This will remove all character data and chat
            history.
          </p>
          <button
            onClick={handleResetCritic}
            className="brutal-btn bg-brutal-white text-brutal-black flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" strokeWidth={2.5} />
            Delete Inner Critic
          </button>
        </div>
      )}

      {/* About Section */}
      <div className="brutal-card bg-brutal-green">
        <h2 className="text-xl font-black uppercase mb-4">About This Tool</h2>
        <div className="space-y-3 font-medium">
          <p>
            The Inner Critic Builder is a therapeutic tool based on the concept of externalizing
            negative self-talk. By giving your inner critic a visual form and defined personality,
            you can better observe and understand these thought patterns.
          </p>
          <p>
            This technique is used in various therapeutic approaches including Internal Family
            Systems (IFS), Cognitive Behavioral Therapy (CBT), and mindfulness practices.
          </p>
          <p className="text-brutal-black/60">
            <strong className="font-black">Note:</strong> This tool is for self-exploration and
            is not a substitute for professional mental health treatment.
          </p>
        </div>
      </div>
    </div>
  );
}
