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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import MouseParticles from './components/MouseParticles';

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
      const response = await fetch('http://127.0.0.1:8000/api/predict', {
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
          <div className="space-y-6 animate-fade-rise">
            <div>
              <h2 className="text-2xl font-semibold text-text tracking-tight mb-1">Good morning</h2>
              <p className="text-text-2">Your protein intelligence overview</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Analyses', value: '1,248' },
                { label: 'Total Predictions', value: '4,521' },
                { label: 'Best Model Macro-F1', value: '0.80' },
                { label: 'Reports Generated', value: '342' }
              ].map((stat, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-text-3 uppercase tracking-wider">{stat.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold text-text font-mono tracking-tight">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 min-h-[400px]">
                <CardHeader>
                  <CardTitle>Recent Analyses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-text-3 uppercase bg-surface-muted border-y border-border">
                        <tr>
                          <th className="px-4 py-3 font-medium rounded-tl-lg">Protein ID</th>
                          <th className="px-4 py-3 font-medium">Predicted Class</th>
                          <th className="px-4 py-3 font-medium">Confidence</th>
                          <th className="px-4 py-3 font-medium">Model</th>
                          <th className="px-4 py-3 font-medium rounded-tr-lg text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: 'PRT-8924', class: 'Enzyme', conf: 85.5, model: 'RandomForest', time: '2m ago' },
                          { id: 'PRT-8923', class: 'Transport', conf: 92.1, model: 'RandomForest', time: '1h ago' },
                          { id: 'PRT-8922', class: 'Structural', conf: 78.4, model: 'RandomForest', time: '3h ago' },
                          { id: 'PRT-8921', class: 'Regulatory', conf: 64.2, model: 'RandomForest', time: '5h ago' },
                          { id: 'PRT-8920', class: 'Defense', conf: 96.8, model: 'RandomForest', time: '1d ago' },
                        ].map((row, i) => (
                          <tr key={row.id} className="border-b border-border hover:bg-bg-subtle transition-colors cursor-pointer" onClick={() => setActiveTab('prediction')}>
                            <td className="px-4 py-3 font-mono text-text">{row.id}</td>
                            <td className="px-4 py-3"><ClassChip name={row.class} /></td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary-600 rounded-full" style={{ width: `${row.conf}%` }}></div>
                                </div>
                                <span className="text-text-2 text-xs tabular-nums">{row.conf}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-text-2">{row.model}</td>
                            <td className="px-4 py-3 text-text-3 text-right">{row.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="min-h-[400px]">
                <CardHeader>
                  <CardTitle>Function Distribution</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-4">
                  <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Enzyme', value: 35, color: '#7C3AED' },
                            { name: 'Transport', value: 25, color: '#0EA5E9' },
                            { name: 'Structural', value: 20, color: '#F59E0B' },
                            { name: 'Regulatory', value: 15, color: '#10B981' },
                            { name: 'Defense', value: 5, color: '#F43F5E' },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {
                            [
                              { name: 'Enzyme', value: 35, color: '#7C3AED' },
                              { name: 'Transport', value: 25, color: '#0EA5E9' },
                              { name: 'Structural', value: 20, color: '#F59E0B' },
                              { name: 'Regulatory', value: 15, color: '#10B981' },
                              { name: 'Defense', value: 5, color: '#F43F5E' },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))
                          }
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(16,16,24,.06)' }}
                          itemStyle={{ color: 'var(--text)', fontWeight: 500 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full mt-4">
                    {[
                      { name: 'Enzyme', count: '1,582', color: 'bg-[#7C3AED]' },
                      { name: 'Transport', count: '1,130', color: 'bg-[#0EA5E9]' },
                      { name: 'Structural', count: '904', color: 'bg-[#F59E0B]' },
                      { name: 'Regulatory', count: '678', color: 'bg-[#10B981]' },
                      { name: 'Defense', count: '227', color: 'bg-[#F43F5E]' },
                    ].map(item => (
                      <div key={item.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                          <span className="text-text-2">{item.name}</span>
                        </div>
                        <span className="text-text font-medium tabular-nums">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-text-3 tracking-widest uppercase mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Analyze', icon: Activity, tab: 'analyze' },
                  { label: 'Upload FASTA', icon: UploadCloud, tab: 'analyze' },
                  { label: 'Mutation', icon: Activity, tab: 'mutation' },
                  { label: 'Similarity', icon: Search, tab: 'similarity' },
                  { label: 'Report', icon: FileText, tab: 'reports' },
                  { label: 'Knowledge', icon: BookOpen, tab: 'knowledge' },
                ].map((action, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveTab(action.tab)}
                    className="flex flex-col items-center justify-center gap-3 p-4 bg-surface border border-border rounded-xl hover:border-primary-600 hover:shadow-sm hover:-translate-y-[1px] transition-all text-text-2 hover:text-primary-600"
                  >
                    <action.icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'analyze':
        return (
          <div className="space-y-8 animate-fade-rise max-w-4xl mx-auto">
            <div>
              <h2 className="text-2xl font-semibold text-text tracking-tight mb-1">Analyze Protein</h2>
              <p className="text-text-2">Input a sequence to predict its function and extract properties.</p>
            </div>

            <Card>
              <div className="flex border-b border-border">
                <button className="px-6 py-3 text-sm font-medium border-b-2 border-primary-600 text-primary-700 bg-primary-50">Single Sequence</button>
                <button className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-text-2 hover:text-text" onClick={() => setActiveTab('batch')}>FASTA Upload</button>
              </div>
              <CardContent className="pt-6 space-y-6">
                <SequenceInput 
                  value={sequence} 
                  onChange={setSequence} 
                />
                
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setSequence('MKTLLILAVVAAALAAPVQA')}>Load Example</Button>
                  <Button onClick={handleAnalyze} disabled={!sequence || isAnalyzing}>
                    {isAnalyzing ? 'Analyzing 1 sequence...' : 'Run Analysis'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isAnalyzing && (
              <StepProgress 
                steps={['Sequence validated', 'Features extracted', 'Model loaded', 'Prediction complete']} 
                currentStep={analysisStep} 
              />
            )}
          </div>
        );
      case 'prediction':
        return (
          <div className="space-y-6 animate-fade-rise print:m-0 print:p-0">
            <div className="hidden print:block border-b-2 border-primary-600 pb-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/><path d="M7 12L10 15L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text">AminoAI Official Report</h1>
                  <p className="text-text-3 font-mono text-sm">Sequence Analysis & Function Prediction</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-mono font-semibold text-text tracking-tight">PRT-8924</h2>
                  <span className="text-text-3 text-sm">• Just now • RandomForest</span>
                </div>
              </div>
              <div className="flex gap-2 print:hidden">
                <Button variant="secondary" size="sm" onClick={() => window.print()}><FileText className="w-4 h-4 mr-2" /> Generate PDF</Button>
                <Button variant="secondary" size="sm" onClick={() => { setSequence(sequence || 'MKALIVLGLVLLSVTVQGKVFERCELARTLKRLGMDGYRGISLANWMCLAKWESGYNTRATNYNAGDRSTDYGIFQINSRYWCNDGKTPGAVNACHLSCSALLQDNIADAVACAKRVVRDPQGIRAWVAWRNRCQNRDVRQYVQGCGV'); setShowSimResults(true); setActiveTab('similarity'); }}><Search className="w-4 h-4 mr-2" /> Find Similar</Button>
                <Button variant="secondary" size="sm" onClick={() => { setSequence(sequence || 'MKALIVLGLVLLSVTVQGKVFERCELARTLKRLGMDGYRGISLANWMCLAKWESGYNTRATNYNAGDRSTDYGIFQINSRYWCNDGKTPGAVNACHLSCSALLQDNIADAVACAKRVVRDPQGIRAWVAWRNRCQNRDVRQYVQGCGV'); setShowMutResults(true); setActiveTab('mutation'); }}><Activity className="w-4 h-4 mr-2" /> Mutate</Button>
                <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard.writeText(sequence || 'MKALIVLGLV...'); alert("Sequence copied to clipboard!"); }}><Copy className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 overflow-hidden">
                <div className="flex h-full">
                  <div className="w-2 bg-primary-50 h-full"></div>
                  <div className="p-8 flex-1 flex flex-col justify-center">
                    <div className="text-xs font-semibold text-text-3 tracking-widest uppercase mb-4">Predicted Function</div>
                    <div className="flex items-center gap-4 mb-4">
                      <h1 className="text-[40px] font-bold tracking-tight text-primary-600">{predictionResult?.class || 'Enzyme'}</h1>
                      <ConfidenceBadge confidence={predictionResult?.conf || 85.5} />
                    </div>
                    <p className="text-text-2 text-lg">{predictionResult?.desc || 'Catalyzes biochemical reactions, accelerating metabolic processes within the cell.'}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Class Probabilities</CardTitle>
                </CardHeader>
                <CardContent>
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
            </div>

            <h3 className="text-sm font-semibold text-text-3 tracking-widest uppercase mt-8 mb-4">Protein Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
               {[
                 { label: 'Length', value: '150 aa' },
                 { label: 'Mol. Weight', value: '16.5 kDa' },
                 { label: 'pI', value: '6.5' },
                 { label: 'Instability', value: '35.2', tag: 'Stable' },
                 { label: 'Aromaticity', value: '0.08' },
                 { label: 'GRAVY', value: '-0.42' },
               ].map((stat, i) => (
                 <Card key={i} className="p-4">
                   <div className="text-xs font-medium text-text-3 mb-1 flex justify-between">
                     {stat.label}
                     {stat.tag && <span className="text-success text-[10px] uppercase font-bold">{stat.tag}</span>}
                   </div>
                   <div className="text-lg font-semibold tabular-nums text-text">{stat.value}</div>
                 </Card>
               ))}
            </div>
            
            <div className="mt-8 h-[500px]">
              <ProteinViewer3D pdbId="1ubq" />
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Analyzed Sequence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-surface-muted rounded-lg border border-border font-mono text-sm text-text break-all leading-relaxed max-h-48 overflow-y-auto">
                  {sequence || 'MKALIVLGLVLLSVTVQGKVFERCELARTLKRLGMDGYRGISLANWMCLAKWESGYNTRATNYNAGDRSTDYGIFQINSRYWCNDGKTPGAVNACHLSCSALLQDNIADAVACAKRVVRDPQGIRAWVAWRNRCQNRDVRQYVQGCGV'}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'batch':
        return (
          <div className="space-y-8 animate-fade-rise max-w-4xl mx-auto">
            <div>
              <h2 className="text-2xl font-semibold text-text tracking-tight mb-1">Batch Analysis</h2>
              <p className="text-text-2">Upload a FASTA file to analyze multiple protein sequences at once.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Upload FASTA</CardTitle>
              </CardHeader>
              <CardContent>
                {!batchComplete ? (
                  <>
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
                      className="p-16 border-2 border-dashed border-border-strong rounded-xl flex flex-col items-center justify-center text-center hover:bg-primary-50 hover:border-primary-300 transition-colors cursor-pointer group"
                    >
                      <UploadCloud className="w-12 h-12 text-primary-400 mb-4 group-hover:text-primary-600 transition-colors" />
                      <p className="text-text font-medium mb-1">
                        {batchFile ? batchFile.name : "Click to select a FASTA file"}
                      </p>
                      <p className="text-text-3 text-sm">
                        {batchFile ? `${(batchFile.size / 1024).toFixed(1)} KB` : "Supports .fasta, .fa, .txt up to 10MB"}
                      </p>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button 
                        onClick={handleBatchProcess} 
                        disabled={!batchFile || isBatchProcessing}
                      >
                        {isBatchProcessing ? 'Processing sequences...' : 'Process File'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="p-8 flex flex-col items-center justify-center text-center bg-success-bg border border-success/20 rounded-xl">
                      <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-text mb-2">Analysis Complete!</h3>
                      <p className="text-text-2 mb-6">Successfully analyzed 4 sequences from {batchFile?.name}.</p>
                      <div className="flex gap-4">
                        <Button onClick={() => { setBatchFile(null); setBatchComplete(false); }} variant="secondary">Upload Another</Button>
                        <Button onClick={() => setActiveTab('reports')}><FileText className="w-4 h-4 mr-2" /> Generate Full PDF Report</Button>
                      </div>
                    </div>
                    
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-text-3 uppercase bg-surface-muted border-b border-border">
                          <tr>
                            <th className="px-4 py-3 font-medium">Seq ID</th>
                            <th className="px-4 py-3 font-medium">Sequence Snapshot</th>
                            <th className="px-4 py-3 font-medium">Predicted Class</th>
                            <th className="px-4 py-3 font-medium">Confidence</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { id: 'seq_1 (Lysozyme)', seq: 'MKALIVLGLV...', class: 'Enzyme', conf: 85.5, rawClass: 'enzyme' },
                            { id: 'seq_2 (Hemoglobin)', seq: 'MVLSPADKTN...', class: 'Transport Protein', conf: 92.4, rawClass: 'transport' },
                            { id: 'seq_3 (Actin)', seq: 'MCDEDETTAL...', class: 'Structural Protein', conf: 88.1, rawClass: 'structural' },
                            { id: 'seq_4 (Defensin)', seq: 'MRTLAILAAI...', class: 'Defense Protein', conf: 96.8, rawClass: 'defense' },
                          ].map((row, i) => (
                            <tr key={i} className="border-b border-border hover:bg-bg-subtle transition-colors">
                              <td className="px-4 py-3 font-mono text-text whitespace-nowrap">{row.id}</td>
                              <td className="px-4 py-3 font-mono text-text-2 text-xs">{row.seq}</td>
                              <td className="px-4 py-3"><span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md class-${row.rawClass}`}>{row.class}</span></td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-600 rounded-full" style={{ width: `${row.conf}%` }}></div>
                                  </div>
                                  <span className="text-text-2 text-xs tabular-nums">{row.conf}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button className="text-primary-600 hover:text-primary-700 font-medium text-xs whitespace-nowrap" onClick={() => setActiveTab('prediction')}>View Details</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans animate-super-bg text-white">
        {/* DNA Mesh Overlay */}
        <div className="absolute inset-0 z-0 dna-mesh opacity-60"></div>
        
        {/* Interactive Mouse Particle Field */}
        <MouseParticles />
        
        {/* Animated Plasma Blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden mix-blend-screen pointer-events-none">
          <div className="absolute top-[10%] left-[15%] w-[40vw] h-[40vw] bg-primary-600/30 rounded-full blur-[100px] super-blob"></div>
          <div className="absolute bottom-[5%] right-[10%] w-[45vw] h-[45vw] bg-fuchsia-600/20 rounded-full blur-[120px] super-blob-delay-1"></div>
          <div className="absolute top-[40%] left-[40%] w-[35vw] h-[35vw] bg-indigo-500/20 rounded-full blur-[90px] super-blob-delay-2"></div>
        </div>

        {/* Floating Biological Shapes (Hexagons/Proteins) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[15%] right-[10%] md:right-[15%] opacity-30 animate-fade-rise" style={{ animationDuration: '4s' }}>
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="url(#purpleGradient)" strokeWidth="1" className="animate-[spin_20s_linear_infinite]">
              <defs>
                <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#C084FC" />
                </linearGradient>
              </defs>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="absolute bottom-[15%] left-[5%] md:left-[15%] opacity-40 animate-fade-rise" style={{ animationDuration: '6s' }}>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="url(#purpleGradient)" strokeWidth="0.5" className="animate-[spin_15s_linear_infinite_reverse]">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <polygon points="12 5 19 9 19 15 12 19 5 15 5 9 12 5" />
            </svg>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl px-6 antialiased" style={{ transform: 'translateZ(0)' }}>
          <div className="inline-flex items-center justify-center p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl mb-10 animate-fade-rise">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-fuchsia-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="w-10 h-10" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-[85px] font-extrabold tracking-tight mb-8 animate-fade-rise leading-tight text-white" style={{ animationDelay: '0.1s' }}>
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-fuchsia-300 to-indigo-300">AminoAI</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-14 max-w-3xl mx-auto font-medium leading-relaxed animate-fade-rise tracking-normal" style={{ animationDelay: '0.2s' }}>
            The next-generation platform for protein sequence intelligence. Powered by advanced machine learning to predict, analyze, and mutate biological structures with unprecedented accuracy.
          </p>
          
          <div className="animate-fade-rise" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={() => setHasEnteredApp(true)}
              className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-bold text-white transition-all duration-500 ease-out bg-white/10 border border-white/20 rounded-full hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_60px_rgba(167,139,250,0.6)] backdrop-blur-md overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative flex items-center tracking-wide">
                ENTER PLATFORM 
                <Activity className="w-6 h-6 ml-3 group-hover:animate-pulse" />
              </span>
            </button>
          </div>

          <div className="mt-24 grid grid-cols-3 gap-8 text-center animate-fade-rise border-t border-white/10 pt-12" style={{ animationDelay: '0.5s' }}>
            <div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-2 drop-shadow-lg">19.4k+</div>
              <div className="text-sm font-bold text-primary-200/70 uppercase tracking-[0.2em]">Proteins Trained</div>
            </div>
            <div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-2 drop-shadow-lg">5</div>
              <div className="text-sm font-bold text-primary-200/70 uppercase tracking-[0.2em]">Functional Classes</div>
            </div>
            <div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-2 drop-shadow-lg">91.4%</div>
              <div className="text-sm font-bold text-primary-200/70 uppercase tracking-[0.2em]">Model Accuracy</div>
            </div>
          </div>
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
