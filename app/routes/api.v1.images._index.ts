import z from 'zod/v4';
import { db } from '~/db';
import { allowedImageStatuses, imagesTable } from '~/db/schema';
import type { Route } from './+types/api.v1.images._index';
import { json } from '~/lib/response.server';
import { getUserFromCookie } from '~/lib/jwt.server';
import { redirect } from 'react-router';
import { qstash } from '~/lib/qstash.server';
import { IMAGE_PROCESS_QUEUE_URL } from '~/lib/config.server';
import { and, desc, eq, inArray } from 'drizzle-orm';

export async function loader(args: Route.LoaderArgs) {
  const { request } = args;
  const user = await getUserFromCookie(request);
  if (!user) {
    throw redirect('/login');
  }

  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams);
  const querySchema = z.object({
    status: z
      .array(z.enum(allowedImageStatuses))
      .optional()
      .default(['pending', 'processing']),
  });

  const { data: query, error } = querySchema.safeParse(queryParams);
  if (error) {
    return json(
      {
        status: 400,
        message: 'Invalid query parameters',
        errors: error.issues.map((e) => e.message),
      },
      { status: 400 }
    );
  }

  const images = await db
    .select()
    .from(imagesTable)
    .where(
      and(
        eq(imagesTable.userId, user.id),
        inArray(imagesTable.status, query.status)
      )
    )
    .orderBy(desc(imagesTable.createdAt));

  return json({ images });
}

export async function action(args: Route.ActionArgs) {
  const { request } = args;

  const user = await getUserFromCookie(request);
  if (!user) {
    throw redirect('/login');
  }

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
        userId: user.id,
      }))
    )
    .returning();

  await qstash.publishJSON({
    url: IMAGE_PROCESS_QUEUE_URL,
    body: {
      userId: user.id,
      images: images.map((image) => image.id),
    },
  });

  return json({ status: 'ok' });
}
