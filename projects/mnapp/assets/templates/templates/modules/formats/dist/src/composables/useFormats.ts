import currency from './formats/currency.js';
import date from './formats/date.js';
import editor from './formats/editor.js';
import percent from './formats/percent.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FormatsInstance {} // To be augmented

export default function useFormats() {
  const formats: FormatsInstance = {
    percent,
    currency,
    ...date(),
    ...editor(),
  };

  return formats;
}
