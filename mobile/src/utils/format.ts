export const formatCurrency = (value: number, currency?: string) => {
  const amount = Number.isFinite(value) ? value : 0;
  const normalized = typeof currency === 'string' ? currency : 'ARS';

  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: normalized,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = normalized === 'USD' ? 'US$' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  }
};
