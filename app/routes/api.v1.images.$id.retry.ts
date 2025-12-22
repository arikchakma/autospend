import z from 'zod/v4';
import { and, eq } from 'drizzle-orm';
import { db } from '~/db';
import { imagesTable } from '~/db/schema';
import type { Route } from './+types/api.v1.images.$id.retry';
import { json } from '~/lib/response.server';
import { getUserFromCookie } from '~/lib/jwt.server';
import { qstash } from '~/lib/qstash.server';
import { IMAGE_PROCESS_QUEUE_URL } from '~/lib/constants';

export async function action(args: Route.ActionArgs) {
  const { request, params } = args;

  const user = await getUserFromCookie(request);
  if (!user) {
    return json(
      {
        status: 401,
        message: 'Unauthorized',
        errors: [{ message: 'Unauthorized' }],
      },
      { status: 401 }
    );
  }

  const paramsSchema = z.object({
    id: z.string().transform((val) => parseInt(val)),
  });

  const { success, data, error } = paramsSchema.safeParse(params);

  if (!success) {
    return json(
      {
        status: 400,
        message: 'Invalid ID',
        errors: error.issues,
      },
      { status: 400 }
    );
  }

  const { id } = data;

  if (request.method !== 'POST') {
    return json(
      {
        status: 405,
        message: 'Method not allowed',
        errors: [{ message: 'Method not allowed' }],
      },
      { status: 405 }
    );
  }

  try {
    const image = await db.query.imagesTable.findFirst({
      where: and(eq(imagesTable.id, id), eq(imagesTable.userId, user.id)),
    });

    if (!image) {
      return json(
        {
          status: 404,
          message: 'Image not found',
          errors: [{ message: 'Image not found' }],
        },
        { status: 404 }
      );
    }

    if (image.status !== 'failed') {
      return json(
        {
          status: 400,
          message: 'Only failed images can be retried',
          errors: [{ message: 'Only failed images can be retried' }],
        },
        { status: 400 }
      );
    }

    await db
      .update(imagesTable)
      .set({ status: 'pending', error: null })
      .where(eq(imagesTable.id, id));

    await qstash.publishJSON({
      url: IMAGE_PROCESS_QUEUE_URL,
      body: {
        userId: user.id,
        images: [id],
      },
    });

    return json({ success: true });
  } catch (error) {
    console.error('Failed to retry image:', error);

    await db
      .update(imagesTable)
      .set({ status: 'failed', error: 'Failed to retry image' })
      .where(eq(imagesTable.id, id));

    return json(
      {
        status: 500,
        message: 'Failed to retry image',
        errors: [{ message: 'Failed to retry image' }],
      },
      { status: 500 }
    );
  }
}
