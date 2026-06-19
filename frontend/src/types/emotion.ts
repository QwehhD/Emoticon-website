export type EmotionType = 'Bersemangat' | 'Tenang' | 'Sedih' | 'Cemas' | 'Malas' | 'Marah';

export interface EmotionLog {
  id: string;
  name: string;
  card_uid: string;
  emotion: EmotionType;
  timestamp: number; // ← ubah dari string ke number
}

export interface EmotionConfigItem {
  label: string;
  emoji: string;
  bgColor: string;
  textColor: string;
}

export const EMOTION_CONFIG: Record<EmotionType, EmotionConfigItem> = {
  Bersemangat: {
    label: 'Bersemangat',
    emoji: '😄',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  Tenang: {
    label: 'Tenang',
    emoji: '😌',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  Sedih: {
    label: 'Sedih',
    emoji: '😢',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  Cemas: {
    label: 'Cemas',
    emoji: '😰',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
  Malas: {
    label: 'Malas',
    emoji: '🥱',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
  },
  Marah: {
    label: 'Marah',
    emoji: '😡',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
};