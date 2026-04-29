'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Plus, 
  FileText, 
  Trash2, 
  Edit3, 
  Search,
  Sparkles,
  ChevronLeft,
  Layout,
  Save,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await api.get('/communications/templates');
      setTemplates(data || []);
    } catch (err) {
      toast.error('Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      subject: formData.get('subject'),
      content: formData.get('content'),
    };

    try {
      if (editingTemplate?.id) {
        await api.put(`/communications/templates/${editingTemplate.id}`, data);
        toast.success('Template updated');
      } else {
        await api.post('/communications/templates', data);
        toast.success('Template created');
      }
      setIsEditorOpen(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (err) {
      toast.error('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.delete(`/communications/templates/${id}`);
      toast.success('Template deleted');
      fetchTemplates();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in flex flex-col h-[calc(100vh-160px)]">
        <header className="flex justify-between items-center mb-8">
           <div className="flex items-center space-x-4">
              <Link href="/dashboard/communication/emails" className="p-2 hover:bg-muted rounded-xl transition-all">
                 <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                 <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">Email Templates</h1>
                 <p className="text-muted-foreground text-sm font-medium italic">Create and manage reusable email templates for your brand.</p>
              </div>
           </div>
           <button 
             onClick={() => { setEditingTemplate(null); setIsEditorOpen(true); }}
             className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:opacity-90 transition-all shadow-lg shadow-primary/25"
           >
              <Plus className="w-5 h-5" />
              <span>New Template</span>
           </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto pr-4 scrollbar-hide">
           {isLoading ? (
             <div className="col-span-full py-32 text-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground font-medium">Loading your design library...</p>
             </div>
           ) : templates.length === 0 ? (
             <div className="col-span-full py-32 text-center glass-premium rounded-[60px] border border-dashed border-border">
                <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
                   <Layout className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Templates Found</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">Ready to automate your emails? Start by creating your first template.</p>
                <button 
                  onClick={() => setIsEditorOpen(true)}
                  className="bg-primary/10 text-primary px-8 py-3 rounded-2xl font-bold hover:bg-primary/20 transition-all"
                >
                   Create First Template
                </button>
             </div>
           ) : templates.map((tpl) => (
             <div key={tpl.id} className="glass-premium p-8 rounded-[40px] border border-border group hover:border-primary/30 transition-all premium-shadow flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <FileText className="w-7 h-7" />
                   </div>
                   <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingTemplate(tpl); setIsEditorOpen(true); }} className="p-2 hover:bg-muted rounded-lg transition-all text-muted-foreground"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(tpl.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-all text-destructive"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
                <h3 className="text-lg font-black text-foreground mb-2 truncate">{tpl.name}</h3>
                <p className="text-xs text-muted-foreground font-medium mb-6 line-clamp-2 italic">Subject: {tpl.subject}</p>
                
                <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Updated {new Date(tpl.updatedAt).toLocaleDateString()}
                   </span>
                   <div className="flex items-center space-x-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-xl">
                      <Sparkles className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Ready</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
           <div className="glass-premium w-full max-w-4xl rounded-[50px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">Use {"{{name}}"} for personalization in subject and body.</p>
                 </div>
                 <button onClick={() => setIsEditorOpen(false)} className="p-4 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6 flex-1 overflow-y-auto pr-4 scrollbar-hide">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Template Name</label>
                       <input 
                         name="name" 
                         required 
                         defaultValue={editingTemplate?.name}
                         className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" 
                         placeholder="e.g. Welcome Email" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Email Subject</label>
                       <input 
                         name="subject" 
                         required 
                         defaultValue={editingTemplate?.subject}
                         className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" 
                         placeholder="e.g. Welcome to the team, {{name}}!" 
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Template Content (HTML supported)</label>
                    <textarea 
                      name="content" 
                      required 
                      defaultValue={editingTemplate?.content}
                      className="w-full bg-muted/30 border border-border rounded-3xl px-8 py-6 text-sm font-medium text-foreground min-h-[350px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono" 
                      placeholder="<p>Hello {{name}},</p>..." 
                    />
                 </div>

                 <div className="flex space-x-4 pt-6">
                    <button type="button" onClick={() => setIsEditorOpen(false)} className="flex-1 py-5 bg-muted text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-all">Cancel</button>
                    <button type="submit" className="flex-[2] py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all flex items-center justify-center space-x-2">
                       <Save className="w-4 h-4" />
                       <span>{editingTemplate ? 'Update Library' : 'Save to Library'}</span>
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </DashboardLayout>
  );
}
