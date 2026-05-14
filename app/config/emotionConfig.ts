import { EmotionConfigItem } from '@/app/types/emotion';

export const emotionConfig: Record<string, EmotionConfigItem> = {
  senang: {
    label: 'Senang',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    emoji: '😊',
  },
  sedih: {
    label: 'Sedih',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    emoji: '😢',
  },
  marah: {
    label: 'Marah',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    emoji: '😡',
  },
};
