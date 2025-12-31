import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJournalStore } from '../store/journalStore';
import { ChevronLeft, Plus, Trash2, Check } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  wellness: 'bg-soft-peach',
  emotional: 'bg-soft-lavender',
  social: 'bg-soft-sky',
  growth: 'bg-soft-mint',
  physical: 'bg-soft-rose',
};

export function JournalSettings() {
  const {
    trackableItems,
    reflectionPrompts,
    toggleTrackableItem,
    addCustomTrackableItem,
    removeTrackableItem,
    toggleReflectionPrompt,
    addCustomReflectionPrompt,
    removeReflectionPrompt,
  } = useJournalStore();

  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<
    'wellness' | 'emotional' | 'social' | 'growth' | 'physical'
  >('wellness');
  const [newItemEmoji, setNewItemEmoji] = useState('✨');
  const [newPrompt, setNewPrompt] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddPrompt, setShowAddPrompt] = useState(false);

  const handleAddItem = () => {
    if (newItemName.trim()) {
      addCustomTrackableItem({
        name: newItemName.trim(),
        description: newItemDescription.trim() || `Track your ${newItemName.toLowerCase()}`,
        category: newItemCategory,
        icon: newItemEmoji,
      });
      setNewItemName('');
      setNewItemDescription('');
      setNewItemEmoji('✨');
      setShowAddItem(false);
    }
  };

  const handleAddPrompt = () => {
    if (newPrompt.trim()) {
      addCustomReflectionPrompt(newPrompt.trim());
      setNewPrompt('');
      setShowAddPrompt(false);
    }
  };

  // Group items by category
  const itemsByCategory = trackableItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof trackableItems>
  );

  return (
    <div className="soft-page min-h-screen pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/journal"
            className="p-3 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-soft-text" />
          </Link>
          <div>
            <h1 className="text-3xl soft-heading mb-1">Customize Journal</h1>
            <p className="soft-subheading">Choose what to track each day</p>
          </div>
        </div>

        {/* Trackable Items */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold soft-heading">What to Track</h2>
            <button
              onClick={() => setShowAddItem(!showAddItem)}
              className="soft-btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Custom
            </button>
          </div>

          {/* Add Custom Item Form */}
          {showAddItem && (
            <div className="soft-card mb-6">
              <h3 className="font-semibold text-soft-text mb-4">Add Custom Item</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-20">
                    <label className="block text-sm font-medium text-soft-text-light mb-1">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={newItemEmoji}
                      onChange={(e) => setNewItemEmoji(e.target.value)}
                      className="w-full soft-input text-center text-2xl"
                      maxLength={2}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-soft-text-light mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g., Creativity"
                      className="w-full soft-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-soft-text-light mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    placeholder="e.g., Did you express yourself creatively?"
                    className="w-full soft-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-soft-text-light mb-1">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['wellness', 'emotional', 'social', 'growth', 'physical'] as const).map(
                      (cat) => (
                        <button
                          key={cat}
                          onClick={() => setNewItemCategory(cat)}
                          className={`px-4 py-2 rounded-full capitalize font-medium transition-all ${
                            newItemCategory === cat ? 'soft-pill-active' : 'soft-pill'
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddItem}
                    disabled={!newItemName.trim()}
                    className="soft-btn-mint flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Add Item
                  </button>
                  <button
                    onClick={() => setShowAddItem(false)}
                    className="soft-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items by Category */}
          {Object.entries(itemsByCategory).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-semibold text-soft-text-light uppercase tracking-wide mb-3 px-2">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`${CATEGORY_COLORS[category]} p-4 rounded-xl flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-soft-text">{item.name}</p>
                        <p className="text-sm text-soft-text-light">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTrackableItem(item.id)}
                        className={`w-12 h-7 rounded-full transition-all relative ${
                          item.enabled ? 'bg-soft-mint-dark' : 'bg-soft-fog'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                            item.enabled ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                      {/* Only allow removing custom items (those not in default list) */}
                      {!['sleep', 'energy', 'self-care', 'mood', 'anxiety', 'self-compassion', 'stress', 'joy', 'connection', 'boundaries', 'learning', 'gratitude', 'mindfulness', 'accomplishment', 'movement', 'nutrition'].includes(item.id) && (
                        <button
                          onClick={() => removeTrackableItem(item.id)}
                          className="p-2 rounded-full hover:bg-soft-rose/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reflection Prompts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold soft-heading">Reflection Prompts</h2>
            <button
              onClick={() => setShowAddPrompt(!showAddPrompt)}
              className="soft-btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Prompt
            </button>
          </div>

          {/* Add Custom Prompt Form */}
          {showAddPrompt && (
            <div className="soft-card mb-6">
              <h3 className="font-semibold text-soft-text mb-4">Add Custom Prompt</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-soft-text-light mb-1">
                    Your prompt
                  </label>
                  <input
                    type="text"
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="e.g., What made me smile today?"
                    className="w-full soft-input"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddPrompt}
                    disabled={!newPrompt.trim()}
                    className="soft-btn-mint flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Add Prompt
                  </button>
                  <button
                    onClick={() => setShowAddPrompt(false)}
                    className="soft-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {reflectionPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="soft-card flex items-center justify-between"
              >
                <p className="font-medium text-soft-text">{prompt.prompt}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReflectionPrompt(prompt.id)}
                    className={`w-12 h-7 rounded-full transition-all relative ${
                      prompt.enabled ? 'bg-soft-mint-dark' : 'bg-soft-fog'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        prompt.enabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                  {!['learned', 'grateful', 'proud', 'challenge', 'tomorrow'].includes(prompt.id) && (
                    <button
                      onClick={() => removeReflectionPrompt(prompt.id)}
                      className="p-2 rounded-full hover:bg-soft-rose/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
