type Props = {
  steps: string[]
  currentStep: number
}

export default function WizardStepper({ steps, currentStep }: Props) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < currentStep
        const isCurrent = stepNum === currentStep
        const isLast = i === steps.length - 1

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                isCompleted ? 'bg-success border-success text-white' :
                isCurrent ? 'bg-violet-600 border-violet-600 text-white' :
                'bg-transparent border-white/15 text-white/25'
              }`}>
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : stepNum}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                isCurrent ? 'text-white' : isCompleted ? 'text-success' : 'text-white/25'
              }`}>{label}</span>
            </div>
            {!isLast && (
              <div className={`h-px flex-1 mx-3 ${isCompleted ? 'bg-success/40' : 'bg-white/8'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
