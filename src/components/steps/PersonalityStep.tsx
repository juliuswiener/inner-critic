import { useCriticStore } from '../../store/criticStore';

const VOICE_SUGGESTIONS = [
  'Cold and distant',
  'Anxious and rushed',
  'Disappointed and sighing',
  'Loud and aggressive',
  'Quiet but cutting',
  'Sarcastic and mocking',
];

const EMOTION_SUGGESTIONS = [
  'Disappointment',
  'Contempt',
  'Anxiety',
  'Anger',
  'Disgust',
  'Frustration',
  'Fear',
];

const STYLE_SUGGESTIONS = [
  'Uses "always" and "never" statements',
  'Asks rhetorical questions',
  'Compares to others',
  'References past failures',
  'Uses dismissive language',
  'Makes catastrophic predictions',
];

export function PersonalityStep() {
  const { critic, updatePersonality, addCatchphrase, removeCatchphrase } = useCriticStore();
  const personality = critic?.personality;

  if (!personality) return null;

  return (
    <div>
      <h2 className="text-3xl font-black uppercase mb-2">Define your critic's personality</h2>
      <p className="text-brutal-black/80 font-medium mb-6">
        How does your inner critic communicate? Understanding its voice helps you recognize it.
      </p>

      {/* Name */}
      <div className="mb-6">
        <label className="block font-bold uppercase text-sm mb-2">
          Give your critic a name
        </label>
        <input
          type="text"
          value={personality.name}
          onChange={(e) => updatePersonality({ name: e.target.value })}
          placeholder="The Judge, The Perfectionist, The Worrier..."
          className="w-full brutal-input"
        />
      </div>

      {/* Voice */}
      <div className="mb-6">
        <label className="block font-bold uppercase text-sm mb-2">
          How does it speak? (tone of voice)
        </label>
        <input
          type="text"
          value={personality.voice}
          onChange={(e) => updatePersonality({ voice: e.target.value })}
          placeholder="Describe the tone..."
          className="w-full brutal-input mb-3"
        />
        <div className="flex flex-wrap gap-2">
          {VOICE_SUGGESTIONS.map((voice) => (
            <button
              key={voice}
              onClick={() => updatePersonality({ voice })}
              className={`px-3 py-2 brutal-border border-2 font-bold text-sm brutal-hover ${
                personality.voice === voice ? 'bg-brutal-yellow' : 'bg-brutal-white'
              }`}
            >
              {voice}
            </button>
          ))}
        </div>
      </div>

      {/* Primary emotion */}
      <div className="mb-6">
        <label className="block font-bold uppercase text-sm mb-2">
          What emotion does it primarily express?
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOTION_SUGGESTIONS.map((emotion) => (
            <button
              key={emotion}
              onClick={() => updatePersonality({ primaryEmotion: emotion })}
              className={`px-4 py-2 brutal-border border-2 font-bold brutal-hover ${
                personality.primaryEmotion === emotion ? 'bg-brutal-yellow' : 'bg-brutal-white'
              }`}
            >
              {emotion}
            </button>
          ))}
        </div>
      </div>

      {/* Communication style */}
      <div className="mb-6">
        <label className="block font-bold uppercase text-sm mb-2">
          Communication patterns (select all that apply)
        </label>
        <input
          type="text"
          value={personality.communicationStyle}
          onChange={(e) => updatePersonality({ communicationStyle: e.target.value })}
          placeholder="How does it structure its criticism?"
          className="w-full brutal-input mb-3"
        />
        <div className="flex flex-wrap gap-2">
          {STYLE_SUGGESTIONS.map((style) => (
            <button
              key={style}
              onClick={() => {
                const current = personality.communicationStyle;
                if (current.includes(style)) {
                  updatePersonality({
                    communicationStyle: current
                      .replace(style, '')
                      .replace(/,\s*,/g, ',')
                      .replace(/^,\s*|,\s*$/g, ''),
                  });
                } else {
                  updatePersonality({
                    communicationStyle: current ? `${current}, ${style}` : style,
                  });
                }
              }}
              className={`px-3 py-2 brutal-border border-2 font-bold text-sm brutal-hover ${
                personality.communicationStyle.includes(style)
                  ? 'bg-brutal-yellow'
                  : 'bg-brutal-white'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Catchphrases */}
      <div>
        <label className="block font-bold uppercase text-sm mb-2">
          Common phrases your critic uses
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Add a phrase and press Enter..."
            className="flex-1 brutal-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  addCatchphrase(value);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
        </div>
        {critic?.catchphrases && critic.catchphrases.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {critic.catchphrases.map((phrase, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-3 py-2 brutal-border border-2 bg-brutal-white font-bold text-sm"
              >
                "{phrase}"
                <button
                  onClick={() => removeCatchphrase(phrase)}
                  className="w-6 h-6 brutal-border border-2 bg-brutal-red text-brutal-white font-black flex items-center justify-center brutal-hover"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-sm font-medium mt-3 text-brutal-black/60">
          Examples: "You'll never be good enough", "Why bother trying", "Everyone is judging you"
        </p>
      </div>
    </div>
  );
}
