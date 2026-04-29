'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Users, Briefcase, CheckSquare, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';

interface SearchResult {
  id: string;
  name: string;
  type: 'Contact' | 'Deal' | 'Task';
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const performSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/crm/search?q=${encodeURIComponent(q)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((q: string) => performSearch(q), 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleNavigate = (type: string, id: string) => {
    setIsOpen(false);
    setQuery('');
    if (type === 'Contact') router.push(`/dashboard/contacts/${id}`);
    else if (type === 'Deal') router.push(`/dashboard/deals`); // Kanban view
    else if (type === 'Task') router.push(`/dashboard/tasks`);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Contact': return Users;
      case 'Deal': return Briefcase;
      case 'Task': return CheckSquare;
      default: return MessageSquare;
    }
  };

  if (!isOpen) {
    return (
      <div className="relative group hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search everything..." 
          onFocus={() => setIsOpen(true)}
          className="bg-muted border border-border rounded-2xl px-12 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all cursor-pointer"
          readOnly
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-background border border-border rounded text-[10px] text-muted-foreground font-black">/</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[100] flex items-start justify-center pt-24 px-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-card border border-border shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-[40px] overflow-hidden animate-in slide-in-from-top-4 duration-300">
        <div className="p-6 border-b border-border flex items-center space-x-4">
          <Search className={`w-6 h-6 ${loading ? 'text-primary animate-pulse' : 'text-primary'}`} />
          <input 
            autoFocus
            type="text" 
            placeholder="What are you looking for?" 
            className="flex-1 bg-transparent border-none focus:outline-none text-xl font-bold text-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-all"><X className="w-6 h-6 text-muted-foreground" /></button>
        </div>

        <div className="p-4 max-h-[500px] overflow-y-auto scrollbar-hide">
          {query.length === 0 ? (
            <div className="py-10 text-center">
               <p className="text-sm text-muted-foreground italic">Try searching for contacts, deals, or recent tasks...</p>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="py-10 text-center">
               <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((res, i) => {
                const Icon = getIcon(res.type);
                return (
                  <div 
                    key={i} 
                    onClick={() => handleNavigate(res.type, res.id)}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-primary/10 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center space-x-4">
                       <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                          <Icon className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-foreground">{res.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{res.type}</p>
                       </div>
                    </div>
                    <button className="px-4 py-2 bg-muted rounded-xl text-[10px] font-black uppercase group-hover:bg-primary group-hover:text-white transition-all">View Record</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer className="p-4 bg-muted/30 border-t border-border flex items-center justify-between">
           <div className="flex items-center space-x-4 text-[10px] text-muted-foreground font-black uppercase">
              <span className="flex items-center"><span className="bg-background px-1.5 py-0.5 rounded border border-border mr-1">ENT</span> Select</span>
              <span className="flex items-center"><span className="bg-background px-1.5 py-0.5 rounded border border-border mr-1">↑↓</span> Navigate</span>
           </div>
           <p className="text-[10px] text-muted-foreground">Press <span className="bg-background px-1.5 py-0.5 rounded border border-border">ESC</span> to close</p>
        </footer>
      </div>
    </div>
  );
}
