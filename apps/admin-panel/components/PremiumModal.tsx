'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export default function PremiumModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  footer,
  maxWidth = 'max-w-xl'
}: PremiumModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-6 lg:p-10">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/40 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} bg-card rounded-[40px] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[95vh]`}
          >
            {/* Header */}
            <div className="p-8 md:p-10 border-b border-border flex justify-between items-center bg-muted/30 shrink-0">
               <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">{title}</h2>
                  {subtitle && <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{subtitle}</p>}
               </div>
               <button 
                 onClick={onClose} 
                 className="p-3 hover:bg-background rounded-2xl transition-all text-muted-foreground hover:text-primary border border-transparent hover:border-border shadow-sm"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>

            {/* Body */}
            <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1">
               {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-8 md:p-10 border-t border-border bg-muted/30 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
