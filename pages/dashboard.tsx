import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { ApiKeysConfig, WebhookTokens } from '@/types';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [webhookUrls, setWebhookUrls] = useState<any>(null);

  const [apiKeys, setApiKeys] = useState<ApiKeysConfig>({
    solapi: {
      apiKey: '',
      apiSecret: '',
      senderNumber: '',
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadApiKeys(user);
        await loadWebhookUrls(user);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadApiKeys = async (user: any) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/users/api-keys', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const result = await response.json();
      if (result.success && result.data) {
        setApiKeys(result.data);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const loadWebhookUrls = async (user: any) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/users/webhook-urls', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const result = await response.json();
      if (result.success && result.data) {
        setWebhookUrls(result.data.urls);
      }
    } catch (error) {
      console.error('Failed to load webhook URLs:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/users/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(apiKeys),
      });

      const result = await response.json();
      if (result.success) {
        setMessage('✅ API 키가 저장되었습니다!');
        await loadWebhookUrls(user);
      } else {
        setMessage(`❌ 오류: ${result.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ 오류: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage('📋 웹훅 URL이 복사되었습니다!');
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-md bg-blue-50 p-4">
            <div className="text-sm text-blue-700">{message}</div>
          </div>
        )}

        {/* SOLAPI 설정 (필수) */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            SOLAPI 설정 (필수)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="text"
                value={apiKeys.solapi?.apiKey || ''}
                onChange={(e) =>
                  setApiKeys({
                    ...apiKeys,
                    solapi: { ...apiKeys.solapi, apiKey: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="solapi.com에서 발급받은 API Key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Secret
              </label>
              <input
                type="password"
                value={apiKeys.solapi?.apiSecret || ''}
                onChange={(e) =>
                  setApiKeys({
                    ...apiKeys,
                    solapi: { ...apiKeys.solapi, apiSecret: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="API Secret"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                발신번호
              </label>
              <input
                type="text"
                value={apiKeys.solapi?.senderNumber || ''}
                onChange={(e) =>
                  setApiKeys({
                    ...apiKeys,
                    solapi: { ...apiKeys.solapi, senderNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="01012345678"
              />
            </div>
          </div>
        </div>

        {/* Meta 설정 (선택) */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Meta (Facebook/Instagram) 설정 (선택)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App Secret
              </label>
              <input
                type="password"
                value={apiKeys.meta?.appSecret || ''}
                onChange={(e) =>
                  setApiKeys({
                    ...apiKeys,
                    meta: { ...apiKeys.meta!, appSecret: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Meta App Secret"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Access Token
              </label>
              <input
                type="password"
                value={apiKeys.meta?.pageAccessToken || ''}
                onChange={(e) =>
                  setApiKeys({
                    ...apiKeys,
                    meta: {
                      ...apiKeys.meta!,
                      pageAccessToken: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Page Access Token"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verify Token
              </label>
              <input
                type="text"
                value={apiKeys.meta?.verifyToken || ''}
                onChange={(e) =>
                  setApiKeys({
                    ...apiKeys,
                    meta: { ...apiKeys.meta!, verifyToken: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="임의의 문자열 (예: my_verify_token_123)"
              />
            </div>
          </div>
        </div>

        {/* Google Ads 설정 (선택) */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Google Ads 설정 (선택)
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook Key
            </label>
            <input
              type="text"
              value={apiKeys.google?.webhookKey || ''}
              onChange={(e) =>
                setApiKeys({
                  ...apiKeys,
                  google: { webhookKey: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="임의의 문자열 (예: my_google_key_456)"
            />
          </div>
        </div>

        {/* TikTok 설정 (선택) */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            TikTok 설정 (선택)
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook Secret
            </label>
            <input
              type="password"
              value={apiKeys.tiktok?.webhookSecret || ''}
              onChange={(e) =>
                setApiKeys({
                  ...apiKeys,
                  tiktok: { webhookSecret: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="TikTok Webhook Secret"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? '저장 중...' : 'API 키 저장'}
          </button>
        </div>

        {/* Webhook URLs */}
        {webhookUrls && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              웹훅 URL
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              아래 URL을 각 광고 플랫폼에 등록하세요
            </p>

            <div className="space-y-3">
              {webhookUrls.meta && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta (Facebook/Instagram)
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={webhookUrls.meta}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(webhookUrls.meta)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 text-sm"
                    >
                      복사
                    </button>
                  </div>
                </div>
              )}

              {webhookUrls.google && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Ads
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={webhookUrls.google}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(webhookUrls.google)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 text-sm"
                    >
                      복사
                    </button>
                  </div>
                </div>
              )}

              {webhookUrls.tiktok && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TikTok
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={webhookUrls.tiktok}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(webhookUrls.tiktok)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 text-sm"
                    >
                      복사
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
