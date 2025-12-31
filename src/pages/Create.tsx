import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCriticStore } from '../store/criticStore';
import { AppearanceStep } from '../components/steps/AppearanceStep';
import { PersonalityStep } from '../components/steps/PersonalityStep';
import { BeliefsStep } from '../components/steps/BeliefsStep';
import { TriggersStep } from '../components/steps/TriggersStep';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

const STEPS = ['appearance', 'personality', 'beliefs', 'triggers'] as const;
type Step = (typeof STEPS)[number];

const STEP_LABELS: Record<Step, string> = {
  appearance: 'Look',
  personality: 'Voice',
  beliefs: 'Beliefs',
  triggers: 'Triggers',
};

const STEP_COLORS: Record<Step, string> = {
  appearance: 'bg-brutal-pink',
  personality: 'bg-brutal-blue',
  beliefs: 'bg-brutal-orange',
  triggers: 'bg-brutal-green',
};

export function Create() {
  const navigate = useNavigate();
  const { critic, currentStep, setStep } = useCriticStore();
  const [activeStep, setActiveStep] = useState<Step>(
    currentStep === 'welcome' || currentStep === 'chat' ? 'appearance' : (currentStep as Step)
  );

  if (!critic) {
    navigate('/');
    return null;
  }

  const currentIndex = STEPS.indexOf(activeStep);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STEPS.length - 1;

  const goNext = () => {
    if (!isLast) {
      const nextStep = STEPS[currentIndex + 1];
      setActiveStep(nextStep);
      setStep(nextStep);
    } else {
      setStep('chat');
      navigate('/chat');
    }
  };

  const goPrev = () => {
    if (!isFirst) {
      const prevStep = STEPS[currentIndex - 1];
      setActiveStep(prevStep);
      setStep(prevStep);
    }
  };

  const goToStep = (step: Step) => {
    setActiveStep(step);
    setStep(step);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = step === activeStep;

            return (
              <button
                key={step}
                onClick={() => goToStep(step)}
                className={`flex items-center gap-2 px-4 py-2 brutal-border border-2 brutal-hover ${
                  isCurrent
                    ? STEP_COLORS[step]
                    : isCompleted
                      ? 'bg-brutal-green'
                      : 'bg-brutal-white'
                }`}
              >
                <span
                  className={`w-7 h-7 brutal-border border-2 flex items-center justify-center text-sm font-black ${
                    isCurrent || isCompleted ? 'bg-brutal-white' : 'bg-brutal-gray'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : index + 1}
                </span>
                <span className="hidden sm:inline font-bold uppercase text-sm">{STEP_LABELS[step]}</span>
              </button>
            );
          })}
        </div>
        <div className="h-4 brutal-border bg-brutal-white overflow-hidden">
          <div
            className="h-full bg-brutal-yellow transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className={`brutal-card mb-6 ${STEP_COLORS[activeStep]}`}>
        {activeStep === 'appearance' && <AppearanceStep />}
        {activeStep === 'personality' && <PersonalityStep />}
        {activeStep === 'beliefs' && <BeliefsStep />}
        {activeStep === 'triggers' && <TriggersStep />}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className={`flex items-center gap-2 brutal-btn ${
            isFirst
              ? 'bg-brutal-gray cursor-not-allowed opacity-50'
              : 'bg-brutal-white'
          }`}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          Previous
        </button>

        <button
          onClick={goNext}
          className="brutal-btn-primary flex items-center gap-2"
        >
          {isLast ? 'Start Chatting' : 'Next'}
          <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
