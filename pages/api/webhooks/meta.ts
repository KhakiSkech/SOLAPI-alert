/**
 * Meta (Facebook/Instagram) Lead Ads Webhook - Multi-Tenant
 * Receives lead submissions from Meta ad platforms
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  MetaWebhookPayload,
  MetaLeadData,
  LeadData,
  ApiResponse,
  WebhookResponse,
  ApiKeysConfig,
} from '@/types';
import { getRawBody } from '@/lib/utils';
import { SolapiClient } from '@/lib/solapi-client';
import { getApiKeysByToken, getUserIdByToken } from '@/lib/user-service';
import { logWebhook } from '@/lib/webhook-logger';
import crypto from 'crypto';

/**
 * Disable body parser to access raw body for signature verification
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookResponse | ApiResponse | string>
) {
  // GET request - Webhook verification
  if (req.method === 'GET') {
    return handleVerification(req, res);
  }

  // POST request - Lead data
  if (req.method === 'POST') {
    return handleLeadSubmission(req, res);
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
    timestamp: Date.now(),
  });
}

/**
 * Handle GET request for webhook verification
 */
async function handleVerification(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const mode = req.query['hub.mode'];
  const verifyToken = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const userToken = req.query.token as string;

  console.log('📨 Meta webhook verification request received');

  if (!userToken) {
    console.log('❌ No user token provided');
    return res.status(403).send('Forbidden - Missing token');
  }

  // Get user's API keys
  const apiKeys = await getApiKeysByToken(userToken);
  if (!apiKeys || !apiKeys.meta) {
    console.log('❌ Invalid token or Meta not configured');
    return res.status(403).send('Forbidden - Invalid configuration');
  }

  // Verify against user's verify token
  if (mode === 'subscribe' && verifyToken === apiKeys.meta.verifyToken) {
    console.log('✅ Meta webhook verified successfully');
    return res.status(200).send(challenge as string);
  }

  console.log('❌ Meta webhook verification failed');
  return res.status(403).send('Forbidden');
}

/**
 * Handle POST request for lead submission
 */
async function handleLeadSubmission(
  req: NextApiRequest,
  res: NextApiResponse<WebhookResponse>
) {
  console.log('📨 Meta webhook POST request received');

  try {
    const userToken = req.query.token as string;

    if (!userToken) {
      return res.status(401).json({
        received: false,
        processed: false,
        error: 'Missing token',
      });
    }

    // Get user's API keys
    const apiKeys = await getApiKeysByToken(userToken);
    if (!apiKeys || !apiKeys.meta) {
      return res.status(401).json({
        received: false,
        processed: false,
        error: 'Invalid token or Meta not configured',
      });
    }

    // Get raw body for signature verification
    const rawBody = await getRawBody(req as any);
    const signature = req.headers['x-hub-signature-256'] as string;

    // Validate signature using user's app secret
    const isValid = validateMetaSignature(signature, rawBody, apiKeys.meta.appSecret);
    if (!isValid) {
      console.error('❌ Signature validation failed');
      return res.status(401).json({
        received: false,
        processed: false,
        error: 'Invalid signature',
      });
    }

    // Parse payload
    const payload: MetaWebhookPayload = JSON.parse(rawBody);

    if (payload.object !== 'page') {
      console.log('ℹ️ Ignoring non-page webhook');
      return res.status(200).json({
        received: true,
        processed: false,
      });
    }

    // Process each entry
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field === 'leadgen') {
          await processLead(
            change.value.leadgen_id,
            change.value.page_id,
            apiKeys,
            userToken
          );
        }
      }
    }

    return res.status(200).json({
      received: true,
      processed: true,
    });
  } catch (error) {
    console.error('❌ Error processing Meta webhook:', error);
    return res.status(500).json({
      received: true,
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Validate Meta signature
 */
function validateMetaSignature(
  signature: string | undefined,
  body: string,
  appSecret: string
): boolean {
  if (!signature) {
    return false;
  }

  const [algorithm, hash] = signature.split('=');
  if (algorithm !== 'sha256') {
    return false;
  }

  const expectedHash = crypto
    .createHmac('sha256', appSecret)
    .update(body, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(expectedHash, 'hex')
  );
}

/**
 * Process individual lead
 */
async function processLead(
  leadId: string,
  pageId: string,
  apiKeys: ApiKeysConfig,
  userToken: string
): Promise<void> {
  console.log(`🔄 Processing Meta lead: ${leadId}`);

  try {
    // Fetch lead data from Meta Graph API
    const leadData = await fetchMetaLeadData(leadId, apiKeys.meta!.pageAccessToken);

    // Transform to internal format
    const transformedLead: LeadData = transformMetaLead(leadData, leadId, pageId);

    // Send notifications using user's SOLAPI
    await sendNotifications(transformedLead, apiKeys);

    // Log successful webhook processing
    const userId = await getUserIdByToken(userToken);
    if (userId) {
      await logWebhook({
        userId,
        platform: 'meta',
        leadId,
        status: 'success',
        phoneNumber: transformedLead.phone,
        timestamp: new Date(),
      });
    }

    console.log(`✅ Meta lead processed successfully: ${leadId}`);
  } catch (error) {
    console.error(`❌ Error processing lead ${leadId}:`, error);

    // Log failed webhook processing
    const userId = await getUserIdByToken(userToken);
    if (userId) {
      await logWebhook({
        userId,
        platform: 'meta',
        leadId,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
    }

    throw error;
  }
}

/**
 * Fetch lead data from Meta Graph API
 */
async function fetchMetaLeadData(
  leadId: string,
  accessToken: string
): Promise<MetaLeadData> {
  const url = `https://graph.facebook.com/v19.0/${leadId}?access_token=${accessToken}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch lead data from Meta: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Transform Meta lead data to internal format
 */
function transformMetaLead(
  metaLead: MetaLeadData,
  leadId: string,
  pageId: string
): LeadData {
  const leadInfo: Record<string, string> = {};

  metaLead.field_data.forEach((field) => {
    leadInfo[field.name] = field.values[0];
  });

  return {
    platform: 'meta',
    leadId,
    timestamp: new Date(metaLead.created_time).getTime(),
    name: leadInfo.full_name || leadInfo.name,
    phone: leadInfo.phone_number,
    email: leadInfo.email,
    customFields: leadInfo,
    metadata: {
      pageId,
      source: 'meta_lead_ads',
    },
  };
}

/**
 * Send notifications via SOLAPI using user's credentials
 */
async function sendNotifications(
  lead: LeadData,
  apiKeys: ApiKeysConfig
): Promise<void> {
  if (!lead.phone) {
    console.warn(`⚠️ No phone number for lead, skipping notification`);
    return;
  }

  try {
    // Create SOLAPI client with user's credentials
    const client = new SolapiClient(
      apiKeys.solapi.apiKey,
      apiKeys.solapi.apiSecret,
      apiKeys.solapi.senderNumber
    );

    // Format phone number
    const phone = SolapiClient.formatPhoneNumber(lead.phone);

    // Build simple SMS message (SOLAPI에서 템플릿 관리하므로 간단한 메시지만)
    const smsText = `[${lead.platform.toUpperCase()}] 새로운 문의가 접수되었습니다.\n이름: ${lead.name}\n전화번호: ${lead.phone}`;

    // Send SMS (AlimTalk은 SOLAPI 대시보드에서 직접 설정)
    await client.sendSMS({
      to: phone,
      text: smsText,
    });

    console.log(`✅ Notification sent via SOLAPI`);
  } catch (error) {
    console.error(`❌ Failed to send notification:`, error);
    throw error;
  }
}
