/**
 * TikTok Lead Ads Webhook - Multi-Tenant
 * Receives lead submissions from TikTok ad platform
 * Requires Custom API approval from TikTok
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  TikTokWebhookPayload,
  LeadData,
  WebhookResponse,
  ApiKeysConfig,
} from '@/types';
import { getRawBody } from '@/lib/utils';
import { SolapiClient } from '@/lib/solapi-client';
import { getApiKeysByToken } from '@/lib/user-service';
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
  res: NextApiResponse<WebhookResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      received: false,
      processed: false,
      error: 'Method not allowed',
    });
  }

  console.log('📨 TikTok webhook POST request received');

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
    if (!apiKeys || !apiKeys.tiktok) {
      return res.status(401).json({
        received: false,
        processed: false,
        error: 'Invalid token or TikTok not configured',
      });
    }

    // Get raw body for signature verification
    const rawBody = await getRawBody(req as any);
    const signature = req.headers['x-tiktok-signature'] as string;

    // Validate signature using user's webhook secret
    const isValid = validateTikTokSignature(
      signature,
      rawBody,
      apiKeys.tiktok.webhookSecret
    );
    if (!isValid) {
      console.error('❌ Signature validation failed');
      return res.status(401).json({
        received: false,
        processed: false,
        error: 'Invalid signature',
      });
    }

    // Parse payload
    const payload: TikTokWebhookPayload = JSON.parse(rawBody);

    // Only process lead generation events
    if (payload.event !== 'lead_generate') {
      console.log(`ℹ️ Ignoring non-lead event: ${payload.event}`);
      return res.status(200).json({
        received: true,
        processed: false,
      });
    }

    // Transform and process lead
    const lead = transformTikTokLead(payload);
    await sendNotifications(lead, apiKeys);

    console.log(`✅ TikTok lead processed: ${payload.lead.lead_id}`);

    return res.status(200).json({
      received: true,
      processed: true,
      leadId: payload.lead.lead_id,
    });
  } catch (error) {
    console.error('❌ Error processing TikTok webhook:', error);
    return res.status(500).json({
      received: true,
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Validate TikTok signature
 */
function validateTikTokSignature(
  signature: string | undefined,
  body: string,
  webhookSecret: string
): boolean {
  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Transform TikTok lead data to internal format
 */
function transformTikTokLead(payload: TikTokWebhookPayload): LeadData {
  const customFields: Record<string, string> = {};
  let name: string | undefined;
  let phone: string | undefined;
  let email: string | undefined;

  payload.lead.user_info.forEach((field) => {
    customFields[field.field_name] = field.field_value;

    // Extract standard fields
    const fieldName = field.field_name.toLowerCase();
    if (fieldName.includes('name')) {
      name = field.field_value;
    } else if (fieldName.includes('phone')) {
      phone = field.field_value;
    } else if (fieldName.includes('email')) {
      email = field.field_value;
    }
  });

  return {
    platform: 'tiktok',
    leadId: payload.lead.lead_id,
    timestamp: payload.timestamp * 1000,
    name,
    phone,
    email,
    customFields,
    metadata: {
      pageId: payload.lead.page_id,
      adId: payload.lead.ad_id,
      source: 'tiktok_lead_ads',
    },
  };
}

/**
 * Send notifications via SOLAPI
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
    const client = new SolapiClient(
      apiKeys.solapi.apiKey,
      apiKeys.solapi.apiSecret,
      apiKeys.solapi.senderNumber
    );

    const phone = SolapiClient.formatPhoneNumber(lead.phone);
    const smsText = `[TIKTOK] 새로운 문의가 접수되었습니다.\n이름: ${lead.name}\n전화번호: ${lead.phone}`;

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
