import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loader2, Box } from 'lucide-react';

interface ProteinViewer3DProps {
  pdbId?: string; // e.g., '1cbs', '1ubq'
}

declare global {
  interface Window {
    $3Dmol: any;
  }
}

export function ProteinViewer3D({ pdbId = '1ubq' }: ProteinViewer3DProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!viewerRef.current || !window.$3Dmol) return;
    
    setLoading(true);
    setError(null);

    // Initialize viewer
    const viewer = window.$3Dmol.createViewer(viewerRef.current, {
      backgroundColor: '#f8fafc', // match surface color
    });

    // Fetch PDB data from backend proxy or RCSB directly
    const fetchPdb = async () => {
      try {
        const response = await fetch(`https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`);
        if (!response.ok) throw new Error('Failed to fetch PDB file');
        
        const pdbData = await response.text();
        
        viewer.addModel(pdbData, "pdb");
        
        // Setup initial style (cartoon)
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
        
        viewer.zoomTo();
        viewer.render();
        viewer.zoom(1.2, 1000);
      } catch (err: any) {
        setError(err.message || "Failed to load 3D structure");
      } finally {
        setLoading(false);
      }
    };

    fetchPdb();

    // Cleanup
    return () => {
      if (viewer) {
        viewer.clear();
      }
    };
  }, [pdbId]);

  return (
    <Card className="h-full flex flex-col overflow-hidden border border-border">
      <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border bg-surface-muted">
        <CardTitle className="flex items-center gap-2">
          <Box className="w-5 h-5 text-primary-600" />
          Interactive 3D Structure <span className="text-text-3 font-mono text-sm ml-2">({pdbId.toUpperCase()})</span>
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => {
            if (viewerRef.current && window.$3Dmol) {
               // A hack to force re-render/zoom
               const evt = new Event('resize');
               window.dispatchEvent(evt);
            }
          }}>
            Reset View
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative flex-1 min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/50 z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface z-10 text-error flex-col gap-2">
            <Box className="w-8 h-8" />
            <p>{error}</p>
          </div>
        )}
        <div 
          ref={viewerRef} 
          className="w-full h-full min-h-[400px] cursor-grab active:cursor-grabbing"
          style={{ position: 'relative' }} 
        />
      </CardContent>
    </Card>
  );
}
