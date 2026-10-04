import React from 'react';
import { cn } from '../../lib/utils';
import { 
  Activity, 
  Search, 
  Stethoscope, 
  BarChart3, 
  BookOpen, 
  Settings,
  Hexagon,
  FileText,
  UploadCloud
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navGroups = [
    {
      label: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Overview', icon: Activity },
        { id: 'analyze', label: 'Analyze Protein', icon: Hexagon },
        { id: 'batch', label: 'Batch (FASTA)', icon: UploadCloud },
        { id: 'reports', label: 'Reports', icon: FileText },
      ]
    },
    {
      label: 'TOOLS',
      items: [
        { id: 'similarity', label: 'Similarity Search', icon: Search },
        { id: 'mutation', label: 'Mutation Analyzer', icon: Activity },
        { id: 'disease', label: 'Disease Associations', icon: Stethoscope },
      ]
    },
    {
      label: 'INSIGHTS',
      items: [
        { id: 'models', label: 'Model Performance', icon: BarChart3 },
        { id: 'knowledge', label: 'Knowledge Center', icon: BookOpen },
      ]
    }
  ];

  return (
    <aside className="w-[248px] h-screen border-r border-border bg-bg-subtle flex flex-col flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3 text-primary-600">
          <Hexagon className="w-6 h-6 fill-primary-600/20" />
          <span className="font-semibold text-lg text-text tracking-tight">AminoAI</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-2 text-xs font-semibold text-text-3 tracking-wider">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 h-9 rounded-md text-sm font-medium transition-colors",
                    activeTab === item.id 
                      ? "bg-primary-50 text-primary-700 border-l-2 border-primary-600 rounded-l-none pl-[10px]" 
                      : "text-text-2 hover:text-text hover:bg-bg-subtle"
                  )}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 h-9 rounded-md text-sm font-medium transition-colors mb-4",
            activeTab === 'settings' 
              ? "bg-primary-50 text-primary-700 border-l-2 border-primary-600 rounded-l-none pl-[10px]" 
              : "text-text-2 hover:text-text hover:bg-bg-subtle"
          )}
        >
          <Settings className="w-[18px] h-[18px]" />
          Settings
        </button>
        <div className="px-3 py-3 rounded-lg bg-surface border border-border text-xs text-text-2">
          <div className="font-medium text-text mb-1">Model: RandomForest</div>
          <div className="flex justify-between items-center text-text-3">
            <span>v1.2.0</span>
            <span>F1: 0.80</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
