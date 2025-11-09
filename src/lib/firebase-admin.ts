import admin from 'firebase-admin';

if (!admin.apps.length) {
  // Firebase Admin SDK 초기화
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is required');
  }

  // Cloud Functions 환경에서는 자동으로 인증됨
  // 로컬 개발시에는 GOOGLE_APPLICATION_CREDENTIALS 환경변수 필요
  admin.initializeApp({
    projectId,
  });
}

export const auth = admin.auth();
export const firestore = admin.firestore();

export default admin;
