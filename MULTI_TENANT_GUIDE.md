# 멀티 테넌트 광고 웹훅 오케스트레이터 가이드

## 🎯 개요

각 사용자가 자신의 API 키를 등록하고, 광고 플랫폼(Meta, Google Ads, TikTok)에서 받은 리드를 SOLAPI를 통해 자동으로 알림 받을 수 있는 **SaaS 형태의 오케스트레이터 서비스**입니다.

### 핵심 개념
- ✅ **심플한 오케스트레이터**: 광고 웹훅 → SOLAPI로 전달만 수행
- ✅ **SOLAPI에서 관리**: 템플릿, 통계, 대시보드는 SOLAPI에서 직접 관리
- ✅ **멀티 테넌트**: 각 사용자가 독립적으로 API 키 관리
- ✅ **보안**: API 키는 AES-256로 암호화 저장

## 📋 시스템 구조

```
[사용자] → 대시보드 로그인
    ↓
API 키 입력 (SOLAPI, Meta, Google, TikTok)
    ↓
고유 웹훅 URL 생성 (/api/webhooks/meta?token=abc123)
    ↓
광고 플랫폼에 웹훅 URL 등록
    ↓
[광고 플랫폼] → 리드 발생 → 웹훅 호출
    ↓
오케스트레이터: 토큰으로 사용자 식별
    ↓
사용자의 SOLAPI API 키로 알림 발송
```

## 🚀 빠른 시작

### 1. Firebase 프로젝트 설정

```bash
# Firebase 프로젝트 생성
firebase init

# Authentication 활성화
# - Email/Password 인증 활성화

# Firestore 데이터베이스 생성
# - 프로덕션 모드로 시작
# - Security Rules는 firestore.rules 파일 사용
```

### 2. 환경 변수 설정

`.env.local` 파일 생성:

```bash
# Firebase 설정 (Firebase Console에서 복사)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# 암호화 키 생성 (필수!)
openssl rand -base64 32
# 출력된 값을 아래에 입력
ENCRYPTION_KEY=generated_key_here

# 배포 URL (로컬 개발시에는 생략 가능)
NEXT_PUBLIC_APP_URL=https://your-project.web.app
```

### 3. 로컬 실행

```bash
npm install
npm run dev
```

`http://localhost:3000/login`에서 테스트 가능

### 4. 배포

```bash
npm run build
firebase deploy
```

## 📱 사용자 플로우

### 1단계: 회원가입/로그인

1. `/login` 접속
2. 이메일/비밀번호로 회원가입
3. 자동으로 대시보드로 이동

### 2단계: API 키 입력

대시보드에서 다음 정보 입력:

#### SOLAPI (필수)
- API Key: `solapi.com`에서 발급
- API Secret: SOLAPI API Secret
- 발신번호: `01012345678` 형식

#### Meta (선택)
- App Secret: Facebook Developer Console
- Page Access Token: Facebook Page 설정
- Verify Token: 임의의 문자열

#### Google Ads (선택)
- Webhook Key: 임의의 문자열

#### TikTok (선택)
- Webhook Secret: TikTok Developer Console

### 3단계: 웹훅 URL 복사

API 키 저장 후 생성되는 웹훅 URL:
```
https://your-project.web.app/api/webhooks/meta?token=abc123def456
https://your-project.web.app/api/webhooks/google-ads?token=xyz789ghi012
https://your-project.web.app/api/webhooks/tiktok?token=qwe456rty789
```

### 4단계: 광고 플랫폼에 웹훅 등록

#### Meta (Facebook/Instagram)
1. Facebook Developer Console → Products → Webhooks
2. Page 구독 추가
3. Callback URL: 복사한 Meta 웹훅 URL
4. Verify Token: 대시보드에서 입력한 값
5. Subscribe to: `leadgen`

#### Google Ads
1. Google Ads → Lead Form Extensions
2. Webhook 설정
3. URL: 복사한 Google 웹훅 URL
4. Webhook Key: 대시보드에서 입력한 값

#### TikTok
1. TikTok Ads Manager → Tools → Lead Download
2. Webhook Configuration
3. URL: 복사한 TikTok 웹훅 URL

## 🔐 보안

### API 키 암호화
- **알고리즘**: AES-256-GCM
- **키 파생**: PBKDF2 (100,000 iterations)
- **저장**: Firestore에 암호화된 상태로 저장

### 웹훅 검증
- **Meta**: HMAC-SHA256 서명 검증
- **Google Ads**: Webhook Key 매칭
- **TikTok**: HMAC-SHA256 서명 검증

### Firestore Security Rules
```javascript
// users/{userId}/** : 사용자 본인만 접근
// webhookTokenIndex/** : 서버에서만 접근 (Admin SDK)
```

## 📊 데이터 구조

### Firestore Collections

```
users/{userId}
  ├── profile: { email, name, createdAt }
  ├── apiKeys/config: { solapi, meta, google, tiktok }
  └── webhookTokens/tokens: { meta, google, tiktok }

webhookTokenIndex/{token}
  └── { userId, platform, createdAt }
```

## 🛠️ API 엔드포인트

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/verify` - 토큰 검증

### 사용자 관리
- `GET /api/users/api-keys` - API 키 조회
- `POST /api/users/api-keys` - API 키 저장
- `GET /api/users/webhook-urls` - 웹훅 URL 조회

### 웹훅 (토큰 기반)
- `GET /api/webhooks/meta?token={token}` - Meta 검증
- `POST /api/webhooks/meta?token={token}` - Meta 리드 수신
- `POST /api/webhooks/google-ads?token={token}` - Google Ads 리드 수신
- `POST /api/webhooks/tiktok?token={token}` - TikTok 리드 수신

## 💡 SOLAPI 템플릿 관리

템플릿은 **SOLAPI 대시보드**에서 직접 관리하세요:

1. `solapi.com` 로그인
2. 메시지 → 템플릿 관리
3. AlimTalk 템플릿 생성
4. 승인 요청 및 사용

오케스트레이터는 **SMS만 전송**하며, AlimTalk은 SOLAPI에서 직접 설정 가능합니다.

## 🔍 트러블슈팅

### 웹훅이 작동하지 않음
1. 대시보드에서 API 키가 올바르게 입력되었는지 확인
2. 웹훅 URL이 광고 플랫폼에 정확히 등록되었는지 확인
3. 토큰이 URL에 포함되어 있는지 확인 (`?token=...`)
4. Firebase Functions 로그 확인: `firebase functions:log`

### API 키 저장 실패
1. SOLAPI 발신번호가 `010XXXXXXXX` 형식인지 확인
2. Firebase Authentication이 활성화되어 있는지 확인
3. Firestore Security Rules가 올바르게 설정되었는지 확인

### 암호화 오류
1. `.env.local`에 `ENCRYPTION_KEY`가 설정되어 있는지 확인
2. 키 길이가 최소 32자인지 확인
3. 배포 환경에도 동일한 키가 설정되어 있는지 확인

## 📦 배포 체크리스트

- [ ] Firebase 프로젝트 생성
- [ ] Authentication 활성화 (Email/Password)
- [ ] Firestore 데이터베이스 생성
- [ ] Security Rules 배포 (`firebase deploy --only firestore:rules`)
- [ ] 환경 변수 설정 (특히 `ENCRYPTION_KEY`)
- [ ] 빌드 및 배포 (`npm run build && firebase deploy`)
- [ ] 로그인 페이지 접속 테스트
- [ ] API 키 입력 및 저장 테스트
- [ ] 웹훅 URL 생성 확인
- [ ] 광고 플랫폼에 웹훅 등록
- [ ] 테스트 리드로 동작 확인

## 📚 추가 리소스

- [Firebase 문서](https://firebase.google.com/docs)
- [SOLAPI 문서](https://docs.solapi.com)
- [Meta Lead Ads 문서](https://developers.facebook.com/docs/marketing-api/guides/lead-ads)
- [Google Ads Lead Forms](https://support.google.com/google-ads/answer/9423234)
- [TikTok Lead Generation](https://ads.tiktok.com/help/article?aid=10001094)

## 🙋‍♂️ 지원

질문이나 이슈가 있으시면:
1. Firebase Functions 로그 확인
2. Browser DevTools에서 네트워크 요청 확인
3. Firestore 콘솔에서 데이터 확인

---

**버전**: 1.0.0 (Multi-Tenant Orchestrator)
**마지막 업데이트**: 2025-01-10
