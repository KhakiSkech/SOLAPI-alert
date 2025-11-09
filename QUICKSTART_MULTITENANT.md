# ⚡ 5분 빠른 시작 - 멀티 테넌트 오케스트레이터

## 1️⃣ Firebase 프로젝트 생성 (2분)

```bash
# Firebase CLI 설치 (아직 안 했다면)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화
firebase init

# 선택 항목:
# ✅ Hosting
# ✅ Functions
# ✅ Firestore
```

**Firebase Console에서:**
1. Authentication → Get Started → Email/Password 활성화
2. Firestore Database → Create Database → Production mode

## 2️⃣ 환경 변수 설정 (1분)

`.env.local` 파일 생성:

```bash
# Firebase 설정 (Firebase Console → Project Settings에서 복사)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# 암호화 키 생성 및 입력
# Mac/Linux: openssl rand -base64 32
# Windows: 온라인 random key generator 사용
ENCRYPTION_KEY=your_generated_32_char_key_here

# 배포 URL (로컬 테스트시 생략 가능)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3️⃣ 로컬 실행 (1분)

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

**브라우저에서 열기:** `http://localhost:3000/login`

## 4️⃣ 첫 사용자 생성 및 테스트 (1분)

### 회원가입
1. `/login` 페이지에서 "회원가입" 클릭
2. 이메일, 비밀번호, 이름 입력
3. "가입하기" 클릭

### API 키 입력
대시보드에서 **최소한 SOLAPI 설정만** 입력:
- API Key: `solapi.com`에서 발급
- API Secret: SOLAPI API Secret
- 발신번호: `01012345678` 형식

### 웹훅 URL 복사
저장 후 생성되는 웹훅 URL 복사

## 5️⃣ 배포 (선택 사항)

```bash
# 빌드
npm run build

# Firebase에 배포
firebase deploy

# 배포 완료 후 URL 확인
# https://your-project.web.app
```

## ✅ 완료!

이제 다음 작업을 수행하세요:

1. **SOLAPI 템플릿 설정**
   - `solapi.com` → 메시지 → 템플릿 관리
   - AlimTalk 템플릿 생성 및 승인 요청

2. **광고 플랫폼 웹훅 등록**
   - Meta: Developer Console → Webhooks
   - Google Ads: Lead Form Extensions → Webhook
   - TikTok: Lead Download → Webhook Configuration

3. **테스트**
   - 광고에서 테스트 리드 생성
   - SMS 수신 확인

## 🆘 문제 해결

### "Unauthorized" 오류
→ Firebase Authentication이 활성화되어 있는지 확인

### API 키 저장 실패
→ SOLAPI 발신번호가 `010XXXXXXXX` 형식인지 확인

### 웹훅이 작동하지 않음
→ 웹훅 URL에 `?token=...`이 포함되어 있는지 확인

## 📚 추가 문서

- 자세한 가이드: `MULTI_TENANT_GUIDE.md`
- 구현 요약: `IMPLEMENTATION_SUMMARY.md`
- Firestore 스키마: `SCHEMA.md`

---

**소요 시간**: 약 5분
**필수 준비물**: Firebase 계정, SOLAPI 계정
