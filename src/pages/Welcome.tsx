import { useNavigate } from 'react-router-dom';
import { useCriticStore } from '../store/criticStore';
import { ArrowRight, Shield, Eye, MessageCircle } from 'lucide-react';

export function Welcome() {
  const navigate = useNavigate();
  const { critic, initializeCritic, setStep } = useCriticStore();

  const handleStart = () => {
    if (!critic) {
      initializeCritic();
    }
    setStep('appearance');
    navigate('/create');
  };

  const handleContinue = () => {
    navigate('/create');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="w-24 h-24 mx-auto mb-6 brutal-border brutal-shadow-lg bg-brutal-pink flex items-center justify-center">
          <span className="text-brutal-black font-black text-4xl">IC</span>
        </div>
        <h1 className="text-5xl font-black text-brutal-black mb-4 uppercase tracking-tight">
          Meet Your Inner Critic
        </h1>
        <p className="text-xl text-brutal-black/80 max-w-xl mx-auto font-medium">
          Give form to the critical voice in your mind. By making it visible and tangible, you can
          better understand and work with it.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="brutal-card bg-brutal-blue">
          <div className="w-14 h-14 brutal-border bg-brutal-white flex items-center justify-center mb-4">
            <Eye className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black uppercase mb-2">Visualize</h3>
          <p className="text-brutal-black/80 font-medium">
            Create an image of your inner critic. What does this voice look like when given a form?
          </p>
        </div>

        <div className="brutal-card bg-brutal-orange">
          <div className="w-14 h-14 brutal-border bg-brutal-white flex items-center justify-center mb-4">
            <Shield className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black uppercase mb-2">Understand</h3>
          <p className="text-brutal-black/80 font-medium">
            Define the beliefs, triggers, and patterns of your critic. Where do these thoughts come
            from?
          </p>
        </div>

        <div className="brutal-card bg-brutal-green">
          <div className="w-14 h-14 brutal-border bg-brutal-white flex items-center justify-center mb-4">
            <MessageCircle className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black uppercase mb-2">Dialogue</h3>
          <p className="text-brutal-black/80 font-medium">
            Have a conversation with your externalized critic. Hear its voice separately from your
            own.
          </p>
        </div>
      </div>

      <div className="brutal-card bg-brutal-purple mb-8">
        <h3 className="text-xl font-black uppercase mb-4">Why externalize your inner critic?</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="w-8 h-8 brutal-border border-2 bg-brutal-white flex items-center justify-center font-black shrink-0">1</span>
            <span className="font-medium">
              <strong className="font-black uppercase">Distance:</strong> When negative thoughts have a
              face and name, they feel less like "you" and more like something you can observe.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-8 h-8 brutal-border border-2 bg-brutal-white flex items-center justify-center font-black shrink-0">2</span>
            <span className="font-medium">
              <strong className="font-black uppercase">Clarity:</strong> Defining your critic's beliefs
              and patterns helps you recognize them when they appear in daily life.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-8 h-8 brutal-border border-2 bg-brutal-white flex items-center justify-center font-black shrink-0">3</span>
            <span className="font-medium">
              <strong className="font-black uppercase">Understanding:</strong> Often, our inner critic
              developed to protect us. Seeing it clearly can reveal its origins and intentions.
            </span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {critic ? (
          <>
            <button
              onClick={handleContinue}
              className="brutal-btn-primary flex items-center justify-center gap-2"
            >
              Continue Creating
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <button
              onClick={handleStart}
              className="brutal-btn-secondary flex items-center justify-center gap-2"
            >
              Start Fresh
            </button>
          </>
        ) : (
          <button
            onClick={handleStart}
            className="brutal-btn-primary flex items-center justify-center gap-2 text-lg"
          >
            Begin Creating Your Critic
            <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
          </button>
        )}
      </div>

      <p className="text-center text-brutal-black/60 font-medium text-sm mt-8 uppercase">
        This tool is for self-exploration and is not a replacement for therapy or professional mental health support.
      </p>
    </div>
  );
}
