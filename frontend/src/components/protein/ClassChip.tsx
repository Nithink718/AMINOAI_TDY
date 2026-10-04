import React from 'react';
import { cn } from '../../lib/utils';

interface ClassChipProps {
  name: string;
}

export function ClassChip({ name }: ClassChipProps) {
  const normalized = name.toLowerCase();
  
  const classColors: Record<string, string> = {
    enzyme: "class-enzyme",
    transport: "class-transport",
    structural: "class-structural",
    regulatory: "class-regulatory",
    defense: "class-defense"
  };

  const colorClass = classColors[normalized] || "bg-bg-subtle text-text-2";

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase", colorClass)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {name}
    </span>
  );
}
