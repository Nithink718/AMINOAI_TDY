import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function BioAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I am your AminoAI Bio-Assistant. Ask me anything about protein structures, mutations, or the prediction results on your screen!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate API call to LLM
    setTimeout(() => {
      let botResponse = "I'm analyzing that right now. Based on the sequence properties, this appears to be a highly conserved region typical of catalytic domains.";
      
      const lowerInput = userMessage.content.toLowerCase();
      if (lowerInput.includes('mutation') || lowerInput.includes('mutate')) {
        botResponse = "Mutations in this region, particularly replacing a hydrophobic residue with a charged one, often lead to destabilization of the protein's hydrophobic core, potentially causing a loss of function.";
      } else if (lowerInput.includes('disease') || lowerInput.includes('risk')) {
        botResponse = "I scanned the sequence for known pathogenic motifs. While there are no high-risk amyloidogenic regions, there is a slight structural similarity to known inflammatory markers. Further clinical assay is recommended.";
      } else if (lowerInput.includes('ubiquitin') || lowerInput.includes('1ubq')) {
        botResponse = "Ubiquitin (1UBQ) is a small regulatory protein found in most tissues of eukaryotic organisms. It essentially acts as a 'kiss of death' tag, marking other proteins for degradation by the proteasome.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: botResponse
      }]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full shadow-xl flex items-center justify-center text-white hover:bg-primary-700 hover:scale-105 transition-all z-50 animate-bounce-slow"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[550px] shadow-2xl flex flex-col z-50 animate-fade-rise border-border-strong overflow-hidden">
      <CardHeader className="bg-primary-600 text-white p-4 rounded-t-xl flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-white text-base">Bio-Assistant AI</CardTitle>
            <p className="text-primary-100 text-xs">Powered by LLM</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-y-auto bg-surface-muted flex flex-col gap-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-surface border border-border text-primary-600'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-surface border border-border text-text rounded-tl-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-surface border border-border text-primary-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-surface border border-border rounded-tl-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-text-3 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-text-3 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
              <span className="w-1.5 h-1.5 bg-text-3 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-3 bg-surface border-t border-border">
        <form 
          className="flex w-full gap-2"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this protein..."
            className="flex-1 px-4 py-2 bg-surface-muted border border-border rounded-full text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-text"
          />
          <Button type="submit" disabled={!input.trim() || isTyping} className="rounded-full w-10 h-10 p-0 flex items-center justify-center flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
