import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { 
  Activity, Search, Stethoscope, BarChart3, BookOpen, Settings,
  Hexagon, FileText, UploadCloud, Cpu, Layers
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
        { id: 'batch', label: 'Batch Analysis', icon: UploadCloud },
      ]
    },
    {
      label: 'INSIGHTS',
      items: [
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'models', label: 'Model Performance', icon: BarChart3 },
      ]
    },
    {
      label: 'DISCOVERY',
      items: [
        { id: 'similarity', label: 'Similarity Search', icon: Search },
        { id: 'mutation', label: 'Mutation Analyzer', icon: Layers },
        { id: 'disease', label: 'Disease Associations', icon: Stethoscope },
      ]
    },
    {
      label: 'KNOWLEDGE',
      items: [
        { id: 'knowledge', label: 'Knowledge Center', icon: BookOpen },
      ]
    }
  ];

  return (
    <aside className="w-[260px] h-screen border-r border-border bg-white/40 backdrop-blur-xl flex flex-col flex-shrink-0 z-20 relative">
      <div className="h-20 flex flex-col justify-center px-6 border-b border-border/50">
        <div className="flex items-center gap-3 text-primary-600 mb-1">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 border border-primary-100">
            <Hexagon className="w-5 h-5 text-primary-600 absolute" />
            <div className="w-1.5 h-1.5 bg-info rounded-full absolute" />
          </div>
          <span className="font-bold text-xl text-text tracking-tight">AminoAI</span>
        </div>
        <div className="text-[10px] font-medium text-text-3 uppercase tracking-widest ml-[44px]">
          Protein Intelligence
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-3 text-[11px] font-semibold text-text-3 tracking-wider">
              {group.label}
            </div>
            <div className="space-y-1 relative">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full relative flex items-center gap-3 px-3 h-9 rounded-lg text-sm font-medium transition-all duration-200 group",
                      isActive ? "text-primary-700" : "text-text-2 hover:text-text"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-primary-50 rounded-lg border border-primary-100/50"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeLine"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary-500 rounded-r-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-3 w-full">
                      <item.icon className={cn(
                        "w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110",
                        isActive ? "text-primary-600" : "text-text-3 group-hover:text-text-2"
                      )} />
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border/50 mt-auto bg-bg/30">
        <div className="mb-2 relative">
           <button
             onClick={() => setActiveTab('settings')}
             className={cn(
               "w-full relative flex items-center gap-3 px-3 h-9 rounded-lg text-sm font-medium transition-all duration-200 group",
               activeTab === 'settings' ? "text-primary-700 bg-primary-50" : "text-text-2 hover:text-text hover:bg-black/5"
             )}
           >
             {activeTab === 'settings' && (
                <motion.div
                  layoutId="activeLine"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary-500 rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
             )}
             <Settings className={cn("w-[18px] h-[18px]", activeTab === 'settings' ? "text-primary-600" : "text-text-3")} />
             Settings
           </button>
        </div>
        <div className="px-4 py-3 rounded-xl bg-white border border-border/60 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-text">RandomForest</span>
            <span className="text-[10px] text-text-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              v1.2.0 • F1: 0.80
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
