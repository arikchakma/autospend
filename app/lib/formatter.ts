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

export function humanizeNumber(value: number) {
  if (value >= 1000000000) {
    var val = value / 1000000000;
    if (val.toFixed(1).length > 3) return val.toFixed(0) + 'B';
    else return val.toFixed(1) + 'B';
  }

  if (value >= 1000000) {
    var val = value / 1000000;
    if (val.toFixed(1).length > 3) return val.toFixed(0) + 'M';
    else return val.toFixed(1) + 'M';
  }
  if (value >= 1000) {
    var val = value / 1000;
    if (val.toFixed(1).length > 3) return val.toFixed(0) + 'K';
    else return val.toFixed(1) + 'K';
  }

  if (value >= 100) {
    return value.toFixed(0) + '';
  }

  if (value >= 10) {
    return value.toFixed(1) + '';
  }

  if (value >= 1) {
    return value.toFixed(2) + '';
  }

  if (value < 1 && value > 0) {
    return value.toPrecision(3);
  }

  return value + '';
}
