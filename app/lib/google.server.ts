import { generateObject } from 'ai';
import { type Image, type User } from '~/db/types';
import { imagesTable, transactionsTable } from '~/db/schema';
import { z } from 'zod';
import { db } from '~/db';
import { and, eq } from 'drizzle-orm';
import PQueue from 'p-queue';
import { DateTime } from 'luxon';

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
      .describe(
        'Date of the transaction, include the time if available, in the format YYYY-MM-DD HH:MM:SS'
      ),
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

export async function extractTransactionData(image: Image) {
  try {
    const imageUrl = `${import.meta.env.VITE_FILE_CDN_URL}/${image.path}`;

    const result = await generateObject({
      model: 'google/gemini-2.5-flash',
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
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      },
    });

    return result.object;
  } catch (error) {
    console.log('-'.repeat(20));
    console.log('Error extracting transaction data:', image.path, error);
    console.log('-'.repeat(20));
    return null;
  }
}

export async function processImages(images: Image[], user: User) {
  const { id: userId } = user;
  const queue = new PQueue({ concurrency: 5 });
  for (const image of images) {
    queue.add(async () => {
      try {
        await db
          .update(imagesTable)
          .set({
            status: 'processing',
          })
          .where(
            and(eq(imagesTable.id, image.id), eq(imagesTable.userId, userId))
          );

        const result = await extractTransactionData(image);
        if (!result) {
          throw new Error('Unable to extract transaction data');
        }

        await db
          .update(imagesTable)
          .set({
            status: 'completed',
          })
          .where(
            and(eq(imagesTable.id, image.id), eq(imagesTable.userId, userId))
          );

        const timestamp = result?.datetime
          ? DateTime.fromFormat(result.datetime, 'yyyy-MM-dd HH:mm:ss', {
              zone: user.timezone,
            }).toJSDate()
          : DateTime.now().toJSDate();

        await db.insert(transactionsTable).values({
          timestamp,
          amount: result.amount,
          currency: result.currency,
          merchant: result.merchant,
          category: result.category,
          description: result.description,
          image: image.path,
          userId: userId,

          cardNumber: result.card?.number,
          cardType: result.card?.type,
        });
      } catch (error) {
        console.log('-'.repeat(20));
        console.log('Error processing image:', image.id, error);
        console.log('-'.repeat(20));

        await db
          .update(imagesTable)
          .set({
            status: 'failed',
            error: 'Failed to extract transaction data',
          })
          .where(
            and(eq(imagesTable.id, image.id), eq(imagesTable.userId, userId))
          );
      }
    });
  }
  await queue.onIdle();
}
