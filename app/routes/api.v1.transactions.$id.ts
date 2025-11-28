import z from 'zod/v4';
import { eq } from 'drizzle-orm';
import { db } from '~/db';
import { transactionsTable } from '~/db/schema';
import { allowedCategories } from '~/lib/transaction';
import type { Route } from './+types/api.v1.transactions.$id';
import { json } from '~/lib/response.server';

export async function action(args: Route.ActionArgs) {
  const { request, params } = args;

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

  switch (request.method) {
    case 'PUT':
    case 'PATCH':
      return updateTransaction(request, id);
    case 'DELETE':
      return deleteTransaction(id);
    default:
      return json(
        {
          status: 405,
          message: 'Method not allowed',
          errors: [{ message: 'Method not allowed' }],
        },
        { status: 405 }
      );
  }
}

async function deleteTransaction(id: number) {
  try {
    await db.delete(transactionsTable).where(eq(transactionsTable.id, id));
    return json({ success: true });
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    return json(
      {
        status: 500,
        message: 'Failed to delete transaction',
        errors: [{ message: 'Failed to delete transaction' }],
      },
      { status: 500 }
    );
  }
}

async function updateTransaction(request: Request, id: number) {
  try {
    const bodySchema = z.object({
      amount: z.number({ message: 'Amount is required' }),
      description: z.string().optional(),
      merchant: z.string().optional(),
      category: z.enum(allowedCategories),
    });

    const jsonBody = await request.json();
    const { data: body, error } = bodySchema.safeParse(jsonBody);

    if (error) {
      const errors = error.issues;
      const message = errors.map((e) => e.message).join(', ');

      return json({ errors, message, status: 400 }, { status: 400 });
    }

    const { amount, description, merchant, category } = body;
    await db
      .update(transactionsTable)
      .set({
        amount,
        description: description || '',
        merchant: merchant || '',
        category,
      })
      .where(eq(transactionsTable.id, id));

    return json({ success: true });
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return json(
      {
        status: 500,
        message: 'Failed to update transaction',
        errors: [{ message: 'Failed to update transaction' }],
      },
      { status: 500 }
    );
  }
}
