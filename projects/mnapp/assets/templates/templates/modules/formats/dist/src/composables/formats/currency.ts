import { isFinite, isNumber } from 'lodash-es';

declare module '../useFormats.js' {
  interface FormatsInstance {
    currency: typeof currency;
  }
}

export default function currency(value: number | string | null | undefined, isNegative = false) {
  if (value == null) return value;

  if (isNumber(value) && isFinite(value)) {
    const negative = value < 0;
    value = Math.abs(value);
    let result = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    result = result.replace(/,/g, '_');
    result = result.replace(/\./g, ',');
    result = result.replace(/_/g, '.');

    return (isNegative ? '(' : '') + (negative ? '-' : '') + result + (isNegative ? ')' : '');
  }

  return String(value);
}
