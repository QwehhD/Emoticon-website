import { supabase } from './supabase';

export interface EmotionLog {
  id?: string;
  card_uid: string;
  emotion: string;
  timestamp: number;
  created_at?: string;
}

/**
 * Save emotion log to Supabase
 * Expected table structure:
 * - emotion_logs (table)
 *   - id (UUID, primary key)
 *   - card_uid (text)
 *   - emotion (text)
 *   - timestamp (bigint)
 *   - created_at (timestamp with timezone, default: now())
 */
export async function saveEmotionLog(emotionLog: EmotionLog): Promise<EmotionLog | null> {
  try {
    const { data, error } = await supabase
      .from('emotion_logs')
      .insert([
        {
          card_uid: emotionLog.card_uid,
          emotion: emotionLog.emotion,
          timestamp: emotionLog.timestamp,
        },
      ])
      .select();

    if (error) {
      console.error('Error saving emotion log:', error);
      return null;
    }

    if (data && data.length > 0) {
      console.log(`✓ Emotion log saved: ${emotionLog.card_uid} - ${emotionLog.emotion}`);
      return data[0];
    }

    return null;
  } catch (error) {
    console.error('Exception while saving emotion log:', error);
    return null;
  }
}

/**
 * Get all emotion logs for a specific UID
 */
export async function getEmotionLogsByUID(cardUID: string): Promise<EmotionLog[]> {
  try {
    const { data, error } = await supabase
      .from('emotion_logs')
      .select('*')
      .eq('card_uid', cardUID)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching emotion logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception while fetching emotion logs:', error);
    return [];
  }
}

/**
 * Get all emotion logs with optional limit
 */
export async function getAllEmotionLogs(limit: number = 100): Promise<EmotionLog[]> {
  try {
    const { data, error } = await supabase
      .from('emotion_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching all emotion logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception while fetching emotion logs:', error);
    return [];
  }
}

/**
 * Delete an emotion log by ID
 */
export async function deleteEmotionLog(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('emotion_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting emotion log:', error);
      return false;
    }

    console.log(`✓ Emotion log deleted: ${id}`);
    return true;
  } catch (error) {
    console.error('Exception while deleting emotion log:', error);
    return false;
  }
}

/**
 * Get emotion statistics for a UID
 */
export async function getEmotionStats(
  cardUID: string,
  days: number = 30
): Promise<Record<string, number>> {
  try {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const { data, error } = await supabase
      .from('emotion_logs')
      .select('emotion')
      .eq('card_uid', cardUID)
      .gte('timestamp', cutoffTime);

    if (error) {
      console.error('Error fetching emotion stats:', error);
      return {};
    }

    const stats: Record<string, number> = {};
    data?.forEach((log) => {
      stats[log.emotion] = (stats[log.emotion] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Exception while fetching emotion stats:', error);
    return {};
  }
}
