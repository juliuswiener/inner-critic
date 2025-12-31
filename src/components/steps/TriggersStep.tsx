import { useState } from 'react';
import { useCriticStore } from '../../store/criticStore';
import { Plus, Trash2 } from 'lucide-react';

const TRIGGER_EXAMPLES = [
  { situation: 'Making a mistake at work', response: "See? You can't do anything right." },
  { situation: 'Being criticized by someone', response: 'They finally see what I always knew about you.' },
  { situation: 'Comparing myself to others', response: "Look how far behind you are. They're all doing better." },
  { situation: 'Starting something new', response: "Why bother? You'll just fail like always." },
  { situation: 'Receiving a compliment', response: "If they only knew the real you." },
  { situation: 'Feeling happy or successful', response: "Don't get too comfortable. It won't last." },
];

export function TriggersStep() {
  const { critic, addTrigger, removeTrigger } = useCriticStore();
  const [newSituation, setNewSituation] = useState('');
  const [newResponse, setNewResponse] = useState('');

  const handleAddTrigger = () => {
    if (!newSituation.trim() || !newResponse.trim()) return;

    addTrigger({
      situation: newSituation.trim(),
      typicalResponse: newResponse.trim(),
    });

    setNewSituation('');
    setNewResponse('');
  };

  const handleQuickAdd = (trigger: { situation: string; response: string }) => {
    addTrigger({
      situation: trigger.situation,
      typicalResponse: trigger.response,
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-black uppercase mb-2">When does your critic appear?</h2>
      <p className="text-brutal-black/80 font-medium mb-6">
        Identify the situations that trigger your inner critic. Knowing these helps you prepare for
        and recognize critical moments.
      </p>

      {/* Quick add common triggers */}
      <div className="mb-6">
        <p className="font-bold uppercase text-sm mb-2">Common triggers (click to add):</p>
        <div className="grid gap-2">
          {TRIGGER_EXAMPLES.filter(
            (t) => !critic?.triggers.some((existing) => existing.situation === t.situation)
          ).map((trigger, i) => (
            <button
              key={i}
              onClick={() => handleQuickAdd(trigger)}
              className="p-3 brutal-border border-2 bg-brutal-white font-medium text-left brutal-hover"
            >
              <span className="font-black uppercase text-sm">When: </span>
              {trigger.situation}
              <br />
              <span className="font-black uppercase text-sm">Critic says: </span>
              <span className="italic">"{trigger.response}"</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add custom trigger */}
      <div className="brutal-border bg-brutal-white p-4 mb-6">
        <h3 className="font-black uppercase mb-3">Add a trigger</h3>

        <div className="space-y-4">
          <div>
            <label className="block font-bold uppercase text-xs mb-1">
              The triggering situation
            </label>
            <input
              type="text"
              value={newSituation}
              onChange={(e) => setNewSituation(e.target.value)}
              placeholder="When does your critic speak up?"
              className="w-full brutal-input"
            />
          </div>

          <div>
            <label className="block font-bold uppercase text-xs mb-1">
              What does the critic typically say?
            </label>
            <textarea
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              placeholder="The typical message or response..."
              className="w-full brutal-textarea"
              rows={2}
            />
          </div>

          <button
            onClick={handleAddTrigger}
            disabled={!newSituation.trim() || !newResponse.trim()}
            className={`flex items-center gap-2 brutal-btn ${
              !newSituation.trim() || !newResponse.trim()
                ? 'bg-brutal-gray cursor-not-allowed'
                : 'bg-brutal-green'
            }`}
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Add Trigger
          </button>
        </div>
      </div>

      {/* Current triggers */}
      {critic?.triggers && critic.triggers.length > 0 && (
        <div>
          <h3 className="font-black uppercase mb-3">
            Your triggers ({critic.triggers.length})
          </h3>
          <div className="space-y-2">
            {critic.triggers.map((trigger) => (
              <div
                key={trigger.id}
                className="p-4 brutal-border border-2 bg-brutal-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 brutal-border border-2 bg-brutal-purple font-black uppercase text-xs mr-2">
                        Trigger
                      </span>
                      <span className="font-bold">{trigger.situation}</span>
                    </div>
                    <div>
                      <span className="inline-block px-2 py-1 brutal-border border-2 bg-brutal-pink font-black uppercase text-xs mr-2">
                        Response
                      </span>
                      <span className="italic">"{trigger.typicalResponse}"</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTrigger(trigger.id)}
                    className="p-2 brutal-border border-2 bg-brutal-red text-brutal-white brutal-hover shrink-0"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="mt-6 p-4 brutal-border bg-brutal-blue">
        <p className="font-black uppercase text-sm mb-1">Tip</p>
        <p className="font-medium text-sm">
          Pay attention to recurring patterns. Your inner critic often shows up in similar
          situations. Recognizing these patterns is the first step to responding differently.
        </p>
      </div>
    </div>
  );
}
