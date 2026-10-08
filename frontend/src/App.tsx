import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { SequenceInput } from './components/protein/SequenceInput';
import { StepProgress } from './components/ui/StepProgress';
import { ClassChip } from './components/protein/ClassChip';
import { ConfidenceBadge } from './components/protein/ConfidenceBadge';
import { ProbabilityBars } from './components/protein/ProbabilityBars';
import { ProteinViewer3D } from './components/protein/ProteinViewer3D';
import { BioAssistant } from './components/chat/BioAssistant';
import { FileText, Search, Activity, Copy, UploadCloud, Stethoscope, BookOpen, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area } from 'recharts';
import { motion, useAnimation } from 'framer-motion';
import MouseParticles from './components/MouseParticles';

// Simple count up hook for the KPIs
const CountUp = ({ end, duration = 2 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return <>{count.toLocaleString()}</>;
};

function App() {
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sequence, setSequence] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  
  // Batch Upload State
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchComplete, setBatchComplete] = useState(false);
  
  // Tool States
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showSimResults, setShowSimResults] = useState(false);
  const [showMutResults, setShowMutResults] = useState(false);
  const [showDiseaseResults, setShowDiseaseResults] = useState(false);
  
  // Settings States
  const [settings, setSettings] = useState({
    hardwareAcceleration: true,
    autoGeneratePDF: false,
    verboseLogging: false,
    endpointUrl: 'http://127.0.0.1:8000/api',
    uniprotToken: ''
  });
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  
  const handleAnalyze = async () => {
    if (!sequence) return;
    setIsAnalyzing(true);
    setAnalysisStep(0);
    
    setTimeout(() => setAnalysisStep(1), 600);
    setTimeout(() => setAnalysisStep(2), 1200);
    setTimeout(() => setAnalysisStep(3), 1800);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence })
      });
      
      if (!response.ok) {
        throw new Error("Backend prediction failed.");
      }
      
      const data = await response.json();
      
      const descriptions: Record<string, string> = {
        'Enzyme': 'Catalyzes biochemical reactions, accelerating metabolic processes within the cell.',
        'Transport Protein': 'Responsible for transporting molecules across cell membranes or through bodily fluids.',
        'Structural Protein': 'Provides structural support and scaffolding to cells and tissues.',
        'Regulatory Protein': 'Regulates cellular processes, including gene expression and signaling.',
        'Defense Protein': 'Involved in defending the organism against disease or neutralizing threats.'
      };

      const mappedProbs: Record<string, number> = {};
      for (const [k, v] of Object.entries(data.probabilities)) {
        mappedProbs[k.split(' ')[0].toLowerCase()] = parseFloat((v as number).toFixed(1));
      }

      const result = {
        class: data.predicted_class,
        conf: parseFloat((data.confidence).toFixed(1)),
        desc: descriptions[data.predicted_class] || 'Protein analyzed successfully.',
        probs: mappedProbs
      };

      setTimeout(() => {
        setPredictionResult(result);
        setAnalysisStep(4);
        setIsAnalyzing(false);
        setActiveTab('prediction');
      }, 2400); // Ensure the animation completes before jumping to results
    } catch (err) {
      console.error(err);
      alert("Error: Could not connect to the backend API. Please ensure the Python server is running.");
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  const handleBatchProcess = () => {
    if (!batchFile) return;
    setIsBatchProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsBatchProcessing(false);
      setBatchComplete(true);
    }, 3000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 max-w-[1400px] mx-auto pb-12"
          >
            {/* OVERVIEW HERO */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 p-10 text-white shadow-xl shadow-primary-900/10 border border-primary-800/50">
              <div className="relative z-10 max-w-2xl">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-white">
                    Protein intelligence, <br/><span className="text-primary-300">simplified.</span>
                  </h2>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <p className="text-lg text-primary-100 mb-8 max-w-xl leading-relaxed">
                    Analyze protein sequences, predict functional classes, and explore biological insights with our advanced machine learning models.
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-4">
                  <Button onClick={() => setActiveTab('analyze')} className="bg-white text-primary-900 hover:bg-primary-50 border-none shadow-lg px-6 h-12 text-base font-semibold rounded-xl">
                    <Hexagon className="w-5 h-5 mr-2" />
                    Analyze Protein
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('batch')} className="border-primary-400/30 text-white hover:bg-primary-800/50 hover:text-white px-6 h-12 text-base font-medium rounded-xl backdrop-blur-sm">
                    Batch Upload
                  </Button>
                </motion.div>
              </div>

              {/* Subtle Animated Scientific Visualization */}
              <div className="absolute top-0 right-0 bottom-0 w-1/2 opacity-60 pointer-events-none overflow-hidden">
                <svg className="absolute w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  {[...Array(12)].map((_, i) => (
                    <motion.circle
                      key={i}
                      cx={200 + Math.cos(i * 30) * (50 + i * 10)}
                      cy={200 + Math.sin(i * 30) * (50 + i * 10)}
                      r={Math.random() * 4 + 2}
                      fill="url(#glow)"
                      initial={{ y: 0, opacity: 0.3 }}
                      animate={{ 
                        y: [0, -20, 0], 
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.2, 1] 
                      }}
                      transition={{ 
                        duration: 4 + Math.random() * 4, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: i * 0.2
                      }}
                    />
                  ))}
                  <motion.path
                    d="M 100,200 Q 200,100 300,200 T 500,200"
                    fill="none"
                    stroke="url(#glow)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 3, ease: "easeOut" }}
                  />
                  <motion.path
                    d="M 100,250 Q 200,350 300,250 T 500,250"
                    fill="none"
                    stroke="url(#glow)"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    transition={{ duration: 4, ease: "easeOut", delay: 1 }}
                  />
                </svg>
              </div>
            </div>

            {/* KPI METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Total Analyses', value: 1248, trend: '+18.4%', trendUp: true, icon: Activity, color: 'text-primary-600', bg: 'bg-primary-50', data: [30, 40, 35, 50, 49, 60, 70] },
                { label: 'Total Predictions', value: 4521, trend: '+24.1%', trendUp: true, icon: Hexagon, color: 'text-info', bg: 'bg-info-bg', data: [100, 120, 115, 140, 135, 160, 180] },
                { label: 'Model Macro-F1', value: 0.80, trend: '+4.2%', trendUp: true, icon: BarChart3, color: 'text-success', bg: 'bg-success-bg', data: [0.72, 0.74, 0.73, 0.76, 0.78, 0.79, 0.80], isFloat: true },
                { label: 'Reports Generated', value: 342, trend: '-2.1%', trendUp: false, icon: FileText, color: 'text-warning', bg: 'bg-warning-bg', data: [40, 35, 45, 30, 25, 35, 30] }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className={`px-2 py-1 rounded-md text-xs font-bold ${stat.trendUp ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>
                      {stat.trend}
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="text-text-3 text-xs font-bold tracking-wider uppercase mb-1">{stat.label}</div>
                    <div className="text-3xl font-extrabold text-text tracking-tight flex items-baseline gap-1">
                      {stat.isFloat ? stat.value.toFixed(2) : <CountUp end={stat.value} />}
                    </div>
                  </div>
                  {/* Subtle Sparkline */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stat.data.map((val, idx) => ({ value: val, index: idx }))}>
                        <defs>
                          <linearGradient id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={stat.trendUp ? '#10B981' : '#6366F1'} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={stat.trendUp ? '#10B981' : '#6366F1'} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke={stat.trendUp ? '#10B981' : '#6366F1'} fillOpacity={1} fill={`url(#color-${i})`} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* RECENT ANALYSES */}
              <Card className="xl:col-span-2 shadow-sm hover:shadow-md transition-shadow border-border">
                <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-white/50 rounded-t-2xl">
                  <h3 className="font-bold text-lg text-text">Recent Analyses</h3>
                  <Button variant="secondary" size="sm" className="h-8 text-xs font-medium">View All</Button>
                </div>
                <div className="w-full overflow-x-auto rounded-b-2xl">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[11px] text-text-3 font-bold tracking-wider uppercase bg-bg-subtle/50">
                      <tr>
                        <th className="px-6 py-4">Protein ID</th>
                        <th className="px-6 py-4">Predicted Function</th>
                        <th className="px-6 py-4">Confidence</th>
                        <th className="px-6 py-4 text-right">Analyzed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { id: 'PRT-8924', class: 'Enzyme', conf: 96.8, time: '2m ago' },
                        { id: 'PRT-8923', class: 'Transport', conf: 85.1, time: '1h ago' },
                        { id: 'PRT-8922', class: 'Structural', conf: 78.4, time: '3h ago' },
                        { id: 'PRT-8921', class: 'Regulatory', conf: 64.2, time: '5h ago' },
                        { id: 'PRT-8920', class: 'Defense', conf: 92.5, time: '1d ago' },
                      ].map((row, i) => (
                        <tr key={row.id} className="hover:bg-primary-50/30 transition-colors cursor-pointer group" onClick={() => setActiveTab('prediction')}>
                          <td className="px-6 py-4 font-mono text-text font-medium text-xs">
                            <span className="bg-bg-subtle px-2 py-1 rounded border border-border group-hover:border-primary-200 group-hover:bg-white transition-all">{row.id}</span>
                          </td>
                          <td className="px-6 py-4"><ClassChip name={row.class} /></td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-center text-[11px] font-medium">
                                <span className="text-text-2">{row.conf}%</span>
                                <span className={row.conf >= 90 ? 'text-success' : row.conf >= 75 ? 'text-warning' : 'text-danger'}>
                                  {row.conf >= 90 ? 'High' : row.conf >= 75 ? 'Moderate' : 'Review'}
                                </span>
                              </div>
                              <div className="w-32 h-1.5 bg-bg-subtle rounded-full overflow-hidden border border-border/50">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${row.conf}%` }}
                                  transition={{ duration: 1, delay: i * 0.1 }}
                                  className={cn("h-full rounded-full", row.conf >= 90 ? 'bg-success' : row.conf >= 75 ? 'bg-warning' : 'bg-danger')}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-text-3 text-right text-xs font-medium">{row.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              
              {/* FUNCTION DISTRIBUTION */}
              <Card className="shadow-sm hover:shadow-md transition-shadow border-border flex flex-col">
                <div className="px-6 py-5 border-b border-border bg-white/50 rounded-t-2xl">
                  <h3 className="font-bold text-lg text-text">Function Distribution</h3>
                </div>
                <CardContent className="flex-1 flex flex-col items-center justify-center pt-6 pb-2">
                  <div className="w-full h-[240px] relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                      <span className="text-3xl font-extrabold text-text tracking-tight"><CountUp end={4521} /></span>
                      <span className="text-xs font-semibold text-text-3 uppercase tracking-widest mt-1">Predictions</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Enzyme', value: 35, color: '#6366F1' },
                            { name: 'Transport', value: 25, color: '#0284C7' },
                            { name: 'Structural', value: 20, color: '#D97706' },
                            { name: 'Regulatory', value: 15, color: '#059669' },
                            { name: 'Defense', value: 5, color: '#E11D48' },
                          ]}
                          cx="50%" cy="50%"
                          innerRadius={75} outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                          isAnimationActive={true}
                        >
                          {
                            [
                              { name: 'Enzyme', value: 35, color: '#6366F1' },
                              { name: 'Transport', value: 25, color: '#0284C7' },
                              { name: 'Structural', value: 20, color: '#D97706' },
                              { name: 'Regulatory', value: 15, color: '#059669' },
                              { name: 'Defense', value: 5, color: '#E11D48' },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 cursor-pointer transition-opacity outline-none" />
                            ))
                          }
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 8px 30px rgba(15,23,42,.1)', padding: '8px 12px', fontWeight: 600, fontSize: '12px' }}
                          itemStyle={{ color: 'var(--text)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full mt-4 space-y-2">
                    {[
                      { name: 'Enzyme', pct: '35%', color: 'bg-[#6366F1]' },
                      { name: 'Transport', pct: '25%', color: 'bg-[#0284C7]' },
                      { name: 'Structural', pct: '20%', color: 'bg-[#D97706]' },
                      { name: 'Regulatory', pct: '15%', color: 'bg-[#059669]' },
                    ].map(item => (
                      <div key={item.name} className="flex justify-between items-center text-[13px] px-2 py-1.5 hover:bg-bg-subtle rounded-lg transition-colors cursor-default">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm`}></span>
                          <span className="text-text-2 font-medium">{item.name}</span>
                        </div>
                        <span className="text-text font-bold tabular-nums">{item.pct}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* QUICK ACTIONS */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-4 w-1 bg-primary-500 rounded-full" />
                <h3 className="text-sm font-bold text-text-3 tracking-widest uppercase">Start your analysis</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Analyze Protein', desc: 'Predict function', icon: Activity, tab: 'analyze', color: 'text-primary-600', bg: 'bg-primary-50' },
                  { label: 'Upload FASTA', desc: 'Batch process', icon: UploadCloud, tab: 'analyze', color: 'text-info', bg: 'bg-info-bg' },
                  { label: 'Mutation', desc: 'Analyze impacts', icon: Layers, tab: 'mutation', color: 'text-warning', bg: 'bg-warning-bg' },
                  { label: 'Similarity', desc: 'Search database', icon: Search, tab: 'similarity', color: 'text-success', bg: 'bg-success-bg' },
                  { label: 'Generate Report', desc: 'Export insights', icon: FileText, tab: 'reports', color: 'text-danger', bg: 'bg-danger-bg' },
                  { label: 'Knowledge', desc: 'Learn more', icon: BookOpen, tab: 'knowledge', color: 'text-text-2', bg: 'bg-bg-subtle' },
                ].map((action, i) => (
                  <motion.button 
                    key={i} 
                    onClick={() => setActiveTab(action.tab)}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-start p-4 bg-white border border-border rounded-2xl hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/5 transition-all text-left group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="text-sm font-bold text-text mb-1">{action.label}</span>
                    <span className="text-[11px] font-medium text-text-3 leading-tight">{action.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 'analyze':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="space-y-8 max-w-4xl mx-auto pb-12"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-text tracking-tight mb-3">Analyze a Protein</h2>
              <p className="text-text-2 text-lg">Paste a protein sequence and let AminoAI predict its functional class.</p>
            </div>

            <Card className="shadow-lg shadow-primary-900/5 border-primary-100 overflow-hidden">
              <div className="flex border-b border-border bg-bg-subtle/50">
                <button className="px-8 py-4 text-sm font-bold border-b-2 border-primary-600 text-primary-700 bg-white">Single Sequence</button>
                <button className="px-8 py-4 text-sm font-bold border-b-2 border-transparent text-text-3 hover:text-text hover:bg-white/50 transition-colors" onClick={() => setActiveTab('batch')}>FASTA Upload</button>
              </div>
              <CardContent className="p-8 space-y-6 bg-white">
                <div className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-text-3 tracking-widest uppercase">Sequence Editor</label>
                    {sequence && (
                      <span className="text-xs font-mono font-medium text-success flex items-center gap-1 bg-success-bg px-2 py-0.5 rounded-md">
                        ✓ Valid protein sequence ({sequence.length} aa)
                      </span>
                    )}
                  </div>
                  <div className="relative group">
                    <SequenceInput 
                      value={sequence} 
                      onChange={setSequence} 
                    />
                    <div className="absolute inset-0 border-2 border-transparent group-focus-within:border-primary-200 rounded-xl pointer-events-none transition-colors" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <div className="text-xs text-text-3 font-medium">Supports FASTA format or raw amino-acid sequences.</div>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setSequence('MKTLLILAVVAAALAAPVQA')} className="font-semibold bg-bg-subtle hover:bg-primary-50 hover:text-primary-700 border-transparent">
                      Load Example
                    </Button>
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={!sequence || isAnalyzing}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md shadow-primary-600/20 px-8"
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : 'Analyze Sequence'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <AnimatePresence>
              {isAnalyzing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <Card className="border-primary-200 shadow-md shadow-primary-500/10 bg-primary-50/30">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-5 h-5 text-primary-600 animate-pulse" />
                        <h3 className="font-bold text-primary-900 tracking-tight text-lg">Analysis in Progress</h3>
                      </div>
                      <StepProgress 
                        steps={['Sequence validated', 'Features extracted', 'Running Random Forest model', 'Generating prediction']} 
                        currentStep={analysisStep} 
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      case 'prediction':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="space-y-6 max-w-[1400px] mx-auto pb-12 print:m-0 print:p-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-mono font-bold text-text tracking-tight">PRT-8924</h2>
                  <span className="bg-bg-subtle text-text-3 text-xs font-semibold px-2 py-1 rounded-md border border-border">Just now</span>
                </div>
              </div>
              <div className="flex gap-2 print:hidden">
                <Button variant="secondary" size="sm" onClick={() => window.print()} className="font-semibold"><FileText className="w-4 h-4 mr-2" /> Export PDF</Button>
                <Button variant="secondary" size="sm" onClick={() => { setSequence(sequence || 'MKALIVLGLVLLSVTVQGKVFERCELARTLKRLGMDGYRGISLANWMCLAKWESGYNTRATNYNAGDRSTDYGIFQINSRYWCNDGKTPGAVNACHLSCSALLQDNIADAVACAKRVVRDPQGIRAWVAWRNRCQNRDVRQYVQGCGV'); setShowSimResults(true); setActiveTab('similarity'); }} className="font-semibold"><Search className="w-4 h-4 mr-2" /> Find Similar</Button>
                <Button variant="secondary" size="sm" onClick={() => { setSequence(sequence || 'MKALIVLGLVLLSVTVQGKVFERCELARTLKRLGMDGYRGISLANWMCLAKWESGYNTRATNYNAGDRSTDYGIFQINSRYWCNDGKTPGAVNACHLSCSALLQDNIADAVACAKRVVRDPQGIRAWVAWRNRCQNRDVRQYVQGCGV'); setShowMutResults(true); setActiveTab('mutation'); }} className="font-semibold"><Layers className="w-4 h-4 mr-2" /> Mutate</Button>
                <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard.writeText(sequence || 'MKALIVLGLV...'); alert("Sequence copied to clipboard!"); }} className="font-semibold"><Copy className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* PRIMARY PREDICTION CARD */}
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.1 }} className="lg:col-span-2">
                <Card className="h-full overflow-hidden border-2 border-primary-200 shadow-xl shadow-primary-900/5 relative bg-gradient-to-br from-white to-primary-50/50">
                  <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <Hexagon className="w-64 h-64 text-primary-600" />
                  </div>
                  <div className="p-10 relative z-10 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="w-5 h-5 text-primary-500" />
                      <span className="text-xs font-bold text-primary-600 tracking-widest uppercase">AI Prediction Result</span>
                    </div>
                    
                    <h1 className="text-[56px] font-extrabold tracking-tight text-text leading-none mb-6">
                      {predictionResult?.class ? predictionResult.class.toUpperCase() : 'ENZYME'}
                    </h1>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <div className="flex-1 max-w-sm">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-4xl font-bold text-primary-600 tabular-nums">
                            <CountUp end={predictionResult?.conf || 92.4} />%
                          </span>
                          <span className="text-sm font-bold text-success uppercase tracking-wider mb-1">High Confidence</span>
                        </div>
                        <div className="h-3 w-full bg-primary-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${predictionResult?.conf || 92.4}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-primary-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-text-2 text-xl font-medium max-w-2xl leading-relaxed mb-6">
                      {predictionResult?.desc || 'Catalyzes biochemical reactions, accelerating metabolic processes within the cell.'}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm font-medium text-text-3 bg-white/60 w-fit px-3 py-1.5 rounded-lg border border-border">
                      <Cpu className="w-4 h-4" />
                      Random Forest Model v1.2.0
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <Card className="h-full shadow-md border-border">
                  <CardHeader className="border-b border-border/50 bg-bg-subtle/30 pb-4">
                    <CardTitle className="text-sm font-bold tracking-widest uppercase text-text-3">Class Probabilities</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ProbabilityBars 
                      predictedClass={(predictionResult?.class || 'enzyme').toLowerCase().replace(' protein', '')}
                      probabilities={predictionResult?.probs || {
                        enzyme: 85.5,
                        transport: 8.2,
                        regulatory: 4.1,
                        structural: 1.5,
                        defense: 0.7
                      }} 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center gap-3 mt-10 mb-5">
                <div className="h-4 w-1 bg-primary-500 rounded-full" />
                <h3 className="text-sm font-bold text-text-3 tracking-widest uppercase">Protein Statistics</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                 {[
                   { label: 'Length', value: '150 aa' },
                   { label: 'Mol. Weight', value: '16.5 kDa' },
                   { label: 'pI', value: '6.5' },
                   { label: 'Instability', value: '35.2', tag: 'Stable', tagColor: 'text-success bg-success-bg' },
                   { label: 'Aromaticity', value: '0.08' },
                   { label: 'GRAVY', value: '-0.42' },
                 ].map((stat, i) => (
                   <Card key={i} className="p-5 border-border shadow-sm hover:shadow-md transition-shadow">
                     <div className="text-[11px] font-bold text-text-3 mb-2 flex justify-between items-center uppercase tracking-wider">
                       {stat.label}
                       {stat.tag && <span className={`text-[9px] px-1.5 py-0.5 rounded-sm ${stat.tagColor}`}>{stat.tag}</span>}
                     </div>
                     <div className="text-2xl font-extrabold tabular-nums text-text">{stat.value}</div>
                   </Card>
                 ))}
              </div>
            </motion.div>
            
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 h-[500px] rounded-2xl overflow-hidden border border-border shadow-lg">
              <ProteinViewer3D pdbId="1ubq" />
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
              <Card className="mt-6 border-border shadow-sm">
                <CardHeader className="border-b border-border/50 bg-bg-subtle/30 pb-4">
                  <CardTitle className="text-sm font-bold tracking-widest uppercase text-text-3">Analyzed Sequence</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="p-6 bg-surface-muted rounded-xl border border-border font-mono text-sm text-text-2 break-all leading-relaxed max-h-48 overflow-y-auto">
                    {sequence || 'MKALIVLGLVLLSVTVQGKVFERCELARTLKRLGMDGYRGISLANWMCLAKWESGYNTRATNYNAGDRSTDYGIFQINSRYWCNDGKTPGAVNACHLSCSALLQDNIADAVACAKRVVRDPQGIRAWVAWRNRCQNRDVRQYVQGCGV'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        );
      case 'batch':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="space-y-8 max-w-4xl mx-auto pb-12"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-text tracking-tight mb-3">Batch Processing</h2>
              <p className="text-text-2 text-lg">Upload a FASTA file to analyze thousands of protein sequences at once.</p>
            </div>
            <Card className="shadow-lg border-border/60 overflow-hidden">
              <div className="flex border-b border-border bg-bg-subtle/50">
                <button className="px-8 py-4 text-sm font-bold border-b-2 border-transparent text-text-3 hover:text-text hover:bg-white/50 transition-colors" onClick={() => setActiveTab('analyze')}>Single Sequence</button>
                <button className="px-8 py-4 text-sm font-bold border-b-2 border-primary-600 text-primary-700 bg-white">FASTA Upload</button>
              </div>
              <CardContent className="p-8">
                {!batchComplete ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <input 
                      type="file" 
                      accept=".fasta,.fa,.txt" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setBatchFile(e.target.files[0]);
                        }
                      }}
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "p-16 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group relative overflow-hidden",
                        batchFile ? "border-primary-500 bg-primary-50/50" : "border-border-strong hover:border-primary-400 hover:bg-bg-subtle/50 bg-bg-subtle/20"
                      )}
                    >
                      {batchFile && (
                        <div className="absolute inset-0 bg-primary-500/5 pointer-events-none" />
                      )}
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }} 
                        className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors shadow-sm",
                          batchFile ? "bg-primary-600 text-white" : "bg-white border border-border text-primary-500 group-hover:text-primary-600"
                        )}
                      >
                        <UploadCloud className="w-10 h-10" />
                      </motion.div>
                      
                      <h3 className="text-xl font-bold text-text tracking-tight mb-2">
                        {batchFile ? batchFile.name : "Drop your FASTA file here"}
                      </h3>
                      <p className="text-text-3 font-medium">
                        {batchFile 
                          ? `${(batchFile.size / 1024).toFixed(1)} KB • Ready to process` 
                          : "or click to browse from your computer"
                        }
                      </p>
                      
                      {!batchFile && (
                        <div className="mt-8 flex gap-3 text-xs font-semibold text-text-3 bg-white px-4 py-2 rounded-lg border border-border shadow-sm">
                          <span>.fasta</span>
                          <span className="w-px h-4 bg-border" />
                          <span>.fa</span>
                          <span className="w-px h-4 bg-border" />
                          <span>.txt</span>
                          <span className="w-px h-4 bg-border" />
                          <span>Up to 100MB</span>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {isBatchProcessing && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-2">
                          <div className="flex justify-between items-center text-sm font-bold text-text-2 mb-2 uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                              Processing Sequences...
                            </span>
                            <span className="text-primary-600 tabular-nums">42%</span>
                          </div>
                          <div className="h-2.5 w-full bg-bg-subtle rounded-full overflow-hidden border border-border/50">
                            <motion.div 
                              initial={{ width: '0%' }} animate={{ width: '42%' }} transition={{ duration: 3, ease: 'easeOut' }}
                              className="h-full bg-primary-500 rounded-full"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-end pt-4 border-t border-border/50">
                      <Button 
                        onClick={handleBatchProcess} 
                        disabled={!batchFile || isBatchProcessing}
                        className={cn(
                          "px-8 py-6 text-base font-bold shadow-md transition-all",
                          batchFile && !isBatchProcessing ? "bg-primary-600 hover:bg-primary-700 shadow-primary-600/20" : ""
                        )}
                      >
                        {isBatchProcessing ? (
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </span>
                        ) : 'Process Batch File'}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                    <div className="p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-success-bg to-white border border-success/30 rounded-2xl shadow-sm">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center relative z-10">
                          <FileText className="w-10 h-10" />
                        </div>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-0 bg-success/30 rounded-full" />
                      </div>
                      <h3 className="text-3xl font-extrabold tracking-tight text-text mb-3">Analysis Complete</h3>
                      <p className="text-text-2 text-lg mb-8 max-w-md">Successfully processed 1,248 sequences from <span className="font-semibold">{batchFile?.name}</span>.</p>
                      <div className="flex gap-4">
                        <Button onClick={() => { setBatchFile(null); setBatchComplete(false); }} variant="secondary" className="px-6 border-transparent bg-bg-subtle hover:bg-border font-semibold">Upload Another</Button>
                        <Button onClick={() => setActiveTab('reports')} className="px-6 bg-primary-600 font-semibold shadow-md"><FileText className="w-4 h-4 mr-2" /> Generate PDF Report</Button>
                      </div>
                    </div>
                    
                    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-bg-subtle px-6 py-4 border-b border-border flex justify-between items-center">
                        <h4 className="font-bold text-text">Batch Results Summary</h4>
                        <div className="text-xs font-semibold text-text-3 tracking-widest uppercase">Showing Top 4</div>
                      </div>
                      <table className="w-full text-sm text-left">
                        <thead className="text-[11px] text-text-3 font-bold uppercase tracking-wider bg-white">
                          <tr>
                            <th className="px-6 py-4">Seq ID</th>
                            <th className="px-6 py-4">Sequence Snapshot</th>
                            <th className="px-6 py-4">Predicted Class</th>
                            <th className="px-6 py-4">Confidence</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-border/50">
                          {[
                            { id: 'seq_1 (Lysozyme)', seq: 'MKALIVLGLV...', class: 'Enzyme', conf: 85.5, rawClass: 'enzyme' },
                            { id: 'seq_2 (Hemoglobin)', seq: 'MVLSPADKTN...', class: 'Transport Protein', conf: 92.4, rawClass: 'transport' },
                            { id: 'seq_3 (Actin)', seq: 'MCDEDETTAL...', class: 'Structural Protein', conf: 88.1, rawClass: 'structural' },
                            { id: 'seq_4 (Defensin)', seq: 'MRTLAILAAI...', class: 'Defense Protein', conf: 96.8, rawClass: 'defense' },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-primary-50/50 transition-colors group">
                              <td className="px-6 py-4 font-mono text-text font-bold text-xs whitespace-nowrap">{row.id}</td>
                              <td className="px-6 py-4 font-mono text-text-3 text-xs">{row.seq}</td>
                              <td className="px-6 py-4"><ClassChip name={row.class} /></td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 max-w-[80px] h-1.5 bg-bg-subtle rounded-full overflow-hidden border border-border/50">
                                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${row.conf}%` }}></div>
                                  </div>
                                  <span className="text-text-2 text-xs font-bold tabular-nums">{row.conf}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button className="text-primary-600 hover:text-primary-800 font-bold text-xs whitespace-nowrap bg-primary-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setActiveTab('prediction')}>View Detail</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      case 'similarity':
        return (
          <div className="space-y-8 animate-fade-rise max-w-4xl mx-auto">
            <div>
              <h2 className="text-2xl font-semibold text-text tracking-tight mb-1">Similarity Search</h2>
              <p className="text-text-2">Find similar proteins in the reference dataset.</p>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <SequenceInput value={sequence} onChange={setSequence} />
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setSequence('MKTLLILAVVAAALAAPVQA')}>Load Example</Button>
                  <Button onClick={() => setShowSimResults(true)}>Search Database</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                {showSimResults ? (
                  <div className="space-y-4">
                    {[
                      { id: 'UniProt: P00698', name: 'Lysozyme C (Gallus gallus)', sim: '98.2%', e: '2e-105' },
                      { id: 'UniProt: P61626', name: 'Lysozyme C (Homo sapiens)', sim: '60.5%', e: '4e-52' },
                      { id: 'UniProt: P00711', name: 'Alpha-lactalbumin (Bos taurus)', sim: '35.1%', e: '1e-20' },
                    ].map((res, i) => (
                      <div key={i} className="p-4 border rounded-lg bg-surface-muted flex items-center justify-between">
                        <div>
                          <div className="font-medium text-text">{res.id}</div>
                          <div className="text-sm text-text-2">{res.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-primary-600 font-semibold">{res.sim} Match</div>
                          <div className="text-xs text-text-3 font-mono">E-value: {res.e}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-text-3 text-sm flex items-center justify-center h-32 border border-dashed rounded-lg">Run search to see similarity results.</div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      case 'mutation':
        return (
          <div className="space-y-8 animate-fade-rise max-w-4xl mx-auto">
            <div>
              <h2 className="text-2xl font-semibold text-text tracking-tight mb-1">Mutation Analyzer</h2>
              <p className="text-text-2">Compare an original sequence against a mutated one.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Original Sequence</CardTitle></CardHeader>
                <CardContent><textarea className="w-full h-32 p-3 font-mono text-sm border rounded-lg bg-surface-muted focus:ring-2 focus:ring-primary-600/20 outline-none" placeholder="Paste original..." defaultValue={sequence || "MKTLLILAVVAAALAAPVQA"} /></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Mutated Sequence</CardTitle></CardHeader>
                <CardContent><textarea className="w-full h-32 p-3 font-mono text-sm border rounded-lg bg-surface-muted focus:ring-2 focus:ring-primary-600/20 outline-none" placeholder="Paste mutated..." defaultValue={(sequence || "MKTLLILAVVAAALAAPVQA").replace('V', 'G')} /></CardContent>
              </Card>
            </div>
            <div className="flex justify-end"><Button onClick={() => setShowMutResults(true)}>Analyze Impact</Button></div>
            
            {showMutResults && (
              <Card className="animate-fade-rise">
                <CardHeader><CardTitle>Analysis Results</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-danger-bg border border-danger/20 rounded-lg flex gap-4 items-start">
                    <Activity className="text-danger w-6 h-6 mt-1" />
                    <div>
                      <h4 className="font-semibold text-danger mb-1">Structural Destabilization Detected</h4>
                      <p className="text-sm text-text-2">The substitution of Valine (Hydrophobic) to Glycine disrupts the hydrophobic core packing, severely impacting the thermostability of the folded state.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-xs text-text-3 mb-1 uppercase tracking-wider">ΔΔG (Stability)</div>
                      <div className="text-lg font-mono font-semibold text-danger">-2.4 kcal/mol</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-xs text-text-3 mb-1 uppercase tracking-wider">Function Shift</div>
                      <div className="text-lg font-mono font-semibold text-text">No Change</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-xs text-text-3 mb-1 uppercase tracking-wider">Pathogenicity</div>
                      <div className="text-lg font-mono font-semibold text-warning">Likely Pathogenic</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case 'disease':
        return (
          <div className="space-y-8 animate-fade-rise max-w-4xl mx-auto">
            <div>
              <h2 className="text-2xl font-semibold text-text tracking-tight mb-1">Disease Associations</h2>
              <p className="text-text-2">Scan for pathogenic structural motifs.</p>
            </div>
            <div className="p-4 bg-info-bg text-info border border-info/20 rounded-lg text-sm flex items-start gap-3 mb-6">
              <Stethoscope className="w-5 h-5 shrink-0" />
              <p>AminoAI provides computational and educational information. It is not a medical diagnostic system.</p>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <SequenceInput value={sequence} onChange={setSequence} />
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => { setSequence('MKTLLILAVVAAALAAPVQAQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ'); setShowDiseaseResults(false); }}>Load PolyQ Example</Button>
                  <Button onClick={() => setShowDiseaseResults(true)}>Scan Sequence</Button>
                </div>
              </CardContent>
            </Card>

            {showDiseaseResults && (
              <Card className="animate-fade-rise border-danger/50">
                <CardHeader>
                  <CardTitle className="text-danger flex items-center gap-2">
                    <Activity className="w-5 h-5" /> Pathogenic Motif Detected
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-danger-bg rounded-lg border border-danger/20">
                    <h3 className="font-semibold text-danger mb-2">Expanded Polyglutamine (PolyQ) Tract</h3>
                    <p className="text-sm text-text-2">
                      The sequence contains an abnormally long consecutive run of Glutamine (Q) residues (&gt;35 repeats). 
                      This structural motif strongly correlates with neurodegenerative disorders caused by protein misfolding and aggregation.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-muted rounded-lg border border-border">
                      <div className="text-xs text-text-3 font-semibold uppercase mb-1">Associated Conditions</div>
                      <div className="font-medium text-text">Huntington's Disease, Spinocerebellar Ataxia</div>
                    </div>
                    <div className="p-4 bg-surface-muted rounded-lg border border-border">
                      <div className="text-xs text-text-3 font-semibold uppercase mb-1">Confidence Score</div>
                      <div className="font-medium text-danger">99.1% (High)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case 'models':
        return (
          <div className="space-y-6 animate-fade-rise max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-text tracking-tight mb-1">Model Performance</h2>
                <p className="text-text-2">Evaluation metrics on the held-out test set (n=3,948).</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">Download Metrics (CSV)</Button>
                <Button variant="secondary" size="sm">Export ROC Curves</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Confusion Matrix (RandomForest)</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="grid grid-cols-6 gap-1 text-xs text-center font-mono">
                    <div className="flex items-end justify-center p-1 font-semibold text-text-3">True\Pred</div>
                    <div className="p-2 border-b border-border">ENZ</div>
                    <div className="p-2 border-b border-border">TRA</div>
                    <div className="p-2 border-b border-border">STR</div>
                    <div className="p-2 border-b border-border">REG</div>
                    <div className="p-2 border-b border-border">DEF</div>
                    
                    <div className="p-2 border-r border-border flex items-center justify-end">ENZ</div>
                    <div className="p-2 bg-primary-600 text-white font-bold rounded">94%</div>
                    <div className="p-2 bg-primary-100 text-primary-800 rounded">2%</div>
                    <div className="p-2 bg-primary-50 text-primary-800 rounded">1%</div>
                    <div className="p-2 bg-primary-100 text-primary-800 rounded">2%</div>
                    <div className="p-2 bg-primary-50 text-primary-800 rounded">1%</div>
                    
                    <div className="p-2 border-r border-border flex items-center justify-end">TRA</div>
                    <div className="p-2 bg-primary-100 text-primary-800 rounded">3%</div>
                    <div className="p-2 bg-primary-500 text-white font-bold rounded">88%</div>
                    <div className="p-2 bg-primary-50 text-primary-800 rounded">1%</div>
                    <div className="p-2 bg-primary-200 text-primary-800 rounded">4%</div>
                    <div className="p-2 bg-primary-100 text-primary-800 rounded">4%</div>
                    
                    <div className="p-2 border-r border-border flex items-center justify-end">STR</div>
                    <div className="p-2 bg-primary-50 text-primary-800 rounded">1%</div>
                    <div className="p-2 bg-primary-100 text-primary-800 rounded">2%</div>
                    <div className="p-2 bg-primary-600 text-white font-bold rounded">92%</div>
                    <div className="p-2 bg-primary-100 text-primary-800 rounded">3%</div>
                    <div className="p-2 bg-primary-50 text-primary-800 rounded">2%</div>
                    
                    <div className="p-2 border-r border-border flex items-center justify-end">REG</div>
                    <div className="p-2 bg-primary-200 text-primary-800 rounded">5%</div>
                    <div className="p-2 bg-primary-50 text-primary-800 rounded">2%</div>
                    <div className="p-2 bg-primary-100 text-primary-800 rounded">3%</div>
                    <div className="p-2 bg-primary-400 text-white font-bold rounded">85%</div>
                    <div className="p-2 bg-primary-200 text-primary-800 rounded">5%</div>
                    
                    <div className="p-2 border-r border-border flex items-center justify-end">DEF</div>
                    <div className="p-2 bg-primary-50 text-primary-800 rounded">1%</div>
                    <div className="p-2 bg-primary-50 text-primary-800 rounded">1%</div>
                    <div className="p-2 bg-primary-50 text-primary-800 rounded">1%</div>
                    <div className="p-2 bg-primary-50 text-primary-800 rounded">1%</div>
                    <div className="p-2 bg-primary-700 text-white font-bold rounded">96%</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Model Comparison (F1-Score)</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-6 mt-4">
                    {[
                      { name: 'RandomForest (Best)', score: 0.91, color: 'bg-primary-600' },
                      { name: 'GradientBoosting', score: 0.88, color: 'bg-info' },
                      { name: 'MLP Neural Network', score: 0.84, color: 'bg-warning' },
                    ].map((model, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-text">{model.name}</span>
                          <span className="text-text-2 tabular-nums">{model.score.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-surface-muted rounded-full h-3 overflow-hidden">
                          <div className={`h-full rounded-full ${model.color}`} style={{ width: `${model.score * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-text-3 uppercase tracking-wider mb-1">Precision</div>
                      <div className="text-xl font-semibold text-text">0.92</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-3 uppercase tracking-wider mb-1">Recall</div>
                      <div className="text-xl font-semibold text-text">0.90</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-3 uppercase tracking-wider mb-1">Accuracy</div>
                      <div className="text-xl font-semibold text-text">91.4%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6 animate-fade-rise max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-text tracking-tight mb-1">Analysis Reports</h2>
                <p className="text-text-2">View and download your generated prediction reports.</p>
              </div>
              <Button onClick={() => {
                const blob = new Blob(['SeqID,Class,Confidence\nPRT-8924,Enzyme,85.5\nPRT-8925,Transport,92.4'], { type: 'text/csv' });
                const a = document.createElement('a');
                a.href = window.URL.createObjectURL(blob);
                a.download = 'AminoAI_Export_All.csv';
                a.click();
              }}><FileText className="w-4 h-4 mr-2" /> Export All (CSV)</Button>
            </div>
            
            <div className="grid gap-4">
              {[
                { name: 'Report_PRT-8924.pdf', date: 'Just now', size: '245 KB', type: 'Enzyme Analysis' },
                { name: 'Batch_Analysis_Q4.pdf', date: '2 hours ago', size: '1.2 MB', type: 'Batch Processing' },
                { name: 'Mutation_Impact_Report.pdf', date: 'Yesterday', size: '890 KB', type: 'Variant Study' },
                { name: 'Structural_Summary.pdf', date: 'Oct 5, 2026', size: '412 KB', type: 'Structural Protein' },
              ].map((report, i) => (
                <Card key={i} className="hover:border-primary-300 transition-colors cursor-pointer group">
                  <div className="flex items-center p-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-primary-600 mr-4 group-hover:bg-primary-50">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-text group-hover:text-primary-600 transition-colors">{report.name}</h4>
                      <div className="text-xs text-text-3 mt-0.5 flex gap-3">
                        <span>{report.type}</span>
                        <span>•</span>
                        <span>{report.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-text-3">{report.size}</span>
                      <Button variant="secondary" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        const blob = new Blob(['Mock PDF Content for ' + report.name], { type: 'application/pdf' });
                        const a = document.createElement('a');
                        a.href = window.URL.createObjectURL(blob);
                        a.download = report.name;
                        a.click();
                      }}>Download</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'knowledge':
        return (
          <div className="space-y-6 animate-fade-rise max-w-6xl mx-auto">
            <div>
              <h2 className="text-2xl font-semibold text-text tracking-tight mb-1">Knowledge Center</h2>
              <p className="text-text-2">Documentation, guides, and biological references.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Understanding Protein Features', desc: 'Learn how AAC, Dipeptide Composition, and Physicochemical properties affect the model.', icon: BookOpen, color: 'text-info' },
                { title: 'Random Forest vs Gradient Boosting', desc: 'A deep dive into why ensemble methods perform best for sequence data.', icon: Activity, color: 'text-primary-600' },
                { title: 'Disease Mutations', desc: 'How single-point mutations (SNPs) alter structural stability.', icon: Stethoscope, color: 'text-danger' },
                { title: 'API Documentation', desc: 'Integrate AminoAIF into your own bioinformatics pipelines.', icon: Copy, color: 'text-text-2' },
                { title: 'FASTA formatting guide', desc: 'Best practices for uploading batch sequences.', icon: FileText, color: 'text-success' },
                { title: 'Confidence Scoring', desc: 'How probability metrics are calibrated and calculated.', icon: Search, color: 'text-warning' }
              ].map((item, i) => (
                <Card key={i} onClick={() => setSelectedArticle(item)} className="flex flex-col h-full hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <item.icon className={`w-8 h-8 mb-4 ${item.color}`} />
                    <h3 className="font-semibold text-text mb-2">{item.title}</h3>
                    <p className="text-sm text-text-2 flex-1">{item.desc}</p>
                    <div className="mt-6 text-sm font-medium text-primary-600 flex items-center gap-1">
                      Read Article <span className="text-lg leading-none">→</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Article Modal */}
            {selectedArticle && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedArticle(null)}>
                <div 
                  className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-rise flex flex-col max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative h-64 bg-surface-muted">
                    <img 
                      src={`https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80`} 
                      alt="Article cover" 
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>
                    <button 
                      onClick={() => setSelectedArticle(null)}
                      className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 px-8 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <selectedArticle.icon className={`w-5 h-5 ${selectedArticle.color}`} />
                        <span className="text-xs font-bold uppercase tracking-widest text-text-2 drop-shadow-md">Knowledge Base</span>
                      </div>
                      <h2 className="text-3xl font-bold text-text leading-tight drop-shadow-sm">{selectedArticle.title}</h2>
                    </div>
                  </div>
                  
                  <div className="px-8 pt-4 pb-8 overflow-y-auto">
                    <p className="text-lg text-text-2 leading-relaxed mb-6">
                      {selectedArticle.desc}
                    </p>
                    <div className="prose prose-sm prose-slate max-w-none text-text-3">
                      <p className="mb-4">
                        This is a premium placeholder for the full article content. When fully implemented, this section will contain detailed biological mechanisms, code snippets for integrating AminoAIF into your pipelines, and deep dives into our machine learning models.
                      </p>
                      <div className="bg-primary-600/10 border border-primary-600/20 rounded-lg p-5 my-6">
                        <h4 className="text-primary-600 font-semibold mb-3">Key Takeaways</h4>
                        <ul className="list-disc list-inside space-y-2 text-text-2">
                          <li>Advanced feature extraction significantly improves accuracy.</li>
                          <li>Sequence alignment provides baseline similarity metrics.</li>
                          <li>Motif detection identifies known pathogenic structures.</li>
                        </ul>
                      </div>
                      <p>
                        Stay tuned for our upcoming documentation releases where we will expand upon these topics with interactive examples and case studies.
                      </p>
                    </div>
                  </div>
                  
                  <div className="px-8 py-6 border-t border-border bg-surface flex justify-end">
                    <Button onClick={() => setSelectedArticle(null)}>Close Article</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6 animate-fade-rise max-w-3xl mx-auto">
            <div>
              <h2 className="text-2xl font-semibold text-text tracking-tight mb-1">Settings</h2>
              <p className="text-text-2">Configure system preferences and model parameters.</p>
            </div>
            
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle>System Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text">Hardware Acceleration</h4>
                    <p className="text-sm text-text-3">Use GPU for faster model inference if available.</p>
                  </div>
                  <div 
                    onClick={() => setSettings(s => ({...s, hardwareAcceleration: !s.hardwareAcceleration}))}
                    className={`w-11 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${settings.hardwareAcceleration ? 'bg-primary-600' : 'bg-border'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.hardwareAcceleration ? 'right-1' : 'left-1 shadow-sm'}`}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text">Auto-generate PDF Reports</h4>
                    <p className="text-sm text-text-3">Automatically create a report after every analysis.</p>
                  </div>
                  <div 
                    onClick={() => setSettings(s => ({...s, autoGeneratePDF: !s.autoGeneratePDF}))}
                    className={`w-11 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${settings.autoGeneratePDF ? 'bg-primary-600' : 'bg-border'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoGeneratePDF ? 'right-1' : 'left-1 shadow-sm'}`}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text">Verbose Logging</h4>
                    <p className="text-sm text-text-3">Save detailed feature extraction logs.</p>
                  </div>
                  <div 
                    onClick={() => setSettings(s => ({...s, verboseLogging: !s.verboseLogging}))}
                    className={`w-11 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${settings.verboseLogging ? 'bg-primary-600' : 'bg-border'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.verboseLogging ? 'right-1' : 'left-1 shadow-sm'}`}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle>API Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Base Endpoint URL</label>
                  <input type="text" value={settings.endpointUrl} onChange={(e) => setSettings(s => ({...s, endpointUrl: e.target.value}))} className="w-full px-3 py-2 border border-border rounded-lg bg-surface-muted text-sm outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">UniProt Access Token (Optional)</label>
                  <input type="password" value={settings.uniprotToken} onChange={(e) => setSettings(s => ({...s, uniprotToken: e.target.value}))} className="w-full px-3 py-2 border border-border rounded-lg bg-surface-muted text-sm outline-none focus:border-primary-500" placeholder="••••••••••••••••" />
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={() => {
                      setIsSettingsSaved(true);
                      setTimeout(() => setIsSettingsSaved(false), 2000);
                    }}
                    className={isSettingsSaved ? "bg-success hover:bg-success" : ""}
                  >
                    {isSettingsSaved ? "Saved!" : "Save Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-rise">
            <div className="text-6xl mb-4 opacity-20">🏗️</div>
            <h2 className="text-xl font-semibold text-text mb-2">Under Construction</h2>
            <p className="text-text-2 mb-6">The {activeTab} view is being updated.</p>
            <Button onClick={() => setActiveTab('dashboard')} variant="secondary">Return to Dashboard</Button>
          </div>
        );
    }
  };

  if (!hasEnteredApp) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans bg-bg text-text">
        {/* Subtle Light Mesh/Grid Overlay */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-bg via-transparent to-bg"></div>
        
        {/* Interactive Mouse Particle Field */}
        <MouseParticles />
        
        {/* Subtle Light Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary-100 rounded-full blur-[120px] opacity-60 mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-info-bg rounded-full blur-[120px] opacity-60 mix-blend-multiply animate-pulse" style={{ animationDuration: '12s' }}></div>
        </div>

        {/* Floating Biological Shapes (Hexagons) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[20%] right-[15%] opacity-20 animate-fade-rise" style={{ animationDuration: '4s' }}>
            <Hexagon className="w-32 h-32 text-primary-400 animate-[spin_30s_linear_infinite]" strokeWidth={1} />
          </div>
          <div className="absolute bottom-[20%] left-[15%] opacity-30 animate-fade-rise" style={{ animationDuration: '6s' }}>
            <Hexagon className="w-48 h-48 text-info animate-[spin_40s_linear_infinite_reverse]" strokeWidth={0.5} />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl px-6 antialiased">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="inline-flex items-center justify-center p-4 bg-white border border-border shadow-xl rounded-2xl mb-10">
            <div className="w-14 h-14 bg-primary-50 border border-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
              <Hexagon className="w-8 h-8" />
              <div className="absolute w-2 h-2 bg-info rounded-full ml-3 mt-3 animate-pulse" />
            </div>
          </motion.div>
          
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-6xl md:text-[85px] font-extrabold tracking-tight mb-8 leading-tight text-text">
            Protein intelligence, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500">simplified.</span>
          </motion.h1>
          
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-xl md:text-2xl text-text-2 mb-14 max-w-3xl mx-auto font-medium leading-relaxed tracking-normal">
            The next-generation platform for protein sequence analysis. Powered by advanced machine learning to predict functional classes with unprecedented accuracy.
          </motion.p>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <button 
              onClick={() => setHasEnteredApp(true)}
              className="group relative inline-flex items-center justify-center px-12 py-5 text-lg font-bold text-white transition-all duration-300 ease-out bg-primary-600 rounded-xl hover:bg-primary-700 hover:scale-105 hover:shadow-xl hover:shadow-primary-600/20 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              <span className="relative flex items-center tracking-wide">
                ENTER WORKSPACE
                <Activity className="w-5 h-5 ml-3" />
              </span>
            </button>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="mt-24 grid grid-cols-3 gap-8 text-center border-t border-border pt-12">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-primary-600 mb-2 tabular-nums">19.4k+</div>
              <div className="text-[11px] font-bold text-text-3 uppercase tracking-widest">Proteins Trained</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-primary-600 mb-2 tabular-nums">5</div>
              <div className="text-[11px] font-bold text-text-3 uppercase tracking-widest">Functional Classes</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-primary-600 mb-2 tabular-nums">91.4%</div>
              <div className="text-[11px] font-bold text-text-3 uppercase tracking-widest">Model Accuracy</div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
      <BioAssistant />
    </AppShell>
  );
}

export default App;
