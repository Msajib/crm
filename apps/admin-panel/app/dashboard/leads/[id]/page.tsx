'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { useFeatureGates } from '@/hooks/useFeatureGates';
import {
  ArrowLeft, Phone, Mail, MessageSquare, Briefcase, Zap, Plus,
  CheckCircle2, Clock, MapPin, Building, Globe, Send, X, MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { gates } = useFeatureGates();
  
  const [lead, setLead] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  
  // Convert modal
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState({
    title: '',
    value: 0,
    pipelineId: '',
    stageId: '',
    closeDate: ''
  });

  // Users for assignment
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (params?.id) {
      fetchLeadData();
      fetchAuxData();
    }
  }, [params?.id]);

  const fetchLeadData = async () => {
    try {
      const [leadData, timelineData] = await Promise.all([
        api.get(`/contacts/${params.id}`),
        api.get(`/contacts/${params.id}/timeline`)
      ]);
      setLead(leadData);
      setTimeline(Array.isArray(timelineData) ? timelineData : []);
    } catch (err) {
      toast.error('Failed to load lead data');
      router.push('/dashboard/leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [pipeData, usersData] = await Promise.all([
        api.get('/pipelines'),
        api.get('/settings/users')
      ]);
      setPipelines(pipeData || []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Failed to load auxiliary data', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await api.post('/activities', {
        contactId: lead.id,
        type: 'NOTE',
        subject: 'Note added',
        notes: newNote
      });
      setNewNote('');
      fetchLeadData();
      toast.success('Note added');
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  const handleAssign = async (userId: string) => {
    try {
      await api.patch(`/contacts/${lead.id}/assign`, { assignedTo: userId });
      fetchLeadData();
      toast.success('Assigned successfully');
    } catch (err) {
      toast.error('Failed to assign');
    }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversionData.pipelineId || !conversionData.stageId) {
      return toast.error('Please select pipeline and stage');
    }
    try {
      await api.post(`/contacts/${lead.id}/convert-to-deal`, conversionData);
      toast.success('Converted to deal successfully!');
      setShowConvertModal(false);
      fetchLeadData();
    } catch (err) {
      toast.error('Failed to convert');
    }
  };

  if (loading || !lead) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between glass-premium p-6 rounded-3xl border border-border">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-xl transition-all">
              <ArrowLeft className="w-6 h-6 text-muted-foreground" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl">
                {lead.firstName?.[0]}{lead.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">{lead.firstName} {lead.lastName}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    lead.status === 'CONVERTED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {lead.status}
                  </span>
                  {lead.aiScore && (
                    <span className="flex items-center text-amber-500 text-xs font-black bg-amber-500/10 px-2 py-1 rounded-full">
                      <Zap className="w-3 h-3 mr-1" /> {lead.aiScore} Score
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {lead.status !== 'CONVERTED' && (
              <button 
                onClick={() => {
                  setConversionData(prev => ({ ...prev, title: `Deal with ${lead.firstName}` }));
                  setShowConvertModal(true);
                }}
                className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-all"
              >
                <Briefcase className="w-5 h-5" />
                <span>Convert to Deal</span>
              </button>
            )}
          </div>
        </header>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-premium p-8 rounded-3xl border border-border">
              <h2 className="text-xl font-black mb-6">Activity Timeline</h2>
              
              <div className="space-y-6 mb-8 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {timeline.length === 0 ? (
                  <div className="text-center py-10">
                    <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No activity recorded yet.</p>
                  </div>
                ) : (
                  timeline.map((act) => (
                    <div key={act.id} className="flex space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border z-10 relative">
                          {act.type === 'CALL' && <Phone className="w-4 h-4 text-blue-500" />}
                          {act.type === 'EMAIL' && <Mail className="w-4 h-4 text-rose-500" />}
                          {(act.type === 'SMS' || act.type === 'WHATSAPP') && <MessageSquare className="w-4 h-4 text-emerald-500" />}
                          {act.type === 'NOTE' && <Briefcase className="w-4 h-4 text-purple-500" />}
                        </div>
                        <div className="w-0.5 h-full bg-border -mt-2"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="bg-muted/30 p-4 rounded-2xl border border-border">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-bold text-foreground">{act.subject}</span>
                            <span className="text-[10px] text-muted-foreground font-bold">{format(new Date(act.createdAt), 'MMM d, h:mm a')}</span>
                          </div>
                          {act.notes && (
                            <p className="text-sm text-muted-foreground">{act.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note */}
              <form onSubmit={handleAddNote} className="flex space-x-3">
                <input 
                  type="text" 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type a new note here..."
                  className="flex-1 bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
                />
                <button type="submit" className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-bold flex items-center hover:opacity-90 transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Info */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="glass-premium p-6 rounded-3xl border border-border grid grid-cols-4 gap-3">
              {gates.email && (
                <button className="flex flex-col items-center justify-center p-3 bg-rose-500/10 text-rose-600 rounded-2xl hover:bg-rose-500 hover:text-white transition-all group">
                  <Mail className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-black uppercase">Email</span>
                </button>
              )}
              {gates.call && (
                <button className="flex flex-col items-center justify-center p-3 bg-blue-500/10 text-blue-600 rounded-2xl hover:bg-blue-500 hover:text-white transition-all group">
                  <Phone className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-black uppercase">Call</span>
                </button>
              )}
              {gates.sms && (
                <button className="flex flex-col items-center justify-center p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all group">
                  <MessageSquare className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-black uppercase">SMS</span>
                </button>
              )}
              {gates.whatsapp && (
                <button className="flex flex-col items-center justify-center p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all group">
                  <MessageSquare className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-black uppercase">WA</span>
                </button>
              )}
            </div>

            {/* Info Card */}
            <div className="glass-premium p-6 rounded-3xl border border-border space-y-6">
              <h3 className="font-black text-foreground">Contact Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold">{lead.email || '—'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold">{lead.phone || '—'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold">{lead.company?.name || lead.jobTitle || '—'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="px-2 py-1 bg-muted rounded-md text-xs font-black uppercase">{lead.sourcePlatform || lead.source || 'Direct'}</span>
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="glass-premium p-6 rounded-3xl border border-border">
              <h3 className="font-black text-foreground mb-4">Assigned Staff</h3>
              <select 
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
                value={lead.assignedTo || ''}
                onChange={(e) => handleAssign(e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            </div>

            {/* Linked Deals */}
            {lead.deals && lead.deals.length > 0 && (
              <div className="glass-premium p-6 rounded-3xl border border-border">
                <h3 className="font-black text-foreground mb-4">Linked Deals</h3>
                <div className="space-y-3">
                  {lead.deals.map((d: any) => (
                    <div key={d.id} className="p-3 bg-muted/30 rounded-xl border border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push('/dashboard/deals')}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm truncate pr-2">{d.title}</span>
                        <span className="text-xs font-black text-emerald-500">${d.value}</span>
                      </div>
                      <span className="text-[10px] uppercase font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">{d.stage?.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Convert Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-xl rounded-[40px] border border-border p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">Convert to Deal</h2>
              <button onClick={() => setShowConvertModal(false)} className="p-2 hover:bg-muted rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleConvert} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Deal Title</label>
                <input 
                  required 
                  className="w-full mt-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold" 
                  value={conversionData.title}
                  onChange={e => setConversionData({...conversionData, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Pipeline</label>
                  <select 
                    required 
                    className="w-full mt-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold"
                    value={conversionData.pipelineId}
                    onChange={e => setConversionData({...conversionData, pipelineId: e.target.value, stageId: ''})}
                  >
                    <option value="">Select Pipeline...</option>
                    {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Stage</label>
                  <select 
                    required 
                    disabled={!conversionData.pipelineId}
                    className="w-full mt-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-50"
                    value={conversionData.stageId}
                    onChange={e => setConversionData({...conversionData, stageId: e.target.value})}
                  >
                    <option value="">Select Stage...</option>
                    {pipelines.find(p => p.id === conversionData.pipelineId)?.stages.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Value ($)</label>
                  <input 
                    type="number"
                    className="w-full mt-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold" 
                    value={conversionData.value}
                    onChange={e => setConversionData({...conversionData, value: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Close Date</label>
                  <input 
                    type="date"
                    className="w-full mt-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold" 
                    value={conversionData.closeDate}
                    onChange={e => setConversionData({...conversionData, closeDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowConvertModal(false)} className="flex-1 py-4 bg-muted rounded-xl font-bold text-sm">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:opacity-90 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Convert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
