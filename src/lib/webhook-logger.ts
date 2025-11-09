/**
 * Webhook logging utilities
 * Stores webhook processing history in Firestore
 */

import { firestore } from './firebase-admin';

export interface WebhookLog {
  userId: string;
  platform: 'meta' | 'google' | 'tiktok';
  leadId: string;
  status: 'success' | 'failed';
  phoneNumber?: string;
  errorMessage?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Log webhook processing result
 */
export async function logWebhook(log: WebhookLog): Promise<void> {
  try {
    await firestore.collection('webhookLogs').add({
      ...log,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to log webhook:', error);
    // Don't throw - logging failure shouldn't stop webhook processing
  }
}

/**
 * Get recent webhook logs for a user
 */
export async function getWebhookLogs(
  userId: string,
  limit: number = 50
): Promise<WebhookLog[]> {
  try {
    const snapshot = await firestore
      .collection('webhookLogs')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as WebhookLog);
  } catch (error) {
    console.error('Failed to get webhook logs:', error);
    return [];
  }
}

/**
 * Get webhook statistics for a user
 */
export async function getWebhookStats(userId: string): Promise<{
  total: number;
  success: number;
  failed: number;
  byPlatform: Record<string, number>;
}> {
  try {
    const snapshot = await firestore
      .collection('webhookLogs')
      .where('userId', '==', userId)
      .get();

    const logs = snapshot.docs.map((doc) => doc.data() as WebhookLog);

    const stats = {
      total: logs.length,
      success: logs.filter((l) => l.status === 'success').length,
      failed: logs.filter((l) => l.status === 'failed').length,
      byPlatform: {} as Record<string, number>,
    };

    // Count by platform
    logs.forEach((log) => {
      stats.byPlatform[log.platform] = (stats.byPlatform[log.platform] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Failed to get webhook stats:', error);
    return {
      total: 0,
      success: 0,
      failed: 0,
      byPlatform: {},
    };
  }
}
