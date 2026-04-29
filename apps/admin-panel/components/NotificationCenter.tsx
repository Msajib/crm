'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Initial load to show the dot if there are unread notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.get('/communications/notifications');
      if (Array.isArray(data)) {
        // Map backend schema to frontend interface
        setNotifications(data.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.read || n.isRead, // Handle both possible field names
          createdAt: n.createdAt
        })));
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      if (notifications.length > 0) {
        // Mark the first unread one as read for demo or implement bulk mark as read
        const firstUnread = notifications.find(n => !n.isRead);
        if (firstUnread) {
          await api.post(`/communications/notifications/${firstUnread.id}/read`, {});
          fetchNotifications();
        }
      }
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  const clearAll = () => {
    // Frontend only clear for demo
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 glass-premium rounded-2xl border border-border p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            <div className="flex space-x-3">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[10px] text-primary hover:underline font-bold">Mark Read</button>
              )}
              <button onClick={clearAll} className="text-[10px] text-red-500 hover:underline font-bold">Clear All</button>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-muted-foreground">All caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                  n.isRead ? 'bg-muted/30 border-border' : 'bg-primary/5 border-primary/20'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center ${
                      n.type === 'ALERT' ? 'bg-red-500/10 text-red-500' :
                      n.type === 'REMINDER' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {n.type === 'ALERT' ? <AlertTriangle className="w-4 h-4" /> :
                       n.type === 'REMINDER' ? <Bell className="w-4 h-4" /> :
                       <Info className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate ${n.isRead ? 'text-foreground/70' : 'font-bold text-foreground'}`}>{n.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[9px] text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-border text-center">
             <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest">View All Activity</button>
          </div>
        </div>
      )}
    </div>
  );
}
