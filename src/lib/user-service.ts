import { firestore } from './firebase-admin';
import { encrypt, decrypt, generateWebhookToken } from './encryption';
import type { ApiKeysConfig, WebhookTokens } from '@/types';

/**
 * 사용자 API 키 설정 저장
 */
export async function saveApiKeys(
  userId: string,
  apiKeys: ApiKeysConfig
): Promise<void> {
  const encryptedKeys = encryptApiKeys(apiKeys);

  await firestore
    .collection('users')
    .doc(userId)
    .collection('apiKeys')
    .doc('config')
    .set(
      {
        ...encryptedKeys,
        updatedAt: new Date(),
      },
      { merge: true }
    );
}

/**
 * 사용자 API 키 설정 조회
 */
export async function getApiKeys(
  userId: string
): Promise<ApiKeysConfig | null> {
  const doc = await firestore
    .collection('users')
    .doc(userId)
    .collection('apiKeys')
    .doc('config')
    .get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data() as any;
  return decryptApiKeys(data);
}

/**
 * 웹훅 토큰 생성 또는 조회
 */
export async function getOrCreateWebhookTokens(
  userId: string
): Promise<WebhookTokens> {
  const docRef = firestore
    .collection('users')
    .doc(userId)
    .collection('webhookTokens')
    .doc('tokens');

  const doc = await docRef.get();

  if (doc.exists) {
    return doc.data() as WebhookTokens;
  }

  // 새 토큰 생성
  const tokens: WebhookTokens = {
    meta: generateWebhookToken(),
    google: generateWebhookToken(),
    tiktok: generateWebhookToken(),
    createdAt: new Date(),
  };

  // Firestore에 저장
  await docRef.set(tokens);

  // 토큰 인덱스 생성 (토큰 → userId 매핑)
  const batch = firestore.batch();
  batch.set(firestore.collection('webhookTokenIndex').doc(tokens.meta), {
    userId,
    platform: 'meta',
    createdAt: new Date(),
  });
  batch.set(firestore.collection('webhookTokenIndex').doc(tokens.google), {
    userId,
    platform: 'google',
    createdAt: new Date(),
  });
  batch.set(firestore.collection('webhookTokenIndex').doc(tokens.tiktok), {
    userId,
    platform: 'tiktok',
    createdAt: new Date(),
  });
  await batch.commit();

  return tokens;
}

/**
 * 토큰으로 사용자 ID 조회
 */
export async function getUserIdByToken(token: string): Promise<string | null> {
  const doc = await firestore
    .collection('webhookTokenIndex')
    .doc(token)
    .get();

  if (!doc.exists) {
    return null;
  }

  return doc.data()?.userId || null;
}

/**
 * 토큰으로 사용자 API 키 조회
 */
export async function getApiKeysByToken(
  token: string
): Promise<ApiKeysConfig | null> {
  const userId = await getUserIdByToken(token);
  if (!userId) {
    return null;
  }

  return getApiKeys(userId);
}

/**
 * API 키 암호화 헬퍼
 */
function encryptApiKeys(apiKeys: ApiKeysConfig): any {
  const result: any = {};

  if (apiKeys.solapi) {
    result.solapi = {
      apiKey: encrypt(apiKeys.solapi.apiKey),
      apiSecret: encrypt(apiKeys.solapi.apiSecret),
      senderNumber: apiKeys.solapi.senderNumber, // 전화번호는 암호화 불필요
    };
  }

  if (apiKeys.meta) {
    result.meta = {
      appSecret: encrypt(apiKeys.meta.appSecret),
      pageAccessToken: encrypt(apiKeys.meta.pageAccessToken),
      verifyToken: apiKeys.meta.verifyToken,
    };
  }

  if (apiKeys.google) {
    result.google = {
      webhookKey: apiKeys.google.webhookKey,
    };
  }

  if (apiKeys.tiktok) {
    result.tiktok = {
      webhookSecret: apiKeys.tiktok.webhookSecret,
    };
  }

  if (apiKeys.kakao) {
    result.kakao = apiKeys.kakao;
  }

  return result;
}

/**
 * API 키 복호화 헬퍼
 */
function decryptApiKeys(data: any): ApiKeysConfig {
  const result: ApiKeysConfig = {} as any;

  if (data.solapi) {
    result.solapi = {
      apiKey: decrypt(data.solapi.apiKey),
      apiSecret: decrypt(data.solapi.apiSecret),
      senderNumber: data.solapi.senderNumber,
    };
  }

  if (data.meta) {
    result.meta = {
      appSecret: decrypt(data.meta.appSecret),
      pageAccessToken: decrypt(data.meta.pageAccessToken),
      verifyToken: data.meta.verifyToken,
    };
  }

  if (data.google) {
    result.google = data.google;
  }

  if (data.tiktok) {
    result.tiktok = data.tiktok;
  }

  if (data.kakao) {
    result.kakao = data.kakao;
  }

  return result;
}

/**
 * 사용자 생성 (회원가입 시 호출)
 */
export async function createUser(
  userId: string,
  email: string,
  name: string
): Promise<void> {
  await firestore.collection('users').doc(userId).set({
    email,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
