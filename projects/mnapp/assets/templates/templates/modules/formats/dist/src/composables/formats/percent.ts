import { isFinite } from 'lodash-es';

declare module '../useFormats.js' {
  interface FormatsInstance {
    percent: typeof percent;
  }
}

export default function percent(value: number | string | null | undefined, decimal?: number) {
  if (value == null) return value;

  if (isFinite(value)) {
    const valueAsNumber = value as number;

    if (decimal === undefined) {
      // Fixing floating point issue
      let str = (valueAsNumber * 100).toFixed(10);

      while (str.endsWith('0')) {
        str = str.substring(0, str.length - 1);
      }

      if (str.endsWith('.')) {
        str = str.substring(0, str.length - 1);
      }

      return `${str}%`;
    }

    return `${(valueAsNumber * 100).toFixed(decimal)}%`;
  }

  return String(value);
}
