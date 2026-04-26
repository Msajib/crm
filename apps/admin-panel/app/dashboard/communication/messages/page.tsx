'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  Paperclip, 
  Image as ImageIcon,
  MoreVertical,
  CheckCheck,
  Search,
  Users
} from 'lucide-react';

const CHATS = [
  { id: 1, name: 'Sarah Jenkins', last: 'Looking forward to the demo!', time: '2m', active: true, unread: 2 },
  { id: 2, name: 'Michael Chen', last: 'Can you send the contract?', time: '1h', active: false },
  { id: 3, name: 'Marketing Group', last: 'New campaign is live 🚀', time: '5h', active: false, isGroup: true },
];

export default function CommunicationMessages() {
  const [message, setMessage] = useState('');

  return (
    <DashboardLayout>
      <div className="animate-fade-in h-[calc(100vh-160px)] flex gap-8">
         {/* Conversations Sidebar */}
         <aside className="w-80 flex flex-col space-y-6">
            <header>
               <h1 className="text-3xl font-black text-foreground mb-4">Messages</h1>
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search chats..." className="w-full bg-muted border border-border rounded-2xl pl-12 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
               </div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-2">
               {CHATS.map((chat) => (
                  <div key={chat.id} className={`p-4 rounded-[28px] border border-border flex items-center space-x-4 cursor-pointer transition-all hover:bg-muted ${chat.active ? 'bg-primary/5 border-primary/20' : 'bg-background'}`}>
                     <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold ${chat.isGroup ? 'bg-amber-500' : 'bg-indigo-500'}`}>
                           {chat.isGroup ? <Users className="w-6 h-6" /> : chat.name.charAt(0)}
                        </div>
                        {chat.active && <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full"></span>}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                           <p className="text-sm font-bold text-foreground truncate">{chat.name}</p>
                           <span className="text-[10px] text-gray-500 font-black">{chat.time}</span>
                        </div>
                        <p className={`text-xs truncate ${chat.unread ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{chat.last}</p>
                     </div>
                     {chat.unread && (
                        <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black">{chat.unread}</div>
                     )}
                  </div>
               ))}
            </div>
         </aside>

         {/* Chat Window */}
         <div className="flex-1 glass-premium rounded-[48px] border border-border flex flex-col overflow-hidden premium-shadow">
            <header className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">S</div>
                  <div>
                     <p className="text-sm font-bold text-foreground">Sarah Jenkins</p>
                     <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Online Now</p>
                  </div>
               </div>
               <div className="flex items-center space-x-2">
                  <button className="p-3 bg-muted rounded-2xl text-muted-foreground hover:text-foreground transition-all"><ImageIcon className="w-5 h-5" /></button>
                  <button className="p-3 bg-muted rounded-2xl text-muted-foreground hover:text-foreground transition-all"><MoreVertical className="w-5 h-5" /></button>
               </div>
            </header>

            <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-muted/10">
               <MessageBubble isMe={false} text="Hi John! Have you had a chance to look at the enterprise setup document?" time="10:20 AM" />
               <MessageBubble isMe text="Hey Sarah! Yes, I just finished reviewing it. Looks great. I have a few notes on the timeline." time="10:22 AM" />
               <MessageBubble isMe={false} text="Perfect. We can discuss that during our sync later. Looking forward to the demo!" time="10:25 AM" />
            </div>

            <footer className="p-6 bg-muted/20 border-t border-border">
               <div className="bg-background border border-border rounded-[32px] p-2 flex items-center space-x-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <button className="p-3 text-muted-foreground hover:text-primary transition-all"><Smile className="w-6 h-6" /></button>
                  <button className="p-3 text-muted-foreground hover:text-primary transition-all"><Paperclip className="w-6 h-6" /></button>
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 text-foreground"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button className="bg-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/25">
                     <Send className="w-5 h-5" />
                  </button>
               </div>
            </footer>
         </div>
      </div>
    </DashboardLayout>
  );
}

function MessageBubble({ isMe, text, time }: any) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md ${isMe ? 'order-1' : 'order-2'}`}>
         <div className={`p-5 rounded-[28px] ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-background border border-border text-foreground rounded-tl-none'}`}>
            <p className="text-sm font-medium leading-relaxed">{text}</p>
         </div>
         <div className={`flex items-center space-x-2 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <p className="text-[9px] text-gray-500 font-black uppercase">{time}</p>
            {isMe && <CheckCheck className="w-3 h-3 text-emerald-500" />}
         </div>
      </div>
    </div>
  );
}
