import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Step {
  key: string;
  title: string;
  description?: string;
}

interface SchemeWizardProps {
  steps: Step[];
  schemeType: 'mpt' | 'iou' | 'nft' | 'credentials';
  children: ReactNode;
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
}

const schemeColors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  mpt: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    gradient: 'from-purple-500/50 to-purple-500/0',
  },
  iou: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    gradient: 'from-blue-500/50 to-blue-500/0',
  },
  nft: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    gradient: 'from-pink-500/50 to-pink-500/0',
  },
  credentials: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    gradient: 'from-amber-500/50 to-amber-500/0',
  },
};

export function SchemeWizard({
  steps,
  schemeType,
  children,
  currentStep,
  onStepChange,
  onComplete,
}: SchemeWizardProps) {
  const { t } = useTranslation();
  const colors = schemeColors[schemeType];

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handlePrevious = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      onStepChange(currentStep + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="glass-card border border-border/50 rounded-2xl p-6">
        {/* Step counter */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {t('scplus.wizard.step')} {currentStep + 1} {t('scplus.wizard.of')} {steps.length}
          </span>
          <span className="text-xs text-muted-foreground/60 italic">
            {t('scplus.wizard.refreshWarning')}
          </span>
        </div>

        {/* Step indicator row - each step evenly distributed */}
        <div 
          className="grid w-full"
          style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
        >
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div 
                key={step.key} 
                className="flex items-center justify-center relative"
              >
                {/* Connecting line (except last step) - starts from edge of circle, not center */}
                {index < steps.length - 1 && (
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-border/50"
                    style={{ 
                      left: 'calc(50% + 1.25rem)',
                      width: 'calc(100% - 2.5rem)'
                    }}
                  >
                    <div
                      className={`
                        absolute inset-y-0 left-0 transition-all duration-500 ease-out
                        ${isCompleted ? `${colors.text.replace('text-', 'bg-')} w-full` : 'w-0'}
                      `}
                    />
                  </div>
                )}

                {/* Step circle - centered */}
                <button
                  onClick={() => onStepChange(index)}
                  className={`
                    relative z-10 flex items-center justify-center w-10 h-10 rounded-full
                    transition-all duration-300 flex-shrink-0
                    ${isCompleted
                      ? `${colors.bg} ${colors.border} border-2`
                      : isCurrent
                        ? `${colors.bg} ${colors.border} border-2 ring-2 ring-offset-2 ring-offset-background ${colors.text.replace('text-', 'ring-')}`
                        : 'bg-muted/30 border border-border/50'
                    }
                  `}
                  aria-label={step.title}
                >
                  {isCompleted ? (
                    <Check className={`w-5 h-5 ${colors.text}`} />
                  ) : (
                    <span
                      className={`
                        text-sm font-semibold
                        ${isCurrent ? colors.text : 'text-muted-foreground'}
                      `}
                    >
                      {index + 1}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Step titles row - evenly distributed with auto wrap */}
        <div 
          className="grid w-full mt-4"
          style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
        >
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div
                key={`title-${step.key}`}
                className="flex flex-col items-center px-1"
              >
                <p
                  className={`
                    text-xs text-center leading-tight transition-colors duration-200
                    ${isCurrent ? colors.text + ' font-medium' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                  `}
                >
                  {step.title}
                </p>
                {step.description && isCurrent && (
                  <p className="text-xs text-center text-muted-foreground/70 mt-0.5 leading-tight">
                    {step.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className="glass-card border border-border/50 rounded-2xl p-6 relative"
        style={{
          borderColor: `var(--${schemeType}-color, hsl(var(--border)))`,
        }}
      >
        {/* Gradient accent line at top */}
        <div
          className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.gradient.replace('/50', '/30')} to-transparent`}
        />

        {/* Form content */}
        <div className="min-h-[200px]">{children}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('scplus.wizard.prev')}
        </Button>

        <Button
          onClick={handleNext}
          className={`flex-1 btn-glow ${colors.bg} hover:${colors.bg.replace('/10', '/20')} ${colors.text} border ${colors.border}`}
        >
          {isLastStep ? t('scplus.wizard.complete') : t('scplus.wizard.next')}
          {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
