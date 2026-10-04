import React from 'react';
import { cn } from '../../lib/utils';
import { ClassChip } from './ClassChip';

interface ProbabilityBarsProps {
  probabilities: Record<string, number>;
  predictedClass: string;
}

export function ProbabilityBars({ probabilities, predictedClass }: ProbabilityBarsProps) {
  // Sort entries descending
  const sorted = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      {sorted.map(([className, prob]) => {
        const isPredicted = className === predictedClass;
        
        return (
          <div key={className} className="space-y-1.5">
            <div className="flex justify-between items-center text-sm font-medium">
              {isPredicted ? (
                <ClassChip name={className} />
              ) : (
                <span className="text-text-2 capitalize">{className}</span>
              )}
              <span className={isPredicted ? "text-text tabular-nums" : "text-text-3 tabular-nums"}>
                {prob.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  isPredicted ? "bg-primary-600" : "bg-border-strong"
                )}
                style={{ width: `${prob}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
