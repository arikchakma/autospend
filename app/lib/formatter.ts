const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'BDT',
});

export const formatCurrency = (amount: number) => {
  return currencyFormatter.format(amount);
};

const numberFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
});

export const formatNumber = (amount: number) => {
  return numberFormatter.format(amount);
};
