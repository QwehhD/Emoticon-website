export interface EmotionLog {
  id: string;
  name: string;
  cardUid: string;
  emotion: 'senang' | 'sedih' | 'marah';
  timestamp: string;
}

export interface EmotionConfig {
  icon: null;
  label: string;
  bgColor: string;
  textColor: string;
  emoji: string;
}
