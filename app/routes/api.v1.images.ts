import z from 'zod/v4';
import { db } from '~/db';
import { imagesTable } from '~/db/schema';
import { processImages } from '~/lib/google.server';
import type { Route } from './+types/api.v1.images';
import { json } from '~/lib/response.server';

export async function action(args: Route.ActionArgs) {
  const { request } = args;

  const bodySchema = z.object({
    images: z.array(
      z.object({
        name: z.string(),
        size: z.number().min(0),
        type: z.string(),
        path: z.string(),
      })
    ),
  });

  const jsonBody = await request.json();
  const { data: body, error } = bodySchema.safeParse(jsonBody);
  if (error) {
    const errors = error.issues;
    const message = errors.map((e) => e.message).join(', ');

    return json({ errors, message }, { status: 400 });
  }

  const images = await db
    .insert(imagesTable)
    .values(
      body.images.map((image) => ({
        name: image.name,
        size: image.size,
        type: image.type,
        path: image.path,
      }))
    )
    .returning();

  await processImages(images);

  return json({ status: 'ok' });
}
