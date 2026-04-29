'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import { Camera, User, Mail, Shield, Save, Loader2, KeyRound, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

export default function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    avatar: '',
    phone: '',
    password: '',
  });
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    const forceReset = localStorage.getItem('mustChangePassword') === 'true';
    setMustChangePassword(forceReset);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.get('/users/me');
      const isImpersonating = localStorage.getItem('isImpersonating') === 'true';
      
      if (isImpersonating) {
         const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
         setProfile({
           firstName: storedUser.firstName || '',
           lastName: storedUser.lastName || '',
           email: storedUser.email || '',
           role: localStorage.getItem('role') || '',
           avatar: storedUser.avatar || '',
           phone: '',
           password: '',
         });
      } else {
         setProfile({
           firstName: data.firstName || '',
           lastName: data.lastName || '',
           email: data.email || '',
           role: data.role || '',
           avatar: data.avatar || '',
           phone: data.phone || '',
           password: '',
         });
      }

        // Sync local storage so UserNav gets the latest data on reload
        // BUT ONLY IF NOT IMPERSONATING (otherwise we lose the impersonated context)
        if (!isImpersonating) {
           const user = JSON.parse(localStorage.getItem('user') || '{}');
           localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
           window.dispatchEvent(new Event('profile-updated'));
        }
    } catch (err) {
      toast.error('Failed to sync profile data');
    } finally {
      setIsFetching(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 800000) {
        toast.error('Image size must be less than 800KB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setProfile(prev => ({ ...prev, avatar: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch('/users/me', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        avatar: profile.avatar,
      });

      if (true) { // api.patch throws on error
        toast.success('Profile updated successfully!');
        
        // Handle password change
        if (mustChangePassword && profile.password) {
           if (profile.password.length < 8) {
              toast.error('Password must be at least 8 characters long.');
              setLoading(false);
              return;
           }
           localStorage.removeItem('mustChangePassword');
           setMustChangePassword(false);
           setProfile(prev => ({ ...prev, password: '' }));
           toast.success('Password updated securely. Account unlocked.');
        } else if (mustChangePassword && !profile.password) {
           toast.error('You MUST change your password to continue.');
           setLoading(false);
           return;
        }

        // Update local storage if needed for UI immediate reflect
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...user, ...profile }));
        window.dispatchEvent(new Event('profile-updated'));
      } else {
        toast.error('Failed to save profile changes');
      }
    } catch (error) {
      toast.error('Network error during profile update');
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Retrieving secure profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-4xl mx-auto space-y-10">
        <header>
          <h1 className="text-4xl font-black text-foreground mb-2">My Identity</h1>
          <p className="text-muted-foreground">Manage your personal presence and security settings across the platform.</p>
        </header>

        {mustChangePassword && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-start space-x-4 animate-pulse-slow">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-black text-amber-500 mb-1">Action Required: Update Your Password</h3>
              <p className="text-sm font-bold text-amber-600/80">You are using a system-generated password. For security reasons, you must set a new password before you can navigate to other parts of the application.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar Section */}
          <section className="bg-card p-10 rounded-[40px] border border-border flex flex-col md:flex-row items-center gap-10 premium-shadow">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[32px] bg-gradient-to-tr from-primary to-purple-500 p-1 overflow-hidden relative shadow-2xl">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover rounded-[28px]" />
                ) : (
                  <div className="w-full h-full rounded-[28px] bg-background flex items-center justify-center text-5xl font-black text-primary">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </div>
                )}
              </div>
              <button onClick={() => avatarInputRef.current?.click()} type="button" className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center border-4 border-background text-white hover:scale-110 transition-all shadow-xl">
                <Camera className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black text-foreground mb-2">Profile Aesthetics</h3>
              <p className="text-sm text-muted-foreground mb-6">Custom avatars help your team recognize you. PNG or JPG, max 800KB.</p>
              <div className="flex justify-center md:justify-start space-x-3">
                <input type="file" ref={avatarInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <button onClick={() => avatarInputRef.current?.click()} type="button" className="px-6 py-3 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all">Upload New</button>
                <button onClick={() => setProfile({...profile, avatar: ''})} type="button" className="px-6 py-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">Reset</button>
              </div>
            </div>
          </section>

          {/* Personal Info */}
          <section className="bg-card p-10 rounded-[40px] border border-border space-y-8 premium-shadow">
            <h2 className="text-xl font-black text-foreground flex items-center">
                <User className="w-6 h-6 mr-4 text-primary" />
                Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">First Name</label>
                <input 
                  type="text" 
                  value={profile.firstName}
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  placeholder="e.g. John"
                  className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Last Name</label>
                <input 
                  type="text" 
                  value={profile.lastName}
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  placeholder="e.g. Doe"
                  className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Phone Number</label>
                <input 
                  type="text" 
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email}
                  disabled
                  className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-medium text-muted-foreground cursor-not-allowed" 
                />
              </div>
            </div>
          </section>

          {/* Role & Access */}
          <section className="bg-card p-10 rounded-[40px] border border-border space-y-8 premium-shadow">
            <h2 className="text-xl font-black text-foreground flex items-center">
                <Shield className="w-6 h-6 mr-4 text-purple-500" />
                Identity & Access
            </h2>
            <div className="flex items-center justify-between p-6 bg-purple-500/5 rounded-[32px] border border-purple-500/10">
                <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
                        <Shield className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-lg font-black text-white">{profile.role.replace('_', ' ')}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Authorized Personnel</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl">
                   <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                   <span className="text-[10px] font-black uppercase tracking-widest">VERIFIED</span>
                </div>
            </div>
          </section>

          {/* Security & Password */}
          <section className="bg-card p-10 rounded-[40px] border border-border space-y-8 premium-shadow">
            <h2 className="text-xl font-black text-foreground flex items-center">
                <KeyRound className="w-6 h-6 mr-4 text-emerald-500" />
                Security Credentials
            </h2>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">New Password</label>
              <input 
                type="password" 
                value={profile.password}
                onChange={(e) => setProfile({...profile, password: e.target.value})}
                placeholder={mustChangePassword ? "Required: Enter a new password" : "Leave blank to keep current password"}
                className={`w-full bg-muted border rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                  mustChangePassword ? 'border-amber-500/50 focus:ring-amber-500/50' : 'border-border focus:ring-primary/50'
                }`}
                required={mustChangePassword}
              />
              <p className="text-xs text-muted-foreground ml-1">Minimum 8 characters. Includes letters, numbers, and symbols.</p>
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button
              disabled={loading}
              className="px-12 py-5 bg-primary hover:opacity-90 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] flex items-center space-x-3 transition-all shadow-2xl shadow-primary/40 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{loading ? 'Synchronizing...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
