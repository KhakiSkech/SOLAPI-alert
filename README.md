# Verdi SOLAPI Notification Server

Automated notification server that sends KakaoTalk AlimTalk and SMS messages to customers who submit leads through various ad platforms (Meta, Google Ads, TikTok).

## Features

- ✅ **Multi-Platform Support**: Meta (Facebook/Instagram), Google Ads, TikTok Lead Ads
- ✅ **Dual Notification**: AlimTalk (primary) + SMS (fallback)
- ✅ **Secure Webhooks**: Signature verification for all platforms
- ✅ **Deduplication**: Prevents duplicate notifications
- ✅ **Firebase Integration**: Cloud Functions + Firestore logging
- ✅ **TypeScript**: Full type safety
- ✅ **Production Ready**: Error handling, retry logic, monitoring

## Tech Stack

- **Framework**: Next.js 14+ with TypeScript
- **Deployment**: Firebase Hosting + Cloud Functions
- **Database**: Firebase Firestore (optional logging)
- **Messaging**: SOLAPI (AlimTalk + SMS)
- **Security**: HMAC signature verification

## Prerequisites

Before you begin, ensure you have:

### 1. SOLAPI Account
- [ ] Create account at [solapi.com](https://solapi.com)
- [ ] Get API key
- [ ] Register sender phone number

### 2. Kakao Channel
- [ ] Create Kakao Channel at [center-pf.kakao.com](https://center-pf.kakao.com)
- [ ] Get Channel ID (PFID)
- [ ] **Submit AlimTalk templates for approval (1-3 days)**

### 3. Ad Platform Accounts
- [ ] Meta Business account with Lead Ads access
- [ ] Google Ads account with Lead Form Extensions
- [ ] TikTok Business account (Custom API approval required)

### 4. Firebase Project
- [ ] Create Firebase project
- [ ] Enable Cloud Functions
- [ ] Enable Firestore
- [ ] Enable Google Cloud Secret Manager

## Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local` and fill in your credentials:

\`\`\`env
# SOLAPI
SOLAPI_API_KEY=your_api_key
SOLAPI_SENDER_NUMBER=01012345678

# Kakao
KAKAO_CHANNEL_ID=your_channel_id

# Meta
META_VERIFY_TOKEN=your_verify_token
META_APP_SECRET=your_app_secret
META_PAGE_ACCESS_TOKEN=your_page_access_token

# Google Ads
GOOGLE_ADS_WEBHOOK_KEY=your_webhook_key

# TikTok
TIKTOK_WEBHOOK_SECRET=your_webhook_secret

# Firebase
FIREBASE_PROJECT_ID=your_project_id
\`\`\`

### 3. Update AlimTalk Template IDs

Edit `lib/templates.ts` and replace `'YOUR_ALIMTALK_TEMPLATE_ID'` with your approved template IDs:

\`\`\`typescript
meta_lead: {
  templateId: 'YOUR_APPROVED_TEMPLATE_ID', // ← Replace this
  // ...
}
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Server will start at `http://localhost:3000`

### 5. Test Webhooks Locally

Use [ngrok](https://ngrok.com/) to expose your local server:

\`\`\`bash
ngrok http 3000
\`\`\`

Then configure your ad platforms to send webhooks to:
- Meta: `https://your-ngrok-url.ngrok.io/api/webhooks/meta`
- Google: `https://your-ngrok-url.ngrok.io/api/webhooks/google-ads`
- TikTok: `https://your-ngrok-url.ngrok.io/api/webhooks/tiktok`

## Deployment to Firebase

### 1. Install Firebase CLI

\`\`\`bash
npm install -g firebase-tools
\`\`\`

### 2. Login to Firebase

\`\`\`bash
firebase login
\`\`\`

### 3. Initialize Firebase Project

\`\`\`bash
firebase init
\`\`\`

Select:
- Hosting
- Functions
- Firestore

### 4. Set Firebase Project

Edit `.firebaserc` and set your project ID:

\`\`\`json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
\`\`\`

### 5. Configure Secrets

\`\`\`bash
firebase functions:secrets:set SOLAPI_API_KEY
firebase functions:secrets:set META_VERIFY_TOKEN
firebase functions:secrets:set META_APP_SECRET
firebase functions:secrets:set META_PAGE_ACCESS_TOKEN
firebase functions:secrets:set GOOGLE_ADS_WEBHOOK_KEY
firebase functions:secrets:set TIKTOK_WEBHOOK_SECRET
firebase functions:secrets:set KAKAO_CHANNEL_ID
firebase functions:secrets:set SOLAPI_SENDER_NUMBER
\`\`\`

### 6. Deploy

\`\`\`bash
npm run build
firebase deploy
\`\`\`

Your server will be live at:
\`\`\`
https://your-project-id.web.app
\`\`\`

## Webhook Configuration

### Meta (Facebook/Instagram)

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create or select your app
3. Add "Webhooks" product
4. Subscribe to "leadgen" events
5. Callback URL: `https://your-domain.web.app/api/webhooks/meta`
6. Verify Token: Your `META_VERIFY_TOKEN`

### Google Ads

1. In Google Ads, create Lead Form Extension
2. Add webhook integration
3. Webhook URL: `https://your-domain.web.app/api/webhooks/google-ads`
4. Webhook Key: Your `GOOGLE_ADS_WEBHOOK_KEY`

### TikTok

1. Apply for Custom API access
2. Once approved, register webhook URL
3. Webhook URL: `https://your-domain.web.app/api/webhooks/tiktok`
4. Subscribe to "lead_generate" event

## Project Structure

\`\`\`
verdi-solapi/
├── pages/
│   └── api/
│       └── webhooks/
│           ├── meta.ts           # Meta webhook handler
│           ├── google-ads.ts     # Google Ads webhook handler
│           └── tiktok.ts         # TikTok webhook handler
├── lib/
│   ├── config.ts                 # Configuration management
│   ├── solapi-client.ts          # SOLAPI API client
│   ├── validators.ts             # Webhook signature validators
│   ├── firestore.ts              # Firestore logging service
│   └── templates.ts              # Message template manager
├── types/
│   └── index.ts                  # TypeScript type definitions
├── firebase.json                 # Firebase configuration
├── firestore.rules               # Firestore security rules
├── apphosting.yaml               # App Hosting configuration
└── package.json                  # Dependencies
\`\`\`

## Customization

### Message Templates

Edit `lib/templates.ts` to customize your messages:

\`\`\`typescript
export const MESSAGE_TEMPLATES = {
  meta_lead: {
    templateId: 'YOUR_TEMPLATE_ID',
    content: 'Your custom message with #{variables}',
    variables: ['고객명', '신청일', '연락처'],
  },
  // ...
};
\`\`\`

### Template Variables

Available variables:
- `#{업체명}` - Company name
- `#{고객명}` - Customer name
- `#{연락처}` - Phone number
- `#{이메일}` - Email
- `#{신청일}` - Date
- `#{신청시간}` - Time

## Monitoring

### Firebase Console

View logs and errors:
\`\`\`
https://console.firebase.google.com/project/YOUR_PROJECT/functions/logs
\`\`\`

### Firestore Data

Check processed leads:
\`\`\`
https://console.firebase.google.com/project/YOUR_PROJECT/firestore
\`\`\`

Collections:
- `leads` - All processed leads
- `processed_webhooks` - Deduplication records

## Troubleshooting

### AlimTalk Not Sending

1. ✅ Verify template is approved in Kakao
2. ✅ Check template ID matches in `lib/templates.ts`
3. ✅ Ensure variables match template exactly
4. ✅ Verify Kakao Channel ID (PFID)

### SMS Not Sending

1. ✅ Check sender number is registered
2. ✅ Verify phone number format (010XXXXXXXX)
3. ✅ Check SOLAPI account credits

### Webhook Not Receiving

1. ✅ Verify webhook URL is correct
2. ✅ Check signature verification tokens
3. ✅ Review Firebase Functions logs
4. ✅ Test with webhook testing tools

### Firebase Functions Timeout

1. ✅ Ensure HTTPS is fast (< 5 seconds)
2. ✅ Add async processing if needed
3. ✅ Increase timeout in `firebase.json`

## Security

- ✅ All webhooks use signature verification
- ✅ Environment variables stored in Secret Manager
- ✅ Firestore rules restrict public access
- ✅ HTTPS enforced
- ✅ Rate limiting (Firebase default)

## Performance

- **Cold Start**: ~1-3 seconds (first request)
- **Warm Start**: ~100-500ms
- **Processing Time**: ~1-2 seconds per lead
- **Throughput**: Up to 1000 concurrent requests

## Cost Estimation

### Firebase (Free Tier)
- Cloud Functions: 2M invocations/month
- Firestore: 1GB storage, 50K reads/day

### SOLAPI
- AlimTalk: ~15-20 KRW per message
- SMS: ~20-25 KRW per message
- LMS: ~50-60 KRW per message

**Example**: 1000 leads/month ≈ 30,000 KRW (~$25 USD)

## Support

For issues or questions:
1. Check [claudedocs/notification-server-specification.md](claudedocs/notification-server-specification.md)
2. Review [claudedocs/ad-platforms-comparison.md](claudedocs/ad-platforms-comparison.md)
3. Check Firebase Functions logs

## License

MIT

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [SOLAPI](https://solapi.com/)
- [TypeScript](https://www.typescriptlang.org/)
