import React, { useEffect, useRef, useState } from 'react';
import { Search, LayoutDashboard, FileText, Activity, BookOpen, Settings } from 'lucide-react';
import { Button } from '../ui/Button';

interface TopbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Topbar({ activeTab, setActiveTab }: TopbarProps) {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setIsPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
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
        <div className="relative" onClick={() => setIsPaletteOpen(true)}>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
          <input 
            type="text" 
            placeholder="Search (⌘K)" 
            readOnly
            className="h-9 w-64 bg-surface-muted border-none rounded-md pl-9 pr-3 text-sm focus:ring-2 focus:ring-primary-600/20 focus:outline-none transition-shadow text-text placeholder:text-text-3 cursor-text"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-md cursor-help" title="Currently using the Demo Database environment.">
            Demo Data
          </span>
          <Button size="sm" onClick={() => setActiveTab('analyze')}>New Analysis</Button>
        </div>
      </div>

      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-text/20 backdrop-blur-sm" onClick={() => setIsPaletteOpen(false)}>
          <div className="bg-surface w-full max-w-2xl rounded-xl shadow-2xl border border-border overflow-hidden animate-fade-rise" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center px-4 py-4 border-b border-border">
              <Search className="w-6 h-6 text-text-3 mr-3" />
              <input 
                type="text" 
                autoFocus
                placeholder="Search tools..." 
                className="flex-1 bg-transparent border-none outline-none text-lg text-text placeholder:text-text-3"
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <div className="px-3 py-2 text-xs font-semibold text-text-3 tracking-widest uppercase">Workspace</div>
              {[
                { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
                { id: 'analyze', label: 'Analyze Protein', icon: Activity },
                { id: 'batch', label: 'Batch (FASTA) Upload', icon: FileText },
                { id: 'reports', label: 'Analysis Reports', icon: FileText },
              ].map(item => (
                <div 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsPaletteOpen(false); }}
                  className="flex items-center justify-between px-3 py-3 mx-1 my-1 rounded-lg hover:bg-primary-50 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center text-text group-hover:text-primary-700 font-medium">
                    <item.icon className="w-5 h-5 mr-3 text-text-3 group-hover:text-primary-600" />
                    {item.label}
                  </div>
                  <span className="text-xs text-text-3 font-mono opacity-0 group-hover:opacity-100 transition-opacity">Enter</span>
                </div>
              ))}
              
              <div className="px-3 py-2 mt-2 text-xs font-semibold text-text-3 tracking-widest uppercase">Tools & Insights</div>
              {[
                { id: 'similarity', label: 'Similarity Search', icon: Search },
                { id: 'mutation', label: 'Mutation Analyzer', icon: Activity },
                { id: 'knowledge', label: 'Knowledge Center', icon: BookOpen },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(item => (
                <div 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsPaletteOpen(false); }}
                  className="flex items-center justify-between px-3 py-3 mx-1 my-1 rounded-lg hover:bg-primary-50 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center text-text group-hover:text-primary-700 font-medium">
                    <item.icon className="w-5 h-5 mr-3 text-text-3 group-hover:text-primary-600" />
                    {item.label}
                  </div>
                  <span className="text-xs text-text-3 font-mono opacity-0 group-hover:opacity-100 transition-opacity">Enter</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
