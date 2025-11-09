import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/firebase-admin';
import { saveApiKeys, getApiKeys } from '@/lib/user-service';
import type { ApiResponse, ApiKeysConfig } from '@/types';

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
  // 사용자 인증
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      timestamp: Date.now(),
    });
  }

  // GET: API 키 조회
  if (req.method === 'GET') {
    try {
      const apiKeys = await getApiKeys(userId);

      return res.status(200).json({
        success: true,
        data: apiKeys,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      console.error('Failed to get API keys:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get API keys',
        timestamp: Date.now(),
      });
    }
  }

  // POST/PUT: API 키 저장
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const apiKeys = req.body as ApiKeysConfig;

      // SOLAPI는 필수
      if (!apiKeys.solapi) {
        return res.status(400).json({
          success: false,
          error: 'SOLAPI configuration is required',
          timestamp: Date.now(),
        });
      }

      // 필수 필드 검증
      const { apiKey, apiSecret, senderNumber } = apiKeys.solapi;
      if (!apiKey || !apiSecret || !senderNumber) {
        return res.status(400).json({
          success: false,
          error: 'SOLAPI apiKey, apiSecret, and senderNumber are required',
          timestamp: Date.now(),
        });
      }

      // 전화번호 형식 검증 (한국 번호)
      const phoneRegex = /^010\d{8}$/;
      if (!phoneRegex.test(senderNumber.replace(/-/g, ''))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid sender number format. Use 010XXXXXXXX',
          timestamp: Date.now(),
        });
      }

      await saveApiKeys(userId, apiKeys);

      return res.status(200).json({
        success: true,
        data: { message: 'API keys saved successfully' },
        timestamp: Date.now(),
      });
    } catch (error: any) {
      console.error('Failed to save API keys:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save API keys',
        timestamp: Date.now(),
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
    timestamp: Date.now(),
  });
}
