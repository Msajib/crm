'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Plus, 
  CheckCircle2, 
  Share2,
  Settings,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Globe,
  Zap,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import PremiumModal from '@/components/PremiumModal';


const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600 bg-blue-600/10 border-blue-600/20', docs: 'https://developers.facebook.com/docs/marketing-apis/' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600 bg-pink-600/10 border-pink-600/20', docs: 'https://developers.facebook.com/docs/instagram-api/' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700 bg-blue-700/10 border-blue-700/20', docs: 'https://developer.linkedin.com/docs/marketing-developer-platform' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20', docs: 'https://developer.twitter.com/en/docs' },
];

export default function SocialMarketing() {
  const [configModal, setConfigModal] = useState<string | null>(null);
  const [publishModal, setPublishModal] = useState<boolean>(false);
  const [postData, setPostData] = useState({ message: '', link: '', platforms: [] as string[] });
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const [showGuide, setShowGuide] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const data = await api.get('/social/configs');
      if (Array.isArray(data)) {
        const newConnected: Record<string, boolean> = {};
        const newCreds: Record<string, any> = {};
        data.forEach((c: any) => {
          const pid = c.platform.toLowerCase();
          newConnected[pid] = true;
          newCreds[pid] = {
            appId: c.appId,
            appSecret: '********',
            ...(c.settings || {})
          };
        });
        setConnected(newConnected);
        setCredentials(newCreds);
      }
    } catch (err) {}
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/social/sync', {});
      await fetchConfigs();
      toast.success('Sync complete! Insights updated.', {
          icon: '🔄',
          style: { borderRadius: '16px', background: '#0f172a', color: '#fff' }
      });
    } catch (err) {
      toast.error('Sync failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePost = async () => {
    if (!postData.message.trim() || postData.platforms.length === 0) {
      toast.error('Please enter a message and select at least one platform.');
      return;
    }
    setIsPosting(true);
    try {
      const promises = postData.platforms.map(platform => 
        api.post('/social/post', { platform, message: postData.message, link: postData.link })
      );
      await Promise.all(promises);
      toast.success('Content published successfully!', { icon: '🚀' });
      setPublishModal(false);
      setPostData({ message: '', link: '', platforms: [] });
    } catch (err) {
      toast.error('Failed to publish content.');
    } finally {
      setIsPosting(false);
    }
  };


  const exportLeadsPDF = async () => {
    toast.loading('Preparing PDF report...');
    try {
      const doc = new jsPDF() as any;
      
      // Add Title
      doc.setFontSize(22);
      doc.text('Social Media Leads Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      
      // Mock Leads Data (In production, fetch from /api/contacts?source=SOCIAL)
      const leads = [
        { name: 'John Doe', email: 'john@example.com', platform: 'Facebook', date: '2024-04-27' },
        { name: 'Jane Smith', email: 'jane@text.com', platform: 'LinkedIn', date: '2024-04-26' },
        { name: 'Robert Brown', email: 'rob@social.io', platform: 'Facebook', date: '2024-04-26' },
      ];

      doc.autoTable({
        startY: 35,
        head: [['Name', 'Email', 'Platform', 'Date']],
        body: leads.map(l => [l.name, l.email, l.platform, l.date]),
        headStyles: { fillStyle: '#6366f1' },
      });

      doc.save('social_leads_export.pdf');
      toast.dismiss();
      toast.success('Leads Exported Successfully!');
    } catch (err) {
      toast.error('PDF Generation Failed.');
    }
  };

  const handleSaveConfig = async () => {
    if (!configModal) return;
    const creds = credentials[configModal];
    const appId = creds?.appId?.trim();
    const appSecret = creds?.appSecret?.trim();

    if (!appId || appId.length < 5) {
      toast.error('A valid App/Client ID is required.', { icon: '⚠️' });
      return;
    }
    if (!appSecret || appSecret.length < 5) {
      toast.error('A valid App/Client Secret is required.', { icon: '⚠️' });
      return;
    }
    
    if (configModal === 'facebook' && (!creds?.pageAccessToken || creds.pageAccessToken.trim().length < 10)) {
      toast.error('A valid Page Access Token is required for Facebook/Instagram integration.', { icon: '⚠️' });
      return;
    }

    try {
      await api.post('/social/config', {
        platform: configModal,
        appId: creds.appId,
        appSecret: creds.appSecret === '********' ? undefined : creds.appSecret,
        settings: {
          ...creds,
          appId: undefined,
          appSecret: undefined
        }
      });

      toast.success(`${configModal.toUpperCase()} Integration Updated!`, {
          icon: '🔗',
          style: { borderRadius: '16px', background: '#0f172a', color: '#fff' }
      });
      setConfigModal(null);
      fetchConfigs();
    } catch (err) {
      toast.error('Marketing service failure.');
    }
  };

  const updateField = (id: string, field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  const renderConfigFields = (id: string) => {
    switch (id) {
      case 'facebook':
      case 'instagram':
        return (
          <>
            <ConfigField label="App ID" field="appId" id={id} placeholder="Enter App ID" value={credentials[id]?.appId} onChange={updateField} />
            <ConfigField label="App Secret" field="appSecret" id={id} placeholder="Enter App Secret" value={credentials[id]?.appSecret} onChange={updateField} secret />
            <ConfigField label="Page Access Token" field="pageAccessToken" id={id} placeholder="Enter Page Token" value={credentials[id]?.pageAccessToken} onChange={updateField} secret />
          </>
        );
      case 'linkedin':
        return (
          <>
            <ConfigField label="Client ID" field="appId" id={id} placeholder="Enter Client ID" value={credentials[id]?.appId} onChange={updateField} />
            <ConfigField label="Client Secret" field="appSecret" id={id} placeholder="Enter Client Secret" value={credentials[id]?.appSecret} onChange={updateField} secret />
          </>
        );
      case 'twitter':
        return (
          <>
            <ConfigField label="API Key" field="appId" id={id} placeholder="Enter API Key" value={credentials[id]?.appId} onChange={updateField} />
            <ConfigField label="API Secret" field="appSecret" id={id} placeholder="Enter API Secret" value={credentials[id]?.appSecret} onChange={updateField} secret />
            <ConfigField label="Bearer Token" field="bearerToken" id={id} placeholder="Enter Bearer Token" value={credentials[id]?.bearerToken} onChange={updateField} secret />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10 max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-foreground tracking-tight">Social Ecosystem</h1>
            <p className="text-muted-foreground text-sm font-medium max-w-2xl">Connect your global brand pages and unify your marketing reach across all channels.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleSync} disabled={isSyncing} className={`flex items-center space-x-2 px-6 py-3 bg-indigo-500/10 text-indigo-500 rounded-2xl border border-indigo-500/20 hover:bg-indigo-500/20 transition-all ${isSyncing ? 'animate-pulse' : ''}`}>
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{isSyncing ? 'Syncing...' : 'Sync Analytics'}</span>
             </button>
             <button onClick={exportLeadsPDF} className="flex items-center space-x-2 px-6 py-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Export Leads PDF</span>
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLATFORMS.map((platform) => {
            const isConnected = connected[platform.id];
            return (
              <div key={platform.id} className="bg-card p-8 rounded-[32px] border border-border flex flex-col justify-between hover:border-primary/40 transition-all group relative overflow-hidden shadow-sm">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110 ${platform.color} shadow-lg overflow-hidden`}>
                      {isConnected && credentials[platform.id]?.pictureUrl ? (
                         <img src={credentials[platform.id].pictureUrl} alt={platform.name} className="w-full h-full object-cover" />
                      ) : (
                         <platform.icon className="w-7 h-7" />
                      )}
                    </div>
                    {isConnected && (
                       <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                          <span>Linked</span>
                       </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-foreground mb-1">{isConnected ? (credentials[platform.id]?.pageName || platform.name) : platform.name}</h3>
                  <p className="text-[10px] text-muted-foreground mb-4 font-medium italic">
                    {isConnected ? (
                      credentials[platform.id]?.followersCount ? `${credentials[platform.id].followersCount.toLocaleString()} Followers • Syncing feeds` : 'Actively syncing data feeds.'
                    ) : 'Ready for integration.'}
                  </p>
                  {isConnected && credentials[platform.id]?.analytics && (
                     <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="bg-background/50 p-2 rounded-lg border border-border text-center">
                           <p className="text-[8px] font-black text-muted-foreground uppercase">Reach</p>
                           <p className="text-xs font-black text-foreground">{credentials[platform.id].analytics.reach || 0}</p>
                        </div>
                        <div className="bg-background/50 p-2 rounded-lg border border-border text-center">
                           <p className="text-[8px] font-black text-muted-foreground uppercase">Engage</p>
                           <p className="text-xs font-black text-foreground">{credentials[platform.id].analytics.engagement || 0}</p>
                        </div>
                        <div className="bg-background/50 p-2 rounded-lg border border-border text-center">
                           <p className="text-[8px] font-black text-muted-foreground uppercase">Impress</p>
                           <p className="text-xs font-black text-foreground">{credentials[platform.id].analytics.impressions || 0}</p>
                        </div>
                     </div>
                  )}
                  {!isConnected && <div className="mb-8" />}
                </div>

                <div className="flex items-center space-x-2 relative z-10">
                  <button onClick={() => setConfigModal(platform.id)} className="flex-1 py-3.5 bg-primary/5 text-primary border border-primary/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                    {isConnected ? 'Update' : 'Connect'}
                  </button>
                  {isConnected && (
                    <button className="p-3 bg-muted hover:bg-red-500/10 hover:text-red-500 rounded-xl text-muted-foreground border border-border transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <section className="bg-card p-10 rounded-[40px] border border-border relative overflow-hidden group">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
              <div className="flex items-start space-x-5">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                   <Share2 className="w-7 h-7" />
                </div>
                <div>
                   <h2 className="text-xl font-black text-foreground mb-1">Omni-Channel Publishing</h2>
                   <p className="text-muted-foreground text-xs max-w-xl font-medium leading-relaxed italic">
                     Distribute your creative content and updates across all linked ecosystems with a single unified workflow.
                   </p>
                </div>
              </div>
                  <button onClick={() => setPublishModal(true)} className="px-10 py-4 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl active:scale-95">Open Publisher Hub</button>
           </div>
        </section>
      </div>


      <PremiumModal
        isOpen={!!configModal}
        onClose={() => setConfigModal(null)}
        title={`${configModal} Setup`}
        subtitle="Developer Credentials"
        footer={(
          <button 
            onClick={handleSaveConfig} 
            className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center space-x-3"
          >
            <Plus className="w-5 h-5" />
            <span>Authorize Channel</span>
          </button>
        )}
      >
        <div className="space-y-8">
           {/* Guide Toggle */}
           <button 
             onClick={() => setShowGuide(!showGuide)}
             className="w-full p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between group transition-all"
           >
              <div className="flex items-center space-x-3">
                 <Info className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest">How to get {configModal} keys?</span>
              </div>
              {showGuide ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
           </button>

           {showGuide && configModal && (
              <div className="p-6 bg-muted/40 rounded-2xl border border-border text-[11px] text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 duration-200">
                 <p className="font-bold text-foreground mb-2 text-xs uppercase tracking-widest">Step-by-Step Instructions:</p>
                 {configModal === 'facebook' && (
                    <div className="space-y-4">
                       <div>
                          <p className="font-black text-primary text-[10px] uppercase mb-1">1. Developer Portal</p>
                          <p>Visit the <a href="https://developers.facebook.com/" target="_blank" className="text-primary underline">Meta for Developers</a> portal and sign in.</p>
                       </div>
                       <div>
                          <p className="font-black text-primary text-[10px] uppercase mb-1">2. Create App</p>
                          <p>Click "My Apps" &gt; "Create App". Select "Business" as the type.</p>
                       </div>
                       <div>
                          <p className="font-black text-primary text-[10px] uppercase mb-1">3. Get App Credentials</p>
                          <p>Navigate to "Settings" &gt; "Basic". Copy your **App ID** and **App Secret**.</p>
                       </div>
                       <div>
                          <p className="font-black text-primary text-[10px] uppercase mb-1">4. Marketing API</p>
                          <p>Add the "Marketing API" product. Under "Tools", you can generate a **Page Access Token** with `ads_management` and `leads_retrieval` permissions.</p>
                       </div>
                    </div>
                 )}
                 {configModal === 'linkedin' && (
                    <div className="space-y-4">
                       <div>
                          <p className="font-black text-primary text-[10px] uppercase mb-1">1. Developer Portal</p>
                          <p>Access the <a href="https://www.linkedin.com/developers/" target="_blank" className="text-primary underline">LinkedIn Developer Portal</a>.</p>
                       </div>
                       <div>
                          <p className="font-black text-primary text-[10px] uppercase mb-1">2. Create App</p>
                          <p>Create a new app and link it to your official LinkedIn Page.</p>
                       </div>
                       <div>
                          <p className="font-black text-primary text-[10px] uppercase mb-1">3. Request Access</p>
                          <p>Under "Products", request access to "Marketing Developer Platform".</p>
                       </div>
                       <div>
                          <p className="font-black text-primary text-[10px] uppercase mb-1">4. Auth Tokens</p>
                          <p>Go to the "Auth" tab to find your **Client ID** and **Client Secret**.</p>
                       </div>
                    </div>
                 )}
                 {configModal === 'twitter' && (
                    <div className="space-y-4">
                       <div>
                          <p className="font-black text-primary text-[10px] uppercase mb-1">1. Developer Platform</p>
                          <p>Go to the <a href="https://developer.twitter.com/" target="_blank" className="text-primary underline">Twitter Developer Portal</a>.</p>
                       </div>
                       <div>
                          <p className="font-black text-primary text-[10px] uppercase mb-1">2. Project Setup</p>
                          <p>Create a Project and an App. Ensure you have "Essential" or "Pro" access.</p>
                       </div>
                       <div>
                          <p className="font-black text-primary text-[10px] uppercase mb-1">3. Keys & Tokens</p>
                          <p>Under "Keys and Tokens", generate your **API Key**, **API Secret**, and **Bearer Token**.</p>
                       </div>
                    </div>
                 )}
                 <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-[9px] italic uppercase tracking-tighter">Note: All redirected URLs should point to your secure production callback endpoint.</p>
                 </div>
              </div>
           )}

           <div className="space-y-6">
              {configModal && renderConfigFields(configModal)}
           </div>
        </div>
      </PremiumModal>

      <PremiumModal
        isOpen={publishModal}
        onClose={() => setPublishModal(false)}
        title="Publisher Hub"
        subtitle="Cross-Platform Post"
        footer={(
          <button 
            onClick={handlePost} 
            disabled={isPosting}
            className={`w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center space-x-3 ${isPosting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Share2 className="w-5 h-5" />
            <span>{isPosting ? 'Publishing...' : 'Publish Now'}</span>
          </button>
        )}
      >
        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Select Platforms</label>
              <div className="flex gap-3">
                 {PLATFORMS.filter(p => connected[p.id]).map(p => (
                    <button 
                       key={p.id}
                       onClick={() => {
                          const has = postData.platforms.includes(p.id);
                          setPostData({ ...postData, platforms: has ? postData.platforms.filter(x => x !== p.id) : [...postData.platforms, p.id] });
                       }}
                       className={`flex-1 py-3 rounded-xl border flex items-center justify-center transition-all ${postData.platforms.includes(p.id) ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'}`}
                    >
                       <p.icon className="w-5 h-5" />
                    </button>
                 ))}
                 {Object.keys(connected).length === 0 && (
                    <p className="text-xs text-muted-foreground italic px-2 py-3">No platforms connected. Please connect a platform first.</p>
                 )}
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Post Content</label>
              <textarea 
                 value={postData.message}
                 onChange={(e) => setPostData({ ...postData, message: e.target.value })}
                 className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30 min-h-[120px] resize-none"
                 placeholder="What's on your mind? This will be published to all selected platforms..."
              />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Attachment Link (Optional)</label>
              <input 
                 value={postData.link}
                 onChange={(e) => setPostData({ ...postData, link: e.target.value })}
                 className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30"
                 placeholder="https://example.com/promo"
              />
           </div>
        </div>
      </PremiumModal>
    </DashboardLayout>
  );
}

function ConfigField({ label, field, id, placeholder, value, onChange, secret = false }: any) {
  const [show, setShow] = useState(!secret);
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">{label}</label>
      <div className="relative group">
         <input 
            type={show ? "text" : "password"} 
            value={value || ''}
            onChange={(e) => onChange(id, field, e.target.value)}
            className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30" 
            placeholder={placeholder} 
         />
         {secret && (
            <button 
               type="button"
               onClick={() => setShow(!show)}
               className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            >
               {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
         )}
      </div>
    </div>
  );
}
