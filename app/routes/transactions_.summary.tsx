import { DateTime } from 'luxon';
import type { Route } from './+types/transactions_.summary';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Libertinus+Serif:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap',
  },
];

export const meta: Route.MetaFunction = () => {
  return [{ title: 'Yearly Summary' }];
};

export const loader = async (args: Route.LoaderArgs) => {};

export default function YearlySummary() {
  const data = {
    year: 2025,
    user: {
      name: 'Arik Chakma',
      email: 'arikchangma@gmail.com',
      city: 'Dhaka',
      country: 'Bangladesh',
    },
    items: [
      { name: 'Food - Groceries, dining out, etc.', total: 1000 },
      {
        name: 'Transport - Public transport, fuel, parking, etc.',
        total: 2000,
      },
      { name: 'Shopping - Clothes, electronics, etc.', total: 3000 },
      { name: 'Entertainment - Movies, concerts, etc.', total: 4000 },
      { name: 'Accommodation - Rent, hotel, etc.', total: 5000 },
      {
        name: 'Health - Insurance, medical expenses, etc.',
        total: 6000,
      },
      { name: 'Education - Tuition, textbooks, etc.', total: 7000 },
      { name: 'Bills - Utilities, internet, etc.', total: 8000 },
      { name: 'Other - Gifts, donations, etc.', total: 9000 },
    ],
  };

  const totalAmount = data.items.reduce((acc, item) => acc + item.total, 0);
  const formattedToday = DateTime.now()
    .setZone('Asia/Kolkata')
    .toFormat('dd.MM.yyyy');

  const formatAmount = (amount: number) => {
    const intl = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
    });
    return intl.format(amount);
  };

  return (
    <div className="min-h-screen py-10 font-serif">
      <div
        className="mx-auto max-w-lg bg-white p-4"
        style={{ fontFamily: '"Libertinus Serif", serif' }}
      >
        <div className="mb-8 text-sm tracking-wider uppercase">
          <span className="font-bold">{data.user.email}</span>&nbsp;•&nbsp;
          <span className="font-bold">{data.user.city}</span>&nbsp;
          {data.user.country}
        </div>

        <div>
          <p className="text-xl leading-tight">
            Financial Summary for
            <br />
            Personal Yearly Summary
          </p>
        </div>

        <div className="mt-12 flex items-end justify-between">
          <h1 className="text-2xl font-bold">Yearly Summary #{data.year}</h1>
          <div className="text-right">
            {data.user.city},{' '}
            <span className="font-bold">{formattedToday}</span>
          </div>
        </div>

        <div className="mt-2 mb-8">
          <div className="grid w-full grid-cols-[60px_1fr_auto] items-center">
            <div className="border-t border-b-2 py-1.5 pl-2 font-bold">
              Pos.
            </div>
            <div className="border-t border-b-2 py-1.5 font-bold">Category</div>
            <div className="border-t border-b-2 py-1.5 pr-2 text-right font-bold">
              Amount
            </div>

            {data.items.map((item, index) => (
              <div key={index} className="contents">
                <div className="py-1.5 pl-2">
                  {String(index + 1).padStart(2, '0')}.
                </div>
                <div className="min-w-0 truncate py-1.5 pr-2">{item.name}</div>
                <div className="py-1.5 pr-2 text-right">
                  {formatAmount(item.total)}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 pr-2 text-right font-bold">
            Total:&nbsp;&nbsp;
            <span className="border-b-2 border-black pb-1">
              {formatAmount(totalAmount)}
            </span>
          </div>
        </div>

        <div className="mb-6 space-y-4 text-justify text-base">
          <p>
            We hope you find this summary helpful. If you have any questions,
            please feel free to contact us. We're always here to help you.
          </p>
          <p>
            <strong>Note:</strong> This summary is generated automatically by
            AutoSpend for <strong>{data.user.name}</strong> for the year{' '}
            <strong>{data.year}</strong>. It is not a financial advice. Please
            consult a financial advisor for your financial decisions.
          </p>
        </div>

        <div className="mt-8">
          Best Regards,
          <br />
          <strong>Arik Chakma</strong>
        </div>
      </div>
    </div>
  );
}
