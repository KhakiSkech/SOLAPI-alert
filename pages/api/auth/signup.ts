import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/firebase-admin';
import { createUser } from '@/lib/user-service';
import { checkRateLimit, getClientIdentifier, RateLimitPresets } from '@/lib/rate-limit';
import type { ApiResponse } from '@/types';

interface SignupRequest {
  email: string;
  password: string;
  name: string;
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

  // Rate limiting
  const clientId = getClientIdentifier(req);
  const rateLimit = checkRateLimit(clientId, {
    ...RateLimitPresets.AUTH,
    keyPrefix: 'signup',
  });

  if (!rateLimit.success) {
    return res.status(429).json({
      success: false,
      error: 'Too many signup attempts. Please try again later.',
      timestamp: Date.now(),
    });
  }

  try {
    const { email, password, name } = req.body as SignupRequest;

    // 입력 검증
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
        timestamp: Date.now(),
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
        timestamp: Date.now(),
      });
    }

    // Firebase Auth에 사용자 생성
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Firestore에 사용자 정보 저장
    await createUser(userRecord.uid, email, name);

    // Custom token 생성 (클라이언트에서 로그인에 사용)
    const customToken = await auth.createCustomToken(userRecord.uid);

    return res.status(201).json({
      success: true,
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        name,
        customToken,
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Signup error:', error);

    // Firebase Auth 에러 처리
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        error: '이미 사용 중인 이메일입니다',
        timestamp: Date.now(),
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create user',
      timestamp: Date.now(),
    });
  }
}
