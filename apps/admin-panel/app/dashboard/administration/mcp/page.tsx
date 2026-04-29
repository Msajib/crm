'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ModuleGuard from '@/components/ModuleGuard';
import { 
  Server, 
  Database, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Code, 
  ExternalLink,
  Cpu,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MOCK_RESOURCES = [
  { id: 1, name: 'crm://contacts', type: 'Collection', status: 'READY', calls: 1240 },
  { id: 2, name: 'crm://deals', type: 'Collection', status: 'READY', calls: 850 },
  { id: 3, name: 'crm://activities', type: 'Timeline', status: 'SYNCING', calls: 3200 },
];

const MOCK_TOOLS = [
  { name: 'create_contact', desc: 'Adds a new contact to CRM', inputs: 'name, email, phone' },
  { name: 'update_deal_stage', desc: 'Moves a deal to a new stage', inputs: 'deal_id, stage' },
  { name: 'get_lead_score', desc: 'Returns AI lead score for contact', inputs: 'contact_id' },
];

export default function MCPProtocolPage() {
  return (
    <ModuleGuard moduleId="mcp">
      <MCPContent />
    </ModuleGuard>
  );
}

function MCPContent() {
  const [serverStatus, setServerStatus] = useState('OPERATIONAL');

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2 text-gradient flex items-center">
              <Cpu className="w-8 h-8 mr-3 text-primary" />
              MCP Server Configuration
            </h1>
            <p className="text-muted-foreground text-sm">Model Context Protocol (MCP) allows external AI agents to securely interact with your CRM data and tools.</p>
          </div>
          <div className={`px-6 py-3 rounded-2xl border flex items-center space-x-3 font-black text-[10px] tracking-widest ${
            serverStatus === 'OPERATIONAL' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
             <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
             <span>SERVER {serverStatus}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Resource Monitoring */}
           <div className="lg:col-span-2 space-y-8">
              <section className="glass-premium p-8 rounded-[40px] border border-border premium-shadow">
                 <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                       <Database className="w-5 h-5 text-primary" />
                       <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Exposed Resources</h2>
                    </div>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center space-x-1 hover:underline">
                       <RefreshCw className="w-3 h-3" />
                       <span>Re-index Resources</span>
                    </button>
                 </div>
                 
                 <div className="space-y-4">
                    {MOCK_RESOURCES.map(res => (
                       <div key={res.id} className="flex items-center justify-between p-6 bg-muted/30 border border-border rounded-3xl group hover:bg-primary/5 transition-all">
                          <div className="flex items-center space-x-4">
                             <div className="w-10 h-10 bg-background rounded-xl border border-border flex items-center justify-center text-muted-foreground">
                                <Terminal className="w-4 h-4" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-foreground">{res.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black">{res.type}</p>
                             </div>
                          </div>
                          <div className="flex items-center space-x-6">
                             <div className="text-right">
                                <p className="text-xs font-black text-foreground">{res.calls.toLocaleString()}</p>
                                <p className="text-[8px] text-muted-foreground uppercase font-black">Total Tool Calls</p>
                             </div>
                             <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest ${
                                res.status === 'READY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'
                             }`}>{res.status}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>

              <section className="glass-premium p-8 rounded-[40px] border border-border premium-shadow bg-primary/5">
                 <div className="flex items-center space-x-3 mb-8">
                    <Code className="w-5 h-5 text-primary" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-foreground">AI Tool Definition</h2>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MOCK_TOOLS.map(tool => (
                       <div key={tool.name} className="p-5 bg-background border border-border rounded-3xl flex flex-col justify-between">
                          <div>
                             <p className="text-xs font-black text-primary mb-1">/{tool.name}</p>
                             <p className="text-[10px] text-muted-foreground leading-relaxed">{tool.desc}</p>
                          </div>
                          <p className="text-[8px] font-black text-muted-foreground uppercase mt-4 opacity-50">Args: {tool.inputs}</p>
                       </div>
                    ))}
                 </div>
              </section>
           </div>

           {/* MCP Integration Details */}
           <aside className="space-y-8">
              <div className="glass-premium p-8 rounded-[40px] border border-border premium-shadow bg-muted/50">
                 <div className="flex items-center space-x-3 mb-6">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-black text-sm uppercase tracking-widest">Access & Security</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">MCP Bearer Token</label>
                       <div className="flex items-center space-x-2">
                          <input type="password" value="mcp_live_••••••••••••••••" readOnly className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-xs focus:outline-none" />
                          <button className="p-3 bg-primary text-white rounded-xl hover:opacity-90 transition-all"><RefreshCw className="w-4 h-4" /></button>
                       </div>
                    </div>
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                       <p className="text-[10px] text-emerald-600 font-bold leading-relaxed">
                          Row Level Security (RLS) is automatically enforced on all MCP requests. Agents can only access data permitted by their specific user role.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="glass-premium p-8 rounded-[40px] border border-border premium-shadow">
                 <div className="flex items-center space-x-3 mb-6">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-widest">Request Tracing</h3>
                 </div>
                 <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                       <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl border border-border">
                          <div className="flex items-center space-x-3">
                             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                             <span className="text-[10px] font-bold text-foreground">GET /contacts</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-black">24ms</span>
                       </div>
                    ))}
                    <button className="w-full py-3 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View Full Audit Trail</button>
                 </div>
              </div>
           </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
