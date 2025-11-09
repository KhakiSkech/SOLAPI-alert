/**
 * SOLAPI Client
 * Handles communication with SOLAPI API for AlimTalk and SMS
 */

import type {
  SolapiMessage,
  SolapiResponse,
  SolapiError,
  SolapiClientError,
} from '@/types';

export class SolapiClient {
  private apiKey: string;
  private apiSecret: string;
  private apiUrl: string;
  private senderNumber: string;

  constructor(
    apiKey: string,
    apiSecret: string,
    senderNumber: string,
    apiUrl: string = 'https://api.solapi.com'
  ) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.apiUrl = apiUrl;
    this.senderNumber = senderNumber;
  }

  /**
   * Send AlimTalk message via SOLAPI
   */
  async sendAlimTalk(params: {
    to: string;
    templateId: string;
    variables?: Record<string, string>;
    pfId: string;
  }): Promise<SolapiResponse> {
    const message: SolapiMessage = {
      to: params.to,
      from: this.senderNumber,
      type: 'ATA',
      kakaoOptions: {
        pfId: params.pfId,
        templateId: params.templateId,
        variables: params.variables,
      },
    };

    return this.sendMessage(message);
  }

  /**
   * Send SMS message via SOLAPI
   */
  async sendSMS(params: {
    to: string;
    text: string;
  }): Promise<SolapiResponse> {
    const message: SolapiMessage = {
      to: params.to,
      from: this.senderNumber,
      text: params.text,
      type: params.text.length > 90 ? 'LMS' : 'SMS',
    };

    return this.sendMessage(message);
  }

  /**
   * Send message through SOLAPI API
   */
  private async sendMessage(message: SolapiMessage): Promise<SolapiResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/messages/v4/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages: [message],
        }),
      });

      if (!response.ok) {
        const error: SolapiError = await response.json();
        throw new Error(`SOLAPI Error: ${error.errorMessage} (${error.errorCode})`);
      }

      const result: SolapiResponse = await response.json();

      console.log('✅ SOLAPI message sent successfully:', {
        to: message.to,
        type: message.type,
        groupId: result.groupId,
      });

      return result;
    } catch (error) {
      console.error('❌ SOLAPI Error:', error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Unknown error occurred while sending message');
    }
  }

  /**
   * Validate phone number format (Korean mobile)
   */
  static validatePhoneNumber(phone: string): boolean {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if it's a valid Korean mobile number
    // Format: 010-XXXX-XXXX (11 digits)
    return /^01[0-9]{9}$/.test(cleaned);
  }

  /**
   * Format phone number to standard format
   */
  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (!SolapiClient.validatePhoneNumber(cleaned)) {
      throw new Error(`Invalid phone number format: ${phone}`);
    }

    return cleaned;
  }
}
