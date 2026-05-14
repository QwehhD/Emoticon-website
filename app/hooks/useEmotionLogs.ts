import { useState, useEffect } from 'react';
import { EmotionLog } from '@/app/types/emotion';
import { INITIAL_LOGS, MOCK_NAMES, EMOTIONS } from '@/app/config/emotionConfig';

export function useEmotionLogs() {
  const [logs, setLogs] = useState<EmotionLog[]>(INITIAL_LOGS);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEntry: EmotionLog = {
        id: `USR-${Math.floor(Math.random() * 900) + 100}`,
        name: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
        card_uid: `${Math.random().toString(16).slice(2, 4).toUpperCase()}:X1:Y2:Z3`,
        emotion: EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setLogs((prev) => [newEntry, ...prev].slice(0, 10));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return logs;
}
