'use client'

// ============================================================
// SECTION: StepIndicator — مؤشر تقدم الخطوات
// ============================================================

interface Step {
  number: number
  label:  string
}

interface StepIndicatorProps {
  currentStep: number
  steps:       Step[]
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const done    = step.number < currentStep
        const active  = step.number === currentStep
        const pending = step.number > currentStep

        return (
          <div key={step.number} className="flex items-center">

            {/* الدائرة + الرقم */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={`
                flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all
                ${done    ? 'bg-emerald-500 text-white'                              : ''}
                ${active  ? 'text-white ring-4 ring-offset-1'                        : ''}
                ${pending ? 'border-2 border-gray-200 bg-white text-gray-400'        : ''}
              `}
              style={active ? { backgroundColor: 'var(--color-primary)',
                               ringColor: 'var(--color-primary)' } : {}}
              >
                {done ? '✓' : step.number}
              </div>
              <span className={`
                hidden sm:block text-[11px] font-medium whitespace-nowrap
                ${active  ? 'text-gray-800' : 'text-gray-400'}
              `}>
                {step.label}
              </span>
            </div>

            {/* الخط الرابط */}
            {idx < steps.length - 1 && (
              <div className={`
                mx-2 mb-5 h-0.5 w-10 sm:w-16 transition-colors
                ${step.number < currentStep ? 'bg-emerald-400' : 'bg-gray-200'}
              `} />
            )}

          </div>
        )
      })}
    </div>
  )
}
