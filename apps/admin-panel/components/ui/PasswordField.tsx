'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  showIcon?: boolean;
}

export function PasswordField({ 
  value, 
  onChange, 
  placeholder = '••••••••', 
  label, 
  required = false, 
  id, 
  name,
  className = "w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-14 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm font-medium",
  showIcon = true
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {showIcon && (
          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors pointer-events-none" />
        )}
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all outline-none"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
