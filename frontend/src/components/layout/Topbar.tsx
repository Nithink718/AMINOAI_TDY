import React, { useEffect, useState } from 'react';
import { Search, LayoutDashboard, FileText, Activity, BookOpen, Settings, Bell, HelpCircle, User, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface TopbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Topbar({ activeTab, setActiveTab }: TopbarProps) {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

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
    batch: 'Batch Analysis',
    reports: 'Reports',
    similarity: 'Similarity Search',
    mutation: 'Mutation Analyzer',
    disease: 'Disease Associations',
    models: 'Model Performance',
    knowledge: 'Knowledge Center',
    settings: 'Settings'
  };

  const getBreadcrumbCategory = () => {
    if (['dashboard', 'analyze', 'batch'].includes(activeTab)) return 'Workspace';
    if (['reports', 'models'].includes(activeTab)) return 'Insights';
    if (['similarity', 'mutation', 'disease'].includes(activeTab)) return 'Discovery';
    if (activeTab === 'knowledge') return 'Knowledge';
    return 'System';
  };

  return (
    <header className="h-20 border-b border-border/50 bg-white/60 backdrop-blur-md flex items-center justify-between px-8 flex-shrink-0 z-10 sticky top-0">
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 text-xs font-medium text-text-3 mb-1">
          <span>Protein Intelligence</span>
          <ChevronRight className="w-3 h-3 text-border-strong" />
          <span>{getBreadcrumbCategory()}</span>
        </div>
        <h1 className="text-2xl font-bold text-text tracking-tight">
          {titleMap[activeTab] || 'AminoAI'}
        </h1>
      </div>
      
      <div className="flex items-center gap-5">
        <div 
          className="relative group cursor-text" 
          onClick={() => setIsPaletteOpen(true)}
        >
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-3 group-hover:text-primary-500 transition-colors" />
          <div className="h-10 w-64 bg-bg-subtle border border-border rounded-lg pl-9 pr-3 text-sm flex items-center justify-between text-text-3 group-hover:border-primary-200 group-hover:bg-white transition-all shadow-sm">
            <span>Search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-text-3 bg-white border border-border shadow-sm">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
        
        <div className="flex items-center gap-3 border-l border-border pl-5">
          <button className="text-text-3 hover:text-text transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-info rounded-full ring-2 ring-white" />
          </button>
          <button className="text-text-3 hover:text-text transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase bg-info-bg text-info rounded-md cursor-help border border-info/20" title="Currently using the Demo Database environment.">
            Demo Data
          </span>
          <Button 
            size="sm" 
            onClick={() => setActiveTab('analyze')}
            className="gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 border-none shadow-md hover:shadow-lg shadow-primary-500/20 text-white transition-all h-10 rounded-lg px-4 font-semibold"
          >
            <Sparkles className="w-4 h-4 text-primary-200" />
            New Analysis
          </Button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-100 to-info-bg border border-border flex items-center justify-center cursor-pointer ml-1 overflow-hidden shadow-sm">
            <User className="w-5 h-5 text-primary-700" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPaletteOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-text/10 backdrop-blur-sm" 
            onClick={() => setIsPaletteOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center px-5 py-4 border-b border-border/50 bg-bg/30">
                <Search className="w-5 h-5 text-primary-500 mr-3" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search proteins, analyses, or tools..." 
                  className="flex-1 bg-transparent border-none outline-none text-lg text-text placeholder:text-text-3 font-medium"
                />
                <kbd className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium text-text-3 bg-white border border-border shadow-sm ml-3">
                  ESC
                </kbd>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-3">
                <div className="px-3 py-2 text-[10px] font-bold text-text-3 tracking-widest uppercase">Quick Actions</div>
                {[
                  { id: 'analyze', label: 'Analyze new protein sequence', icon: Activity },
                  { id: 'batch', label: 'Upload FASTA for batch processing', icon: FileText },
                  { id: 'reports', label: 'View generated reports', icon: FileText },
                ].map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsPaletteOpen(false); }}
                    className="flex items-center justify-between px-4 py-3 mx-1 my-1 rounded-xl hover:bg-primary-50 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center text-text group-hover:text-primary-700 font-medium text-sm">
                      <div className="w-8 h-8 rounded-lg bg-bg-subtle flex items-center justify-center mr-4 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-primary-100 transition-all">
                        <item.icon className="w-4 h-4 text-text-3 group-hover:text-primary-600" />
                      </div>
                      {item.label}
                    </div>
                    <span className="text-xs text-primary-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-primary-100/50 px-2 py-1 rounded">Enter</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
