export type EmotionType = "senang" | "sedih" | "marah";

export interface EmotionLog {
  id: string;
  name: string;
  card_uid: string;
  owner_name?: string;
  emotion: EmotionType;
  timestamp: number;
}

export interface EmotionConfigItem {
  label: string;
  emoji: string;
  bgColor: string;
  textColor: string;
}

export const EMOTION_CONFIG: Record<EmotionType, EmotionConfigItem> = {
  senang: {
    label: "Senang",
    emoji: "😊",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
  },
  sedih: {
    label: "Sedih",
    emoji: "😢",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  marah: {
    label: "Marah",
    emoji: "😡",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
};
