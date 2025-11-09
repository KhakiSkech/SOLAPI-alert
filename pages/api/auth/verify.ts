import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/firebase-admin';
import type { ApiResponse } from '@/types';

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

  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required',
        timestamp: Date.now(),
      });
    }

    // Firebase ID 토큰 검증
    const decodedToken = await auth.verifyIdToken(idToken);

    return res.status(200).json({
      success: true,
      data: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Token verification error:', error);

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      timestamp: Date.now(),
    });
  }
}
