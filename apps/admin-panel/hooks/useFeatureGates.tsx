import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { api } from '@/lib/api';

interface FeatureGates {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  call: boolean;
  aiVoice: boolean;
  aiText: boolean;
}

interface FeatureGatesContextType {
  gates: FeatureGates;
  loading: boolean;
  refreshGates: () => Promise<void>;
}

const defaultGates: FeatureGates = {
  email: false,
  sms: false,
  whatsapp: false,
  call: false,
  aiVoice: false,
  aiText: false,
};

const FeatureGatesContext = createContext<FeatureGatesContextType>({
  gates: defaultGates,
  loading: true,
  refreshGates: async () => {},
});

export const FeatureGatesProvider = ({ children }: { children: ReactNode }) => {
  const [gates, setGates] = useState<FeatureGates>(defaultGates);
  const [loading, setLoading] = useState(true);

  const fetchGates = async () => {
    try {
      const data = await api.get('/credentials/features');
      if (data) {
        setGates(data);
      }
    } catch (err) {
      console.error('Failed to fetch feature gates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGates();
  }, []);

  return (
    <FeatureGatesContext.Provider value={{ gates, loading, refreshGates: fetchGates }}>
      {children}
    </FeatureGatesContext.Provider>
  );
};

export const useFeatureGates = () => {
  const context = useContext(FeatureGatesContext);
  if (!context) {
    throw new Error('useFeatureGates must be used within a FeatureGatesProvider');
  }
  return context;
};
