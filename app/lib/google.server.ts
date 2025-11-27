import { generateObject } from 'ai';
import { type Image } from '~/db/types';
import { imagesTable, transactionsTable } from '~/db/schema';
import { z } from 'zod';
import { db } from '~/db';
import { eq } from 'drizzle-orm';
import { config } from './config.server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import PQueue from 'p-queue';

const google = createGoogleGenerativeAI({
  apiKey: config.GOOGLE_API_KEY,
});

const SYSTEM_PROMPT_TEMPLATE = `You are an expert extraction algorithm.
Only extract relevant information from the text.
You are extracting invoice or payment receipt transaction information.
Do not process or extract if it is not a valid transaction receipt, bill, or invoice.
It has to be a valid transaction receipt, bill, or invoice. Extract structured receipt data with maximum accuracy.`;

const transactionSchema = z
  .object({
    datetime: z
      .string()
      .optional()
      .describe('Date of the transaction, include the time if available'),
    amount: z
      .number()
      .describe('Amount of the transaction, usually the highest amount'),
    currency: z.string().describe('Currency code of the transaction'),
    merchant: z.string().optional().describe('Name of the merchant'),
    category: z.enum([
      'food',
      'transport',
      'shopping',
      'entertainment',
      'accommodation',
      'health',
      'education',
      'bills',
      'other',
    ]),
    card: z
      .object({
        number: z.string().optional().describe('Last 4 digits of the card'),
        type: z
          .string()
          .optional()
          .describe('Type of the card e.g. Visa, MasterCard, Amex'),
      })
      .optional()
      .describe('Card information if available'),
    description: z
      .string()
      .describe(
        'Summarize the transaction details by focusing on the most important information'
      ),
  })
  .nullable()
  .describe('Transaction data extracted from the image, return null if failed');

export async function extractTransactionData(images: Image) {
  try {
    const imageUrl = `${import.meta.env.VITE_FILE_CDN_URL}/${images.path}`;

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: transactionSchema,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT_TEMPLATE,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: imageUrl,
            },
          ],
        },
      ],
    });

    console.log('-'.repeat(20));
    console.log('Result:', result);
    console.log('-'.repeat(20));

    return result.object;
  } catch (error) {
    console.log('-'.repeat(20));
    console.log('Error:', error);
    console.log('-'.repeat(20));
    return null;
  }
}

export async function processImages(images: Image[]) {
  const queue = new PQueue({ concurrency: 5 });
  for (const image of images) {
    queue.add(async () => {
      try {
        await db
          .update(imagesTable)
          .set({
            status: 'processing',
          })
          .where(eq(imagesTable.id, image.id));

        const result = await extractTransactionData(image);
        if (!result) {
          throw new Error('Unable to extract transaction data');
        }

        await db
          .update(imagesTable)
          .set({
            status: 'completed',
          })
          .where(eq(imagesTable.id, image.id));
        await db.insert(transactionsTable).values({
          timestamp: new Date(result.datetime || new Date()),
          amount: result.amount,
          currency: result.currency,
          merchant: result.merchant,
          category: result.category,
          description: result.description,
          image: image.path,

          cardNumber: result.card?.number,
          cardType: result.card?.type,
        });
      } catch {
        await db
          .update(imagesTable)
          .set({
            status: 'failed',
            error: 'Failed to extract transaction data',
          })
          .where(eq(imagesTable.id, image.id));
      }
    });
  }
  await queue.onIdle();
}
