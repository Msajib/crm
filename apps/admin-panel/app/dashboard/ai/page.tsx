'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Zap, 
  Shield, 
  BrainCircuit
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Message {
  id: number;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

interface LeadScore {
  name: string;
  score: number;
}

interface Recommendation {
  title: string;
  description: string;
}

export default function AISalesAgent() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', content: "Hello! I'm your AI Sales Agent. I've analyzed your current pipeline. How can I help you today?", timestamp: '10:00 AM' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadScores, setLeadScores] = useState<LeadScore[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [scoresRes, recsRes] = await Promise.all([
        fetch('/api/v1/ai/lead-scores', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/v1/ai/recommendations', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (scoresRes.ok) setLeadScores(await scoresRes.json());
      if (recsRes.ok) setRecommendations(await recsRes.json());
    } catch (err) {
      console.error('Failed to fetch AI data', err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { 
      id: Date.now(), 
      role: 'user', 
      content: input, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { ...data, id: Date.now() + 1 }]);
      } else {
        toast.error('AI Service currently unavailable');
      }
    } catch (err) {
      toast.error('Failed to connect to AI Service');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in flex flex-col h-[calc(100vh-160px)]">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2 text-gradient flex items-center">
              <Sparkles className="w-8 h-8 mr-3 text-primary animate-pulse" />
              AI Sales Agent
            </h1>
            <p className="text-muted-foreground text-sm">Autonomous assistant for lead scoring, outreach generation, and deal analysis.</p>
          </div>
          <div className="flex items-center space-x-2">
             <div className="flex -space-x-2">
                {['Gemini', 'GPT-5', 'Claude'].map((model) => (
                  <div key={model} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-black uppercase">
                    {model[0]}
                  </div>
                ))}
             </div>
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-3">Multi-Model Active</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden">
          {/* Chat Interface */}
          <div className="lg:col-span-3 bg-card rounded-[48px] border border-border flex flex-col overflow-hidden premium-shadow">
            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide" ref={scrollRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`flex items-start space-x-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                      msg.role === 'assistant' ? 'bg-primary text-white' : 'bg-muted text-foreground border border-border'
                    }`}>
                      {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div className={`p-6 rounded-[32px] text-sm leading-relaxed shadow-sm ${
                      msg.role === 'assistant' ? 'bg-muted/50 text-foreground rounded-tl-none border border-border' : 'bg-primary text-white rounded-tr-none'
                    }`}>
                      {msg.content}
                      <p className={`text-[8px] mt-2 font-black uppercase tracking-widest ${msg.role === 'assistant' ? 'text-muted-foreground' : 'text-white/50'}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start animate-in fade-in slide-in-from-left-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center">
                       <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-muted/50 p-6 rounded-[32px] rounded-tl-none border border-border">
                       <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100"></div>
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200"></div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-8 bg-muted/30 border-t border-border">
               <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask anything about your pipeline or contacts..." 
                    className="w-full bg-background border border-border rounded-3xl pl-8 pr-16 py-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center hover:opacity-90 transition-all active:scale-95">
                    <Send className="w-4 h-4" />
                  </button>
               </div>
               <div className="flex items-center justify-center space-x-6 mt-4">
                  {['Draft Email', 'Score Leads', 'Analyze Deals', 'Next Actions'].map((action) => (
                    <button key={action} className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-all">
                      {action}
                    </button>
                  ))}
               </div>
            </form>
          </div>

          {/* AI Insights Sidebar */}
          <aside className="space-y-8 overflow-y-auto scrollbar-hide">
             <div className="bg-card p-8 rounded-[40px] border border-border premium-shadow">
                <div className="flex items-center space-x-3 mb-6">
                   <BrainCircuit className="w-5 h-5 text-primary" />
                   <h3 className="font-black text-sm uppercase tracking-widest">Lead Scores</h3>
                </div>
                <div className="space-y-4">
                   {leadScores.map((ls, idx) => (
                     <LeadScoreItem key={idx} name={ls.name} score={ls.score} />
                   ))}
                </div>
             </div>

             <div className="bg-card p-8 rounded-[40px] border border-border premium-shadow bg-primary/5">
                <div className="flex items-center space-x-3 mb-6">
                   <Zap className="w-5 h-5 text-primary" />
                   <h3 className="font-black text-sm uppercase tracking-widest">Recommended</h3>
                </div>
                <div className="space-y-4">
                   {recommendations.map((rec, idx) => (
                     <div key={idx} className="p-4 bg-background/50 border border-border rounded-2xl">
                        <p className="text-xs font-bold text-foreground">{rec.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{rec.description}</p>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-card p-8 rounded-[40px] border border-border premium-shadow">
                <div className="flex items-center space-x-3 mb-6">
                   <Shield className="w-5 h-5 text-primary" />
                   <h3 className="font-black text-sm uppercase tracking-widest">Safety Check</h3>
                </div>
                <div className="flex items-center space-x-2 text-emerald-500">
                   <Zap className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase">RLS Protected</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 italic">Your CRM data is never used for external model training.</p>
             </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

function LeadScoreItem({ name, score }: { name: string, score: number }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-xs font-bold text-foreground">{name}</span>
       <div className="flex items-center space-x-3">
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
             <div className="h-full bg-primary" style={{ width: `${score}%` }}></div>
          </div>
          <span className="text-[10px] font-black text-primary">{score}</span>
       </div>
    </div>
  );
}
