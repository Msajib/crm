'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface BrandSettings {
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  systemName?: string;
}

const BrandContext = createContext<{
  settings: BrandSettings;
  updateSettings: (newSettings: Partial<BrandSettings>) => void;
} | null>(null);

export function BrandProvider({ children, initialSettings }: { children: React.ReactNode; initialSettings: BrandSettings }) {
  const [settings, setSettings] = useState<BrandSettings>(initialSettings);

  useEffect(() => {
    // Simulate fetching tenant-specific branding if context is switched
    const tenantSlug = localStorage.getItem('tenant_slug');
    if (tenantSlug && tenantSlug !== 'admin') {
       // Mock fetch: in real app, call API
       if (tenantSlug === 'acme') {
          updateSettings({ primaryColor: '#059669', systemName: 'Acme Enterprise' }); // Emerald for Acme
       } else if (tenantSlug === 'techflow') {
          updateSettings({ primaryColor: '#7c3aed', systemName: 'TechFlow Pro' }); // Violet for TechFlow
       }
    }
  }, []);

  useEffect(() => {
    // Apply colors to CSS variables
    // ... logic handled by styled-jsx below
  }, [settings]);

  const updateSettings = (newSettings: Partial<BrandSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <BrandContext.Provider value={{ settings, updateSettings }}>
      {/* Dynamic Style Injection */}
      <style jsx global>{`
        :root {
          ${settings.primaryColor ? `--primary: ${hexToHsl(settings.primaryColor)};` : ''}
          ${settings.secondaryColor ? `--secondary: ${hexToHsl(settings.secondaryColor)};` : ''}
          ${settings.accentColor ? `--accent: ${hexToHsl(settings.accentColor)};` : ''}
        }
      `}</style>
      {children}
    </BrandContext.Provider>
  );
}

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) throw new Error('useBrand must be used within BrandProvider');
  return context;
};

// Simple Hex to HSL helper for Tailwind CSS variables
function hexToHsl(hex: string): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
