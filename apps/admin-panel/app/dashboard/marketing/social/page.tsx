'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Plus, 
  CheckCircle2, 
  Share2,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SocialMarketing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    // In a real app, we'd fetch connected accounts
    // For now we'll just simulate awareness of the service
  };

  const connectPlatform = async (id: string) => {
    setLoading(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/marketing/social/connect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          platform: id.toUpperCase(),
          externalId: `ext_${id}_${Date.now()}`,
          accessToken: 'mock_token'
        }),
      });

      if (response.ok) {
        toast.success(`Successfully connected to ${id}!`);
        fetchStatus();
      } else {
        toast.error('Marketing service unavailable');
      }
    } catch (err) {
      toast.error('Failed to connect to marketing service');
    } finally {
      setLoading(null);
    }
  };

  const PLATFORMS = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600 bg-blue-600/10 border-blue-600/20' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600 bg-pink-600/10 border-pink-600/20' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700 bg-blue-700/10 border-blue-700/20' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2 text-gradient">Social Ecosystem</h1>
            <p className="text-muted-foreground">Connect your brand pages and sync marketing data across all channels.</p>
          </div>
          <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:opacity-90 transition-all shadow-lg shadow-primary/25">
            <Plus className="w-5 h-5" />
            <span>Connect New Channel</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLATFORMS.map((platform) => (
            <div key={platform.id} className="bg-card p-6 rounded-3xl border border-border flex flex-col justify-between hover:border-primary/30 transition-all group">
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${platform.color}`}>
                  <platform.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-foreground mb-1">{platform.name}</h3>
                <p className="text-xs text-muted-foreground mb-6 italic">Ready to integrate.</p>
              </div>

              <button 
                onClick={() => connectPlatform(platform.id)}
                disabled={!!loading}
                className="w-full py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading === platform.id ? 'Authorizing...' : 'Connect Now'}
              </button>
            </div>
          ))}
        </div>

        <section className="bg-card p-8 rounded-3xl border border-border">
           <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                 <Share2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Global Publishing</h2>
           </div>
           
           <div className="bg-muted border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-md">
                 <p className="text-sm font-bold text-foreground mb-1">Cross-Platform Posting</p>
                 <p className="text-xs text-muted-foreground">Publish your updates, reels, and stories to all connected platforms at once.</p>
              </div>
              <button className="px-8 py-3 bg-foreground text-background rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all">Open Publisher</button>
           </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
