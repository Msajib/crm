'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();

  // Keyboard shortcut Cmd+K / Ctrl+K and ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const performSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSelectedIndex(-1);
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
        setSelectedIndex(data.length > 0 ? 0 : -1);
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
    if (type === 'Contact') router.push(`/contacts/${id}`);
    else if (type === 'Deal') router.push(`/deals`); // Kanban view doesn't support specific ID easily yet, but can route to deals
    else if (type === 'Task') router.push(`/tasks`);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const res = results[selectedIndex];
      handleNavigate(res.type, res.id);
    }
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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search everything..." 
          onFocus={() => setIsOpen(true)}
          className="bg-muted/50 border border-border/50 rounded-2xl px-12 py-2.5 text-xs focus:outline-none hover:bg-muted hover:border-border w-64 transition-all cursor-pointer text-muted-foreground placeholder:text-muted-foreground/50 font-medium shadow-sm shadow-black/5"
          readOnly
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          <kbd className="px-2 py-1 bg-background border border-border/50 rounded-md text-[10px] text-muted-foreground font-bold shadow-sm">⌘K</kbd>
        </div>
      </div>
    );
  }

  const modalContent = (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999] flex items-start justify-center pt-[15vh] px-4 overflow-y-auto"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="w-full max-w-2xl bg-card border border-border/60 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border/60 flex items-center space-x-4 bg-muted/20">
          <Search className={`w-5 h-5 ${loading ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          <input 
            autoFocus
            type="text" 
            placeholder="Type a command or search..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-lg text-foreground placeholder:text-muted-foreground/60"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1.5 hover:bg-muted rounded-lg transition-all text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-hide py-2">
          {query.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
               <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                 <Search className="w-6 h-6 text-muted-foreground/50" />
               </div>
               <p className="text-sm text-muted-foreground">Search contacts, deals, tasks, and more</p>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
               <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                 <X className="w-6 h-6 text-muted-foreground/50" />
               </div>
               <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
            </div>
          ) : loading && results.length === 0 ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="px-2 space-y-1">
              {results.map((res, i) => {
                const Icon = getIcon(res.type);
                const isSelected = i === selectedIndex;
                return (
                  <div 
                    key={res.id} 
                    onClick={() => handleNavigate(res.type, res.id)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                         isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                       }`}>
                          <Icon className="w-5 h-5" />
                       </div>
                       <div>
                          <p className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{res.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-0.5">{res.type}</p>
                       </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs text-primary font-medium px-3 flex items-center space-x-1">
                        <span>Jump to</span>
                        <kbd className="px-1.5 py-0.5 bg-background rounded border border-primary/20 shadow-sm ml-2 font-sans text-[10px]">↵</kbd>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer className="px-4 py-3 bg-muted/40 border-t border-border/50 flex items-center justify-between">
           <div className="flex items-center space-x-6 text-[11px] text-muted-foreground font-medium">
              <span className="flex items-center">
                <kbd className="bg-background px-1.5 py-0.5 rounded border border-border mr-1.5 shadow-sm font-sans">↵</kbd> 
                Select
              </span>
              <span className="flex items-center">
                <kbd className="bg-background px-1.5 py-0.5 rounded border border-border mr-1.5 shadow-sm font-sans">↑↓</kbd> 
                Navigate
              </span>
           </div>
           <p className="text-[11px] text-muted-foreground font-medium">
             <kbd className="bg-background px-1.5 py-0.5 rounded border border-border mr-1.5 shadow-sm font-sans">ESC</kbd> 
             to close
           </p>
        </footer>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
