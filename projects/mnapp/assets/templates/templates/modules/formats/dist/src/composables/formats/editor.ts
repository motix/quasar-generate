declare module '../useFormats.js' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface FormatsInstance extends ReturnType<typeof editor> {}
}

export default function editor() {
  function isNumber(value: number | string | null | undefined): value is number {
    return value == null || value === '' || typeof value !== 'number' ? false : isFinite(value);
  }

  return {
    isNumber,
  };
}
