import { Client, Receiver } from '@upstash/qstash';
import { config } from './config.server';

export const qstash = new Client({
  token: config.QSTASH_TOKEN,
});

const r = new Receiver({
  currentSigningKey: config.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: config.QSTASH_NEXT_SIGNING_KEY,
});

export async function isValidQueueRequest(request: Request, payload: any) {
  try {
    const signature =
      request.headers.get('Upstash-Signature') ||
      request.headers.get('upstash-signature');
    if (!signature) {
      return false;
    }

    const result = await r.verify({
      signature,
      body: payload,
    });
    return result;
  } catch (error) {
    console.error('Failed to verify QStash signature:', error);
    return false;
  }
}
