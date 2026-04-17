import { isFinite } from 'lodash-es';

export function checkAndCalculate<TResult>(
  calculation: () => TResult,
  ...variables: (number | string | null | undefined)[]
) {
  for (const variable of variables) {
    if (!isFinite(variable)) return undefined;
  }

  return calculation();
}

export function oneThousandRound(value: number) {
  return Math.round(value / 1000) * 1000;
}

export function percentRound(value: number) {
  return Math.round(value * 10000) / 10000;
}

export function pointTenRound(value: number) {
  return Math.round(value * 10) / 10;
}
