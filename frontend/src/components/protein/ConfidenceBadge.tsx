import React from 'react';
import { cn } from '../../lib/utils';

interface ConfidenceBadgeProps {
  confidence: number; // 0 to 100
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  let level = "Low";
  let color = "text-danger bg-danger-bg border-danger/20";
  
  if (confidence >= 80) {
    level = "High";
    color = "text-success bg-success-bg border-success/20";
  } else if (confidence >= 50) {
    level = "Medium";
    color = "text-warning bg-warning-bg border-warning/20";
  }

  return (
    <div className={cn("inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium", color)}>
      {level} Confidence
    </div>
  );
}
