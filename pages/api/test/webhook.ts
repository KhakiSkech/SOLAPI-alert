/**
 * Webhook Testing API
 * Allows users to send test notifications
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/firebase-admin';
import { getApiKeys } from '@/lib/user-service';
import { SolapiClient } from '@/lib/solapi-client';
import { checkRateLimit, getClientIdentifier, RateLimitPresets } from '@/lib/rate-limit';
import type { ApiResponse } from '@/types';

/**
 * 인증 헬퍼: Authorization 헤더에서 사용자 ID 추출
 */
async function getUserIdFromRequest(
  req: NextApiRequest
): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const idToken = authHeader.substring(7);
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: Date.now(),
    });
  }

  // Rate limiting (strict for testing)
  const clientId = getClientIdentifier(req);
  const rateLimit = checkRateLimit(clientId, {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 requests per minute
    keyPrefix: 'test-webhook',
  });

  if (!rateLimit.success) {
    return res.status(429).json({
      success: false,
      error: 'Too many test requests. Please wait before trying again.',
      timestamp: Date.now(),
    });
  }

  // 사용자 인증
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      timestamp: Date.now(),
    });
  }

  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
        timestamp: Date.now(),
      });
    }

    // Get user's API keys
    const apiKeys = await getApiKeys(userId);
    if (!apiKeys || !apiKeys.solapi) {
      return res.status(400).json({
        success: false,
        error: 'SOLAPI not configured. Please set up your API keys first.',
        timestamp: Date.now(),
      });
    }

    // Create SOLAPI client
    const client = new SolapiClient(
      apiKeys.solapi.apiKey,
      apiKeys.solapi.apiSecret,
      apiKeys.solapi.senderNumber
    );

    // Format and validate phone number
    const formattedPhone = SolapiClient.formatPhoneNumber(phoneNumber);

    // Send test SMS
    const testMessage = `[테스트] 웹훅 알림 시스템 테스트 메시지입니다.\n발송 시각: ${new Date().toLocaleString('ko-KR')}`;

    await client.sendSMS({
      to: formattedPhone,
      text: testMessage,
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Test notification sent successfully',
        phoneNumber: formattedPhone,
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Test webhook error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test notification',
      timestamp: Date.now(),
    });
  }
}
