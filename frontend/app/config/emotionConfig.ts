import { EmotionConfigItem } from '@/app/types/emotion';

export const emotionConfig: Record<string, EmotionConfigItem> = {
  Bersemangat: {
    label: 'Bersemangat',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    emoji: '😄',
  },
  Tenang: {
    label: 'Tenang',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    emoji: '😌',
  },
  Sedih: {
    label: 'Sedih',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    emoji: '😢',
  },
  Cemas: {
    label: 'Cemas',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    emoji: '😰',
  },
  Malas: {
    label: 'Malas',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    emoji: '🥱',
  },
  Marah: {
    label: 'Marah',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    emoji: '😡',
  },
};