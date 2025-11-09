/**
 * Type Definitions for Verdi SOLAPI Notification Server
 */

// ============================================================================
// SOLAPI Types
// ============================================================================

export interface SolapiMessage {
  to: string;
  from: string;
  text?: string;
  type: 'SMS' | 'LMS' | 'MMS' | 'ATA' | 'CTA';
  kakaoOptions?: KakaoOptions;
}

export interface KakaoOptions {
  pfId: string;
  templateId: string;
  variables?: Record<string, string>;
  buttons?: KakaoButton[];
}

export interface KakaoButton {
  buttonName: string;
  buttonType: 'WL' | 'AL' | 'BK' | 'MD';
  linkMo?: string;
  linkPc?: string;
}

export interface SolapiResponse {
  statusCode: string;
  statusMessage: string;
  groupId?: string;
  messages?: Array<{
    to: string;
    messageId: string;
    statusCode: string;
    statusMessage: string;
  }>;
}

export interface SolapiError {
  errorCode: string;
  errorMessage: string;
  statusCode: number;
}

// ============================================================================
// Lead Data Types
// ============================================================================

export interface LeadData {
  platform: 'meta' | 'google' | 'tiktok' | 'linkedin' | 'pinterest';
  leadId: string;
  timestamp: number;
  name?: string;
  phone?: string;
  email?: string;
  customFields?: Record<string, string>;
  metadata: LeadMetadata;
}

export interface LeadMetadata {
  campaignId?: string;
  adSetId?: string;
  adId?: string;
  formId?: string;
  pageId?: string;
  source: string;
}

// ============================================================================
// Webhook Types
// ============================================================================

export interface WebhookRequest {
  platform: string;
  signature?: string;
  body: unknown;
  headers: Record<string, string>;
}

export interface WebhookValidationResult {
  isValid: boolean;
  error?: string;
}

// Meta (Facebook/Instagram) Lead Ads
export interface MetaWebhookEntry {
  id: string;
  time: number;
  changes: Array<{
    field: string;
    value: {
      leadgen_id: string;
      page_id: string;
      form_id: string;
      adgroup_id: string;
      ad_id: string;
      created_time: number;
    };
  }>;
}

export interface MetaWebhookPayload {
  object: string;
  entry: MetaWebhookEntry[];
}

export interface MetaLeadData {
  id: string;
  created_time: string;
  field_data: Array<{
    name: string;
    values: string[];
  }>;
}

// Google Ads Lead Forms
export interface GoogleAdsWebhookPayload {
  lead_id: string;
  google_key: string;
  gcl_id: string;
  api_version: string;
  form_id: string;
  campaign_id: string;
  is_test: boolean;
  user_column_data: Array<{
    column_id: string;
    string_value?: string;
    column_name?: string;
  }>;
}

// TikTok Lead Ads
export interface TikTokWebhookPayload {
  event: string;
  timestamp: number;
  lead: {
    lead_id: string;
    advertiser_id: string;
    page_id: string;
    ad_id: string;
    user_info: Array<{
      field_name: string;
      field_value: string;
    }>;
  };
}

// ============================================================================
// Notification Types
// ============================================================================

export interface NotificationRequest {
  lead: LeadData;
  templateId?: string;
  messageType: 'alimtalk' | 'sms' | 'both';
}

export interface NotificationResult {
  success: boolean;
  alimtalkResult?: SolapiResponse;
  smsResult?: SolapiResponse;
  error?: string;
}


// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface WebhookResponse {
  received: boolean;
  processed: boolean;
  leadId?: string;
  error?: string;
}

// ============================================================================
// Multi-Tenant Types
// ============================================================================

export interface User {
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKeysConfig {
  solapi: {
    apiKey: string;
    apiSecret: string;
    senderNumber: string;
  };
  meta?: {
    appSecret: string;
    pageAccessToken: string;
    verifyToken: string;
  };
  google?: {
    webhookKey: string;
  };
  tiktok?: {
    webhookSecret: string;
  };
  kakao?: {
    channelId: string;
    pfId?: string;
  };
}

export interface WebhookTokens {
  meta: string;
  google: string;
  tiktok: string;
  createdAt: Date;
}

export interface WebhookTokenIndex {
  userId: string;
  platform: 'meta' | 'google' | 'tiktok';
  createdAt: Date;
}

// ============================================================================
// Error Types
// ============================================================================

export class WebhookError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'WebhookError';
  }
}

export class SolapiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'SolapiClientError';
  }
}
