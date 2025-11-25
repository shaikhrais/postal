import { Injectable } from '@nestjs/common';

export interface SendResult {
  accepted: boolean;
  status?: number;
  details?: any;
}

@Injectable()
export class MailerService {
  validate(payload: any): { ok: boolean; error?: string } {
    if (!payload || typeof payload !== 'object') return { ok: false, error: 'missing payload' };
    const { from, to, subject } = payload;
    if (!from) return { ok: false, error: 'missing from' };
    if (!to) return { ok: false, error: 'missing to' };
    if (!subject) return { ok: false, error: 'missing subject' };
    return { ok: true };
  }

  buildRelayPayload(payload: any) {
    return {
      personalizations: [{ to: [{ email: payload.to }] }],
      from: { email: payload.from },
      subject: payload.subject,
      content: [{ type: 'text/plain', value: payload.text || payload.body || '' }],
    };
  }

  async sendToRelay(relayPayload: any): Promise<SendResult> {
    const RELAY_URL = process.env.RELAY_URL || '';
    const RELAY_API_KEY = process.env.RELAY_API_KEY || '';
    if (!RELAY_URL) {
      // Simulation mode - accept immediately
      return { accepted: true, status: 202 };
    }

    try {
      const res = await fetch(RELAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: RELAY_API_KEY ? `Bearer ${RELAY_API_KEY}` : '',
        },
        body: JSON.stringify(relayPayload),
      } as any);
      const body = await res.text();
      if (res.ok) return { accepted: true, status: res.status, details: body };
      return { accepted: false, status: res.status, details: body };
    } catch (err) {
      return { accepted: false, details: String(err) };
    }
  }
}
