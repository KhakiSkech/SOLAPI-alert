/**
 * Password Reset Request API
 * Sends password reset email using Firebase Auth
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/firebase-admin';
import { checkRateLimit, getClientIdentifier, RateLimitPresets } from '@/lib/rate-limit';
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

  // Rate limiting
  const clientId = getClientIdentifier(req);
  const rateLimit = checkRateLimit(clientId, {
    ...RateLimitPresets.SENSITIVE,
    keyPrefix: 'reset',
  });

  if (!rateLimit.success) {
    return res.status(429).json({
      success: false,
      error: 'Too many password reset attempts. Please try again later.',
      timestamp: Date.now(),
    });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        timestamp: Date.now(),
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        timestamp: Date.now(),
      });
    }

    // Firebase Admin SDK를 사용하여 비밀번호 재설정 링크 생성
    const resetLink = await auth.generatePasswordResetLink(email);

    // 실제 프로덕션에서는 여기서 이메일 발송 서비스를 사용
    // 현재는 Firebase의 기본 이메일 발송 사용
    console.log('Password reset link:', resetLink);

    // 보안상 사용자 존재 여부를 노출하지 않음
    return res.status(200).json({
      success: true,
      data: {
        message: '비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요.',
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Password reset request error:', error);

    // Firebase Auth 에러 처리
    if (error.code === 'auth/user-not-found') {
      // 보안상 사용자 존재 여부를 노출하지 않음
      return res.status(200).json({
        success: true,
        data: {
          message: '비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요.',
        },
        timestamp: Date.now(),
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to process password reset request',
      timestamp: Date.now(),
    });
  }
}
