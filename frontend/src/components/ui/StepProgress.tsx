import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface StepProgressProps {
  steps: string[];
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-3xl mx-auto gap-4 p-6 bg-surface border border-border rounded-2xl shadow-sm">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step}>
            <div className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
              ) : (
                <Circle className="w-5 h-5 text-border-strong" />
              )}
              <span className={cn(
                "text-sm font-medium tracking-tight transition-colors",
                isCompleted ? "text-text" : isCurrent ? "text-primary-600" : "text-text-3"
              )}>
                {step}
              </span>
            </div>
            {!isLast && (
              <div className={cn(
                "hidden md:block h-[2px] flex-1 min-w-[20px] max-w-[60px]",
                isCompleted ? "bg-success/50" : "bg-border"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
