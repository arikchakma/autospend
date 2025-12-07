import { Client, Receiver } from '@upstash/qstash';
import { config } from './config.server';
import { IMAGE_PROCESS_QUEUE_URL } from './constants';

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
      url: IMAGE_PROCESS_QUEUE_URL,
    });
    return result;
  } catch (error) {
    console.error('Failed to verify QStash signature:', error);
    return false;
  }
}
