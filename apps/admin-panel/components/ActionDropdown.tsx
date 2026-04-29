'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, Eye, Copy } from 'lucide-react';

interface ActionDropdownProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onCopy?: () => void;
}

export default function ActionDropdown({ onEdit, onDelete, onView, onCopy }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 glass-premium rounded-2xl border border-border shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1">
            {onView && (
              <button 
                onClick={() => { onView(); setIsOpen(false); }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-xl transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            )}
            {onEdit && (
              <button 
                onClick={() => { onEdit(); setIsOpen(false); }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-xl transition-all"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Record</span>
              </button>
            )}
            {onCopy && (
              <button 
                onClick={() => { onCopy(); setIsOpen(false); }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-xl transition-all"
              >
                <Copy className="w-4 h-4" />
                <span>Duplicate</span>
              </button>
            )}
            <div className="h-[1px] bg-border mx-2 my-1"></div>
            {onDelete && (
              <button 
                onClick={() => { onDelete(); setIsOpen(false); }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
