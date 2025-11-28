import type { Route } from './+types/api.v1.signed-url';
import { json } from '~/lib/response.server';
import { MAX_FILE_SIZE, s3Client } from '~/lib/s3.server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '~/lib/config.server';
import { z } from 'zod';
import path from 'node:path';
import { getUserFromCookie } from '~/lib/jwt.server';
import { redirect } from 'react-router';

export async function action(args: Route.ActionArgs) {
  const { request } = args;

  const user = await getUserFromCookie(request);
  if (!user) {
    throw redirect('/login');
  }

  const bodySchema = z.object({
    name: z.string(),
    size: z.number().min(0),
    type: z.string(),
  });

  const jsonBody = await request.json();
  const { data: body, error } = bodySchema.safeParse(jsonBody);
  if (error) {
    const errors = error.issues;
    const message = errors.map((e) => e.message).join(', ');

    return json({ errors, message }, { status: 400 });
  }

  const { name, size, type } = body;
  if (size > MAX_FILE_SIZE) {
    return json(
      {
        message: `${name} is too large, max file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        errors: [{ message: 'File too large' }],
      },
      { status: 400 }
    );
  }

  const randomId = crypto.randomUUID();
  const ext = path.extname(name);
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `i/${date}/${randomId}${ext}`;

  const command = new PutObjectCommand({
    Bucket: config.S3_BUCKET_NAME,
    Key: key,
    ContentType: type,
    ContentLength: size,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 60, // 1 minute
  });

  return json({ url, key });
}
