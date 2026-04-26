'use client';

import React, { useState } from 'react';
import { Bell, Check, Info, AlertTriangle } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'New Deal Assigned', message: 'Enterprise CRM Setup assigned to you.', time: '2 mins ago', type: 'info' },
  { id: 2, title: 'Payment Received', message: 'Tenant Acme Corp paid $250.', time: '1 hour ago', type: 'success' },
  { id: 3, title: 'Domain Verification Failed', message: 'techflow.io could not be verified.', time: '5 hours ago', type: 'error' },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const clearAll = () => setNotifications([]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all relative"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 glass-premium rounded-2xl border border-border p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            <button onClick={clearAll} className="text-[10px] text-primary hover:underline font-bold">Clear All</button>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-muted-foreground">All caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-3 bg-muted/50 rounded-xl border border-border hover:border-primary/20 transition-all cursor-pointer group">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center ${
                      n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                      n.type === 'error' ? 'bg-red-500/10 text-red-500' :
                      'bg-indigo-500/10 text-indigo-500'
                    }`}>
                      {n.type === 'success' ? <Check className="w-4 h-4" /> :
                       n.type === 'error' ? <AlertTriangle className="w-4 h-4" /> :
                       <Info className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[9px] text-gray-500 mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-border text-center">
             <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground">View All Activity</button>
          </div>
        </div>
      )}
    </div>
  );
}
