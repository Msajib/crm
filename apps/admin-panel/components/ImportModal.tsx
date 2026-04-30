'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Upload, FileText, CheckCircle2, AlertCircle, 
  Loader2, Download, History, ChevronRight, FileSpreadsheet, Zap
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportModal({ onClose, onSuccess }: ImportModalProps) {
  const [step, setStep] = useState<'upload' | 'progress' | 'history'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentJob, setCurrentJob] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (step === 'history') {
      fetchHistory();
    }
  }, [step]);

  // Poll for progress if there's a current job
  useEffect(() => {
    let interval: any;
    if (currentJob && (currentJob.status === 'PENDING' || currentJob.status === 'PROCESSING')) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/import/${currentJob.id}/status`);
          setCurrentJob(res);
          if (res.status === 'COMPLETED' || res.status === 'FAILED') {
            clearInterval(interval);
            if (res.status === 'COMPLETED') {
              toast.success('Import completed successfully!');
              onSuccess();
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [currentJob]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/import/history');
      setHistory(res || []);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Note: Use a dedicated endpoint for file upload if your API helper doesn't handle FormData well
      const res = await api.post('/import/contacts', formData);
      setCurrentJob(res);
      setStep('progress');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSample = () => {
    const headers = 'firstName,lastName,email,phone,company,jobTitle\n';
    const rows = 'John,Doe,john@example.com,1234567890,Acme Corp,Manager\nJane,Smith,jane@example.com,0987654321,TechFlow,Director';
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crm_contacts_sample.csv';
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-2xl z-[500] flex items-center justify-center p-4">
      <div className="glass-premium w-full max-w-4xl rounded-[60px] border border-border shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex h-[80vh]">
        
        {/* Sidebar */}
        <div className="w-72 border-r border-border bg-muted/20 p-10 flex flex-col">
           <div className="mb-12">
              <h2 className="text-2xl font-black text-foreground tracking-tighter">Import engine</h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">v2.0 Beta</p>
           </div>
           
           <nav className="space-y-4 flex-1">
              <TabButton 
                active={step === 'upload' || step === 'progress'} 
                onClick={() => setStep('upload')} 
                icon={<Upload className="w-5 h-5" />} 
                label="New Import" 
              />
              <TabButton 
                active={step === 'history'} 
                onClick={() => setStep('history')} 
                icon={<History className="w-5 h-5" />} 
                label="History" 
              />
           </nav>

           <div className="mt-auto">
              <button onClick={downloadSample} className="w-full p-6 bg-primary/10 rounded-3xl border border-primary/20 flex items-center space-x-3 group hover:bg-primary transition-all">
                 <Download className="w-5 h-5 text-primary group-hover:text-white" />
                 <span className="text-xs font-black text-primary uppercase tracking-widest group-hover:text-white">Sample File</span>
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col relative">
           <button onClick={onClose} className="absolute top-10 right-10 p-3 hover:bg-muted rounded-2xl transition-all z-10">
              <X className="w-6 h-6 text-muted-foreground" />
           </button>

           <div className="flex-1 overflow-y-auto p-12 lg:p-20">
              {step === 'upload' && (
                <div className="max-w-xl mx-auto text-center space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="w-24 h-24 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
                      <FileSpreadsheet className="w-10 h-10" />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-foreground">Upload Contact Matrix</h3>
                      <p className="text-muted-foreground mt-4 font-medium">Drag and drop your CSV or Excel file here. We'll handle the parsing and duplicate detection automatically.</p>
                   </div>

                   <div 
                      className={`relative group cursor-pointer border-2 border-dashed rounded-[40px] p-16 transition-all ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
                      }}
                   >
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
                      
                      {file ? (
                        <div className="space-y-4">
                           <FileText className="w-12 h-12 text-primary mx-auto" />
                           <div>
                              <p className="font-black text-lg">{file.name}</p>
                              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                           </div>
                           <button onClick={() => setFile(null)} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Remove File</button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                           <Upload className="w-12 h-12 text-muted-foreground/30 mx-auto group-hover:scale-110 transition-transform" />
                           <p className="font-bold text-muted-foreground">Select file from system</p>
                        </div>
                      )}
                   </div>

                   <button 
                     disabled={!file || isUploading}
                     onClick={handleUpload}
                     className="w-full py-6 bg-primary text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center space-x-3"
                   >
                      {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                      <span>{isUploading ? 'Initializing...' : 'Execute Import'}</span>
                   </button>
                </div>
              )}

              {step === 'progress' && currentJob && (
                <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in duration-700">
                   <div className="text-center">
                      <h3 className="text-3xl font-black text-foreground">Processing Stream</h3>
                      <p className="text-muted-foreground mt-2 font-medium">Job ID: {currentJob.id}</p>
                   </div>

                   <div className="glass-premium p-10 rounded-[40px] border border-border shadow-xl space-y-10">
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center space-x-2">
                               {currentJob.status === 'PROCESSING' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                               <span className="text-sm font-black text-foreground uppercase tracking-wider">{currentJob.status}</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="text-3xl font-black text-primary">
                               {currentJob.totalRows > 0 ? Math.round((currentJob.processedRows / currentJob.totalRows) * 100) : 0}%
                            </span>
                         </div>
                      </div>

                      <div className="h-4 bg-muted rounded-full overflow-hidden border border-border/50">
                         <div 
                           className="h-full bg-primary transition-all duration-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" 
                           style={{ width: `${currentJob.totalRows > 0 ? (currentJob.processedRows / currentJob.totalRows) * 100 : 0}%` }}
                         />
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                         <StatItem label="Total" value={currentJob.totalRows} icon={<FileText className="w-4 h-4" />} />
                         <StatItem label="Success" value={currentJob.successRows} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
                         <StatItem label="Failed" value={currentJob.failedRows} icon={<AlertCircle className="w-4 h-4 text-red-500" />} />
                      </div>
                   </div>

                   {currentJob.status === 'COMPLETED' && (
                      <div className="animate-in slide-in-from-top-4 duration-500">
                         <button onClick={() => setStep('history')} className="w-full py-6 bg-muted border border-border rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-border transition-all">
                            View Full Report
                         </button>
                      </div>
                   )}
                </div>
              )}

              {step === 'history' && (
                <div className="space-y-10 animate-in fade-in duration-500">
                   <div>
                      <h3 className="text-3xl font-black text-foreground">Import History</h3>
                      <p className="text-muted-foreground mt-2 font-medium">Review your previous bulk operations and error reports.</p>
                   </div>

                   {loadingHistory ? (
                      <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></div>
                   ) : history.length === 0 ? (
                      <div className="py-20 text-center text-muted-foreground font-bold italic">No import history found.</div>
                   ) : (
                      <div className="space-y-4">
                         {history.map((job) => (
                           <div key={job.id} className="glass-premium p-6 rounded-3xl border border-border flex items-center justify-between group hover:border-primary/30 transition-all">
                              <div className="flex items-center space-x-6">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${job.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {job.status === 'COMPLETED' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                 </div>
                                 <div>
                                    <p className="font-black text-foreground">{job.fileName}</p>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                                       {new Date(job.createdAt).toLocaleDateString()} • {job.successRows} Success • {job.failedRows} Failed
                                    </p>
                                 </div>
                              </div>
                              <button className="p-3 bg-muted rounded-xl hover:bg-primary hover:text-white transition-all">
                                 <ChevronRight className="w-5 h-5" />
                              </button>
                           </div>
                         ))}
                      </div>
                   )}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-4 rounded-2xl flex items-center space-x-4 transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}`}
    >
      {icon}
      <span className="text-sm font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function StatItem({ label, value, icon }: any) {
  return (
    <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 text-center">
       <div className="flex items-center justify-center space-x-2 mb-2">
          {icon}
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
       </div>
       <p className="text-xl font-black text-foreground">{value}</p>
    </div>
  );
}
