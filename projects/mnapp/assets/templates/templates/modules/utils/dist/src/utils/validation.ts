import { date } from 'quasar';

import { mixed, number, string } from 'yup';

import { requiredConfigEntries } from 'composables/useConfig.js';

function getEditDateFormat() {
  return requiredConfigEntries('editDateFormat').editDateFormat;
}

export function stringRequired(label: string) {
  return string()
    .required()
    .label(label)
    .transform((value, originalValue) => {
      return originalValue === null ? undefined : value;
    });
}

export function stringOptional(label: string) {
  return string().nullable().default(null).label(label);
}

export function predefinedStringRequired<TType extends string>(
  label: string,
  ...acceptedValues: TType[]
) {
  return mixed<TType>()
    .required()
    .when({
      is: () => true,
      then: () =>
        stringRequired(label).test({
          message: `${label} is invalid`,
          test: (value) => !value || acceptedValues.includes(value as TType),
        }),
    });
}

export function emailRequired(label: string) {
  return string().required().email().label(label);
}

export function numberRequired(label: string) {
  return number()
    .required()
    .label(label)
    .typeError(`${label} must be a number`)
    .transform((value, originalValue) => {
      const originalValueAsString = String(originalValue);

      if (
        originalValueAsString.endsWith('.') ||
        (originalValueAsString.length > 1 &&
          originalValueAsString.startsWith('0') &&
          originalValueAsString[1] !== '.') ||
        (originalValueAsString.includes('.') && originalValueAsString.endsWith('0'))
      ) {
        return ' ';
      }

      return originalValue === '' ? undefined : value;
    });
}

export function numberOptional(label: string) {
  return number()
    .nullable()
    .default(null)
    .label(label)
    .typeError(`${label} must be a number`)
    .transform((value, originalValue) => {
      const originalValueAsString = String(originalValue);

      if (
        originalValueAsString.endsWith('.') ||
        (originalValueAsString.length > 1 &&
          originalValueAsString.startsWith('0') &&
          originalValueAsString[1] !== '.') ||
        (originalValueAsString.includes('.') && originalValueAsString.endsWith('0'))
      ) {
        return ' ';
      }

      return originalValue === '' ? undefined : value;
    });
}

export function integerRequired(label: string) {
  return numberRequired(label).integer();
}

export function integerOptional(label: string) {
  return numberOptional(label).integer();
}

export function percentRequiredMin(label: string) {
  return numberRequired(label).min(0.01, `${label} must be at least 1%`);
}

export function percentRequiredMinOneMax(label: string) {
  return numberRequired(label)
    .min(0.01, `${label} must be between 1% and 100%`)
    .max(1, `${label} must be between 1% and 100%`);
}

export function percentRequiredMinZeroMax(label: string) {
  return numberRequired(label)
    .min(0, `${label} must be between 0% and 100%`)
    .max(1, `${label} must be between 0% and 100%`);
}

export function percentOptionalMin(label: string) {
  return numberOptional(label).min(0.01, `${label} must be at least 1%`);
}

export function percentOptionalMinOneMax(label: string) {
  return numberOptional(label)
    .min(0.01, `${label} must be between 1% and 100%`)
    .max(1, `${label} must be between 1% and 100%`);
}

export function percentOptionalMinZeroMax(label: string) {
  return numberOptional(label)
    .min(0, `${label} must be between 0% and 100%`)
    .max(1, `${label} must be between 0% and 100%`);
}

export function dateRequired(label: string) {
  return stringRequired(label).test({
    message: `${label} must be a date`,
    test: (value) =>
      !value ||
      value === date.formatDate(date.extractDate(value, getEditDateFormat()), getEditDateFormat()),
  });
}

export function dateOptional(label: string) {
  return string()
    .notRequired()
    .default('')
    .label(label)
    .test({
      message: `${label} must be a date`,
      test: (value) =>
        !value ||
        value ===
          date.formatDate(date.extractDate(value, getEditDateFormat()), getEditDateFormat()),
    });
}

export function asIsRequired<TType extends NonNullable<unknown>>(label: string) {
  return mixed<TType>().required().label(label);
}

export function asIsOptional<TType extends NonNullable<unknown>>(label: string) {
  return mixed<TType>().nullable().default(null).label(label);
}
