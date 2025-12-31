import { useState } from 'react';
import { useCriticStore } from '../../store/criticStore';
import { Sparkles, Loader2, ImageIcon } from 'lucide-react';
import { generateCriticImage } from '../../services/openrouter';

const APPEARANCE_PROMPTS = [
  'A shadowy figure with sharp features, always looking down disapprovingly',
  'An older version of myself, tired and disappointed',
  'A faceless entity in formal business attire, cold and judgmental',
  'A creature made of sharp angles and harsh lines, representing perfectionism',
  'A ghostly figure that resembles a strict parent or teacher',
];

export function AppearanceStep() {
  const { critic, updateAppearance } = useCriticStore();
  const [prompt, setPrompt] = useState(critic?.appearance.imagePrompt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateCriticImage(prompt);
      updateAppearance({ imageUrl, imagePrompt: prompt });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div>
      <h2 className="text-3xl font-black uppercase mb-2">What does your critic look like?</h2>
      <p className="text-brutal-black/80 font-medium mb-6">
        Describe the appearance of your inner critic. This helps externalize and visualize the
        critical voice in your mind.
      </p>

      {/* Current image display */}
      {critic?.appearance.imageUrl && (
        <div className="mb-6">
          <div className="relative aspect-square max-w-sm mx-auto brutal-border brutal-shadow overflow-hidden bg-brutal-white">
            <img
              src={critic.appearance.imageUrl}
              alt="Your inner critic"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-center font-bold uppercase text-sm mt-3">Your inner critic's appearance</p>
        </div>
      )}

      {/* Prompt input */}
      <div className="mb-4">
        <label className="block font-bold uppercase text-sm mb-2">
          Describe your critic's appearance
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A tall, looming figure with cold eyes that seems to know all my failures..."
          className="w-full brutal-textarea"
          rows={3}
        />
      </div>

      {/* Suggestions */}
      <div className="mb-6">
        <p className="font-bold uppercase text-sm mb-2">Or try one of these:</p>
        <div className="flex flex-wrap gap-2">
          {APPEARANCE_PROMPTS.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handlePromptClick(suggestion)}
              className={`text-sm px-3 py-2 brutal-border border-2 brutal-hover ${
                prompt === suggestion ? 'bg-brutal-yellow' : 'bg-brutal-white'
              }`}
            >
              {suggestion.length > 40 ? suggestion.slice(0, 40) + '...' : suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className={`w-full flex items-center justify-center gap-2 brutal-btn ${
          isGenerating || !prompt.trim()
            ? 'bg-brutal-gray cursor-not-allowed'
            : 'bg-brutal-yellow'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating image...
          </>
        ) : critic?.appearance.imageUrl ? (
          <>
            <Sparkles className="w-5 h-5" strokeWidth={2.5} />
            Regenerate Image
          </>
        ) : (
          <>
            <ImageIcon className="w-5 h-5" strokeWidth={2.5} />
            Generate Image
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 brutal-border bg-brutal-red text-brutal-white font-bold">
          {error}
        </div>
      )}

      {/* Physical description fallback */}
      <div className="mt-6 pt-6 border-t-4 border-brutal-black">
        <p className="font-bold uppercase text-sm mb-2">
          Or describe in words (if you prefer not to generate an image):
        </p>
        <textarea
          value={critic?.appearance.physicalDescription || ''}
          onChange={(e) => updateAppearance({ physicalDescription: e.target.value })}
          placeholder="Describe the physical appearance, posture, clothing, expressions..."
          className="w-full brutal-textarea"
          rows={2}
        />
      </div>
    </div>
  );
}
