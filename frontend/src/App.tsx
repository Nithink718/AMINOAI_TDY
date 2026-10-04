import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { SequenceInput } from './components/protein/SequenceInput';
import { StepProgress } from './components/ui/StepProgress';
import { ClassChip } from './components/protein/ClassChip';
import { ConfidenceBadge } from './components/protein/ConfidenceBadge';
import { ProbabilityBars } from './components/protein/ProbabilityBars';
import { FileText, Search, Activity, Copy, UploadCloud, Stethoscope, BookOpen } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sequence, setSequence] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const handleAnalyze = () => {
    if (!sequence) return;
    setIsAnalyzing(true);
    setAnalysisStep(0);
    
    // Simulate steps
    setTimeout(() => setAnalysisStep(1), 600);
    setTimeout(() => setAnalysisStep(2), 1200);
    setTimeout(() => setAnalysisStep(3), 1800);
    setTimeout(() => {
      setAnalysisStep(4);
      setIsAnalyzing(false);
      setActiveTab('prediction');
    }, 2400);
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
                <button className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-text-2 hover:text-text">FASTA Upload</button>
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
          <div className="space-y-6 animate-fade-rise">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-mono font-semibold text-text tracking-tight">PRT-8924</h2>
                  <span className="text-text-3 text-sm">• Just now • RandomForest</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm"><FileText className="w-4 h-4 mr-2" /> Generate PDF</Button>
                <Button variant="secondary" size="sm"><Search className="w-4 h-4 mr-2" /> Find Similar</Button>
                <Button variant="secondary" size="sm"><Activity className="w-4 h-4 mr-2" /> Mutate</Button>
                <Button variant="secondary" size="sm"><Copy className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 overflow-hidden">
                <div className="flex h-full">
                  <div className="w-2 bg-primary-50 h-full"></div>
                  <div className="p-8 flex-1 flex flex-col justify-center">
                    <div className="text-xs font-semibold text-text-3 tracking-widest uppercase mb-4">Predicted Function</div>
                    <div className="flex items-center gap-4 mb-4">
                      <h1 className="text-[40px] font-bold tracking-tight text-primary-600">Enzyme</h1>
                      <ConfidenceBadge confidence={85.5} />
                    </div>
                    <p className="text-text-2 text-lg">Catalyzes biochemical reactions, accelerating metabolic processes within the cell.</p>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Class Probabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProbabilityBars 
                    predictedClass="enzyme"
                    probabilities={{
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
                <div className="p-16 border-2 border-dashed border-border-strong rounded-xl flex flex-col items-center justify-center text-center hover:bg-bg-subtle transition-colors cursor-pointer">
                  <UploadCloud className="w-12 h-12 text-primary-400 mb-4" />
                  <p className="text-text font-medium mb-1">Click or drag FASTA file here</p>
                  <p className="text-text-3 text-sm">Supports .fasta, .fa, .txt up to 10MB</p>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button disabled>Process File</Button>
                </div>
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
                  <Button>Search Database</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Results (Mock)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-text-3 text-sm flex items-center justify-center h-32 border border-dashed rounded-lg">Run search to see similarity results.</div>
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
                <CardContent><textarea className="w-full h-32 p-3 font-mono text-sm border rounded-lg bg-surface-muted focus:ring-2 focus:ring-primary-600/20 outline-none" placeholder="Paste original..." defaultValue="MKTLLILAVVAAALAAPVQA" /></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Mutated Sequence</CardTitle></CardHeader>
                <CardContent><textarea className="w-full h-32 p-3 font-mono text-sm border rounded-lg bg-surface-muted focus:ring-2 focus:ring-primary-600/20 outline-none" placeholder="Paste mutated..." defaultValue="MKTLLILGVVAAALAAPVQA" /></CardContent>
              </Card>
            </div>
            <div className="flex justify-end"><Button>Analyze Impact</Button></div>
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
                  <Button variant="secondary" onClick={() => setSequence('MKTLLILAVVAAALAAPVQAQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ')}>Load PolyQ Example</Button>
                  <Button>Scan Sequence</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'models':
        return (
          <div className="space-y-6 animate-fade-rise">
            <div>
              <h2 className="text-2xl font-semibold text-text tracking-tight mb-1">Model Performance</h2>
              <p className="text-text-2">Evaluation metrics on the held-out test set.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Confusion Matrix</CardTitle></CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-text-3">Heatmap visualization placeholder.</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Metrics</CardTitle></CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-text-3">Bar chart placeholder.</CardContent>
              </Card>
            </div>
          </div>
        );
      case 'reports':
      case 'knowledge':
      case 'settings':
        return (
          <div className="space-y-6 animate-fade-rise max-w-4xl mx-auto">
            <div>
              <h2 className="text-2xl font-semibold text-text tracking-tight mb-1 capitalize">{activeTab}</h2>
              <p className="text-text-2">Manage {activeTab} preferences and data.</p>
            </div>
            <Card>
              <CardContent className="pt-6 h-48 flex items-center justify-center text-text-3 border-dashed border-2 m-4 rounded-xl">
                This section is operational but empty in demo mode.
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

  return (
    <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </AppShell>
  );
}

export default App;
