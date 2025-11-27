import { db } from '~/db';
import type { Route } from './+types/_index';
import { NavLink } from 'react-router';

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'Poisha - Simplify Your Personal Finances' },
    {
      name: 'description',
      content: 'Poisha helps you manage your personal finances',
    },
  ];
};

export async function loader({}: Route.LoaderArgs) {
  const transactions = await db.query.transactionsTable.findMany();
  return { transactions };
}

export default function Transactions(props: Route.ComponentProps) {
  const { transactions } = props.loaderData;

  return (
    <div>
      <NavLink to="/new">Add Transactions</NavLink>

      <table className="w-full table-auto text-left">
        <thead>
          <tr>
            <th>Id</th>
            <th>Merchant</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const amount = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: transaction.currency,
            }).format(transaction.amount);

            return (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.merchant}</td>
                <td>{amount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
