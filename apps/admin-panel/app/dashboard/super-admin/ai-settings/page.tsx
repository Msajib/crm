'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Sparkles, 
  Cpu, 
  Lock, 
  Settings, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  Bot,
  Brain,
  Key,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Info,
  Server,
  X,
  Mic
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI (ChatGPT)', description: 'Industry leader for conversational AI and reasoning.', icon: Sparkles, color: 'text-emerald-500 bg-emerald-500/10', defaultModel: 'gpt-4o' },
  { id: 'google', name: 'Google Gemini', description: 'Multimodal excellence with massive context windows.', icon: Brain, color: 'text-blue-500 bg-blue-500/10', defaultModel: 'gemini-1.5-pro' },
  { id: 'anthropic', name: 'Anthropic (Claude)', description: 'Specialized in safety, long-form writing, and coding.', icon: ShieldCheck, color: 'text-orange-500 bg-orange-500/10', defaultModel: 'claude-3-5-sonnet' },
  { id: 'grok', name: 'xAI (Grok)', description: 'Real-time knowledge access and witty responses.', icon: Zap, color: 'text-indigo-500 bg-indigo-500/10', defaultModel: 'grok-1' },
  { id: 'elevenlabs', name: 'ElevenLabs (Voice)', description: 'Industry-leading text-to-speech engine for conversational AI.', icon: Mic, color: 'text-purple-500 bg-purple-500/10', defaultModel: 'eleven_multilingual_v2' },
];

export default function AISettingsPage() {
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [settingsModal, setSettingsModal] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const data = await api.get('/ai/configs');
      const configMap: Record<string, any> = {};
      data.forEach((c: any) => {
        configMap[c.provider.toLowerCase()] = {
          ...c,
          apiKey: '********' // Mask the key
        };
      });
      setConfigs(configMap);
    } catch (err) {
      toast.error('Failed to load AI configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (provider: string) => {
    const config = configs[provider];
    if (!config?.apiKey) {
      toast.error('API Key is required');
      return;
    }

    try {
      await api.post('/ai/config', {
        provider: provider.toUpperCase(),
        apiKey: config.apiKey === '********' ? undefined : config.apiKey,
        modelName: config.modelName || AI_PROVIDERS.find(p => p.id === provider)?.defaultModel,
        isActive: true
      });

      toast.success(`${provider.toUpperCase()} configured!`, { icon: '🤖' });
      setSettingsModal(null);
      fetchConfigs();
    } catch (err) {
      toast.error('Save failed');
    }
  };

  const updateField = (provider: string, field: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [provider]: {
        ...(prev[provider] || {}),
        [field]: value
      }
    }));
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10 max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-foreground tracking-tight">AI Infrastructure</h1>
            <p className="text-muted-foreground text-sm font-medium max-w-2xl">Manage enterprise LLM keys to power your Sales Agent, Lead Scoring, and Automations.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Encrypted Keys</span>
             </div>
             <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
                <Cpu className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Multi-Provider</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           <div className="xl:col-span-2 space-y-5">
              {AI_PROVIDERS.map((provider) => (
                 <div key={provider.id} className="bg-card p-8 rounded-[32px] border border-border flex flex-col md:flex-row items-center justify-between group hover:border-primary/40 transition-all shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 relative z-10">
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 duration-500 ${provider.color}`}>
                          <provider.icon className="w-8 h-8" />
                       </div>
                       <div className="text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start space-x-2 mb-1">
                             <h3 className="text-lg font-black text-foreground">{provider.name}</h3>
                             {configs[provider.id]?.isActive ? (
                                <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                                   <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                   <span>Connected</span>
                                </span>
                             ) : (
                                <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[8px] font-black uppercase tracking-widest border border-border">Disconnected</span>
                             )}
                          </div>
                          <p className="text-xs text-muted-foreground max-w-sm font-medium">{provider.description}</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-6 md:mt-0 relative z-10 w-full md:w-auto">
                       <button 
                          onClick={() => setSettingsModal(provider.id)} 
                          className="flex-1 md:flex-none p-3.5 bg-muted hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-all border border-border"
                       >
                          <Settings className="w-5 h-5" />
                       </button>
                       <button 
                          onClick={() => setSettingsModal(provider.id)}
                          className={`w-full md:w-auto px-8 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg ${
                            configs[provider.id]?.isActive ? 'bg-muted text-foreground' : 'bg-primary text-white shadow-primary/20'
                          }`}
                       >
                          {configs[provider.id]?.isActive ? 'Update Config' : 'Setup Provider'}
                       </button>
                    </div>
                 </div>
              ))}
           </div>

           <aside className="space-y-6">
              <div className="bg-card p-8 rounded-[32px] border border-border bg-gradient-to-br from-card to-primary/5 relative overflow-hidden group">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
                    <Lock className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-black text-foreground mb-3">Enterprise Privacy</h3>
                 <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-medium">
                    Your API keys are encrypted using AES-256 GCM. We never use your company data to train global models.
                 </p>
                 <div className="flex items-center space-x-2 text-[9px] font-black text-primary uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>SOC2 Compliant Storage</span>
                 </div>
              </div>

              <div className="bg-card p-8 rounded-[32px] border border-border space-y-6">
                 <h3 className="text-base font-black text-foreground">Global Context</h3>
                 <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border flex justify-between items-center">
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Preferred Engine</span>
                       <span className="text-xs font-black text-foreground">GPT-4o</span>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border flex justify-between items-center">
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Knowledge Sync</span>
                       <span className="text-xs font-black text-emerald-500">Every 15m</span>
                    </div>
                 </div>
              </div>
           </aside>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-xl rounded-[40px] border border-border shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            
            <div className="p-8 md:p-10 border-b border-border flex justify-between items-center">
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground capitalize">{settingsModal} Config</h2>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">LLM Integration</p>
                  </div>
               </div>
               <button onClick={() => setSettingsModal(null)} className="p-2.5 hover:bg-muted rounded-xl transition-all text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar space-y-8 flex-1">
               <button 
                 onClick={() => setShowGuide(!showGuide)}
                 className="w-full p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between group transition-all"
               >
                  <div className="flex items-center space-x-3">
                     <Info className="w-4 h-4 text-primary" />
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">How to get API keys?</span>
                  </div>
                  {showGuide ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
               </button>

               {showGuide && (
                  <div className="p-6 bg-muted/40 rounded-2xl border border-border text-[11px] text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 duration-200">
                     <p className="font-bold text-foreground mb-2">Instructions:</p>
                     {settingsModal === 'openai' && <p>Go to platform.openai.com, navigate to API Keys, and create a new secret key.</p>}
                     {settingsModal === 'google' && <p>Go to aistudio.google.com and create a free API key for Gemini.</p>}
                     {settingsModal === 'anthropic' && <p>Log in to console.anthropic.com and generate a key from the Settings.</p>}
                     {settingsModal === 'grok' && <p>Visit x.ai/api and follow the instructions to obtain your Grok API key.</p>}
                     {settingsModal === 'elevenlabs' && <p>Go to elevenlabs.io, sign in, click your profile icon, and view your API key.</p>}
                  </div>
               )}

               <div className="space-y-6">
                  <ConfigField 
                    label="API Secret Key" 
                    field="apiKey" 
                    id={settingsModal} 
                    placeholder={`Enter ${settingsModal} key...`} 
                    value={configs[settingsModal]?.apiKey} 
                    onChange={updateField} 
                    secret 
                  />
                  <ConfigField 
                    label="Model Version" 
                    field="modelName" 
                    id={settingsModal} 
                    placeholder={AI_PROVIDERS.find(p => p.id === settingsModal)?.defaultModel} 
                    value={configs[settingsModal]?.modelName} 
                    onChange={updateField} 
                  />
               </div>
            </div>

            <div className="p-8 md:p-10 border-t border-border bg-muted/20">
               <button 
                 onClick={() => handleSave(settingsModal)} 
                 className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center space-x-3"
               >
                 <CheckCircle2 className="w-5 h-5" />
                 <span>Synchronize Key</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function ConfigField({ label, field, id, placeholder, value, onChange, secret = false }: any) {
  const [show, setShow] = useState(!secret);
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
         <input 
            type={show ? "text" : "password"} 
            value={value || ''}
            onChange={(e) => onChange(id, field, e.target.value)}
            className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" 
            placeholder={placeholder} 
         />
         {secret && (
            <button type="button" onClick={() => setShow(!show)} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
               {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
         )}
      </div>
    </div>
  );
}
