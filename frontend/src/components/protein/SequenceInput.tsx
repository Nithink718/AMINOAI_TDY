import React from 'react';

interface SequenceInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export function SequenceInput({ value, onChange, error }: SequenceInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Simple paste cleaning: remove whitespace and numbers
    const cleaned = e.target.value.replace(/[\s\d]/g, '').toUpperCase();
    onChange(cleaned);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder="Paste amino acid sequence here (e.g., MKTLLIL...)"
          className={`w-full h-48 p-4 font-mono text-sm bg-surface-muted border rounded-xl focus:outline-none focus:ring-4 transition-all resize-none ${
            error 
              ? 'border-danger focus:border-danger focus:ring-danger/15' 
              : 'border-border focus:border-primary-600 focus:ring-primary-600/15'
          }`}
          spellCheck={false}
        />
        <div className="absolute bottom-4 right-4 text-xs font-mono text-text-3">
          {value.length} aa
        </div>
      </div>
      {error && (
        <div className="mt-2 text-sm text-danger font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
          {error}
        </div>
      )}
    </div>
  );
}
