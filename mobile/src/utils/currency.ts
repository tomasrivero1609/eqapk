import { Currency } from '../types';

export const convertAmount = (
  amount: number,
  from: Currency,
  to: Currency,
  rate?: number,
) => {
  if (!Number.isFinite(amount) || from === to || !rate) {
    return amount;
  }

  if (from === Currency.USD && to === Currency.ARS) {
    return amount * rate;
  }

  if (from === Currency.ARS && to === Currency.USD) {
    return amount / rate;
  }

  return amount;
};
