/**
 * Google Ads Lead Form Extensions Webhook - Multi-Tenant
 * Receives lead form submissions from Google Ads lead forms
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  GoogleAdsWebhookPayload,
  LeadData,
  WebhookResponse,
  ApiKeysConfig,
} from '@/types';
import { SolapiClient } from '@/lib/solapi-client';
import { getApiKeysByToken } from '@/lib/user-service';

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

  console.log('📨 Google Ads webhook POST request received');

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
    if (!apiKeys || !apiKeys.google) {
      return res.status(401).json({
        received: false,
        processed: false,
        error: 'Invalid token or Google Ads not configured',
      });
    }

    const payload: GoogleAdsWebhookPayload = req.body;

    // Validate webhook key
    if (payload.google_key !== apiKeys.google.webhookKey) {
      console.error('❌ Invalid Google Ads webhook key');
      return res.status(401).json({
        received: false,
        processed: false,
        error: 'Invalid webhook key',
      });
    }

    // Skip test leads
    if (payload.is_test) {
      console.log('ℹ️ Skipping test lead');
      return res.status(200).json({
        received: true,
        processed: false,
      });
    }

    // Transform and process lead
    const lead = transformGoogleAdsLead(payload);
    await sendNotifications(lead, apiKeys);

    console.log(`✅ Google Ads lead processed: ${payload.lead_id}`);

    return res.status(200).json({
      received: true,
      processed: true,
      leadId: payload.lead_id,
    });
  } catch (error) {
    console.error('❌ Error processing Google Ads webhook:', error);
    return res.status(500).json({
      received: true,
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Transform Google Ads lead data to internal format
 */
function transformGoogleAdsLead(payload: GoogleAdsWebhookPayload): LeadData {
  const customFields: Record<string, string> = {};
  let name: string | undefined;
  let phone: string | undefined;
  let email: string | undefined;

  payload.user_column_data.forEach((column) => {
    const value = column.string_value || '';
    const fieldName = column.column_name || column.column_id;

    customFields[fieldName] = value;

    // Extract standard fields
    const lowerField = fieldName.toLowerCase();
    if (lowerField.includes('name')) {
      name = value;
    } else if (lowerField.includes('phone')) {
      phone = value;
    } else if (lowerField.includes('email')) {
      email = value;
    }
  });

  return {
    platform: 'google',
    leadId: payload.lead_id,
    timestamp: Date.now(),
    name,
    phone,
    email,
    customFields,
    metadata: {
      campaignId: payload.campaign_id,
      formId: payload.form_id,
      source: 'google_ads_lead_form',
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
    const smsText = `[GOOGLE ADS] 새로운 문의가 접수되었습니다.\n이름: ${lead.name}\n전화번호: ${lead.phone}`;

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
