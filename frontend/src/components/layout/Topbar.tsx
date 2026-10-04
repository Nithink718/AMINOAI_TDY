import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '../ui/Button';

interface TopbarProps {
  activeTab: string;
}

export function Topbar({ activeTab }: TopbarProps) {
  const titleMap: Record<string, string> = {
    dashboard: 'Overview',
    analyze: 'Analyze Protein',
    batch: 'Batch Analysis (FASTA)',
    reports: 'Reports',
    similarity: 'Similarity Search',
    mutation: 'Mutation Analyzer',
    disease: 'Disease Associations',
    models: 'Model Performance',
    knowledge: 'Knowledge Center',
    settings: 'Settings'
  };

  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-8 flex-shrink-0">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-text tracking-tight">
          {titleMap[activeTab] || 'AminoAI'}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
          <input 
            type="text" 
            placeholder="Search (⌘K)" 
            className="h-9 w-64 bg-surface-muted border-none rounded-md pl-9 pr-3 text-sm focus:ring-2 focus:ring-primary-600/20 focus:outline-none transition-shadow text-text placeholder:text-text-3"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-md">
            Demo Data
          </span>
          <Button size="sm">New Analysis</Button>
        </div>
      </div>
    </header>
  );
}
