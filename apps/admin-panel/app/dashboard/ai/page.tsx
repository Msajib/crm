'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ModuleGuard } from '@/components/ModuleGuard';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Zap, 
  Shield, 
  BrainCircuit,
  Upload,
  FileText,
  Plus,
  X,
  Search,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

interface Message {
  id: number;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

interface Knowledge {
  id: string;
  fileName: string;
  createdAt: string;
}

export default function AISalesAgent() {
  return (
    <ModuleGuard moduleId="ai">
      <AIContent />
    </ModuleGuard>
  );
}

function AIContent() {
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', content: "Hello! I'm your AI Sales Agent. I can now learn from your uploaded documents. How can I help you today?", timestamp: '10:00 AM' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [showAddKnowledge, setShowAddKnowledge] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState({ fileName: '', content: '' });
  const [leadScores, setLeadScores] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchKnowledge();
    fetchLeadScores();
  }, []);

  const fetchKnowledge = async () => {
    try {
      const data = await api.get('/ai/knowledge');
      setKnowledgeList(data);
    } catch (err) {
      console.error('Failed to fetch knowledge', err);
    }
  };

  const fetchLeadScores = async () => {
    try {
      const data = await api.get('/ai/lead-scores');
      setLeadScores(data);
    } catch (err) {
      console.error('Failed to fetch lead scores', err);
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
      const data = await api.post('/ai/chat', { message: input });
      setMessages(prev => [...prev, { ...data, id: Date.now() + 1 }]);
    } catch (err) {
      toast.error('AI Service Error');
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/ai/knowledge', newKnowledge);
      toast.success('Document added to Knowledge Base');
      setShowAddKnowledge(false);
      setNewKnowledge({ fileName: '', content: '' });
      fetchKnowledge();
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in flex flex-col h-[calc(100vh-160px)]">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2 text-gradient flex items-center tracking-tight">
              <Sparkles className="w-8 h-8 mr-3 text-primary animate-pulse" />
              AI Sales Agent
            </h1>
            <p className="text-muted-foreground text-sm font-medium italic">Autonomous intelligence for document-trained lead scoring and deal analysis.</p>
          </div>
          <div className="flex bg-muted/50 p-1 rounded-2xl border border-border shadow-inner">
             <button 
               onClick={() => setActiveTab('chat')}
               className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
             >
               Chat Hub
             </button>
             <button 
               onClick={() => setActiveTab('knowledge')}
               className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'knowledge' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
             >
               Knowledge Base
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            <>
              {/* Chat Interface */}
              <div className="lg:col-span-3 bg-card rounded-[48px] border border-border flex flex-col overflow-hidden premium-shadow">
                <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide" ref={scrollRef}>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`flex items-start space-x-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                          msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'
                        }`}>
                          {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div className={`p-6 rounded-[32px] text-sm leading-relaxed shadow-sm ${
                          msg.role === 'assistant' ? 'bg-muted/50 text-foreground rounded-tl-none border border-border' : 'bg-primary text-primary-foreground rounded-tr-none'
                        }`}>
                          {msg.content}
                          <p className={`text-[8px] mt-2 font-black uppercase tracking-widest ${msg.role === 'assistant' ? 'text-muted-foreground' : 'text-primary-foreground/50'}`}>
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-left-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
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
                        className="w-full bg-background border border-border rounded-3xl pl-8 pr-16 py-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner text-foreground placeholder:text-muted-foreground"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                      />
                      <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/30">
                        <Send className="w-4 h-4" />
                      </button>
                   </div>
                </form>
              </div>

              {/* Sidebar */}
              <aside className="space-y-8 overflow-y-auto scrollbar-hide">
                 <div className="bg-card p-8 rounded-[40px] border border-border premium-shadow">
                    <div className="flex items-center space-x-3 mb-6 text-primary">
                       <BrainCircuit className="w-5 h-5" />
                       <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Lead Intelligence</h3>
                    </div>
                    <div className="space-y-4">
                       {leadScores.map((ls, idx) => (
                         <div key={idx} className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground/80">{ls.name}</span>
                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{ls.score}%</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/20 premium-shadow">
                    <div className="flex items-center space-x-3 mb-6 text-primary">
                       <Database className="w-5 h-5" />
                       <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Knowledge Base</h3>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed mb-6 italic">
                       AI is currently utilizing {knowledgeList.length} company documents to provide context-aware responses.
                    </p>
                    <button 
                      onClick={() => setActiveTab('knowledge')}
                      className="w-full py-4 bg-primary/10 text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                    >
                      Manage Base
                    </button>
                 </div>
              </aside>
            </>
          ) : (
            <div className="lg:col-span-4 space-y-8 overflow-y-auto scrollbar-hide">
              <div className="flex justify-between items-end">
                <div>
                   <h2 className="text-2xl font-black text-foreground tracking-tight">Enterprise Knowledge Base</h2>
                   <p className="text-muted-foreground text-sm font-medium italic mt-1">Upload SOPs, Product Specs, and Company Policies to train your Agent.</p>
                </div>
                 <button 
                  onClick={() => setShowAddKnowledge(true)}
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black flex items-center space-x-3 hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-primary/20"
                >
                  <Upload className="w-5 h-5" />
                  <span>Train Agent</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {knowledgeList.map((k) => (
                  <div key={k.id} className="glass-premium p-8 rounded-[40px] border border-border group hover:border-primary/30 transition-all premium-shadow">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                       <FileText className="w-7 h-7" />
                    </div>
                     <h4 className="text-lg font-black text-foreground mb-2">{k.fileName}</h4>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-6">Added {new Date(k.createdAt).toLocaleDateString()}</p>
                    <div className="flex items-center space-x-2 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl self-start w-fit">
                       <Shield className="w-3 h-3" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Active Context</span>
                    </div>
                  </div>
                ))}
                 {knowledgeList.length === 0 && (
                  <div className="col-span-full py-32 text-center glass-premium rounded-[60px] border border-dashed border-border">
                     <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Database className="w-10 h-10 text-muted-foreground" />
                     </div>
                     <h3 className="text-xl font-bold text-foreground mb-2">No Training Data Found</h3>
                     <p className="text-muted-foreground text-sm max-w-sm mx-auto">Your AI Agent is currently using default industry models. Upload documents to make it smarter.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Knowledge Modal */}
       {showAddKnowledge && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-2xl rounded-[50px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h2 className="text-3xl font-black text-foreground tracking-tight">Train AI Agent</h2>
                  <p className="text-sm text-muted-foreground mt-2 font-medium">Input document content to provide specific business context.</p>
               </div>
                <button onClick={() => setShowAddKnowledge(false)} className="p-4 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddKnowledge} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Document Name</label>
                  <input required value={newKnowledge.fileName} onChange={e => setNewKnowledge({...newKnowledge, fileName: e.target.value})} type="text" className="w-full bg-background border border-border rounded-3xl px-8 py-5 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" placeholder="e.g. Sales Playbook 2026" />
               </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Extracted Content</label>
                  <textarea required value={newKnowledge.content} onChange={e => setNewKnowledge({...newKnowledge, content: e.target.value})} className="w-full bg-background border border-border rounded-3xl px-8 py-5 text-sm font-medium text-foreground min-h-[250px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" placeholder="Paste the text from your document here..." />
               </div>

                <div className="flex space-x-4 pt-6">
                 <button onClick={() => setShowAddKnowledge(false)} type="button" className="flex-1 py-5 bg-muted text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-all active:scale-95">Cancel</button>
                 <button type="submit" className="flex-[2] py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all active:scale-95">Ingest Data</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
