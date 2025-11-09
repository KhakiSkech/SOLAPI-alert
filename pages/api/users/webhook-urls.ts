import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/firebase-admin';
import { getOrCreateWebhookTokens } from '@/lib/user-service';
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
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
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
    // 웹훅 토큰 조회 또는 생성
    const tokens = await getOrCreateWebhookTokens(userId);

    // 배포 URL (환경변수에서 가져오거나 기본값)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      'http://localhost:3000';

    // 웹훅 URL 생성
    const webhookUrls = {
      meta: `${baseUrl}/api/webhooks/meta?token=${tokens.meta}`,
      google: `${baseUrl}/api/webhooks/google-ads?token=${tokens.google}`,
      tiktok: `${baseUrl}/api/webhooks/tiktok?token=${tokens.tiktok}`,
    };

    return res.status(200).json({
      success: true,
      data: {
        urls: webhookUrls,
        tokens,
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Failed to get webhook URLs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get webhook URLs',
      timestamp: Date.now(),
    });
  }
}
