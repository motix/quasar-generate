export default function useGenericConvert<
  T extends NonNullable<unknown>,
  TRow extends NonNullable<unknown>,
>() {
  // Methods

  function c(model: unknown) {
    return model as T;
  }

  function cr(row: unknown) {
    return row as TRow;
  }

  return {
    c,
    cr,
  };
}
