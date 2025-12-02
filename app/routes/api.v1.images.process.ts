import z from 'zod/v4';
import { db } from '~/db';
import { imagesTable } from '~/db/schema';
import { processImages } from '~/lib/google.server';
import type { Route } from './+types/api.v1.images.process';
import { json } from '~/lib/response.server';
import { inArray } from 'drizzle-orm';
import { isValidQueueRequest } from '~/lib/qstash.server';

export async function action(args: Route.ActionArgs) {
  const { request } = args;

  const payload = await request.text();
  const isValid = await isValidQueueRequest(request, payload);
  if (!isValid) {
    return json({ error: 'Invalid request' }, { status: 400 });
  }

  const bodySchema = z.object({
    userId: z.number(),
    images: z.array(z.number()),
  });

  const { data: body, error } = bodySchema.safeParse(JSON.parse(payload));
  if (error) {
    const errors = error.issues;
    const message = errors.map((e) => e.message).join(', ');

    return json({ errors, message }, { status: 400 });
  }

  const images = await db.query.imagesTable.findMany({
    where: inArray(imagesTable.id, body.images),
  });

  await processImages(images, body.userId);
  return json({ status: 'ok' });
}
