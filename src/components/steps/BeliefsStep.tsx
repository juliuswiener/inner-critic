import { useState } from 'react';
import { useCriticStore } from '../../store/criticStore';
import { Plus, Trash2 } from 'lucide-react';
import type { CriticBelief } from '../../types/critic';

const BELIEF_EXAMPLES = [
  "You're not good enough",
  "You'll never succeed",
  "People are judging you",
  "You don't deserve happiness",
  "You're going to fail",
  "You're a fraud",
  "You should be further along by now",
  "You're too much / not enough",
];

export function BeliefsStep() {
  const { critic, addBelief, removeBelief, setProtectiveIntent } = useCriticStore();
  const [newBelief, setNewBelief] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newIntensity, setNewIntensity] = useState<CriticBelief['intensity']>(3);

  const handleAddBelief = () => {
    if (!newBelief.trim()) return;

    addBelief({
      belief: newBelief.trim(),
      origin: newOrigin.trim() || undefined,
      intensity: newIntensity,
    });

    setNewBelief('');
    setNewOrigin('');
    setNewIntensity(3);
  };

  const handleQuickAdd = (belief: string) => {
    addBelief({
      belief,
      intensity: 3,
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-black uppercase mb-2">What does your critic believe?</h2>
      <p className="text-brutal-black/80 font-medium mb-6">
        These are the core messages your inner critic repeats. Identifying them helps you recognize
        when they appear.
      </p>

      {/* Quick add common beliefs */}
      <div className="mb-6">
        <p className="font-bold uppercase text-sm mb-2">Quick add common beliefs:</p>
        <div className="flex flex-wrap gap-2">
          {BELIEF_EXAMPLES.filter(
            (b) => !critic?.beliefs.some((existing) => existing.belief === b)
          ).map((belief) => (
            <button
              key={belief}
              onClick={() => handleQuickAdd(belief)}
              className="px-3 py-2 brutal-border border-2 bg-brutal-white font-bold text-sm brutal-hover"
            >
              + {belief}
            </button>
          ))}
        </div>
      </div>

      {/* Add custom belief */}
      <div className="brutal-border bg-brutal-white p-4 mb-6">
        <h3 className="font-black uppercase mb-3">Add a belief</h3>

        <div className="space-y-4">
          <div>
            <label className="block font-bold uppercase text-xs mb-1">The belief / message</label>
            <input
              type="text"
              value={newBelief}
              onChange={(e) => setNewBelief(e.target.value)}
              placeholder="What does your critic say?"
              className="w-full brutal-input"
            />
          </div>

          <div>
            <label className="block font-bold uppercase text-xs mb-1">
              Origin (optional) - Where might this belief come from?
            </label>
            <input
              type="text"
              value={newOrigin}
              onChange={(e) => setNewOrigin(e.target.value)}
              placeholder="e.g., childhood, a past relationship, work..."
              className="w-full brutal-input"
            />
          </div>

          <div>
            <label className="block font-bold uppercase text-xs mb-1">
              Intensity level
            </label>
            <div className="flex items-center gap-2">
              {([1, 2, 3, 4, 5] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setNewIntensity(level)}
                  className={`w-12 h-12 brutal-border border-2 font-black text-lg brutal-hover ${
                    newIntensity === level ? 'bg-brutal-yellow' : 'bg-brutal-white'
                  }`}
                >
                  {level}
                </button>
              ))}
              <span className="font-bold text-sm ml-2">
                {newIntensity === 1 && 'Mild'}
                {newIntensity === 2 && 'Moderate'}
                {newIntensity === 3 && 'Strong'}
                {newIntensity === 4 && 'Very strong'}
                {newIntensity === 5 && 'Core belief'}
              </span>
            </div>
          </div>

          <button
            onClick={handleAddBelief}
            disabled={!newBelief.trim()}
            className={`flex items-center gap-2 brutal-btn ${
              !newBelief.trim() ? 'bg-brutal-gray cursor-not-allowed' : 'bg-brutal-green'
            }`}
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Add Belief
          </button>
        </div>
      </div>

      {/* Current beliefs */}
      {critic?.beliefs && critic.beliefs.length > 0 && (
        <div className="mb-6">
          <h3 className="font-black uppercase mb-3">
            Current beliefs ({critic.beliefs.length})
          </h3>
          <div className="space-y-2">
            {critic.beliefs.map((belief) => (
              <div
                key={belief.id}
                className="flex items-start gap-3 p-3 brutal-border border-2 bg-brutal-white"
              >
                <div
                  className={`w-10 h-10 brutal-border border-2 flex items-center justify-center font-black shrink-0 ${
                    belief.intensity >= 4
                      ? 'bg-brutal-red text-brutal-white'
                      : belief.intensity >= 2
                        ? 'bg-brutal-orange'
                        : 'bg-brutal-gray'
                  }`}
                >
                  {belief.intensity}
                </div>
                <div className="flex-1">
                  <p className="font-bold">"{belief.belief}"</p>
                  {belief.origin && (
                    <p className="text-sm text-brutal-black/60 mt-1">Origin: {belief.origin}</p>
                  )}
                </div>
                <button
                  onClick={() => removeBelief(belief.id)}
                  className="p-2 brutal-border border-2 bg-brutal-red text-brutal-white brutal-hover"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Protective intent */}
      <div className="pt-6 border-t-4 border-brutal-black">
        <label className="block font-bold uppercase text-sm mb-2">
          What is your critic trying to protect you from? (optional)
        </label>
        <p className="text-sm font-medium text-brutal-black/60 mb-2">
          Often our inner critic developed to protect us from pain. Understanding this can help with
          self-compassion.
        </p>
        <textarea
          value={critic?.protectiveIntent || ''}
          onChange={(e) => setProtectiveIntent(e.target.value)}
          placeholder="e.g., Failure, rejection, disappointment, looking foolish..."
          className="w-full brutal-textarea"
          rows={2}
        />
      </div>
    </div>
  );
}
