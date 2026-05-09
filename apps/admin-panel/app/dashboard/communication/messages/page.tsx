'use client';

import React, { useState, useEffect } from 'react';
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
  Users,
  Sparkles,
  StickyNote
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function CommunicationMessages() {
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
      const conv = conversations.find(c => c.id === selectedConvId);
      if (conv) {
         setNotes(conv.notes || '');
      }
    }
  }, [selectedConvId, conversations]);

  const fetchConversations = async () => {
    try {
      const data = await api.get('/communications/conversations');
      setConversations(data);
      if (data.length > 0 && !selectedConvId) {
         setSelectedConvId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      const data = await api.get(`/communications/conversations/${id}/messages`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedConvId) return;
    
    setIsSending(true);
    try {
      await api.post(`/communications/conversations/${selectedConvId}/reply`, { text: message });
      setMessage('');
      await fetchMessages(selectedConvId);
      await fetchConversations(); 
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedConvId) return;
    setIsSavingNotes(true);
    try {
      await api.post(`/communications/conversations/${selectedConvId}/notes`, { notes });
      toast.success('Notes saved successfully');
      await fetchConversations();
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const enhanceWithAI = async () => {
    if (!message.trim()) {
       toast.error('Please type a message first to enhance it.');
       return;
    }
    setIsEnhancing(true);
    try {
      const data = await api.post('/ai/chat', { 
        message: `Please enhance this customer service reply to be professional and polite, without adding extra conversational filler. Return only the enhanced message. Original: "${message}"` 
      });
      setMessage(data.response);
      toast.success('Message enhanced with AI!');
    } catch (err) {
      console.error(err);
      toast.error('AI Enhancement failed.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  return (
    <DashboardLayout>
      <div className="animate-fade-in h-[calc(100vh-160px)] flex gap-8">
         <aside className="w-80 flex flex-col space-y-6">
            <header>
               <h1 className="text-2xl font-black text-foreground mb-4">Messages</h1>
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search chats..." className="w-full bg-muted border border-border rounded-2xl pl-12 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
               </div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
               {isLoading ? (
                  <p className="text-xs text-muted-foreground">Loading...</p>
               ) : conversations.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No conversations found.</p>
               ) : conversations.map((chat) => (
                  <div key={chat.id} onClick={() => setSelectedConvId(chat.id)} className={`p-4 rounded-[28px] border border-border flex items-center space-x-4 cursor-pointer transition-all hover:bg-muted ${selectedConvId === chat.id ? 'bg-primary/5 border-primary/20' : 'bg-background'}`}>
                     <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold ${chat.platform === 'FACEBOOK' ? 'bg-blue-600' : 'bg-indigo-500'}`}>
                           {chat.name.charAt(0)}
                        </div>
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                           <p className="text-sm font-bold text-foreground truncate">{chat.name}</p>
                           <span className="text-[9px] text-gray-500 font-black">{new Date(chat.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className={`text-xs truncate ${chat.unreadCount ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{chat.lastMessage}</p>
                     </div>
                     {chat.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black">{chat.unreadCount}</div>
                     )}
                  </div>
               ))}
            </div>
         </aside>

         <div className="flex-1 flex gap-4 overflow-hidden">
            <div className="flex-1 glass-premium rounded-[48px] border border-border flex flex-col overflow-hidden premium-shadow">
               {selectedConv ? (
                  <>
                     <header className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
                        <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">{selectedConv.name.charAt(0)}</div>
                           <div>
                              <p className="text-sm font-bold text-foreground">{selectedConv.name}</p>
                              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{selectedConv.platform}</p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-2">
                           <button onClick={() => setShowNotes(!showNotes)} className={`p-3 rounded-2xl transition-all ${showNotes ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}><StickyNote className="w-5 h-5" /></button>
                           <button className="p-3 bg-muted rounded-2xl text-muted-foreground hover:text-foreground transition-all"><MoreVertical className="w-5 h-5" /></button>
                        </div>
                     </header>

                     <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-muted/10 flex flex-col">
                        {messages.map((msg) => (
                           <MessageBubble key={msg.id} isMe={!msg.isFromCustomer} text={msg.text} time={new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} />
                        ))}
                     </div>

                     <footer className="p-6 bg-muted/20 border-t border-border">
                        <div className="bg-background border border-border rounded-[32px] p-2 flex items-center space-x-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                           <button className="p-3 text-muted-foreground hover:text-primary transition-all"><Paperclip className="w-6 h-6" /></button>
                           <input 
                             type="text" 
                             placeholder="Type your reply..." 
                             className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 text-foreground"
                             value={message}
                             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                             onChange={(e) => setMessage(e.target.value)}
                           />
                           <button onClick={enhanceWithAI} disabled={isEnhancing} className="p-3 text-purple-500 hover:text-purple-600 transition-all hover:bg-purple-500/10 rounded-2xl" title="Enhance with AI">
                              <Sparkles className={`w-5 h-5 ${isEnhancing ? 'animate-pulse' : ''}`} />
                           </button>
                           <button onClick={handleSend} disabled={isSending} className={`bg-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/25 ${isSending ? 'opacity-50' : ''}`}>
                              <Send className="w-5 h-5" />
                           </button>
                        </div>
                     </footer>
                  </>
               ) : (
                  <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground bg-muted/10">
                     <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                     <p className="font-bold text-sm">Select a conversation</p>
                  </div>
               )}
            </div>

            {/* Notes Sidebar */}
            {showNotes && selectedConv && (
               <div className="w-80 glass-premium rounded-[48px] border border-border flex flex-col overflow-hidden premium-shadow animate-fade-in">
                  <header className="p-6 border-b border-border bg-muted/20">
                     <h3 className="text-sm font-black text-foreground">Internal Notes</h3>
                     <p className="text-[10px] text-muted-foreground mt-1">Not visible to the customer</p>
                  </header>
                  <div className="flex-1 p-6">
                     <textarea 
                        className="w-full h-full bg-background border border-border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        placeholder="Add notes about this customer or conversation..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                     ></textarea>
                  </div>
                  <footer className="p-6 border-t border-border bg-muted/20">
                     <button onClick={handleSaveNotes} disabled={isSavingNotes} className="w-full py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all">
                        {isSavingNotes ? 'Saving...' : 'Save Notes'}
                     </button>
                  </footer>
               </div>
            )}
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
