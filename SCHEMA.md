# Firestore Schema - Multi-Tenant Orchestrator

## Collections

### `users/{userId}`
```typescript
{
  email: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `users/{userId}/apiKeys/config`
```typescript
{
  // SOLAPI (필수)
  solapi: {
    apiKey: string;      // AES-256 암호화
    apiSecret: string;   // AES-256 암호화
    senderNumber: string;
  };

  // Meta (선택)
  meta?: {
    appSecret: string;
    pageAccessToken: string;  // 암호화
    verifyToken: string;
  };

  // Google Ads (선택)
  google?: {
    webhookKey: string;
  };

  // TikTok (선택)
  tiktok?: {
    webhookSecret: string;
  };

  // Kakao (선택)
  kakao?: {
    channelId: string;
    pfId?: string;
  };

  updatedAt: Timestamp;
}
```

### `users/{userId}/webhookTokens/tokens`
```typescript
{
  meta: string;      // 무작위 토큰 (32 bytes hex)
  google: string;    // 무작위 토큰 (32 bytes hex)
  tiktok: string;    // 무작위 토큰 (32 bytes hex)
  createdAt: Timestamp;
}
```

### `webhookTokenIndex/{token}` (토큰 → userId 매핑)
```typescript
{
  userId: string;
  platform: 'meta' | 'google' | 'tiktok';
  createdAt: Timestamp;
}
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 데이터만 접근
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /apiKeys/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /webhookTokens/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // 웹훅 토큰 인덱스는 서버에서만 접근
    match /webhookTokenIndex/{token} {
      allow read, write: if false; // Admin SDK only
    }
  }
}
```

## Indexes Required

- `webhookTokenIndex` collection: None (direct document lookup by token)
- Users collection: Composite index on `email` (ascending)

## Notes

- API 키는 AES-256-GCM으로 암호화
- 암호화 키는 환경변수 `ENCRYPTION_KEY`로 관리
- 웹훅 토큰은 crypto.randomBytes(32)로 생성
- SOLAPI는 필수, 다른 플랫폼은 선택적으로 설정 가능
