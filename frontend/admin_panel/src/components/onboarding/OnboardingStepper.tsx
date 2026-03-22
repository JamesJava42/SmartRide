import type { OnboardingStatus } from '../../types/onboarding';

type OnboardingStepperProps = {
  status: OnboardingStatus;
};

type StepState = 'completed' | 'active' | 'pending' | 'rejected';

type Step = {
  key: string;
  label: string;
};

const BASE_STEPS: Step[] = [
  { key: 'DRAFT', label: 'Draft' },
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
];

const STATUS_ORDER: Record<OnboardingStatus, number> = {
  DRAFT: 0,
  SUBMITTED: 1,
  UNDER_REVIEW: 2,
  DOCS_PENDING: 3,
  APPROVED: 3,
  REJECTED: 3,
};

function getDecisionLabel(status: OnboardingStatus): string {
  switch (status) {
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'DOCS_PENDING':
      return 'Docs Pending';
    default:
      return 'Decision';
  }
}

function stepCircleClass(state: StepState): string {
  switch (state) {
    case 'completed':
      return 'bg-emerald-500 border-emerald-500 text-white';
    case 'active':
      return 'bg-accent border-accent text-white';
    case 'rejected':
      return 'bg-red-500 border-red-500 text-white';
    default:
      return 'bg-white border-zinc-300 text-zinc-400';
  }
}

function stepLabelClass(state: StepState): string {
  switch (state) {
    case 'completed':
      return 'text-emerald-700 font-semibold';
    case 'active':
      return 'text-accent font-semibold';
    case 'rejected':
      return 'text-red-600 font-semibold';
    default:
      return 'text-zinc-400';
  }
}

function connectorClass(filled: boolean): string {
  return filled ? 'bg-emerald-400' : 'bg-zinc-200';
}

export function OnboardingStepper({ status }: OnboardingStepperProps) {
  const currentOrder = STATUS_ORDER[status] ?? 0;

  const decisionStep: Step = {
    key: 'DECISION',
    label: getDecisionLabel(status),
  };

  const steps: Step[] = [...BASE_STEPS, decisionStep];

  function getState(stepKey: string, stepIndex: number): StepState {
    if (stepKey === 'DECISION') {
      if (currentOrder < 3) return 'pending';
      if (status === 'REJECTED') return 'rejected';
      return 'active';
    }
    if (stepIndex < currentOrder) return 'completed';
    if (stepIndex === currentOrder) return 'active';
    return 'pending';
  }

  return (
    <div className="flex items-center overflow-x-auto">
      {steps.map((step, idx) => {
        const state = getState(step.key, idx);
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.key} className="flex min-w-0 flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {/* Connector before */}
              {idx > 0 && (
                <div
                  className={`h-0.5 flex-1 ${connectorClass(idx <= currentOrder)}`}
                />
              )}

              {/* Circle */}
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${stepCircleClass(state)}`}
              >
                {state === 'completed' ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Connector after */}
              {!isLast && (
                <div
                  className={`h-0.5 flex-1 ${connectorClass(idx < currentOrder)}`}
                />
              )}
            </div>

            {/* Label */}
            <span className={`mt-2 text-center text-xs ${stepLabelClass(state)}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
