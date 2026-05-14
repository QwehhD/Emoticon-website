'use client';

import { useMqtt } from './MqttProvider';

export function MqttStatusIndicator() {
  const { isConnected, error } = useMqtt();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
        isConnected 
          ? 'bg-green-500 text-white' 
          : error 
          ? 'bg-red-500 text-white' 
          : 'bg-yellow-500 text-white'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-white animate-pulse' : 'bg-white/50'
        }`} />
        <span className="text-sm font-medium">
          {isConnected ? 'MQTT Connected' : error ? `MQTT Error: ${error}` : 'MQTT Connecting...'}
        </span>
      </div>
    </div>
  );
}
