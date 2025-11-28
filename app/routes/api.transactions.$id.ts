import { db } from '~/db';
import { transactionsTable } from '~/db/schema';
import { eq } from 'drizzle-orm';
import type { Route } from './+types/api.transactions.$id';

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== 'PUT' && request.method !== 'PATCH') {
    return new Response('Method not allowed', { status: 405 });
  }

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return new Response('Invalid ID', { status: 400 });
  }

  const formData = await request.formData();
  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;
  const merchant = formData.get('merchant') as string;
  const category = formData.get('category') as string;

  // Basic validation
  if (isNaN(amount)) {
    return new Response('Invalid amount', { status: 400 });
  }

  try {
    await db
      .update(transactionsTable)
      .set({
        amount,
        description,
        merchant,
        category,
      })
      .where(eq(transactionsTable.id, id));

    return { success: true };
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return new Response('Failed to update transaction', { status: 500 });
  }
}

