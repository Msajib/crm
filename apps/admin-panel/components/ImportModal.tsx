'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Upload, FileText, CheckCircle2, AlertCircle, 
  Loader2, Download, History, ChevronRight, FileSpreadsheet, Zap,
  ArrowRight, Settings2, Database, Table, Layers
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CRM_FIELDS = [
  { key: 'firstName', label: 'First Name', required: false },
  { key: 'lastName', label: 'Last Name', required: false },
  { key: 'email', label: 'Email Address', required: true },
  { key: 'phone', label: 'Phone Number', required: false },
  { key: 'company', label: 'Company Name', required: false },
  { key: 'jobTitle', label: 'Job Title', required: false },
];

export default function ImportModal({ onClose, onSuccess }: ImportModalProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'progress' | 'history'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentJob, setCurrentJob] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [reportJob, setReportJob] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  
  // Analysis & Mapping
  const [analysis, setAnalysis] = useState<{headers: string[], preview: any[], totalRows: number} | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});

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
  }, [currentJob, onSuccess]);

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

  const deleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this import record? This cannot be undone.')) return;
    try {
      await api.delete(`/import/${id}`);
      toast.success('Record deleted');
      fetchHistory();
    } catch (err) {
      toast.error('Failed to delete record');
    }
  };

  const viewReport = async (job: any) => {
    try {
      const res = await api.get(`/import/${job.id}/report`);
      setReportJob({ ...job, ...res });
      setShowReport(true);
    } catch (err) {
      toast.error('Failed to load report');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeFile = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/import/analyze', formData);
      setAnalysis(res);
      
      // Auto-map headers
      const autoMap: Record<string, string> = {};
      res.headers.forEach((header: string) => {
        const h = header.toLowerCase().replace(/[^a-z]/g, '');
        const match = CRM_FIELDS.find(f => 
          f.key.toLowerCase().includes(h) || 
          h.includes(f.key.toLowerCase()) ||
          f.label.toLowerCase().replace(/ /g, '').includes(h)
        );
        if (match) autoMap[header] = match.key;
      });
      setMapping(autoMap);
      setStep('mapping');
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExecute = async () => {
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));

    try {
      const res = await api.post('/import/contacts', formData);
      setCurrentJob(res);
      setStep('progress');
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
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
    <div className="fixed inset-0 bg-background/95 backdrop-blur-3xl z-[500] flex items-center justify-center p-4">
      <div className="glass-premium w-full max-w-7xl h-[85vh] rounded-[60px] border border-border shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col md:flex-row">
        
        {/* Modern Sidebar */}
        <div className="w-full md:w-80 border-r border-border bg-muted/20 p-10 flex flex-col">
           <div className="mb-12">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                 <Database className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-foreground tracking-tighter">Import Suite</h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2 italic">Hyper-Scale Engine</p>
           </div>
           
           <nav className="space-y-3 flex-1">
              <NavButton 
                active={step === 'upload'} 
                onClick={() => setStep('upload')} 
                icon={<Upload className="w-4 h-4" />} 
                label="1. SOURCE FILE" 
              />
              <NavButton 
                active={step === 'mapping'} 
                onClick={() => analysis ? setStep('mapping') : null}
                disabled={!analysis}
                icon={<Layers className="w-4 h-4" />} 
                label="2. DATA MAPPING" 
              />
              <NavButton 
                active={step === 'progress'} 
                onClick={() => currentJob ? setStep('progress') : null}
                disabled={!currentJob}
                icon={<Zap className="w-4 h-4" />} 
                label="3. EXECUTION" 
              />
              <div className="h-px bg-border my-6 opacity-50" />
              <NavButton 
                active={step === 'history'} 
                onClick={() => setStep('history')} 
                icon={<History className="w-4 h-4" />} 
                label="ARCHIVE" 
              />
           </nav>

           <div className="mt-auto">
              <button onClick={downloadSample} className="w-full p-5 bg-background rounded-2xl border border-border flex items-center justify-between group hover:border-primary/50 transition-all">
                 <div className="flex items-center space-x-3">
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-foreground">Get Template</span>
                 </div>
                 <ChevronRight className="w-3 h-3 text-muted-foreground" />
              </button>
           </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 flex flex-col relative bg-card/30">
           <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-muted rounded-2xl transition-all z-20">
              <X className="w-6 h-6 text-muted-foreground" />
           </button>

           <div className="flex-1 overflow-y-auto p-12 lg:p-16">
              {step === 'upload' && (
                <div className="max-w-xl mx-auto text-center space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                   <div>
                      <h3 className="text-4xl font-black text-foreground tracking-tight">Ingest your data</h3>
                      <p className="text-muted-foreground mt-4 font-medium leading-relaxed">Connect your CSV or Excel files. Our AI engine will automatically scan headers and prepare the mapping infrastructure.</p>
                   </div>

                   <div 
                      className={`relative group cursor-pointer border-2 border-dashed rounded-[40px] p-20 transition-all ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
                      }}
                   >
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
                      
                      {file ? (
                        <div className="space-y-6">
                           <div className="w-20 h-20 bg-primary/20 text-primary rounded-3xl flex items-center justify-center mx-auto">
                              <FileText className="w-10 h-10" />
                           </div>
                           <div>
                              <p className="font-black text-xl text-foreground">{file.name}</p>
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2">{(file.size / 1024).toFixed(2)} KB • READY FOR ANALYSIS</p>
                           </div>
                           <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] hover:opacity-80 transition-all">Detach File</button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                           <div className="w-20 h-20 bg-muted/50 text-muted-foreground/30 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:text-primary/40 transition-all duration-500">
                              <Upload className="w-10 h-10" />
                           </div>
                           <div>
                              <p className="font-bold text-lg text-muted-foreground">Select local source</p>
                              <p className="text-xs text-muted-foreground/50 mt-2">Maximum file size: 50MB</p>
                           </div>
                        </div>
                      )}
                   </div>

                   <button 
                     disabled={!file || isUploading}
                     onClick={analyzeFile}
                     className="w-full py-6 bg-primary text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center space-x-3"
                   >
                      {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                      <span>{isUploading ? 'ANLYZING PROTOCOLS...' : 'CONTINUE TO MAPPING'}</span>
                   </button>
                </div>
              )}

              {step === 'mapping' && analysis && (
                <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-10">
                   <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
                      <div>
                         <div className="flex items-center space-x-3 mb-2">
                            <Layers className="w-5 h-5 text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Step 02</span>
                         </div>
                         <h3 className="text-4xl font-black text-foreground tracking-tight">Align your data</h3>
                         <p className="text-muted-foreground mt-2 font-medium max-w-lg">Match your source columns to CRM architecture nodes. Unmapped data is preserved in metadata.</p>
                      </div>
                      <div className="flex items-center space-x-6 bg-muted/30 px-6 py-4 rounded-3xl border border-border">
                         <div className="text-center">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Records</p>
                            <p className="text-xl font-black text-foreground">{analysis.totalRows}</p>
                         </div>
                         <div className="w-px h-8 bg-border" />
                         <div className="text-center">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Columns</p>
                            <p className="text-xl font-black text-foreground">{analysis.headers.length}</p>
                         </div>
                      </div>
                   </header>

                   <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                      {/* Mapping Column */}
                      <div className="xl:col-span-7 space-y-8">
                         <div className="flex items-center justify-between px-2">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Node Configuration</h4>
                            <span className="text-[9px] font-bold text-muted-foreground/50 italic">Mandatory fields marked with *</span>
                         </div>

                         <div className="grid grid-cols-1 gap-4">
                            {CRM_FIELDS.map((field) => {
                              const mappedHeader = Object.entries(mapping).find(([_, v]) => v === field.key)?.[0];
                              const previewValue = mappedHeader ? analysis.preview[0]?.[mappedHeader] : null;

                              return (
                                <div key={field.key} className={`group relative glass-premium p-1 rounded-[32px] border transition-all duration-500 ${mappedHeader ? 'border-primary/30 bg-primary/[0.02]' : 'border-border hover:border-border/80'}`}>
                                   <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                      <div className="flex items-center space-x-5">
                                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${mappedHeader ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground'}`}>
                                            {field.required ? <Database className="w-6 h-6" /> : <Table className="w-6 h-6" />}
                                         </div>
                                         <div>
                                            <div className="flex items-center space-x-2">
                                               <p className="text-lg font-black text-foreground">{field.label}</p>
                                               {field.required && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-60">{field.key}</p>
                                         </div>
                                      </div>

                                      <div className="flex-1 max-w-xs relative">
                                         <select 
                                           className={`w-full bg-background border rounded-[20px] px-5 py-4 text-xs font-bold appearance-none focus:ring-4 focus:ring-primary/10 outline-none transition-all ${mappedHeader ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}
                                           value={mappedHeader || ''}
                                           onChange={(e) => {
                                              const newMapping = {...mapping};
                                              Object.keys(newMapping).forEach(k => { if(newMapping[k] === field.key) delete newMapping[k] });
                                              if(e.target.value) newMapping[e.target.value] = field.key;
                                              setMapping(newMapping);
                                           }}
                                         >
                                            <option value="">-- Ignore this field --</option>
                                            {analysis.headers.map(h => (
                                              <option key={h} value={h}>{h}</option>
                                            ))}
                                         </select>
                                         <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                            <ChevronRight className="w-4 h-4 rotate-90" />
                                         </div>
                                      </div>
                                   </div>

                                   {mappedHeader && (
                                      <div className="px-6 pb-6 pt-2 border-t border-primary/10 mx-6 mt-2 animate-in slide-in-from-top-2 duration-300">
                                         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary/60">
                                            <span>Current Vector Data</span>
                                            <span className="bg-primary/10 px-2 py-0.5 rounded text-[8px]">{mappedHeader}</span>
                                         </div>
                                         <p className="mt-2 text-sm font-bold text-foreground truncate">{previewValue || <span className="italic opacity-30">null_value</span>}</p>
                                      </div>
                                   )}
                                </div>
                              );
                            })}
                         </div>
                      </div>

                      {/* Info & Action Column */}
                      <div className="xl:col-span-5 space-y-8">
                         <div className="sticky top-0 space-y-8">
                            <div className="glass-premium rounded-[40px] border border-border p-10 bg-gradient-to-br from-primary/[0.03] to-transparent relative overflow-hidden group">
                               <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
                               
                               <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-8 flex items-center">
                                  <Zap className="w-4 h-4 mr-3 text-primary" /> System Validation
                               </h4>
                               
                               <div className="space-y-6">
                                  <div className="flex items-start space-x-4">
                                     <div className={`mt-1 p-2 rounded-lg ${Object.values(mapping).includes('email') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {Object.values(mapping).includes('email') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                     </div>
                                     <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-foreground">Deduplication Logic</p>
                                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Email field is used for intelligent record collision detection.</p>
                                     </div>
                                  </div>

                                  <div className="flex items-start space-x-4">
                                     <div className="mt-1 p-2 rounded-lg bg-primary/10 text-primary">
                                        <Layers className="w-4 h-4" />
                                     </div>
                                     <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-foreground">Metadata Capture</p>
                                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{analysis.headers.length - Object.keys(mapping).length} columns will be archived as additional JSON metadata.</p>
                                     </div>
                                  </div>
                               </div>

                               <div className="mt-12 pt-10 border-t border-border/50">
                                  <button 
                                    onClick={handleExecute}
                                    disabled={isUploading || !Object.values(mapping).includes('email')}
                                    className="w-full py-7 bg-foreground text-background rounded-[32px] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale transition-all duration-500 flex items-center justify-center space-x-4 group"
                                  >
                                     {isUploading ? (
                                       <Loader2 className="w-5 h-5 animate-spin" />
                                     ) : (
                                       <Zap className="w-5 h-5 group-hover:animate-pulse" />
                                     )}
                                     <span>{isUploading ? 'INITIATING WORKER...' : 'DEPOY IMPORT SEQUENCE'}</span>
                                  </button>
                               </div>
                            </div>

                            <div className="p-8 border border-border/50 rounded-[32px] bg-muted/5">
                               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Pro Tip</p>
                               <p className="text-xs text-muted-foreground leading-relaxed italic">Double check your email mapping. Incorrect email formatting will cause records to be flagged as failures during the validation phase.</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {step === 'progress' && currentJob && (
                <div className="max-w-2xl mx-auto space-y-16 animate-in fade-in duration-700 py-10">
                   <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                         <Zap className="w-8 h-8 animate-pulse" />
                      </div>
                      <h3 className="text-4xl font-black text-foreground tracking-tight">Worker active</h3>
                      <p className="text-muted-foreground font-medium">Syncing data streams for <span className="text-foreground font-bold">{currentJob.fileName}</span></p>
                   </div>

                   <div className="glass-premium p-12 rounded-[50px] border border-border shadow-2xl space-y-12 bg-card/50">
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Current Vector Status</p>
                            <div className="flex items-center space-x-3">
                               {currentJob.status !== 'COMPLETED' && currentJob.status !== 'FAILED' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                               <span className="text-lg font-black text-foreground uppercase tracking-wider">{currentJob.status}</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="text-5xl font-black text-primary tracking-tighter">
                               {currentJob.totalRows > 0 ? Math.round((currentJob.processedRows / currentJob.totalRows) * 100) : 0}%
                            </span>
                         </div>
                      </div>

                      <div className="h-4 bg-muted rounded-full overflow-hidden border border-border/50 p-1">
                         <div 
                           className="h-full bg-primary transition-all duration-700 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.6)]" 
                           style={{ width: `${currentJob.totalRows > 0 ? (currentJob.processedRows / currentJob.totalRows) * 100 : 0}%` }}
                         />
                      </div>

                      <div className="grid grid-cols-3 gap-8 pt-4">
                         <StatItem label="TOTAL RECORDS" value={currentJob.totalRows} icon={<FileText className="w-4 h-4" />} />
                         <StatItem label="SUCCESSFUL" value={currentJob.successRows} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
                         <StatItem label="DUPLICATES/ERR" value={currentJob.failedRows} icon={<AlertCircle className="w-4 h-4 text-rose-500" />} />
                      </div>
                   </div>

                   {(currentJob.status === 'COMPLETED' || currentJob.status === 'FAILED') && (
                      <div className="animate-in slide-in-from-top-4 duration-500 flex flex-col items-center space-y-6">
                         <div className={`p-4 rounded-2xl flex items-center space-x-3 ${currentJob.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {currentJob.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="text-xs font-black uppercase tracking-widest">Job Execution {currentJob.status}</span>
                         </div>
                         <button onClick={() => setStep('history')} className="px-12 py-5 bg-background border border-border rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary transition-all shadow-xl">
                            Finalize and View Archive
                         </button>
                      </div>
                   )}
                </div>
              )}

              {step === 'history' && (
                <div className="space-y-12 animate-in fade-in duration-500 pb-10">
                   <header className="flex justify-between items-center border-b border-border pb-8">
                      <div>
                         <h3 className="text-3xl font-black text-foreground tracking-tight">Operation Archive</h3>
                         <p className="text-sm text-muted-foreground mt-2 font-medium">Audit logs for historical data imports.</p>
                      </div>
                      <button onClick={fetchHistory} className="p-3 hover:bg-muted rounded-xl transition-all">
                         <History className="w-5 h-5 text-muted-foreground" />
                      </button>
                   </header>

                   {loadingHistory ? (
                      <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></div>
                   ) : history.length === 0 ? (
                      <div className="py-32 text-center">
                         <History className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
                         <p className="text-muted-foreground font-black uppercase tracking-widest">No historical data logs</p>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 gap-4">
                         {history.map((job) => (
                           <div key={job.id} className="glass-premium p-8 rounded-[32px] border border-border flex items-center justify-between group hover:border-primary/40 transition-all bg-card/20 hover:shadow-2xl hover:shadow-primary/5">
                              <div className="flex items-center space-x-8">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${job.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {job.status === 'COMPLETED' ? <CheckCircle2 className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                                 </div>
                                 <div>
                                    <p className="font-black text-xl text-foreground group-hover:text-primary transition-colors">{job.fileName}</p>
                                    <div className="flex items-center space-x-4 mt-2">
                                       <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{new Date(job.createdAt).toLocaleDateString()}</span>
                                       <div className="w-1 h-1 bg-border rounded-full" />
                                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{job.successRows} Imported</span>
                                       <div className="w-1 h-1 bg-border rounded-full" />
                                       <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{job.failedRows} Skipped</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                  <button 
                                    onClick={() => viewReport(job)}
                                    className="px-6 py-3 bg-primary/10 text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                  >
                                     View Report
                                  </button>
                                  <button 
                                    onClick={() => deleteJob(job.id)}
                                    className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
                                  >
                                     <X className="w-4 h-4" />
                                  </button>
                               </div>
                            </div>
                          ))}
                       </div>
                    )}
                 </div>
              )}

              {/* Report Modal */}
              {showReport && reportJob && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[600] flex items-center justify-center p-8">
                   <div className="glass-premium w-full max-w-4xl h-[70vh] rounded-[48px] border border-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                      <header className="p-10 border-b border-border flex justify-between items-center bg-muted/20">
                         <div>
                            <h3 className="text-3xl font-black text-foreground">{reportJob.fileName}</h3>
                            <p className="text-xs text-muted-foreground mt-1 font-black uppercase tracking-widest">Job ID: {reportJob.id}</p>
                         </div>
                         <button onClick={() => setShowReport(false)} className="p-3 bg-background border border-border rounded-2xl hover:bg-muted transition-all">
                            <X className="w-6 h-6" />
                         </button>
                      </header>
                      
                      <div className="flex-1 overflow-y-auto p-10 space-y-10">
                         <div className="grid grid-cols-3 gap-6">
                            <div className="p-8 bg-muted/30 rounded-3xl border border-border/50 text-center">
                               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total</p>
                               <p className="text-4xl font-black">{reportJob.totalRows || 0}</p>
                            </div>
                            <div className="p-8 bg-emerald-500/5 rounded-3xl border border-emerald-500/20 text-center">
                               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Success</p>
                               <p className="text-4xl font-black text-emerald-500">{reportJob.successRows || 0}</p>
                            </div>
                            <div className="p-8 bg-rose-500/5 rounded-3xl border border-rose-500/20 text-center">
                               <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Failed/Skip</p>
                               <p className="text-4xl font-black text-rose-500">{reportJob.failedRows || 0}</p>
                            </div>
                         </div>

                         {reportJob.errorLog && Array.isArray(reportJob.errorLog) && reportJob.errorLog.length > 0 ? (
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Anomaly Logs</h4>
                              <div className="space-y-3">
                                 {reportJob.errorLog.map((log: any, idx: number) => (
                                   <div key={idx} className="p-5 bg-background border border-border rounded-2xl flex items-center justify-between">
                                      <div className="flex items-center space-x-4">
                                         <span className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center text-[10px] font-black">{log.row}</span>
                                         <div>
                                            <p className="text-sm font-bold text-foreground">{log.email}</p>
                                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{log.reason}</p>
                                         </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground italic max-w-md truncate">{log.detail || 'Validation error'}</p>
                                   </div>
                                 ))}
                              </div>
                           </div>
                         ) : (
                           <div className="py-20 text-center">
                              <CheckCircle2 className="w-16 h-16 text-emerald-500/20 mx-auto mb-4" />
                              <p className="text-muted-foreground font-black uppercase tracking-widest">No errors recorded for this operation</p>
                           </div>
                         )}
                      </div>
                      
                      <footer className="p-8 border-t border-border bg-muted/10 flex justify-center">
                         <button onClick={() => setShowReport(false)} className="px-10 py-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-widest">Close Report</button>
                      </footer>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, disabled }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-4 rounded-2xl flex items-center space-x-4 transition-all ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted'} ${active ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]' : 'text-muted-foreground'}`}
    >
      <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-muted'}`}>
         {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}

function StatItem({ label, value, icon }: any) {
  return (
    <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 text-center relative overflow-hidden group">
       <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
       <div className="flex items-center justify-center space-x-2 mb-3">
          {icon}
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
       </div>
       <p className="text-3xl font-black text-foreground tracking-tighter">{value}</p>
    </div>
  );
}

