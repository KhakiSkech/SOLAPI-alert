# SOLAPI 알림 오케스트레이터 (Multi-Tenant SaaS)

다양한 광고 플랫폼(Meta, Google Ads, TikTok)에서 발생하는 리드를 실시간으로 수집하고, SOLAPI를 통해 자동으로 SMS/알림톡 알림을 전송하는 멀티테넌트 SaaS 플랫폼입니다.

## ✨ 주요 기능

### 🔐 사용자 관리
- ✅ **이메일 기반 회원가입/로그인** - Firebase Authentication
- ✅ **이메일 인증** - 자동 발송 + 재발송 기능
- ✅ **비밀번호 재설정** - 이메일 기반 안전한 재설정
- ✅ **사용자별 격리된 데이터** - 완전한 멀티테넌트 구조

### 🔑 API 키 관리
- ✅ **SOLAPI 설정** - API Key, API Secret, 발신번호
- ✅ **Meta (Facebook/Instagram)** - App Secret, Page Access Token, Verify Token
- ✅ **Google Ads** - Webhook Key (선택)
- ✅ **TikTok** - Webhook Secret (선택)
- ✅ **안전한 암호화** - AES-256-GCM 암호화 저장
- ✅ **API 키 삭제** - 플랫폼별 개별 삭제 기능

### 🪝 웹훅 처리
- ✅ **Multi-Platform 지원** - Meta, Google Ads, TikTok Lead Ads
- ✅ **서명 검증** - HMAC-SHA256 서명 검증으로 보안 강화
- ✅ **실시간 리드 수집** - Graph API를 통한 리드 데이터 자동 수집
- ✅ **자동 SMS/알림톡 발송** - SOLAPI 통합
- ✅ **웹훅 로깅** - 모든 웹훅 처리 기록 저장 (성공/실패)
- ✅ **웹훅 테스트** - 대시보드에서 직접 테스트 알림 발송

### 🛡️ 보안 및 성능
- ✅ **Rate Limiting** - 엔드포인트별 요청 제한 (5-100회/분)
- ✅ **AES-256-GCM 암호화** - 모든 API 키 안전하게 암호화 저장
- ✅ **PBKDF2 키 파생** - 100,000회 반복으로 강력한 암호화
- ✅ **TypeScript** - 완전한 타입 안정성
- ✅ **Firebase Admin SDK** - 서버 측 보안 작업

## 🏗️ 기술 스택

- **프레임워크**: Next.js 14+ with TypeScript
- **인증**: Firebase Authentication (Email/Password)
- **데이터베이스**: Firebase Firestore
- **암호화**: crypto (AES-256-GCM, PBKDF2)
- **메시징**: SOLAPI (SMS/AlimTalk)
- **보안**: HMAC 서명 검증, Rate Limiting
- **배포**: Vercel / Firebase Hosting

## 📋 사전 준비

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Authentication 활성화
   - Email/Password 로그인 방식 활성화
3. Firestore Database 생성
   - 프로덕션 모드로 시작
4. 웹 앱 추가 및 Firebase 설정 정보 저장

### 2. SOLAPI 계정

1. [SOLAPI](https://solapi.com)에서 계정 생성
2. API Key 발급
3. 발신번호 등록 (본인 인증 필요)
4. 크레딧 충전

### 3. 광고 플랫폼 설정 (선택)

#### Meta (Facebook/Instagram)
1. [Meta for Developers](https://developers.facebook.com/)에서 앱 생성
2. Webhooks 제품 추가
3. Page Access Token 발급
4. App Secret 확인

#### Google Ads
1. Google Ads 계정에서 리드 양식 확장 생성
2. 웹훅 통합 활성화
3. 웹훅 키 생성

#### TikTok
1. TikTok Business 계정 생성
2. Custom API 액세스 신청
3. 승인 후 웹훅 등록

## 🚀 빠른 시작

### 1. 저장소 클론

\`\`\`bash
git clone https://github.com/KhakiSkech/SOLAPI-alert.git
cd SOLAPI-alert
\`\`\`

### 2. 의존성 설치

\`\`\`bash
npm install
\`\`\`

### 3. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성:

\`\`\`env
# Firebase Admin SDK (서버 측)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (클라이언트 측)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# 암호화 키 (32바이트 랜덤 문자열)
ENCRYPTION_KEY=your-32-byte-random-encryption-key-here-must-be-32-chars
\`\`\`

**암호화 키 생성 방법**:
\`\`\`bash
# Node.js로 랜덤 키 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

### 4. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

서버가 `http://localhost:3000`에서 실행됩니다.

### 5. 첫 사용자 등록

1. 브라우저에서 `http://localhost:3000` 접속
2. "회원가입" 클릭
3. 이메일/비밀번호 입력하여 계정 생성
4. 이메일 인증 메일 확인 및 인증
5. 대시보드에서 API 키 설정

## 📱 대시보드 사용법

### API 키 설정

#### 1. SOLAPI 설정 (필수)

대시보드에서 SOLAPI 섹션에 입력:
- **API Key**: SOLAPI 대시보드에서 발급받은 API Key
- **API Secret**: SOLAPI API Secret
- **발신번호**: 등록된 발신번호 (예: 01012345678)

#### 2. Meta 설정 (선택)

Meta 섹션에 입력:
- **App Secret**: Meta 앱의 App Secret
- **Page Access Token**: 페이지 액세스 토큰
- **Verify Token**: 웹훅 검증용 임의 문자열 (직접 생성)

저장 후 **웹훅 URL** 복사:
\`\`\`
https://your-domain.com/api/webhooks/meta?token=your-generated-token
\`\`\`

#### 3. Google Ads 설정 (선택)

Google Ads 섹션에 입력:
- **Webhook Key**: Google Ads에서 생성한 웹훅 키

저장 후 **웹훅 URL** 복사:
\`\`\`
https://your-domain.com/api/webhooks/google-ads?token=your-generated-token
\`\`\`

#### 4. TikTok 설정 (선택)

TikTok 섹션에 입력:
- **Webhook Secret**: TikTok에서 제공하는 웹훅 시크릿

저장 후 **웹훅 URL** 복사:
\`\`\`
https://your-domain.com/api/webhooks/tiktok?token=your-generated-token
\`\`\`

### 🧪 웹훅 테스트

SOLAPI 설정 완료 후, 대시보드 하단의 "알림 테스트" 섹션에서:

1. 테스트 수신 번호 입력 (예: 01012345678)
2. "테스트 발송" 버튼 클릭
3. 실제 SMS가 발송되어 설정 확인 가능

⚠️ **주의**: 실제 SMS가 발송되며 비용이 청구됩니다 (분당 최대 5회 제한)

### 🗑️ API 키 삭제

각 플랫폼 섹션의 "삭제" 버튼으로 개별 플랫폼 API 키 삭제 가능
- SOLAPI는 필수 항목이므로 삭제 불가

## 🌐 프로덕션 배포

### Vercel 배포 (권장)

1. **Vercel 계정 생성** - [vercel.com](https://vercel.com)

2. **GitHub 저장소 연결**

3. **환경 변수 설정**
   - Vercel 대시보드 → Settings → Environment Variables
   - `.env.local`의 모든 변수 추가

4. **배포**
   - `main` 브랜치에 푸시하면 자동 배포
   - 또는 Vercel CLI 사용:
     \`\`\`bash
     npm install -g vercel
     vercel --prod
     \`\`\`

5. **웹훅 URL 업데이트**
   - 배포된 도메인으로 광고 플랫폼의 웹훅 URL 업데이트

### Firebase Hosting 배포

1. **Firebase CLI 설치**
   \`\`\`bash
   npm install -g firebase-tools
   \`\`\`

2. **Firebase 로그인**
   \`\`\`bash
   firebase login
   \`\`\`

3. **Firebase 프로젝트 초기화**
   \`\`\`bash
   firebase init hosting
   \`\`\`

4. **빌드 및 배포**
   \`\`\`bash
   npm run build
   firebase deploy --only hosting
   \`\`\`

## 🔧 광고 플랫폼 웹훅 설정

### Meta (Facebook/Instagram)

1. [Meta for Developers](https://developers.facebook.com/) 앱 설정
2. 제품 → Webhooks 추가
3. 페이지 구독 설정:
   - **콜백 URL**: 대시보드에서 복사한 웹훅 URL
   - **확인 토큰**: 설정한 Verify Token
4. `leadgen` 이벤트 구독

### Google Ads

1. Google Ads 계정 → 리드 양식 확장 설정
2. 웹훅 통합 활성화
3. 웹훅 URL 입력: 대시보드에서 복사한 웹훅 URL

### TikTok

1. TikTok Business Manager → Custom API
2. 웹훅 URL 등록: 대시보드에서 복사한 웹훅 URL
3. `lead_generate` 이벤트 구독

## 📁 프로젝트 구조

\`\`\`
verdi-solapi/
├── pages/
│   ├── index.tsx                    # 랜딩 페이지
│   ├── login.tsx                    # 로그인/회원가입
│   ├── dashboard.tsx                # 사용자 대시보드
│   ├── forgot-password.tsx          # 비밀번호 재설정
│   └── api/
│       ├── auth/
│       │   ├── signup.ts            # 회원가입 API
│       │   └── request-reset.ts     # 비밀번호 재설정 요청 API
│       ├── users/
│       │   └── api-keys.ts          # API 키 CRUD
│       ├── test/
│       │   └── webhook.ts           # 웹훅 테스트 API
│       └── webhooks/
│           ├── meta.ts              # Meta 웹훅 핸들러
│           ├── google-ads.ts        # Google Ads 웹훅 핸들러
│           └── tiktok.ts            # TikTok 웹훅 핸들러
├── src/
│   └── lib/
│       ├── firebase-admin.ts        # Firebase Admin SDK 초기화
│       ├── firebase-client.ts       # Firebase Client SDK 초기화
│       ├── encryption.ts            # AES-256-GCM 암호화
│       ├── user-service.ts          # 사용자 서비스 (API 키 관리)
│       ├── solapi-client.ts         # SOLAPI 클라이언트
│       ├── rate-limit.ts            # Rate Limiting
│       ├── webhook-logger.ts        # 웹훅 로깅
│       └── utils.ts                 # 유틸리티 함수
├── types/
│   └── index.ts                     # TypeScript 타입 정의
├── public/                          # 정적 파일
├── .env.local                       # 환경 변수 (git에서 제외)
├── next.config.js                   # Next.js 설정
├── tsconfig.json                    # TypeScript 설정
├── package.json                     # 의존성
└── README.md                        # 이 파일
\`\`\`

## 🔒 보안 기능

### 인증 및 권한
- ✅ Firebase Authentication으로 안전한 사용자 인증
- ✅ 이메일 인증 필수
- ✅ 비밀번호 재설정 기능
- ✅ Bearer 토큰 기반 API 인증

### 데이터 보안
- ✅ AES-256-GCM 암호화로 API 키 저장
- ✅ PBKDF2 키 파생 (100,000회 반복)
- ✅ 사용자별 완전히 격리된 데이터 (멀티테넌트)
- ✅ Firestore Security Rules로 데이터 접근 제어

### Rate Limiting
- ✅ 회원가입/로그인: 10회/분
- ✅ API 키 관리: 30회/분
- ✅ 웹훅 엔드포인트: 100회/분
- ✅ 민감한 작업 (비밀번호 재설정, 테스트): 5회/분

### 웹훅 보안
- ✅ HMAC-SHA256 서명 검증 (Meta, TikTok)
- ✅ 사용자별 고유 토큰 인증
- ✅ 타임스탬프 기반 재전송 공격 방지

## 📊 Firestore 데이터 구조

### users 컬렉션
\`\`\`
users/{userId}/
├── apiKeys/
│   └── config/
│       ├── solapi: { apiKey, apiSecret, senderNumber } (암호화됨)
│       ├── meta: { appSecret, pageAccessToken, verifyToken } (암호화됨)
│       ├── google: { webhookKey } (암호화됨)
│       ├── tiktok: { webhookSecret } (암호화됨)
│       ├── webhookTokens: { meta, google, tiktok } (사용자별 고유 토큰)
│       └── updatedAt: timestamp
\`\`\`

### webhookLogs 컬렉션
\`\`\`
webhookLogs/{logId}/
├── userId: string
├── platform: 'meta' | 'google' | 'tiktok'
├── leadId: string
├── status: 'success' | 'failed'
├── phoneNumber?: string
├── errorMessage?: string
├── timestamp: timestamp
└── metadata?: object
\`\`\`

## 🧪 테스트

### 로컬 웹훅 테스트

ngrok으로 로컬 서버 노출:

\`\`\`bash
# ngrok 설치 (https://ngrok.com/)
ngrok http 3000
\`\`\`

생성된 URL을 광고 플랫폼의 웹훅 URL로 등록

### API 테스트

\`\`\`bash
# 회원가입
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 비밀번호 재설정 요청
curl -X POST http://localhost:3000/api/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# API 키 조회 (인증 필요)
curl http://localhost:3000/api/users/api-keys \
  -H "Authorization: Bearer YOUR_ID_TOKEN"
\`\`\`

## 🐛 문제 해결

### 이메일 인증 메일이 안 옴
1. ✅ 스팸 폴더 확인
2. ✅ Firebase Console → Authentication → Templates에서 이메일 설정 확인
3. ✅ 대시보드에서 "재발송" 버튼 클릭

### API 키 저장 실패
1. ✅ 환경 변수 `ENCRYPTION_KEY` 확인 (정확히 32바이트)
2. ✅ Firebase 프로젝트 설정 확인
3. ✅ 브라우저 콘솔 에러 메시지 확인

### 웹훅이 수신되지 않음
1. ✅ 웹훅 URL이 올바른지 확인
2. ✅ HTTPS 사용 확인 (프로덕션)
3. ✅ 광고 플랫폼에서 웹훅 테스트 전송
4. ✅ Firestore `webhookLogs` 컬렉션에서 로그 확인

### SOLAPI 발송 실패
1. ✅ API Key, API Secret 확인
2. ✅ 발신번호 등록 상태 확인
3. ✅ SOLAPI 계정 크레딧 확인
4. ✅ 수신번호 형식 확인 (01012345678)

### Rate Limit 에러
1. ✅ 1분 후 재시도
2. ✅ 과도한 요청 자제
3. ✅ 프로덕션에서는 Redis 기반 Rate Limiting 고려

## 📈 성능

- **응답 시간**: ~100-500ms (일반 API)
- **웹훅 처리**: ~1-2초 (Meta Graph API 조회 포함)
- **동시 처리**: 최대 1000+ 동시 요청 (Vercel/Firebase 기준)
- **콜드 스타트**: ~1-3초 (첫 요청 시)

## 💰 비용 예상

### Firebase (무료 티어)
- Authentication: 무제한
- Firestore: 1GB 저장소, 50K 읽기/일
- Hosting: 10GB/월 전송량

### Vercel (무료 티어)
- 100GB 대역폭/월
- 100시간 빌드 시간/월

### SOLAPI (종량제)
- SMS: ~20원/건
- LMS: ~50원/건
- 알림톡: ~15원/건 (템플릿 승인 필요)

**예상 비용** (월 1,000건 기준):
- Firebase/Vercel: 무료 티어 내 (0원)
- SOLAPI: ~20,000원 (SMS 기준)

## 🎯 로드맵

### 완료된 기능 ✅
- [x] Multi-tenant 사용자 시스템
- [x] API 키 암호화 저장
- [x] Meta/Google/TikTok 웹훅 통합
- [x] SOLAPI SMS 발송
- [x] Rate Limiting
- [x] 이메일 인증
- [x] 비밀번호 재설정
- [x] 웹훅 로깅
- [x] 웹훅 테스트 도구

### 향후 계획 🚀
- [ ] 웹훅 로그 대시보드 UI
- [ ] 통계 및 분석 대시보드
- [ ] 알림톡 템플릿 관리
- [ ] 이메일 알림 추가
- [ ] 팀 기능 (여러 사용자 협업)
- [ ] API 사용량 통계
- [ ] 웹훅 재시도 로직
- [ ] Redis 기반 Rate Limiting

## 📄 라이선스

MIT License

## 🤝 기여

이슈 및 풀 리퀘스트 환영합니다!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 지원

문제가 있으시면 이슈를 등록해주세요: [GitHub Issues](https://github.com/KhakiSkech/SOLAPI-alert/issues)

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [SOLAPI](https://solapi.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

**Made with ❤️ for Korean businesses using SOLAPI**
