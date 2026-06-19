'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useMqttValidator } from '@/hooks/useMqttValidator';

interface MqttContextValue {
  isConnected: boolean;
  error: string | null;
  lastMessage: { topic: string; message: string } | null;
}

const MqttContext = createContext<MqttContextValue | undefined>(undefined);

export function MqttProvider({ children }: { children: ReactNode }) {
  const mqtt = useMqttValidator();

  return (
    <MqttContext.Provider value={mqtt}>
      {children}
    </MqttContext.Provider>
  );
}

export function useMqtt() {
  const context = useContext(MqttContext);
  if (context === undefined) {
    throw new Error('useMqtt must be used within MqttProvider');
  }
  return context;
}
