import { EmotionConfig } from '@/app/types/emotion';

export const emotionConfig: Record<string, EmotionConfig> = {
  senang: {
    icon: null,
    label: 'Senang',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    emoji: '😊',
  },
  sedih: {
    icon: null,
    label: 'Sedih',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    emoji: '😢',
  },
  marah: {
    icon: null,
    label: 'Marah',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    emoji: '😡',
  },
};

export const INITIAL_LOGS = [
  { id: 'USR-992', name: 'Andi Pratama', cardUid: 'A1:B2:C3:D4', emotion: 'senang' as const, timestamp: '14:20:01' },
  { id: 'USR-441', name: 'Budi Santoso', cardUid: 'E5:F6:G7:H8', emotion: 'sedih' as const, timestamp: '14:15:22' },
  { id: 'USR-102', name: 'Citra Lestari', cardUid: 'I9:J0:K1:L2', emotion: 'marah' as const, timestamp: '14:02:45' },
];

export const MOCK_NAMES = ['Dika Rahardjo', 'Siska Amelia', 'Roni Wijaya'];
export const EMOTIONS = ['senang', 'sedih', 'marah'] as const;
